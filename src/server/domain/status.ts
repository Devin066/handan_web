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
export const DELIVERY_NOTE_STATUS = {
  open: 'to_deliver',
  done: 'completed',
} as const;
export const RECEIPT_NOTE_STATUS = {
  open: 'to_receive',
  done: 'completed',
} as const;

export const WORK_ORDER_STATUS = {
  draft: 'draft',
  scheduling: 'scheduling',
  inProcess: 'in_process',
  completed: 'completed',
} as const;

/**
 * Production queue states (PRD 11).
 *
 * A job card enters as `pending`, reaches an operator either by assignment or by
 * being accepted off the floating queue, and ends at `validated` — the state a
 * supervisor confirms before finished goods move (BR-04). Work reported after the
 * fact is written straight to `completed`.
 */
export const JOB_CARD_STATUS = {
  pending: 'pending',
  assigned: 'assigned',
  accepted: 'accepted',
  inProgress: 'in_progress',
  paused: 'paused',
  completed: 'completed',
  validated: 'validated',
  cancelled: 'cancelled',
} as const;

/** Job cards still owed work — what the production queue screens list. */
export const OPEN_JOB_CARD_STATUSES = [
  JOB_CARD_STATUS.pending,
  JOB_CARD_STATUS.assigned,
  JOB_CARD_STATUS.accepted,
  JOB_CARD_STATUS.inProgress,
  JOB_CARD_STATUS.paused,
] as const;

/**
 * Where an order came from (PRD 8, BR-05). An order keeps its original channel
 * for the life of the record, so this list only ever grows.
 */
export const SALES_CHANNEL = {
  direct: 'direct',
  shopee: 'shopee',
  tiktok: 'tiktok',
  page: 'business_page',
  website: 'website',
} as const;

/** Make-to-order vs make-to-stock (PRD 2). */
export const FULFILLMENT_MODEL = {
  makeToOrder: 'make_to_order',
  makeToStock: 'make_to_stock',
} as const;

/** What the master record is for (SRS 4.4): raw materials, manufactured parts, finished goods. */
export const ITEM_TYPE = {
  rawMaterial: 'raw_material',
  manufacturedPart: 'manufactured_part',
  finishedGood: 'finished_good',
} as const;

/** Material Master code prefix per class (SRS 2): RM, MP, FG. */
export const ITEM_TYPE_PREFIX: Record<string, 'rawMaterial' | 'manufacturedPart' | 'finishedGood'> = {
  raw_material: 'rawMaterial',
  manufactured_part: 'manufacturedPart',
  finished_good: 'finishedGood',
};

/**
 * Roles (PRD 20, BR-08). Ordered least to most privileged; access checks compare
 * position in this list rather than testing each role by name.
 */
export const ROLE = {
  employee: 'employee',
  hr: 'hr',
  finance: 'finance',
  manager: 'manager',
  owner: 'owner',
} as const;

/** Individuals buy most custom work; shops and resellers buy as a business. */
export const CUSTOMER_TYPE = {
  individual: 'individual',
  business: 'business',
} as const;

/**
 * Where a customer was first discovered (PRD 13).
 *
 * Kept separate from SALES_CHANNEL, which is where an order actually came from:
 * a customer found on TikTok may since order direct, and both answers matter.
 */
export const CUSTOMER_SOURCE = {
  direct: 'direct',
  walkIn: 'walk_in',
  referral: 'referral',
  shopee: 'shopee',
  lazada: 'lazada',
  tiktok: 'tiktok',
  facebookPage: 'facebook_page',
  facebookMarketplace: 'facebook_marketplace',
  instagram: 'instagram',
  website: 'website',
  google: 'google',
  other: 'other',
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

/** Production progress rolled up to the order header (PRD 8). */
export function orderProductionStatus(produced: Prisma.Decimal | number, total: Prisma.Decimal | number) {
  const done = d(produced);
  const all = d(total);

  if (done.lte(0)) return 'not_started';
  if (done.gte(all)) return 'produced';
  return 'in_production';
}

/** Days before the target date at which an open order is flagged at risk. */
export const DELIVERY_RISK_DAYS = 3;

/** Delivery Date Risk Warning (SRS 3): overdue, at_risk, on_track, or null. */
export function deliveryRisk(order: { requiredDate: Date | null; deliveryStatus: string; status: string }) {
  if (!order.requiredDate) return null;
  if (order.deliveryStatus === 'fully_delivered' || order.status === 'completed' || order.status === 'cancelled') {
    return null;
  }
  const msLeft = new Date(order.requiredDate).getTime() - Date.now();
  if (msLeft < 0) return 'overdue';
  if (msLeft <= DELIVERY_RISK_DAYS * 24 * 60 * 60 * 1000) return 'at_risk';
  return 'on_track';
}
