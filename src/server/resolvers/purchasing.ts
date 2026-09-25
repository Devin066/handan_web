import { GraphQLError } from 'graphql';
import { Prisma } from '@/generated/prisma/client';
import type { Context } from '../context';
import { requireCompany } from '../context';
import { nextCode } from '../domain/codes';
import { applyStockMove } from '../domain/stock';
import { refreshPurchaseOrder, refreshPurchaseRequest } from '../domain/purchasing';
import { ACCOUNT, postJournal } from '../domain/ledger';
import { RECEIPT_NOTE_STATUS, UNSETTLED_INVOICE_STATUSES } from '../domain/status';

export const purchasingResolvers = {
  RootQueryType: {
    purchaseRequests: async (_: unknown, __: unknown, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.purchaseRequest.findMany({ where: { companyUuid }, orderBy: { insertedAt: 'desc' } });
    },
    /** Approved PR lines with quantity still to order: what a new PO can pull in. */
    openPurchaseRequestItems: async (_: unknown, __: unknown, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      const lines = await ctx.db.purchaseRequestItem.findMany({
        where: {
          purchaseRequest: { companyUuid, status: { in: ['approved', 'partly_ordered'] } },
        },
        include: { purchaseRequest: true },
        orderBy: { insertedAt: 'asc' },
      });
      return lines.filter((line) => new Prisma.Decimal(line.requestedQty).gt(line.orderedQty));
    },
    supplierPrices: async (_: unknown, { request }: { request: { uuid?: string } }, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.supplierPrice.findMany({
        where: { companyUuid, supplierUuid: request.uuid ?? '' },
      });
    },
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
          expectedDate?: string;
          purchaseItems?: Array<{
            purchaseRequestItemUuid?: string;
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
            expectedDate: request.expectedDate ? new Date(request.expectedDate) : null,
            items: {
              create: lines.map((line) => {
                const item = itemsByUuid.get(line.itemUuid as string);

                if (!item) {
                  throw new GraphQLError(`unknown item ${line.itemUuid}`);
                }

                return {
                  purchaseRequestItemUuid: line.purchaseRequestItemUuid || null,
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

        // Pulling a PR line into a PO counts against what is left to order on it.
        const touchedRequests = new Set<string>();
        for (const line of lines) {
          if (!line.purchaseRequestItemUuid) continue;
          const prLine = await tx.purchaseRequestItem.findFirst({
            where: { uuid: line.purchaseRequestItemUuid, purchaseRequest: { companyUuid } },
            include: { purchaseRequest: true },
          });
          if (!prLine || !['approved', 'partly_ordered'].includes(prLine.purchaseRequest.status)) {
            throw new GraphQLError('A selected purchase request line is not approved or no longer open.');
          }
          const qty = new Prisma.Decimal(line.orderedQty ?? 0);
          const left = new Prisma.Decimal(prLine.requestedQty).sub(prLine.orderedQty);
          if (qty.gt(left)) {
            throw new GraphQLError(`${prLine.itemName}: only ${left} left to order on ${prLine.purchaseRequest.code}.`);
          }
          await tx.purchaseRequestItem.update({
            where: { uuid: prLine.uuid },
            data: { orderedQty: { increment: qty } },
          });
          touchedRequests.add(prLine.purchaseRequestUuid);
        }
        for (const uuid of touchedRequests) await refreshPurchaseRequest(tx, uuid);

        // The supplier's latest price per item feeds later PR and PO estimates.
        for (const line of lines) {
          await tx.supplierPrice.upsert({
            where: { itemUuid_supplierUuid: { itemUuid: line.itemUuid as string, supplierUuid: supplier.uuid } },
            create: {
              companyUuid,
              itemUuid: line.itemUuid as string,
              supplierUuid: supplier.uuid,
              unitPrice: new Prisma.Decimal(line.unitPrice ?? 0),
            },
            update: { unitPrice: new Prisma.Decimal(line.unitPrice ?? 0) },
          });
        }

        return refreshPurchaseOrder(tx, order.uuid);
      });
    },

    createPurchaseRequest: async (
      _: unknown,
      {
        request,
      }: {
        request: {
          requestedBy?: string;
          requiredDate?: string;
          notes?: string;
          items?: Array<{
            itemUuid?: string;
            requestedQty?: number;
            stockUomUuid?: string;
            uomName?: string;
            supplierUuid?: string | null;
          }>;
        };
      },
      ctx: Context,
    ) => {
      const companyUuid = requireCompany(ctx);
      const lines = (request.items ?? []).filter((line) => line?.itemUuid && Number(line.requestedQty) > 0);
      if (!lines.length) throw new GraphQLError('Add at least one item with a quantity.');

      return ctx.db.$transaction(async (tx) => {
        const items = await tx.item.findMany({
          where: { uuid: { in: lines.map((l) => l.itemUuid as string) }, companyUuid },
          include: { supplierPrices: true, stockUoms: { orderBy: { sequence: 'asc' }, include: { uom: true } } },
        });
        const itemsByUuid = new Map(items.map((i) => [i.uuid, i]));
        const supplierUuids = lines.map((l) => l.supplierUuid).filter(Boolean) as string[];
        const suppliers = await tx.supplier.findMany({ where: { uuid: { in: supplierUuids }, companyUuid } });
        const suppliersByUuid = new Map(suppliers.map((s) => [s.uuid, s]));
        const code = await nextCode(tx, companyUuid, 'purchaseRequest');

        return tx.purchaseRequest.create({
          data: {
            code,
            companyUuid,
            requestedBy: request.requestedBy?.trim() || null,
            requiredDate: request.requiredDate ? new Date(request.requiredDate) : null,
            notes: request.notes?.trim() || null,
            items: {
              create: lines.map((line) => {
                const item = itemsByUuid.get(line.itemUuid as string);
                if (!item) throw new GraphQLError(`unknown item ${line.itemUuid}`);
                const supplier = line.supplierUuid ? suppliersByUuid.get(line.supplierUuid) : undefined;
                if (line.supplierUuid && !supplier) throw new GraphQLError('That supplier is not in your company.');
                // The chosen supplier's price; without one, the cheapest known price, else standard cost.
                const chosen = supplier && item.supplierPrices.find((p) => p.supplierUuid === supplier.uuid);
                const prices = item.supplierPrices.map((p) => new Prisma.Decimal(p.unitPrice));
                let estimate = new Prisma.Decimal(item.standardCost);
                if (chosen) estimate = new Prisma.Decimal(chosen.unitPrice);
                else if (prices.length) estimate = prices.reduce((min, p) => (p.lt(min) ? p : min));
                const uom = item.stockUoms.find((u) => u.uuid === line.stockUomUuid) ?? item.stockUoms[0];
                return {
                  itemUuid: item.uuid,
                  itemName: item.name,
                  stockUomUuid: uom?.uuid,
                  uomName: line.uomName ?? uom?.uom.name,
                  requestedQty: new Prisma.Decimal(line.requestedQty ?? 0),
                  estimatedUnitPrice: estimate,
                  supplierUuid: supplier?.uuid ?? null,
                  supplierName: supplier?.name ?? null,
                };
              }),
            },
          },
        });
      });
    },

    reviewPurchaseRequest: async (
      _: unknown,
      { request }: { request: { uuid?: string; approve?: boolean } },
      ctx: Context,
    ) => {
      const companyUuid = requireCompany(ctx);
      const pr = await ctx.db.purchaseRequest.findFirst({ where: { uuid: request.uuid ?? '', companyUuid } });
      if (!pr) throw new GraphQLError('Purchase request not found.');
      if (pr.status !== 'pending') throw new GraphQLError(`${pr.code} has already been reviewed.`);

      return ctx.db.purchaseRequest.update({
        where: { uuid: pr.uuid },
        data: request.approve ? { status: 'approved', approvedAt: new Date() } : { status: 'rejected' },
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

        // Goods Receipt Received (SRS 5): the supplier's bill for what arrived.
        const invoiceCode = await nextCode(tx, companyUuid, 'purchaseInvoice');
        const invoice = await tx.purchaseInvoice.create({
          data: {
            code: invoiceCode,
            companyUuid,
            amount: note.totalAmount,
            supplierUuid: note.supplierUuid,
            supplierName: note.supplierName,
            purchaseOrderUuid: note.purchaseOrderUuid,
            receiptNoteUuid: note.uuid,
          },
        });
        await postJournal(tx, {
          companyUuid,
          description: `Goods received from ${note.supplierName}`,
          sourceType: 'purchase_invoice',
          sourceUuid: invoice.uuid,
          sourceCode: invoice.code,
          lines: [
            { account: ACCOUNT.inventory, debit: note.totalAmount },
            { account: ACCOUNT.accountsPayable, credit: note.totalAmount },
          ],
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

        await postJournal(tx, {
          companyUuid,
          description: `Purchase invoice from ${order.supplierName}`,
          sourceType: 'purchase_invoice',
          sourceUuid: invoice.uuid,
          sourceCode: invoice.code,
          lines: [
            { account: ACCOUNT.inventory, debit: invoice.amount },
            { account: ACCOUNT.accountsPayable, credit: invoice.amount },
          ],
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
    purchaseOrderCode: async (parent: { purchaseOrderUuid: string }, _: unknown, ctx: Context) =>
      (await ctx.loaders.purchaseOrder.load(parent.purchaseOrderUuid))?.code,
    purchaseInvoiceCode: async (parent: { uuid: string }, _: unknown, ctx: Context) =>
      (await ctx.db.purchaseInvoice.findFirst({ where: { receiptNoteUuid: parent.uuid } }))?.code,
    items: (parent: { uuid: string }, _: unknown, ctx: Context) => ctx.loaders.receiptNoteItems.load(parent.uuid),
    warehouse: (parent: { warehouseUuid: string }, _: unknown, ctx: Context) =>
      ctx.loaders.warehouse.load(parent.warehouseUuid),
  },

  ReceiptNoteItem: {
    amount: (parent: { unitPrice: Prisma.Decimal; actualQty: Prisma.Decimal }) =>
      new Prisma.Decimal(parent.unitPrice).mul(parent.actualQty),
  },

  PurchaseRequest: {
    items: (parent: { uuid: string }, _: unknown, ctx: Context) =>
      ctx.db.purchaseRequestItem.findMany({
        where: { purchaseRequestUuid: parent.uuid },
        orderBy: { insertedAt: 'asc' },
      }),
    purchaseOrderCodes: async (parent: { uuid: string }, _: unknown, ctx: Context) => {
      const rows = await ctx.db.purchaseOrderItem.findMany({
        where: { purchaseRequestItem: { purchaseRequestUuid: parent.uuid } },
        select: { purchaseOrder: { select: { code: true } } },
      });
      return [...new Set(rows.map((r) => r.purchaseOrder.code))];
    },
  },

  PurchaseRequestItem: {
    remainingQty: (parent: { requestedQty: Prisma.Decimal; orderedQty: Prisma.Decimal }) =>
      new Prisma.Decimal(parent.requestedQty).sub(parent.orderedQty),
    purchaseRequestCode: async (
      parent: { purchaseRequestUuid: string; purchaseRequest?: { code: string } },
      _: unknown,
      ctx: Context,
    ) =>
      parent.purchaseRequest?.code ??
      (await ctx.db.purchaseRequest.findUnique({ where: { uuid: parent.purchaseRequestUuid } }))?.code,
  },

  PurchaseInvoice: {
    receiptNoteCode: async (parent: { receiptNoteUuid: string | null }, _: unknown, ctx: Context) =>
      parent.receiptNoteUuid
        ? (await ctx.db.receiptNote.findUnique({ where: { uuid: parent.receiptNoteUuid } }))?.code
        : null,
    purchaseOrderCode: async (parent: { purchaseOrderUuid: string }, _: unknown, ctx: Context) =>
      (await ctx.loaders.purchaseOrder.load(parent.purchaseOrderUuid))?.code,
    balance: (parent: { amount: Prisma.Decimal; paidAmount: Prisma.Decimal }) =>
      new Prisma.Decimal(parent.amount).sub(parent.paidAmount),
    paymentMethodName: async (parent: { paymentMethodUuid: string | null }, _: unknown, ctx: Context) =>
      parent.paymentMethodUuid
        ? (await ctx.db.paymentMethod.findUnique({ where: { uuid: parent.paymentMethodUuid } }))?.name
        : null,
    supplier: (parent: { supplierUuid: string }, _: unknown, ctx: Context) =>
      ctx.loaders.supplier.load(parent.supplierUuid),
    purchaseOrder: (parent: { purchaseOrderUuid: string }, _: unknown, ctx: Context) =>
      ctx.loaders.purchaseOrder.load(parent.purchaseOrderUuid),
  },
};
