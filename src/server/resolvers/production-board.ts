import { GraphQLError } from 'graphql';

import { Prisma } from '@/generated/prisma/client';
import { MOVES, STAGE_LABELS, SUPERVISOR_ROLES, isStage, type Stage } from '@/config/production-stage';
import type { Context } from '../context';
import { requireCompany, requireUser } from '../context';
import { refreshWorkOrder, storeFinishedGoods } from '../domain/production';
import { JOB_CARD_STATUS } from '../domain/status';
import { manilaDay } from '../domain/time';
import { readConfiguration } from './configuration';

type MoveRequest = {
  uuid: string;
  toStage: string;
  staffUuid?: string | null;
  reportedQty?: number | null;
  goodQty?: number | null;
  note?: string | null;
};

const bad = (message: string) => new GraphQLError(message, { extensions: { code: 'BAD_USER_INPUT' } });

async function isSupervisor(ctx: Context) {
  const user = await ctx.loaders.user.load(requireUser(ctx));
  return !!user && SUPERVISOR_ROLES.includes(user.role);
}

/**
 * Completing a task turns its counts into records the rest of the system reads:
 * a job card for the worker (performance history and piece-rate pay count good
 * pieces, extras included) and finished goods into stock.
 */
async function postCompletion(
  tx: Prisma.TransactionClient,
  companyUuid: string,
  workOrder: { uuid: string; assignedStaffUuid: string | null; goodQty: Prisma.Decimal; rejectedQty: Prisma.Decimal },
) {
  const steps = await tx.workOrderItem.findMany({
    where: { workOrderUuid: workOrder.uuid },
    orderBy: { position: 'asc' },
  });
  const lastStep = steps.at(-1);
  const good = new Prisma.Decimal(workOrder.goodQty);

  if (lastStep) {
    // Output already reported step by step counts; only the difference is new.
    const increment = good.sub(lastStep.producedQty);
    if (increment.gt(0)) {
      await tx.jobCard.create({
        data: {
          companyUuid,
          workOrderUuid: workOrder.uuid,
          workOrderItemUuid: lastStep.uuid,
          operatorStaffUuid: workOrder.assignedStaffUuid,
          status: JOB_CARD_STATUS.completed,
          producedQty: increment,
          defectiveQty: workOrder.rejectedQty,
          endTime: new Date(),
        },
      });
      await tx.workOrderItem.update({
        where: { uuid: lastStep.uuid },
        data: { producedQty: { increment }, defectiveQty: { increment: workOrder.rejectedQty } },
      });
    }
    await refreshWorkOrder(tx, workOrder.uuid);
  } else {
    await tx.workOrder.update({ where: { uuid: workOrder.uuid }, data: { producedQty: good } });
  }

  const current = await tx.workOrder.findUniqueOrThrow({ where: { uuid: workOrder.uuid } });
  const toStore = good.sub(current.storedQty);
  if (toStore.gt(0)) await storeFinishedGoods(tx, companyUuid, workOrder.uuid, toStore);
}

/**
 * The production office board: every work order as a task moving through
 * Queue → Assigned → In Progress → Quality Check → Final Check → Completed.
 */
