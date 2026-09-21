import type { Prisma } from '@/generated/prisma/client';

const PREFIXES: Record<string, string> = {
  salesOrder: 'SO',
  purchaseOrder: 'PO',
  deliveryNote: 'DN',
  receiptNote: 'RN',
  salesInvoice: 'SI',
  purchaseInvoice: 'PI',
  paymentEntry: 'PE',
  workOrder: 'WO',
  inventoryEntry: 'IE',
};

/**
 * Document numbers come from a row-locked counter rather than count()+1, which
 * would hand the same number to two concurrent creates.
 */
export async function nextCode(
  tx: Prisma.TransactionClient,
  companyUuid: string,
  name: keyof typeof PREFIXES,
): Promise<string> {
  const counter = await tx.counter.upsert({
    where: { companyUuid_name: { companyUuid, name } },
    create: { companyUuid, name, value: 1 },
    update: { value: { increment: 1 } },
  });

  const prefix = PREFIXES[name] ?? name.slice(0, 2).toUpperCase();
  return `${prefix}${String(counter.value).padStart(6, '0')}`;
}
