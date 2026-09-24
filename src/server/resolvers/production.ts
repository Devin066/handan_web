import { GraphQLError } from 'graphql';
import { Prisma } from '@/generated/prisma/client';
import type { Context } from '../context';
import { requireCompany } from '../context';
import { nextCode } from '../domain/codes';
import { applyStockMove } from '../domain/stock';
import { expandBom, refreshWorkOrder } from '../domain/production';
import { JOB_CARD_STATUS, WORK_ORDER_STATUS } from '../domain/status';
import { manilaDay } from '../domain/time';

type Id = { request: { uuid?: string } };

export const productionResolvers = {
  RootQueryType: {
    /** Daily Manufactured Goods (SRS 4.3): everything stored from production on a given day. */
    manufacturedGoods: async (_: unknown, { request }: { request: { date?: string } }, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      const { start, end } = manilaDay(request?.date);
      const entries = await ctx.db.inventoryEntry.findMany({
        where: { companyUuid, type: 'production', insertedAt: { gte: start, lt: end } },
        orderBy: { insertedAt: 'desc' },
      });
      const workOrders = await ctx.db.workOrder.findMany({
        where: { uuid: { in: entries.map((e) => e.threadUuid).filter(Boolean) as string[] } },
      });
      const woByUuid = new Map(workOrders.map((w) => [w.uuid, w]));
      return entries.map((entry) => {
        const wo = entry.threadUuid ? woByUuid.get(entry.threadUuid) : undefined;
        return {
          uuid: entry.uuid,
          itemName: wo?.itemName ?? '',
          qty: entry.actualQty,
          workOrderCode: wo?.code ?? null,
          storedAt: entry.insertedAt,
        };
      });
    },
    boms: async (_: unknown, __: unknown, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.bom.findMany({ where: { companyUuid }, orderBy: { insertedAt: 'desc' } });
    },
    bom: async (_: unknown, { request }: Id, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.bom.findFirst({ where: { uuid: request.uuid ?? '', companyUuid } });
    },
    workOrders: async (_: unknown, __: unknown, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.workOrder.findMany({ where: { companyUuid }, orderBy: { insertedAt: 'desc' } });
    },
    workOrder: async (_: unknown, { request }: Id, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.workOrder.findFirst({ where: { uuid: request.uuid ?? '', companyUuid } });
    },
    workOrderItems: async (_: unknown, __: unknown, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.workOrderItem.findMany({
        where: { workOrder: { companyUuid } },
        orderBy: { insertedAt: 'desc' },
      });
    },
    workOrderItem: async (_: unknown, { request }: Id, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.workOrderItem.findFirst({
        where: { uuid: request.uuid ?? '', workOrder: { companyUuid } },
      });
    },
  },

  RootMutationType: {
    createBom: async (
      _: unknown,
      {
        request,
      }: {
        request: {
          name?: string;
          itemUuid?: string;
          bomItems?: Array<{ itemUuid?: string; qty?: number }>;
          bomProcesses?: Array<{ processUuid?: string; position?: number }>;
        };
      },
      ctx: Context,
    ) => {
      const companyUuid = requireCompany(ctx);

      if (!request.itemUuid) {
        throw new GraphQLError('itemUuid is required');
      }

      return ctx.db.$transaction(async (tx) => {
        const item = await tx.item.findFirstOrThrow({
          where: { uuid: request.itemUuid, companyUuid },
        });

        const components = (request.bomItems ?? []).filter((c) => c?.itemUuid);
        const stockUoms = await tx.stockUom.findMany({
          where: { itemUuid: { in: components.map((c) => c.itemUuid as string) } },
          orderBy: { sequence: 'asc' },
        });

        // First stock UOM per component is its default unit of issue.
        const defaultUomByItem = new Map<string, string>();
        for (const uom of stockUoms) {
          if (!defaultUomByItem.has(uom.itemUuid)) defaultUomByItem.set(uom.itemUuid, uom.uuid);
        }

        const code = await nextCode(tx, companyUuid, 'bom');

        return tx.bom.create({
          data: {
            code,
            companyUuid,
            name: request.name ?? `BOM for ${item.name}`,
            itemUuid: item.uuid,
            bomItems: {
              create: components.map((c) => ({
                itemUuid: c.itemUuid as string,
                qty: c.qty ?? 1,
                stockUomUuid: defaultUomByItem.get(c.itemUuid as string),
              })),
            },
            bomProcesses: {
              create: (request.bomProcesses ?? [])
                .filter((p) => p?.processUuid)
                .map((p, index) => ({
                  processUuid: p.processUuid as string,
                  position: p.position ?? index,
                })),
            },
          },
        });
      });
    },

    createWorkOrder: async (
      _: unknown,
      {
        request,
      }: {
        request: {
          bomUuid?: string;
          warehouseUuid?: string;
          plannedQty?: number;
          startTime?: string;
          endTime?: string;
          salesOrderUuid?: string;
          assignedStaffUuid?: string;
          pieceRate?: number;
          dueDate?: string;
        };
      },
      ctx: Context,
    ) => {
      const companyUuid = requireCompany(ctx);

      if (!request.bomUuid || !request.warehouseUuid) {
        throw new GraphQLError('bomUuid and warehouseUuid are required');
      }

      const plannedQty = new Prisma.Decimal(request.plannedQty ?? 0);

      if (plannedQty.lte(0)) {
        throw new GraphQLError('plannedQty must be greater than zero');
      }

      return ctx.db.$transaction(async (tx) => {
        const bom = await tx.bom.findFirstOrThrow({
          where: { uuid: request.bomUuid, companyUuid },
          include: { item: { include: { stockUoms: { orderBy: { sequence: 'asc' } } } } },
        });

        const defaultUom = bom.item.stockUoms[0];

        const salesOrder = request.salesOrderUuid
          ? await tx.salesOrder.findFirst({ where: { uuid: request.salesOrderUuid, companyUuid } })
          : null;
        if (request.salesOrderUuid && !salesOrder) throw new GraphQLError('Sales order not found.');
        if (request.assignedStaffUuid) {
          await tx.staff.findFirstOrThrow({ where: { uuid: request.assignedStaffUuid, companyUuid } });
        }

        const code = await nextCode(tx, companyUuid, 'workOrder');

        const workOrder = await tx.workOrder.create({
          data: {
            code,
            companyUuid,
            title: bom.name,
            itemUuid: bom.itemUuid,
            itemName: bom.item.name,
            stockUomUuid: defaultUom?.uuid,
            bomUuid: bom.uuid,
            warehouseUuid: request.warehouseUuid as string,
            plannedQty,
            startTime: request.startTime ? new Date(request.startTime) : null,
            endTime: request.endTime ? new Date(request.endTime) : null,
            salesOrderUuid: salesOrder?.uuid ?? null,
            dueDate: request.dueDate ? new Date(request.dueDate) : (salesOrder?.requiredDate ?? null),
            assignedStaffUuid: request.assignedStaffUuid || null,
            pieceRate: new Prisma.Decimal(request.pieceRate ?? 0),
          },
        });

        await expandBom(tx, {
          companyUuid,
          workOrderUuid: workOrder.uuid,
          bomUuid: bom.uuid,
          warehouseUuid: request.warehouseUuid as string,
          plannedQty,
        });

        return workOrder;
      });
    },

    scheduleWorkOrder: async (_: unknown, { request }: { request: { workOrderUuid?: string } }, ctx: Context) => {
      const companyUuid = requireCompany(ctx);

      if (!request.workOrderUuid) {
        throw new GraphQLError('workOrderUuid is required');
      }

      // Look the row up scoped to the caller's company first: updating straight
      // by uuid would let any authenticated user schedule another tenant's work
      // order, and writing companyUuid here would hand it to them outright.
      return ctx.db.$transaction(async (tx) => {
        const workOrder = await tx.workOrder.findFirstOrThrow({
          where: { uuid: request.workOrderUuid, companyUuid },
        });

        return tx.workOrder.update({
          where: { uuid: workOrder.uuid },
          data: { status: WORK_ORDER_STATUS.scheduling },
        });
      });
    },

    /**
     * A job card is a report of work done at one process step. It advances that
     * step's produced/defective counts, then lets the work order recompute itself.
     */
    reportJobCard: async (
      _: unknown,
      {
        request,
      }: {
        request: {
          workOrderUuid?: string;
          workOrderItemUuid?: string;
          operatorStaffUuid?: string;
          producedQty?: number;
          defectiveQty?: number;
          machineHours?: number;
          startTime?: string;
          endTime?: string;
        };
      },
      ctx: Context,
    ) => {
      const companyUuid = requireCompany(ctx);
      const machineHours = new Prisma.Decimal(request.machineHours ?? 0);
      if (machineHours.lt(0)) throw new GraphQLError('Machine hours cannot be negative.');

      if (!request.workOrderUuid || !request.workOrderItemUuid) {
        throw new GraphQLError('workOrderUuid and workOrderItemUuid are required');
      }

      return ctx.db.$transaction(async (tx) => {
        const workOrder = await tx.workOrder.findFirstOrThrow({
          where: { uuid: request.workOrderUuid, companyUuid },
        });
        const step = await tx.workOrderItem.findFirstOrThrow({
          where: {
            uuid: request.workOrderItemUuid,
            workOrderUuid: request.workOrderUuid,
            workOrder: { companyUuid },
          },
        });

        const producedQty = new Prisma.Decimal(request.producedQty ?? 0);
        const defectiveQty = new Prisma.Decimal(request.defectiveQty ?? 0);

        await tx.jobCard.create({
          data: {
            companyUuid,
            workOrderUuid: step.workOrderUuid,
            workOrderItemUuid: step.uuid,
            operatorStaffUuid: request.operatorStaffUuid || workOrder.assignedStaffUuid,
            // A reported job card is work that already happened, not a queued
            // task, so it skips the queue states the column now defaults to.
            status: JOB_CARD_STATUS.completed,
            producedQty,
            defectiveQty,
            machineHours,
            startTime: request.startTime ? new Date(request.startTime) : null,
            endTime: request.endTime ? new Date(request.endTime) : null,
          },
        });

        if (machineHours.gt(0)) {
          await tx.workOrder.update({
            where: { uuid: workOrder.uuid },
            data: { machineHours: { increment: machineHours } },
          });
        }

        await tx.workOrderItem.update({
          where: { uuid: step.uuid },
          data: {
            producedQty: { increment: producedQty },
            defectiveQty: { increment: defectiveQty },
          },
        });

        return refreshWorkOrder(tx, step.workOrderUuid);
      });
    },

    /**
     * Moving finished goods into the warehouse. This is the point where production
     * turns into stock, so it consumes the components it required on the way in.
     */
    storeFinishItem: async (
      _: unknown,
      { request }: { request: { workOrderUuid?: string; storedQty?: number } },
      ctx: Context,
    ) => {
      const companyUuid = requireCompany(ctx);

      if (!request.workOrderUuid) {
        throw new GraphQLError('workOrderUuid is required');
      }

      const storedQty = new Prisma.Decimal(request.storedQty ?? 0);

      if (storedQty.lte(0)) {
        throw new GraphQLError('storedQty must be greater than zero');
      }

      return ctx.db.$transaction(async (tx) => {
        const workOrder = await tx.workOrder.findFirstOrThrow({
          where: { uuid: request.workOrderUuid, companyUuid },
          include: { materialRequests: true },
        });

        const alreadyStored = new Prisma.Decimal(workOrder.storedQty);
        const producible = new Prisma.Decimal(workOrder.producedQty).sub(alreadyStored);

        if (storedQty.gt(producible)) {
          throw new GraphQLError(`cannot store ${storedQty}: only ${producible} produced but not yet stored`);
        }

        if (!workOrder.stockUomUuid) {
          throw new GraphQLError('work order item has no stock UOM, cannot store it');
        }

        // Components are consumed in proportion to what is actually being stored,
        // so a partial store only burns its share of the material.
        const ratio = storedQty.div(workOrder.plannedQty);

        for (const material of workOrder.materialRequests) {
          if (!material.stockUomUuid) continue;

          const consumed = new Prisma.Decimal(material.actualQty).mul(ratio);

          await applyStockMove(tx, {
            companyUuid,
            itemUuid: material.itemUuid,
            warehouseUuid: material.warehouseUuid,
            stockUomUuid: material.stockUomUuid,
            qty: consumed.negated(),
            type: 'material_consumption',
            threadType: 'work_order',
            threadUuid: workOrder.uuid,
          });

          await tx.workOrderMaterialRequest.update({
            where: { uuid: material.uuid },
            data: { receivedQty: { increment: consumed } },
          });
        }

        await applyStockMove(tx, {
          companyUuid,
          itemUuid: workOrder.itemUuid,
          warehouseUuid: workOrder.warehouseUuid,
          stockUomUuid: workOrder.stockUomUuid,
          qty: storedQty,
          type: 'production',
          threadType: 'work_order',
          threadUuid: workOrder.uuid,
        });

        await tx.workOrder.update({
          where: { uuid: workOrder.uuid },
          data: { storedQty: { increment: storedQty } },
        });

        return refreshWorkOrder(tx, workOrder.uuid);
      });
    },
  },

  Bom: {
    /**
     * The assembly flattened into levels (SRS 4.4): level 0 is the finished part,
     * level 1 its direct components, deeper levels come from components that have
     * their own BOM. Quantities are per one unit of the level-0 item.
     */
    levels: async (parent: { uuid: string; itemUuid: string }, _: unknown, ctx: Context) => {
      const root = await ctx.loaders.item.load(parent.itemUuid);
      const rows: Array<{
        level: number;
        itemName: string;
        itemType: string | null;
        qty: number;
        bomCode: string | null;
      }> = [{ level: 0, itemName: root?.name ?? '', itemType: root?.itemType ?? null, qty: 1, bomCode: null }];
      const walk = async (bomUuid: string, level: number, multiplier: number, seen: Set<string>) => {
        const components = await ctx.db.bomItem.findMany({ where: { bomUuid }, include: { item: true } });
        for (const component of components) {
          const qty = Number(component.qty) * multiplier;
          const sub = await ctx.db.bom.findFirst({
            where: { itemUuid: component.itemUuid },
            orderBy: { insertedAt: 'desc' },
          });
          rows.push({
            level,
            itemName: component.item.name,
            itemType: component.item.itemType,
            qty,
            bomCode: sub?.code ?? null,
          });
          // A component that points back up the tree would loop forever.
          if (sub && !seen.has(sub.uuid)) await walk(sub.uuid, level + 1, qty, new Set([...seen, sub.uuid]));
        }
      };
      await walk(parent.uuid, 1, 1, new Set([parent.uuid]));
      return rows;
    },
    item: (parent: { itemUuid: string }, _: unknown, ctx: Context) => ctx.loaders.item.load(parent.itemUuid),
    itemName: async (parent: { itemUuid: string }, _: unknown, ctx: Context) => {
      const item = await ctx.loaders.item.load(parent.itemUuid);
      return item?.name ?? null;
    },
    bomItems: (parent: { uuid: string }, _: unknown, ctx: Context) =>
      ctx.db.bomItem.findMany({ where: { bomUuid: parent.uuid } }),
    bomProcesses: (parent: { uuid: string }, _: unknown, ctx: Context) =>
      ctx.db.bomProcess.findMany({ where: { bomUuid: parent.uuid }, orderBy: { position: 'asc' } }),
  },

  BomItem: {
    item: (parent: { itemUuid: string }, _: unknown, ctx: Context) => ctx.loaders.item.load(parent.itemUuid),
    itemName: async (parent: { itemUuid: string }, _: unknown, ctx: Context) => {
      const item = await ctx.loaders.item.load(parent.itemUuid);
      return item?.name ?? null;
    },
    stockUom: (parent: { stockUomUuid: string | null }, _: unknown, ctx: Context) =>
      parent.stockUomUuid ? ctx.loaders.stockUom.load(parent.stockUomUuid) : null,
    uomName: async (parent: { stockUomUuid: string | null }, _: unknown, ctx: Context) => {
      if (!parent.stockUomUuid) return null;
      const stockUom = await ctx.loaders.stockUom.load(parent.stockUomUuid);
      return stockUom?.uom.name ?? null;
    },
    bom: (parent: { bomUuid: string }, _: unknown, ctx: Context) => ctx.loaders.bom.load(parent.bomUuid),
  },

  BomProcess: {
    process: (parent: { processUuid: string }, _: unknown, ctx: Context) =>
      ctx.loaders.process.load(parent.processUuid),
    processName: async (parent: { processUuid: string }, _: unknown, ctx: Context) => {
      const process = await ctx.loaders.process.load(parent.processUuid);
      return process?.name ?? null;
    },
    bom: (parent: { bomUuid: string }, _: unknown, ctx: Context) => ctx.loaders.bom.load(parent.bomUuid),
  },

  WorkOrder: {
    laborHours: async (parent: { uuid: string }, _: unknown, ctx: Context) => {
      const cards = await ctx.db.jobCard.findMany({
        where: { workOrderUuid: parent.uuid },
        select: { startTime: true, endTime: true },
      });
      const hours = cards.reduce(
        (sum, c) => (c.startTime && c.endTime ? sum + Math.max(0, +c.endTime - +c.startTime) / 3_600_000 : sum),
        0,
      );
      return Math.round(hours * 100) / 100;
    },
    assignedStaffName: async (parent: { assignedStaffUuid: string | null }, _: unknown, ctx: Context) => {
      if (!parent.assignedStaffUuid) return null;
      const staff = await ctx.loaders.staff.load(parent.assignedStaffUuid);
      return staff?.name ?? staff?.email ?? null;
    },
    salesOrderCode: async (parent: { salesOrderUuid: string | null }, _: unknown, ctx: Context) =>
      parent.salesOrderUuid ? (await ctx.loaders.salesOrder.load(parent.salesOrderUuid))?.code : null,
    items: (parent: { uuid: string }, _: unknown, ctx: Context) => ctx.loaders.workOrderSteps.load(parent.uuid),
    materialRequests: (parent: { uuid: string }, _: unknown, ctx: Context) =>
      ctx.db.workOrderMaterialRequest.findMany({ where: { workOrderUuid: parent.uuid } }),
    item: (parent: { itemUuid: string }, _: unknown, ctx: Context) => ctx.loaders.item.load(parent.itemUuid),
    bom: (parent: { bomUuid: string | null }, _: unknown, ctx: Context) =>
      parent.bomUuid ? ctx.loaders.bom.load(parent.bomUuid) : null,
    warehouse: (parent: { warehouseUuid: string }, _: unknown, ctx: Context) =>
      ctx.loaders.warehouse.load(parent.warehouseUuid),
    uomName: async (parent: { stockUomUuid: string | null }, _: unknown, ctx: Context) => {
      if (!parent.stockUomUuid) return null;
      const stockUom = await ctx.loaders.stockUom.load(parent.stockUomUuid);
      return stockUom?.uom.name ?? null;
    },
  },

  WorkOrderItem: {
    workOrder: (parent: { workOrderUuid: string }, _: unknown, ctx: Context) =>
      ctx.loaders.workOrder.load(parent.workOrderUuid),
    jobCards: (parent: { uuid: string }, _: unknown, ctx: Context) =>
      ctx.db.jobCard.findMany({
        where: { workOrderItemUuid: parent.uuid },
        orderBy: { insertedAt: 'desc' },
      }),
  },

  WorkOrderMaterialRequest: {
    item: (parent: { itemUuid: string }, _: unknown, ctx: Context) => ctx.loaders.item.load(parent.itemUuid),
    warehouse: (parent: { warehouseUuid: string }, _: unknown, ctx: Context) =>
      ctx.loaders.warehouse.load(parent.warehouseUuid),
    workOrder: (parent: { workOrderUuid: string }, _: unknown, ctx: Context) =>
      ctx.loaders.workOrder.load(parent.workOrderUuid),
    stockUom: (parent: { stockUomUuid: string | null }, _: unknown, ctx: Context) =>
      parent.stockUomUuid ? ctx.loaders.stockUom.load(parent.stockUomUuid) : null,
    remainingQty: (parent: { actualQty: Prisma.Decimal; receivedQty: Prisma.Decimal }) =>
      new Prisma.Decimal(parent.actualQty).sub(parent.receivedQty),
  },

  JobCard: {
    /** Labour time from the reported start and end. */
    laborHours: (parent: { startTime: Date | null; endTime: Date | null }) =>
      parent.startTime && parent.endTime
        ? Math.max(0, Math.round(((+parent.endTime - +parent.startTime) / 3_600_000) * 100) / 100)
        : 0,
    operatorStaff: (parent: { operatorStaffUuid: string | null }, _: unknown, ctx: Context) =>
      parent.operatorStaffUuid ? ctx.loaders.staff.load(parent.operatorStaffUuid) : null,
    workOrder: (parent: { workOrderUuid: string }, _: unknown, ctx: Context) =>
      ctx.loaders.workOrder.load(parent.workOrderUuid),
    workOrderItem: (parent: { workOrderItemUuid: string }, _: unknown, ctx: Context) =>
      ctx.loaders.workOrderItem.load(parent.workOrderItemUuid),
  },
};
