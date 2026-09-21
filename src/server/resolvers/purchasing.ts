import { GraphQLError } from 'graphql';
import { Prisma } from '@/generated/prisma/client';
import type { Context } from '../context';
import { requireCompany } from '../context';
import { nextCode } from '../domain/codes';
import { applyStockMove } from '../domain/stock';
import { refreshPurchaseOrder } from '../domain/purchasing';
import { RECEIPT_NOTE_STATUS, UNSETTLED_INVOICE_STATUSES } from '../domain/status';

export const purchasingResolvers = {
  RootQueryType: {
    purchaseOrders: async (_: unknown, __: unknown, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.purchaseOrder.findMany({
        where: { companyUuid },
        orderBy: { insertedAt: 'desc' },
      });
    },
    purchaseOrder: async (_: unknown, { request }: { request: { purchaseOrderUuid?: string } }, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.purchaseOrder.findFirst({
        where: { uuid: request.purchaseOrderUuid ?? '', companyUuid },
      });
    },
    receiptNotes: async (_: unknown, __: unknown, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.receiptNote.findMany({
        where: { companyUuid },
        orderBy: { insertedAt: 'desc' },
      });
    },
    receiptNote: async (
      _: unknown,
      { request }: { request: { receiptNoteUuid?: string; purchaseOrderUuid?: string } },
      ctx: Context,
    ) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.receiptNote.findFirst({
        where: {
          companyUuid,
          ...(request.receiptNoteUuid
            ? { uuid: request.receiptNoteUuid }
            : { purchaseOrderUuid: request.purchaseOrderUuid ?? '' }),
        },
        orderBy: { insertedAt: 'desc' },
      });
    },
    purchaseInvoices: async (_: unknown, __: unknown, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.purchaseInvoice.findMany({
        where: { companyUuid },
        orderBy: { insertedAt: 'desc' },
      });
    },
    purchaseInvoice: async (
      _: unknown,
      { request }: { request: { purchaseInvoiceUuid?: string; purchaseOrderUuid?: string } },
      ctx: Context,
    ) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.purchaseInvoice.findFirst({
        where: {
          companyUuid,
          ...(request.purchaseInvoiceUuid
            ? { uuid: request.purchaseInvoiceUuid }
            : { purchaseOrderUuid: request.purchaseOrderUuid ?? '' }),
        },
        orderBy: { insertedAt: 'desc' },
      });
    },
    unpaidPurchaseInvoicesBySupplier: async (_: unknown, { request }: { request: { uuid?: string } }, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.purchaseInvoice.findMany({
        where: {
          companyUuid,
          supplierUuid: request.uuid ?? '',
          status: { in: [...UNSETTLED_INVOICE_STATUSES] },
        },
        orderBy: { insertedAt: 'asc' },
      });
    },
  },

  RootMutationType: {
    createPurchaseOrder: async (
      _: unknown,
      {
        request,
      }: {
        request: {
          supplierUuid?: string;
          warehouseUuid?: string;
          purchaseItems?: Array<{
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

      if (!request.supplierUuid || !request.warehouseUuid) {
        throw new GraphQLError('supplierUuid and warehouseUuid are required');
      }

      const lines = (request.purchaseItems ?? []).filter((line) => line?.itemUuid);

      if (!lines.length) {
        throw new GraphQLError('a purchase order needs at least one line item');
      }

      return ctx.db.$transaction(async (tx) => {
        const supplier = await tx.supplier.findFirstOrThrow({
          where: { uuid: request.supplierUuid, companyUuid },
        });

        const items = await tx.item.findMany({
          where: { uuid: { in: lines.map((l) => l.itemUuid as string) }, companyUuid },
        });
        const itemsByUuid = new Map(items.map((i) => [i.uuid, i]));

        const code = await nextCode(tx, companyUuid, 'purchaseOrder');

        const order = await tx.purchaseOrder.create({
          data: {
            code,
            companyUuid,
            supplierUuid: supplier.uuid,
            supplierName: supplier.name,
            supplierAddress: supplier.address,
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
                  unitPrice: new Prisma.Decimal(line.unitPrice ?? 0),
                  orderedQty: new Prisma.Decimal(line.orderedQty ?? 0),
                };
              }),
            },
          },
        });

        return refreshPurchaseOrder(tx, order.uuid);
      });
    },

    createReceiptNote: async (
      _: unknown,
      {
        request,
      }: {
        request: {
          purchaseOrderUuid?: string;
          receiptItems?: Array<{ purchaseOrderItemUuid?: string; actualQty?: number }>;
        };
      },
      ctx: Context,
    ) => {
      const companyUuid = requireCompany(ctx);

      if (!request.purchaseOrderUuid) {
        throw new GraphQLError('purchaseOrderUuid is required');
      }

      const lines = (request.receiptItems ?? []).filter(
        (line) => line?.purchaseOrderItemUuid && Number(line.actualQty) > 0,
      );

      if (!lines.length) {
        throw new GraphQLError('a receipt note needs at least one line with a quantity');
      }

      return ctx.db.$transaction(async (tx) => {
        const order = await tx.purchaseOrder.findFirstOrThrow({
          where: { uuid: request.purchaseOrderUuid, companyUuid },
          include: { items: true },
        });

        const orderItems = new Map(order.items.map((i) => [i.uuid, i]));
        const code = await nextCode(tx, companyUuid, 'receiptNote');

        let totalQty = new Prisma.Decimal(0);
        let totalAmount = new Prisma.Decimal(0);

        const note = await tx.receiptNote.create({
          data: {
            code,
            companyUuid,
            supplierUuid: order.supplierUuid,
            supplierName: order.supplierName,
            purchaseOrderUuid: order.uuid,
            warehouseUuid: order.warehouseUuid,
          },
        });

        for (const line of lines) {
          const orderItem = orderItems.get(line.purchaseOrderItemUuid as string);

          if (!orderItem) {
            throw new GraphQLError(`line ${line.purchaseOrderItemUuid} is not on this purchase order`);
          }

          const actualQty = new Prisma.Decimal(line.actualQty ?? 0);
          const outstanding = new Prisma.Decimal(orderItem.orderedQty).sub(orderItem.receivedQty);

          if (actualQty.gt(outstanding)) {
            throw new GraphQLError(
              `cannot receive ${actualQty} of ${orderItem.itemName}: only ${outstanding} outstanding`,
            );
          }

          await tx.receiptNoteItem.create({
            data: {
              receiptNoteUuid: note.uuid,
              purchaseOrderItemUuid: orderItem.uuid,
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

        return tx.receiptNote.update({
          where: { uuid: note.uuid },
          data: { totalQty, totalAmount },
        });
      });
    },

    completeReceiptNote: async (_: unknown, { request }: { request: { receiptNoteUuid?: string } }, ctx: Context) => {
      const companyUuid = requireCompany(ctx);

      if (!request.receiptNoteUuid) {
        throw new GraphQLError('receiptNoteUuid is required');
      }

      return ctx.db.$transaction(async (tx) => {
        const note = await tx.receiptNote.findFirstOrThrow({
          where: { uuid: request.receiptNoteUuid, companyUuid },
          include: { items: true },
        });

        if (note.status === RECEIPT_NOTE_STATUS.done) {
          throw new GraphQLError('this receipt note is already completed');
        }

        for (const line of note.items) {
          if (!line.stockUomUuid) {
            throw new GraphQLError(`${line.itemName} has no stock UOM, cannot receive it`);
          }

          await applyStockMove(tx, {
            companyUuid,
            itemUuid: line.itemUuid,
            warehouseUuid: note.warehouseUuid,
            stockUomUuid: line.stockUomUuid,
            qty: line.actualQty,
            type: 'receipt',
            threadType: 'receipt_note',
            threadUuid: note.uuid,
          });

          await tx.purchaseOrderItem.update({
            where: { uuid: line.purchaseOrderItemUuid },
            data: { receivedQty: { increment: line.actualQty } },
          });
        }

        const completed = await tx.receiptNote.update({
          where: { uuid: note.uuid },
          data: { status: RECEIPT_NOTE_STATUS.done },
        });

        await refreshPurchaseOrder(tx, note.purchaseOrderUuid);

        return completed;
      });
    },

    createPurchaseInvoice: async (
      _: unknown,
      { request }: { request: { purchaseOrderUuid?: string; amount?: number } },
      ctx: Context,
    ) => {
      const companyUuid = requireCompany(ctx);

      if (!request.purchaseOrderUuid) {
        throw new GraphQLError('purchaseOrderUuid is required');
      }

      return ctx.db.$transaction(async (tx) => {
        const order = await tx.purchaseOrder.findFirstOrThrow({
          where: { uuid: request.purchaseOrderUuid, companyUuid },
        });

        const code = await nextCode(tx, companyUuid, 'purchaseInvoice');

        const invoice = await tx.purchaseInvoice.create({
          data: {
            code,
            companyUuid,
            amount: new Prisma.Decimal(request.amount ?? order.totalAmount),
            supplierUuid: order.supplierUuid,
            supplierName: order.supplierName,
            purchaseOrderUuid: order.uuid,
          },
        });

        await refreshPurchaseOrder(tx, order.uuid);

        return invoice;
      });
    },
  },

  PurchaseOrder: {
    items: (parent: { uuid: string }, _: unknown, ctx: Context) => ctx.loaders.purchaseOrderItems.load(parent.uuid),
    receiptNotes: (parent: { uuid: string }, _: unknown, ctx: Context) =>
      ctx.db.receiptNote.findMany({ where: { purchaseOrderUuid: parent.uuid } }),
    purchaseInvoices: (parent: { uuid: string }, _: unknown, ctx: Context) =>
      ctx.db.purchaseInvoice.findMany({ where: { purchaseOrderUuid: parent.uuid } }),
    supplier: (parent: { supplierUuid: string }, _: unknown, ctx: Context) =>
      ctx.loaders.supplier.load(parent.supplierUuid),
    warehouse: (parent: { warehouseUuid: string }, _: unknown, ctx: Context) =>
      ctx.loaders.warehouse.load(parent.warehouseUuid),
    warehouseName: async (parent: { warehouseUuid: string }, _: unknown, ctx: Context) => {
      const warehouse = await ctx.loaders.warehouse.load(parent.warehouseUuid);
      return warehouse?.name ?? null;
    },
    remainingQty: (parent: { totalQty: Prisma.Decimal; receivedQty: Prisma.Decimal }) =>
      new Prisma.Decimal(parent.totalQty).sub(parent.receivedQty),
    remainingAmount: (parent: { totalAmount: Prisma.Decimal; paidAmount: Prisma.Decimal }) =>
      new Prisma.Decimal(parent.totalAmount).sub(parent.paidAmount),
  },

  PurchaseOrderItem: {
    amount: (parent: { unitPrice: Prisma.Decimal; orderedQty: Prisma.Decimal }) =>
      new Prisma.Decimal(parent.unitPrice).mul(parent.orderedQty),
    remainingQty: (parent: { orderedQty: Prisma.Decimal; receivedQty: Prisma.Decimal }) =>
      new Prisma.Decimal(parent.orderedQty).sub(parent.receivedQty),
  },

  ReceiptNote: {
    items: (parent: { uuid: string }, _: unknown, ctx: Context) => ctx.loaders.receiptNoteItems.load(parent.uuid),
    warehouse: (parent: { warehouseUuid: string }, _: unknown, ctx: Context) =>
      ctx.loaders.warehouse.load(parent.warehouseUuid),
  },

  ReceiptNoteItem: {
    amount: (parent: { unitPrice: Prisma.Decimal; actualQty: Prisma.Decimal }) =>
      new Prisma.Decimal(parent.unitPrice).mul(parent.actualQty),
  },

  PurchaseInvoice: {
    supplier: (parent: { supplierUuid: string }, _: unknown, ctx: Context) =>
      ctx.loaders.supplier.load(parent.supplierUuid),
    purchaseOrder: (parent: { purchaseOrderUuid: string }, _: unknown, ctx: Context) =>
      ctx.loaders.purchaseOrder.load(parent.purchaseOrderUuid),
  },
};
