import { Prisma } from '@/generated/prisma/client';
import { invoiceStatus } from './status';
import { ACCOUNT, postJournal } from './ledger';

/**
 * Allocates a payment across the invoices it names, oldest first, stopping when the
 * money runs out. Anything left over is deliberately dropped rather than written
 * onto an invoice as an overpayment.
 */
export async function allocatePayment(
  tx: Prisma.TransactionClient,
  args: {
    amount: Prisma.Decimal;
    salesInvoiceIds: string[];
    purchaseInvoiceIds: string[];
    /** Official Receipt number and method, stamped on each invoice this payment touches. */
    orNumber?: string | null;
    paymentMethodUuid?: string | null;
  },
) {
  let remaining = new Prisma.Decimal(args.amount);
  const touchedSalesOrders = new Set<string>();
  const touchedPurchaseOrders = new Set<string>();

  if (args.salesInvoiceIds.length) {
    const invoices = await tx.salesInvoice.findMany({
      where: { uuid: { in: args.salesInvoiceIds } },
      orderBy: { insertedAt: 'asc' },
    });

    for (const invoice of invoices) {
      if (remaining.lte(0)) break;

      const due = new Prisma.Decimal(invoice.amount).sub(invoice.paidAmount);
      if (due.lte(0)) continue;

      const applied = Prisma.Decimal.min(due, remaining);
      remaining = remaining.sub(applied);

      const paidAmount = new Prisma.Decimal(invoice.paidAmount).add(applied);

      await tx.salesInvoice.update({
        where: { uuid: invoice.uuid },
        data: {
          paidAmount,
          status: invoiceStatus(paidAmount, invoice.amount),
          paidAt: new Date(),
          ...(args.orNumber ? { orNumber: args.orNumber } : {}),
          ...(args.paymentMethodUuid ? { paymentMethodUuid: args.paymentMethodUuid } : {}),
        },
      });

      await postJournal(tx, {
        companyUuid: invoice.companyUuid,
        description: `Payment from ${invoice.customerName}${args.orNumber ? ` (OR ${args.orNumber})` : ''}`,
        sourceType: 'sales_payment',
        sourceUuid: invoice.uuid,
        sourceCode: invoice.code,
        lines: [
          { account: ACCOUNT.cash, debit: applied },
          { account: ACCOUNT.accountsReceivable, credit: applied },
        ],
      });

      touchedSalesOrders.add(invoice.salesOrderUuid);
    }
  }

  if (args.purchaseInvoiceIds.length) {
    const invoices = await tx.purchaseInvoice.findMany({
      where: { uuid: { in: args.purchaseInvoiceIds } },
      orderBy: { insertedAt: 'asc' },
    });

    for (const invoice of invoices) {
      if (remaining.lte(0)) break;

      const due = new Prisma.Decimal(invoice.amount).sub(invoice.paidAmount);
      if (due.lte(0)) continue;

      const applied = Prisma.Decimal.min(due, remaining);
      remaining = remaining.sub(applied);

      const paidAmount = new Prisma.Decimal(invoice.paidAmount).add(applied);

      await tx.purchaseInvoice.update({
        where: { uuid: invoice.uuid },
        data: {
          paidAmount,
          status: invoiceStatus(paidAmount, invoice.amount),
          paidAt: new Date(),
          ...(args.orNumber ? { referenceNo: args.orNumber } : {}),
          ...(args.paymentMethodUuid ? { paymentMethodUuid: args.paymentMethodUuid } : {}),
        },
      });

      await postJournal(tx, {
        companyUuid: invoice.companyUuid,
        description: `Payment to ${invoice.supplierName}`,
        sourceType: 'purchase_payment',
        sourceUuid: invoice.uuid,
        sourceCode: invoice.code,
        lines: [
          { account: ACCOUNT.accountsPayable, debit: applied },
          { account: ACCOUNT.cash, credit: applied },
        ],
      });

      touchedPurchaseOrders.add(invoice.purchaseOrderUuid);
    }
  }

  return { touchedSalesOrders, touchedPurchaseOrders, unallocated: remaining };
}
