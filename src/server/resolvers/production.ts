import { GraphQLError } from 'graphql';
import { Prisma } from '@/generated/prisma/client';
import type { Context } from '../context';
import { requireCompany } from '../context';
import { nextCode } from '../domain/codes';
import { applyStockMove } from '../domain/stock';
import { expandBom, refreshWorkOrder } from '../domain/production';
import { WORK_ORDER_STATUS } from '../domain/status';

type Id = { request: { uuid?: string } };

export const productionResolvers = {
  RootQueryType: {
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

        return tx.bom.create({
          data: {
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
          startTime?: string;
          endTime?: string;
        };
      },
      ctx: Context,
    ) => {
      const companyUuid = requireCompany(ctx);

      if (!request.workOrderUuid || !request.workOrderItemUuid) {
        throw new GraphQLError('workOrderUuid and workOrderItemUuid are required');
      }

      return ctx.db.$transaction(async (tx) => {
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
            operatorStaffUuid: request.operatorStaffUuid,
            producedQty,
            defectiveQty,
            startTime: request.startTime ? new Date(request.startTime) : null,
            endTime: request.endTime ? new Date(request.endTime) : null,
          },
        });

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
    operatorStaff: (parent: { operatorStaffUuid: string | null }, _: unknown, ctx: Context) =>
      parent.operatorStaffUuid ? ctx.loaders.staff.load(parent.operatorStaffUuid) : null,
    workOrder: (parent: { workOrderUuid: string }, _: unknown, ctx: Context) =>
      ctx.loaders.workOrder.load(parent.workOrderUuid),
    workOrderItem: (parent: { workOrderItemUuid: string }, _: unknown, ctx: Context) =>
      ctx.loaders.workOrderItem.load(parent.workOrderItemUuid),
  },
};
