import { createSalesInvoice, invoicedQtyByOrderItem, type CreateSalesInvoiceRequest } from '../domain/sales-invoice';
import { GraphQLError } from 'graphql';
import { Prisma } from '@/generated/prisma/client';
import type { Context } from '../context';
import { requireCompany } from '../context';
import { nextCode } from '../domain/codes';
import { applyStockMove } from '../domain/stock';
import { refreshSalesOrder } from '../domain/sales';
import { DELIVERY_NOTE_STATUS, UNSETTLED_INVOICE_STATUSES } from '../domain/status';

export const sellingResolvers = {
  RootQueryType: {
    salesOrders: async (_: unknown, __: unknown, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.salesOrder.findMany({
        where: { companyUuid },
        orderBy: { insertedAt: 'desc' },
      });
    },
    salesOrder: async (_: unknown, { request }: { request: { salesOrderUuid?: string } }, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.salesOrder.findFirst({
        where: { uuid: request.salesOrderUuid ?? '', companyUuid },
      });
    },
    deliveryNotes: async (_: unknown, __: unknown, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.deliveryNote.findMany({
        where: { companyUuid },
        orderBy: { insertedAt: 'desc' },
      });
    },
    deliveryNote: async (
      _: unknown,
      { request }: { request: { deliveryNoteUuid?: string; salesOrderUuid?: string } },
      ctx: Context,
    ) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.deliveryNote.findFirst({
        where: {
          companyUuid,
          ...(request.deliveryNoteUuid
            ? { uuid: request.deliveryNoteUuid }
            : { salesOrderUuid: request.salesOrderUuid ?? '' }),
        },
        orderBy: { insertedAt: 'desc' },
      });
    },
    salesInvoices: async (_: unknown, __: unknown, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.salesInvoice.findMany({
        where: { companyUuid },
        orderBy: { insertedAt: 'desc' },
      });
    },
    salesInvoice: async (
      _: unknown,
      { request }: { request: { salesInvoiceUuid?: string; salesOrderUuid?: string } },
      ctx: Context,
    ) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.salesInvoice.findFirst({
        where: {
          companyUuid,
          ...(request.salesInvoiceUuid
            ? { uuid: request.salesInvoiceUuid }
            : { salesOrderUuid: request.salesOrderUuid ?? '' }),
        },
        orderBy: { insertedAt: 'desc' },
      });
    },
    unpaidSalesInvoicesByCustomer: async (_: unknown, { request }: { request: { uuid?: string } }, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.salesInvoice.findMany({
        where: {
          companyUuid,
          customerUuid: request.uuid ?? '',
          status: { in: [...UNSETTLED_INVOICE_STATUSES] },
        },
        orderBy: { insertedAt: 'asc' },
      });
    },
  },

  RootMutationType: {
    createSalesOrder: async (
      _: unknown,
      {
        request,
      }: {
        request: {
          customerUuid?: string;
          customerAddress?: string;
          warehouseUuid?: string;
          salesItems?: Array<{
            itemUuid?: string;
            orderedQty?: number;
            unitPrice?: number;
            stockUomUuid?: string;
            uomName?: string;
          }>;
        };
      },
      ctx: Context,
    ) => {
      const companyUuid = requireCompany(ctx);

      if (!request.customerUuid || !request.warehouseUuid) {
        throw new GraphQLError('customerUuid and warehouseUuid are required');
      }

      const lines = (request.salesItems ?? []).filter((line) => line?.itemUuid);

      if (!lines.length) {
        throw new GraphQLError('a sales order needs at least one line item');
      }

      return ctx.db.$transaction(async (tx) => {
        const customer = await tx.customer.findFirstOrThrow({
          where: { uuid: request.customerUuid, companyUuid },
        });

        const items = await tx.item.findMany({
          where: { uuid: { in: lines.map((l) => l.itemUuid as string) }, companyUuid },
        });
        const itemsByUuid = new Map(items.map((i) => [i.uuid, i]));

        const code = await nextCode(tx, companyUuid, 'salesOrder');

        const order = await tx.salesOrder.create({
          data: {
            code,
            companyUuid,
            customerUuid: customer.uuid,
            customerName: customer.name,
            customerAddress: request.customerAddress ?? customer.address,
            warehouseUuid: request.warehouseUuid as string,
            items: {
              create: lines.map((line) => {
                const item = itemsByUuid.get(line.itemUuid as string);

                if (!item) {
                  throw new GraphQLError(`unknown item ${line.itemUuid}`);
                }

                return {
                  itemUuid: item.uuid,
                  itemName: item.name,
                  uomName: line.uomName,
                  stockUomUuid: line.stockUomUuid,
                  unitPrice: new Prisma.Decimal(line.unitPrice ?? item.sellingPrice),
                  orderedQty: new Prisma.Decimal(line.orderedQty ?? 0),
                };
              }),
            },
          },
        });

        return refreshSalesOrder(tx, order.uuid);
      });
    },

    createDeliveryNote: async (
      _: unknown,
      {
        request,
      }: {
        request: {
          salesOrderUuid?: string;
          deliveryItems?: Array<{ salesOrderItemUuid?: string; actualQty?: number }>;
        };
      },
      ctx: Context,
    ) => {
      const companyUuid = requireCompany(ctx);

      if (!request.salesOrderUuid) {
        throw new GraphQLError('salesOrderUuid is required');
      }

      const lines = (request.deliveryItems ?? []).filter(
        (line) => line?.salesOrderItemUuid && Number(line.actualQty) > 0,
      );

      if (!lines.length) {
        throw new GraphQLError('a delivery note needs at least one line with a quantity');
      }

      return ctx.db.$transaction(async (tx) => {
        const order = await tx.salesOrder.findFirstOrThrow({
          where: { uuid: request.salesOrderUuid, companyUuid },
          include: { items: true },
        });

        const orderItems = new Map(order.items.map((i) => [i.uuid, i]));
        const code = await nextCode(tx, companyUuid, 'deliveryNote');

        let totalQty = new Prisma.Decimal(0);
        let totalAmount = new Prisma.Decimal(0);

        const note = await tx.deliveryNote.create({
          data: {
            code,
            companyUuid,
            customerUuid: order.customerUuid,
            customerName: order.customerName,
            salesOrderUuid: order.uuid,
            warehouseUuid: order.warehouseUuid,
          },
        });

        for (const line of lines) {
          const orderItem = orderItems.get(line.salesOrderItemUuid as string);

          if (!orderItem) {
            throw new GraphQLError(`line ${line.salesOrderItemUuid} is not on this sales order`);
          }

          const actualQty = new Prisma.Decimal(line.actualQty ?? 0);
          const outstanding = new Prisma.Decimal(orderItem.orderedQty).sub(orderItem.deliveredQty);

          // Over-delivery is rejected outright rather than clamped, so the operator
          // finds out now instead of discovering a silently shortened note later.
          if (actualQty.gt(outstanding)) {
            throw new GraphQLError(
              `cannot deliver ${actualQty} of ${orderItem.itemName}: only ${outstanding} outstanding`,
            );
          }

          await tx.deliveryNoteItem.create({
            data: {
              deliveryNoteUuid: note.uuid,
              salesOrderItemUuid: orderItem.uuid,
              itemUuid: orderItem.itemUuid,
              itemName: orderItem.itemName,
              uomName: orderItem.uomName,
              stockUomUuid: orderItem.stockUomUuid,
              actualQty,
              unitPrice: orderItem.unitPrice,
            },
          });

          totalQty = totalQty.add(actualQty);
          totalAmount = totalAmount.add(new Prisma.Decimal(orderItem.unitPrice).mul(actualQty));
        }

        return tx.deliveryNote.update({
          where: { uuid: note.uuid },
          data: { totalQty, totalAmount },
        });
      });
    },

    /**
     * Completing the note is what actually moves stock. Creating it only records
     * intent, so a draft can be corrected without touching inventory.
     */
    completeDeliveryNote: async (_: unknown, { request }: { request: { deliveryNoteUuid?: string } }, ctx: Context) => {
      const companyUuid = requireCompany(ctx);

      if (!request.deliveryNoteUuid) {
        throw new GraphQLError('deliveryNoteUuid is required');
      }

      return ctx.db.$transaction(async (tx) => {
        const note = await tx.deliveryNote.findFirstOrThrow({
          where: { uuid: request.deliveryNoteUuid, companyUuid },
          include: { items: true },
        });

        if (note.status === DELIVERY_NOTE_STATUS.done) {
          throw new GraphQLError('this delivery note is already completed');
        }

        for (const line of note.items) {
          if (!line.stockUomUuid) {
            throw new GraphQLError(`${line.itemName} has no stock UOM, cannot issue it`);
          }

          await applyStockMove(tx, {
            companyUuid,
            itemUuid: line.itemUuid,
            warehouseUuid: note.warehouseUuid,
            stockUomUuid: line.stockUomUuid,
            qty: new Prisma.Decimal(line.actualQty).negated(),
            type: 'delivery',
            threadType: 'delivery_note',
            threadUuid: note.uuid,
          });

          await tx.salesOrderItem.update({
            where: { uuid: line.salesOrderItemUuid },
            data: { deliveredQty: { increment: line.actualQty } },
          });
        }

        const completed = await tx.deliveryNote.update({
          where: { uuid: note.uuid },
          data: { status: DELIVERY_NOTE_STATUS.done },
        });

        await refreshSalesOrder(tx, note.salesOrderUuid);

        return completed;
      });
    },

    createSalesInvoice: async (_: unknown, { request }: { request: CreateSalesInvoiceRequest }, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.$transaction((tx) => createSalesInvoice(tx, companyUuid, request));
    },
  },

  SalesOrder: {
    items: (parent: { uuid: string }, _: unknown, ctx: Context) => ctx.loaders.salesOrderItems.load(parent.uuid),
    deliveryNotes: (parent: { uuid: string }, _: unknown, ctx: Context) =>
      ctx.db.deliveryNote.findMany({ where: { salesOrderUuid: parent.uuid } }),
    salesInvoices: (parent: { uuid: string }, _: unknown, ctx: Context) =>
      ctx.db.salesInvoice.findMany({ where: { salesOrderUuid: parent.uuid } }),
    customer: (parent: { customerUuid: string }, _: unknown, ctx: Context) =>
      ctx.loaders.customer.load(parent.customerUuid),
    warehouse: (parent: { warehouseUuid: string }, _: unknown, ctx: Context) =>
      ctx.loaders.warehouse.load(parent.warehouseUuid),
    warehouseName: async (parent: { warehouseUuid: string }, _: unknown, ctx: Context) => {
      const warehouse = await ctx.loaders.warehouse.load(parent.warehouseUuid);
      return warehouse?.name ?? null;
    },
    remainingQty: (parent: { totalQty: Prisma.Decimal; deliveredQty: Prisma.Decimal }) =>
      new Prisma.Decimal(parent.totalQty).sub(parent.deliveredQty),
    remainingAmount: (parent: { totalAmount: Prisma.Decimal; paidAmount: Prisma.Decimal }) =>
      new Prisma.Decimal(parent.totalAmount).sub(parent.paidAmount),
  },

  SalesOrderItem: {
    item: (parent: { itemUuid: string }, _: unknown, ctx: Context) => ctx.loaders.item.load(parent.itemUuid),
    salesOrder: (parent: { salesOrderUuid: string }, _: unknown, ctx: Context) =>
      ctx.loaders.salesOrder.load(parent.salesOrderUuid),
    amount: (parent: { unitPrice: Prisma.Decimal; orderedQty: Prisma.Decimal }) =>
      new Prisma.Decimal(parent.unitPrice).mul(parent.orderedQty),
    remainingQty: (parent: { orderedQty: Prisma.Decimal; deliveredQty: Prisma.Decimal }) =>
      new Prisma.Decimal(parent.orderedQty).sub(parent.deliveredQty),
    invoicedQty: async (parent: { uuid: string }, _: unknown, ctx: Context) =>
      (await invoicedQtyByOrderItem(ctx.db, [parent.uuid])).get(parent.uuid) ?? 0,
    uninvoicedQty: async (parent: { uuid: string; orderedQty: Prisma.Decimal }, _: unknown, ctx: Context) =>
      Number(parent.orderedQty) - ((await invoicedQtyByOrderItem(ctx.db, [parent.uuid])).get(parent.uuid) ?? 0),
  },

  DeliveryNote: {
    items: (parent: { uuid: string }, _: unknown, ctx: Context) => ctx.loaders.deliveryNoteItems.load(parent.uuid),
    customer: (parent: { customerUuid: string }, _: unknown, ctx: Context) =>
      ctx.loaders.customer.load(parent.customerUuid),
    salesOrder: (parent: { salesOrderUuid: string }, _: unknown, ctx: Context) =>
      ctx.loaders.salesOrder.load(parent.salesOrderUuid),
    warehouse: (parent: { warehouseUuid: string }, _: unknown, ctx: Context) =>
      ctx.loaders.warehouse.load(parent.warehouseUuid),
  },

  DeliveryNoteItem: {
    item: (parent: { itemUuid: string }, _: unknown, ctx: Context) => ctx.loaders.item.load(parent.itemUuid),
    deliveryNote: (parent: { deliveryNoteUuid: string }, _: unknown, ctx: Context) =>
      ctx.loaders.deliveryNote.load(parent.deliveryNoteUuid),
    salesOrderItem: (parent: { salesOrderItemUuid: string }, _: unknown, ctx: Context) =>
      ctx.loaders.salesOrderItem.load(parent.salesOrderItemUuid),
    amount: (parent: { unitPrice: Prisma.Decimal; actualQty: Prisma.Decimal }) =>
      new Prisma.Decimal(parent.unitPrice).mul(parent.actualQty),
  },

  SalesInvoice: {
    items: (parent: { uuid: string }, _: unknown, ctx: Context) =>
      ctx.db.salesInvoiceItem.findMany({ where: { salesInvoiceUuid: parent.uuid } }),
    balance: (parent: { amount: Prisma.Decimal; paidAmount: Prisma.Decimal }) =>
      new Prisma.Decimal(parent.amount).sub(parent.paidAmount),
    salesOrderCode: async (parent: { salesOrderUuid: string }, _: unknown, ctx: Context) =>
      (await ctx.loaders.salesOrder.load(parent.salesOrderUuid))?.code ?? null,
    customer: (parent: { customerUuid: string }, _: unknown, ctx: Context) =>
      ctx.loaders.customer.load(parent.customerUuid),
    salesOrder: (parent: { salesOrderUuid: string }, _: unknown, ctx: Context) =>
      ctx.loaders.salesOrder.load(parent.salesOrderUuid),
  },
};
