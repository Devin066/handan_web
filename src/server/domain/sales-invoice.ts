import { GraphQLError } from 'graphql';

import { Prisma } from '@/generated/prisma/client';
import {
  computeInvoiceTotals,
  dueDateFor,
  isPaymentTerms,
  isValidTin,
  isVatMode,
  type VatMode,
} from '@/config/invoice';
import { nextCode } from './codes';
import { refreshSalesOrder } from './sales';
import { ACCOUNT, postJournal } from './ledger';

export type CreateSalesInvoiceRequest = {
  salesOrderUuid?: string;
  amount?: number;
  items?: Array<{
    salesOrderItemUuid: string;
    qty: number;
    unitPrice?: number | null;
    discount?: number | null;
    description?: string | null;
  }> | null;
  invoiceDate?: Date | null;
  paymentTerms?: string | null;
  dueDate?: Date | null;
  customerAddress?: string | null;
  customerTin?: string | null;
  customerReference?: string | null;
  vatMode?: string | null;
  notes?: string | null;
};

const clean = (value?: string | null) => value?.trim() || null;

/** Quantity of each order line already on an invoice. */
export async function invoicedQtyByOrderItem(tx: Prisma.TransactionClient, orderItemUuids: string[]) {
  const rows = await tx.salesInvoiceItem.groupBy({
    by: ['salesOrderItemUuid'],
    where: { salesOrderItemUuid: { in: orderItemUuids }, salesInvoice: { status: { not: 'cancelled' } } },
    _sum: { qty: true },
  });
  return new Map(rows.map((row) => [row.salesOrderItemUuid as string, Number(row._sum.qty ?? 0)]));
}

/** Short, readable address from the customer's address parts. */
function customerAddressOf(customer: Record<string, any>): string | null {
  const parts = [customer.address, customer.barangay, customer.city, customer.province, customer.postalCode]
    .map((part) => (typeof part === 'string' ? part.trim() : ''))
    .filter(Boolean);
  return parts.length ? parts.join(', ') : null;
}

export async function createSalesInvoice(
  tx: Prisma.TransactionClient,
  companyUuid: string,
  request: CreateSalesInvoiceRequest,
) {
  if (!request.salesOrderUuid) throw new GraphQLError('Choose a sales order to invoice.');

  const order = await tx.salesOrder.findFirst({
    where: { uuid: request.salesOrderUuid, companyUuid },
    include: { items: true, customer: true },
  });
  if (!order) throw new GraphQLError('Sales order not found.');
  if (order.status === 'draft' || order.status === 'cancelled') {
    throw new GraphQLError(`A ${order.status} sales order can't be invoiced.`);
  }

  const invoiced = await invoicedQtyByOrderItem(
    tx,
    order.items.map((item) => item.uuid),
  );
  const orderItems = new Map(order.items.map((item) => [item.uuid, item]));

  // Legacy callers send only an amount: bill everything not yet invoiced.
  const billEverything = order.items.map((item) => ({
    salesOrderItemUuid: item.uuid,
    qty: Number(item.orderedQty) - (invoiced.get(item.uuid) ?? 0),
    unitPrice: Number(item.unitPrice),
    discount: 0,
    description: null,
  }));
  const requested = request.items?.length ? request.items : billEverything;

  const lines = requested
    .filter((line) => Number(line.qty) > 0)
    .map((line) => {
      const orderItem = orderItems.get(line.salesOrderItemUuid);
      if (!orderItem) throw new GraphQLError('An invoice line does not belong to this sales order.');

      const available = Number(orderItem.orderedQty) - (invoiced.get(orderItem.uuid) ?? 0);
      if (Number(line.qty) > available + 1e-9) {
        throw new GraphQLError(
          `${orderItem.itemName}: only ${available} left to invoice, but ${line.qty} was entered.`,
        );
      }

      const unitPrice = line.unitPrice ?? Number(orderItem.unitPrice);
      if (unitPrice < 0) throw new GraphQLError(`${orderItem.itemName}: price can't be negative.`);

      return {
        orderItem,
        qty: Number(line.qty),
        unitPrice,
        discount: Number(line.discount ?? 0),
        description: line.description,
      };
    });

  if (!lines.length) throw new GraphQLError('Nothing left to invoice on this sales order.');

  const vatMode: VatMode = isVatMode(request.vatMode) ? request.vatMode : 'vat_exclusive';
  if (request.vatMode && !isVatMode(request.vatMode)) throw new GraphQLError(`Unknown VAT mode: ${request.vatMode}`);
  if (request.paymentTerms && !isPaymentTerms(request.paymentTerms)) {
    throw new GraphQLError(`Unknown payment terms: ${request.paymentTerms}`);
  }

  const customerTin = clean(request.customerTin);
  if (customerTin && !isValidTin(customerTin)) {
    throw new GraphQLError('TIN should be 9 digits, optionally followed by a branch code.');
  }

  const invoiceDate = request.invoiceDate ? new Date(request.invoiceDate) : new Date();
  let dueDate: Date | null = null;
  if (request.dueDate) dueDate = new Date(request.dueDate);
  else if (isPaymentTerms(request.paymentTerms)) dueDate = dueDateFor(invoiceDate, request.paymentTerms);
  if (dueDate && dueDate < new Date(invoiceDate.toDateString())) {
    throw new GraphQLError('Due date can’t be before the invoice date.');
  }

  const totals = computeInvoiceTotals(lines, vatMode);
  const code = await nextCode(tx, companyUuid, 'salesInvoice');

  const invoice = await tx.salesInvoice.create({
    data: {
      code,
      companyUuid,
      salesOrderUuid: order.uuid,
      customerUuid: order.customerUuid,
      customerName: order.customerName,
      customerAddress: clean(request.customerAddress) ?? order.customerAddress ?? customerAddressOf(order.customer),
      customerTin,
      customerReference: clean(request.customerReference) ?? order.externalRef,
      invoiceDate,
      dueDate,
      paymentTerms: request.paymentTerms ?? null,
      vatMode,
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      vatableAmount: totals.vatableAmount,
      vatAmount: totals.vatAmount,
      amount: totals.total,
      notes: request.notes?.trim() || null,
      items: {
        create: lines.map((line, index) => ({
          salesOrderItemUuid: line.orderItem.uuid,
          itemUuid: line.orderItem.itemUuid,
          itemName: line.orderItem.itemName,
          description: clean(line.description) ?? line.orderItem.customSpec,
          uomName: line.orderItem.uomName,
          qty: line.qty,
          unitPrice: line.unitPrice,
          discount: totals.lines[index].discount,
          lineTotal: totals.lines[index].lineTotal,
        })),
      },
    },
  });

  await postJournal(tx, {
    companyUuid,
    description: `Sales invoice to ${order.customerName}`,
    sourceType: 'sales_invoice',
    sourceUuid: invoice.uuid,
    sourceCode: invoice.code,
    entryDate: invoiceDate,
    lines: [
      { account: ACCOUNT.accountsReceivable, debit: totals.total },
      { account: ACCOUNT.salesRevenue, credit: totals.total - totals.vatAmount },
      { account: ACCOUNT.outputVat, credit: totals.vatAmount },
    ],
  });

  await refreshSalesOrder(tx, order.uuid);

  return invoice;
}
