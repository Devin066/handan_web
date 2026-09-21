import { Prisma } from '@/generated/prisma/client';

/**
 * Document status vocabulary.
 *
 * These exact strings are what the UI gates its actions on — the "Stock In" and
 * "Stock Out" buttons only appear for `to_receive` / `to_deliver`, and the work
 * order actions key off `draft` / `scheduling`. Changing a value here silently
 * removes a button from a screen, so they are defined in one place and the
 * labels live alongside them in src/utils/enum.tsx.
 */
export const DELIVERY_NOTE_STATUS = { open: 'to_deliver', done: 'completed' } as const;
export const RECEIPT_NOTE_STATUS = { open: 'to_receive', done: 'completed' } as const;

export const WORK_ORDER_STATUS = {
  draft: 'draft',
  scheduling: 'scheduling',
  inProcess: 'in_process',
  completed: 'completed',
} as const;

const d = (v: Prisma.Decimal | number | null | undefined) => new Prisma.Decimal(v ?? 0);

/** Goods movement progress on an order line or header. */
export function deliveryStatus(delivered: Prisma.Decimal | number, total: Prisma.Decimal | number) {
  const done = d(delivered);
  const all = d(total);

  if (done.lte(0)) return 'not_delivered';
  if (done.gte(all)) return 'fully_delivered';
  return 'partly_delivered';
}

export function receiptStatus(received: Prisma.Decimal | number, total: Prisma.Decimal | number) {
  const done = d(received);
  const all = d(total);

  if (done.lte(0)) return 'not_received';
  if (done.gte(all)) return 'fully_received';
  return 'partly_received';
}

export function billingStatus(paid: Prisma.Decimal | number, total: Prisma.Decimal | number) {
  const done = d(paid);
  const all = d(total);

  if (done.lte(0)) return 'not_billed';
  if (done.gte(all)) return 'fully_billed';
  return 'partly_billed';
}

/** Invoice-level payment state. */
export function invoiceStatus(paid: Prisma.Decimal | number, amount: Prisma.Decimal | number) {
  const done = d(paid);
  const all = d(amount);

  if (done.lte(0)) return 'unpaid';
  if (done.gte(all)) return 'paid';
  return 'partly_paid';
}

/**
 * The order header status says what is still outstanding, which is what an
 * operator actually needs to know at a glance: whether it still owes goods,
 * money, or both.
 */
export function salesOrderStatus(delivery: string, billing: string) {
  const delivered = delivery === 'fully_delivered';
  const billed = billing === 'fully_billed';

  if (delivered && billed) return 'completed';
  if (delivered) return 'to_bill';
  if (billed) return 'to_deliver';
  return 'to_deliver_and_bill';
}

export function purchaseOrderStatus(receipt: string, billing: string) {
  const received = receipt === 'fully_received';
  const billed = billing === 'fully_billed';

  if (received && billed) return 'completed';
  if (received) return 'to_bill';
  if (billed) return 'to_receive';
  return 'to_receive_and_bill';
}

/** Invoices that still owe money — what the payment screens list. */
export const UNSETTLED_INVOICE_STATUSES = ['unpaid', 'partly_paid'] as const;
