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
