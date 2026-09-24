import { GraphQLError } from 'graphql';
import { Prisma } from '@/generated/prisma/client';
import type { Context } from '../context';
import { requireCompany } from '../context';
import { nextCode } from '../domain/codes';
import { allocatePayment } from '../domain/invoicing';
import { refreshSalesOrder } from '../domain/sales';
import { refreshPurchaseOrder } from '../domain/purchasing';

export const financeResolvers = {
  RootQueryType: {
    journalEntries: async (_: unknown, __: unknown, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.journalEntry.findMany({
        where: { companyUuid },
        include: { lines: true },
        orderBy: [{ entryDate: 'desc' }, { insertedAt: 'desc' }],
        take: 1000,
      });
    },
    accountBalances: async (_: unknown, __: unknown, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      const rows = await ctx.db.journalLine.groupBy({
        by: ['account'],
        where: { journalEntry: { companyUuid } },
        _sum: { debit: true, credit: true },
      });
      return rows
        .map((row) => {
          const debit = new Prisma.Decimal(row._sum.debit ?? 0);
          const credit = new Prisma.Decimal(row._sum.credit ?? 0);
          return { account: row.account, debit, credit, balance: debit.sub(credit) };
        })
        .sort((a, b) => a.account.localeCompare(b.account));
    },
    paymentEntries: async (_: unknown, __: unknown, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.paymentEntry.findMany({
        where: { companyUuid },
        orderBy: { insertedAt: 'desc' },
      });
    },
    paymentEntry: async (_: unknown, { request }: { request: { uuid?: string } }, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.paymentEntry.findFirst({ where: { uuid: request.uuid ?? '', companyUuid } });
    },
  },

  RootMutationType: {
    /**
     * Customer Payment Received (SRS 5): finance confirms a payment against one
     * sales invoice, which stamps the OR number and method on it and posts it to
     * the ledger. A supplier payment works the same way against a purchase invoice.
     */
    recordInvoicePayment: async (
      _: unknown,
      {
        request,
      }: {
        request: {
          invoiceType: 'sales' | 'purchase';
          invoiceUuid: string;
          amount: number;
          paymentMethodUuid: string;
          orNumber?: string;
        };
      },
      ctx: Context,
    ) => {
      const companyUuid = requireCompany(ctx);
      const amount = new Prisma.Decimal(request.amount ?? 0);
      const orNumber = request.orNumber?.trim() || null;

      if (amount.lte(0)) throw new GraphQLError('Enter an amount greater than zero.');
      if (request.invoiceType === 'sales' && !orNumber) throw new GraphQLError('Enter the Official Receipt number.');

      return ctx.db.$transaction(async (tx) => {
        await tx.paymentMethod.findFirstOrThrow({ where: { uuid: request.paymentMethodUuid, companyUuid } });

        const isSales = request.invoiceType === 'sales';
        const invoice = isSales
          ? await tx.salesInvoice.findFirst({ where: { uuid: request.invoiceUuid, companyUuid } })
          : await tx.purchaseInvoice.findFirst({ where: { uuid: request.invoiceUuid, companyUuid } });
        if (!invoice) throw new GraphQLError('Invoice not found.');

        const due = new Prisma.Decimal(invoice.amount).sub(invoice.paidAmount);
        if (due.lte(0)) throw new GraphQLError(`${invoice.code} is already paid.`);
        if (amount.gt(due)) throw new GraphQLError(`Only ${due.toFixed(2)} is left to pay on ${invoice.code}.`);

        const { touchedSalesOrders, touchedPurchaseOrders } = await allocatePayment(tx, {
          amount,
          salesInvoiceIds: isSales ? [invoice.uuid] : [],
          purchaseInvoiceIds: isSales ? [] : [invoice.uuid],
          orNumber,
          paymentMethodUuid: request.paymentMethodUuid,
        });
        for (const uuid of touchedSalesOrders) await refreshSalesOrder(tx, uuid);
        for (const uuid of touchedPurchaseOrders) await refreshPurchaseOrder(tx, uuid);

        const code = await nextCode(tx, companyUuid, 'paymentEntry');
        await tx.paymentEntry.create({
          data: {
            code,
            companyUuid,
            type: isSales ? 'receive' : 'pay',
            partyType: isSales ? 'customer' : 'supplier',
            partyUuid: isSales
              ? (invoice as { customerUuid: string }).customerUuid
              : (invoice as { supplierUuid: string }).supplierUuid,
            partyName: isSales
              ? (invoice as { customerName: string }).customerName
              : (invoice as { supplierName: string }).supplierName,
            paymentMethodUuid: request.paymentMethodUuid,
            totalAmount: amount,
            memo: orNumber ? `OR ${orNumber}` : null,
            salesInvoiceIds: isSales ? [invoice.uuid] : [],
            purchaseInvoiceIds: isSales ? [] : [invoice.uuid],
          },
        });

        return { uuid: invoice.uuid, code: invoice.code };
      });
    },

    createPaymentEntry: async (
      _: unknown,
      {
        request,
      }: {
        request: {
          type: string;
          partyType: string;
          partyUuid: string;
          paymentMethodUuid: string;
          totalAmount?: number;
          memo?: string;
          attachments?: string[];
          salesInvoiceIds?: string[];
          purchaseInvoiceIds?: string[];
        };
      },
      ctx: Context,
    ) => {
      const companyUuid = requireCompany(ctx);
      const amount = new Prisma.Decimal(request.totalAmount ?? 0);

      if (amount.lte(0)) {
        throw new GraphQLError('totalAmount must be greater than zero');
      }

      return ctx.db.$transaction(async (tx) => {
        // partyType decides which master table the payer/payee lives in.
        const party =
          request.partyType === 'customer'
            ? await tx.customer.findFirstOrThrow({ where: { uuid: request.partyUuid, companyUuid } })
            : await tx.supplier.findFirstOrThrow({ where: { uuid: request.partyUuid, companyUuid } });
        const partyName = party.name;

        const salesInvoiceIds = (request.salesInvoiceIds ?? []).filter(Boolean) as string[];
        const purchaseInvoiceIds = (request.purchaseInvoiceIds ?? []).filter(Boolean) as string[];

        const { touchedSalesOrders, touchedPurchaseOrders } = await allocatePayment(tx, {
          amount,
          salesInvoiceIds,
          purchaseInvoiceIds,
          paymentMethodUuid: request.paymentMethodUuid,
        });

        for (const uuid of touchedSalesOrders) await refreshSalesOrder(tx, uuid);
        for (const uuid of touchedPurchaseOrders) await refreshPurchaseOrder(tx, uuid);

        const code = await nextCode(tx, companyUuid, 'paymentEntry');

        return tx.paymentEntry.create({
          data: {
            code,
            companyUuid,
            type: request.type,
            partyType: request.partyType,
            partyUuid: request.partyUuid,
            partyName,
            paymentMethodUuid: request.paymentMethodUuid,
            totalAmount: amount,
            memo: request.memo,
            attachments: request.attachments?.filter(Boolean) as string[] | undefined,
            salesInvoiceIds,
            purchaseInvoiceIds,
          },
        });
      });
    },
  },

  PaymentEntry: {
    paymentMethod: (parent: { paymentMethodUuid: string }, _: unknown, ctx: Context) =>
      ctx.db.paymentMethod.findUnique({ where: { uuid: parent.paymentMethodUuid } }),
  },
};
