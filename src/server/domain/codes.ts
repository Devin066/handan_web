import type { Prisma } from '@/generated/prisma/client';

/** Document prefixes from the SRS numbering rules (section 2). */
const PREFIXES = {
  salesOrder: 'SO',
  purchaseRequest: 'PR',
  purchaseOrder: 'PO',
  workOrder: 'WO',
  receiptNote: 'GR',
  deliveryNote: 'DN',
  salesInvoice: 'SO-INV',
  purchaseInvoice: 'INV',
  paymentEntry: 'PE',
  inventoryEntry: 'IE',
  bom: 'BOM',
  rawMaterial: 'RM',
  manufacturedPart: 'MP',
  finishedGood: 'FG',
} as const;

/** Invoices restart their sequence each fiscal year and carry the year in the number. */
const FISCAL_YEAR_INDEXED = new Set<keyof typeof PREFIXES>(['salesInvoice', 'purchaseInvoice']);

/** The fiscal year follows the calendar year in company time (GMT+8). */
export function fiscalYear(at: Date = new Date()): number {
  return new Date(at.getTime() + 8 * 60 * 60 * 1000).getUTCFullYear();
}

/**
 * Document numbers come from a row-locked counter rather than count()+1, which
 * would hand the same number to two concurrent creates.
 *
 * SO-000001, GR-000001, SO-INV-2026-000001, INV-2026-000001.
 */
export async function nextCode(
  tx: Prisma.TransactionClient,
  companyUuid: string,
  name: keyof typeof PREFIXES,
): Promise<string> {
  const year = FISCAL_YEAR_INDEXED.has(name) ? fiscalYear() : null;
  const counterName = year ? `${name}:${year}` : name;

  const counter = await tx.counter.upsert({
    where: { companyUuid_name: { companyUuid, name: counterName } },
    create: { companyUuid, name: counterName, value: 1 },
    update: { value: { increment: 1 } },
  });

  const seq = String(counter.value).padStart(6, '0');
  return year ? `${PREFIXES[name]}-${year}-${seq}` : `${PREFIXES[name]}-${seq}`;
}