export const productionBoardResolvers = {
  RootQueryType: {
    productionBoard: async (_: unknown, __: unknown, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      const { start } = manilaDay();
      const [orders, staff, config, supervisor] = await Promise.all([
        ctx.db.workOrder.findMany({
          // Completed tasks stay on the board for the rest of the day they finished.
          where: { companyUuid, OR: [{ stage: { not: 'completed' } }, { stageChangedAt: { gte: start } }] },
          orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }, { insertedAt: 'asc' }],
        }),
        ctx.db.staff.findMany({ where: { companyUuid } }),
        readConfiguration(ctx, companyUuid),
        isSupervisor(ctx),
      ]);
      const names = new Map(staff.map((s) => [s.uuid, s.name || s.email]));
      return {
        claimMode: config.productionClaimMode,
        canSupervise: supervisor,
        tasks: orders.map((o) => ({
          ...o,
          assignedStaffName: o.assignedStaffUuid ? (names.get(o.assignedStaffUuid) ?? null) : null,
        })),
      };
    },

    workOrderStageLogs: async (_: unknown, { request }: { request: { uuid?: string } }, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      const logs = await ctx.db.workOrderStageLog.findMany({
        where: { companyUuid, workOrderUuid: request.uuid ?? '' },
        orderBy: { insertedAt: 'desc' },
      });
      const [staff, users] = await Promise.all([
        ctx.db.staff.findMany({ where: { companyUuid } }),
        ctx.db.user.findMany({ where: { uuid: { in: logs.map((l) => l.userUuid).filter(Boolean) as string[] } } }),
      ]);
      const staffNames = new Map(staff.map((s) => [s.uuid, s.name || s.email]));
      const userNames = new Map(users.map((u) => [u.uuid, u.nickname || u.email]));
      return logs.map((l) => ({
        ...l,
        staffName: l.staffUuid ? (staffNames.get(l.staffUuid) ?? null) : null,
        movedBy: l.userUuid ? (userNames.get(l.userUuid) ?? null) : null,
      }));
    },
  },

  RootMutationType: {
    moveWorkOrderStage: async (_: unknown, { request }: { request: MoveRequest }, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      const userUuid = requireUser(ctx);
      if (!isStage(request.toStage)) throw bad('Unknown stage.');
      const to: Stage = request.toStage;
      const note = request.note?.trim() || null;

      const [supervisor, config] = await Promise.all([isSupervisor(ctx), readConfiguration(ctx, companyUuid)]);

      return ctx.db.$transaction(async (tx) => {
        const order = await tx.workOrder.findFirst({ where: { uuid: request.uuid, companyUuid } });
        if (!order) throw new GraphQLError('Work order not found.');
        const from = (isStage(order.stage) ? order.stage : 'queued') as Stage;

        const move = MOVES[from].find((m) => m.to === to);
        if (!move) throw bad(`A task in ${STAGE_LABELS[from]} can't move to ${STAGE_LABELS[to]}.`);
        if (move.supervisorOnly && !supervisor) {
          throw new GraphQLError(`Only a manager or the owner can ${move.label.toLowerCase()}.`, {
            extensions: { code: 'FORBIDDEN' },
          });
        }
        if (move.needsNote && !note) throw bad('Add a note saying why it is going back.');

        const data: Prisma.WorkOrderUpdateInput = { stage: to, stageChangedAt: new Date() };
        let staffUuid = order.assignedStaffUuid;

        if (to === 'assigned') {
          if (!request.staffUuid) throw bad('Choose who will do this task.');
          // In manager mode only a supervisor hands out work; in self mode workers claim.
          if (config.productionClaimMode === 'manager' && !supervisor) {
            throw new GraphQLError('Tasks are assigned by a manager. Ask them to assign this one.', {
              extensions: { code: 'FORBIDDEN' },
            });
          }
          const member = await tx.staff.findFirst({ where: { uuid: request.staffUuid, companyUuid } });
          if (!member || member.status === 'inactive') throw bad('That employee is not an active member.');
          staffUuid = member.uuid;
          data.assignedStaffUuid = member.uuid;
        }

        if (to === 'queued') {
          staffUuid = null;
          data.assignedStaffUuid = null;
        }

        if (to === 'quality_check' && from === 'in_progress') {
          const reported = Number(request.reportedQty);
          if (!Number.isFinite(reported) || reported <= 0) throw bad('Enter how many pieces were made.');
          // More than ordered is allowed and expected sometimes; it is the extra effort.
          if (reported > Number(order.plannedQty) * 10) throw bad('That count is far above the order. Check it.');
          data.reportedQty = reported;
        }

        if (to === 'final_check') {
          const good = Number(request.goodQty);
          const reported = Number(order.reportedQty);
          if (!Number.isFinite(good) || good < 0) throw bad('Enter how many pieces passed.');
          if (good > reported) throw bad(`Only ${reported} were reported; passed can't be more.`);
          data.goodQty = good;
          data.rejectedQty = reported - good;
        }

        if (to === 'completed' && Number(order.goodQty) <= 0) {
          throw bad('No pieces passed quality check, so there is nothing to complete.');
        }

        const updated = await tx.workOrder.update({ where: { uuid: order.uuid }, data });

        await tx.workOrderStageLog.create({
          data: {
            companyUuid,
            workOrderUuid: order.uuid,
            fromStage: from,
            toStage: to,
            staffUuid,
            userUuid,
            reportedQty: updated.reportedQty,
            goodQty: to === 'final_check' || to === 'completed' ? updated.goodQty : null,
            rejectedQty: to === 'final_check' || to === 'completed' ? updated.rejectedQty : null,
            note,
          },
        });

        if (to === 'completed') await postCompletion(tx, companyUuid, updated);

        return tx.workOrder.findUniqueOrThrow({ where: { uuid: order.uuid } });
      });
    },
  },
};
