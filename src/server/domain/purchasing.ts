import { Prisma } from '@/generated/prisma/client';
import { billingStatus, purchaseOrderStatus, receiptStatus } from './status';

/** Purchase-order mirror of refreshSalesOrder: receipts in place of deliveries. */
export async function refreshPurchaseOrder(tx: Prisma.TransactionClient, purchaseOrderUuid: string) {
  const order = await tx.purchaseOrder.findUniqueOrThrow({
    where: { uuid: purchaseOrderUuid },
    include: { items: true, purchaseInvoices: true },
  });

  const totalQty = order.items.reduce((a, i) => a.add(i.orderedQty), new Prisma.Decimal(0));
  const receivedQty = order.items.reduce((a, i) => a.add(i.receivedQty), new Prisma.Decimal(0));
  const totalAmount = order.items.reduce(
    (a, i) => a.add(new Prisma.Decimal(i.unitPrice).mul(i.orderedQty)),
    new Prisma.Decimal(0),
  );
  const paidAmount = order.purchaseInvoices.reduce((a, inv) => a.add(inv.paidAmount), new Prisma.Decimal(0));

  const receipt = receiptStatus(receivedQty, totalQty);
  const billing = billingStatus(paidAmount, totalAmount);

  return tx.purchaseOrder.update({
    where: { uuid: purchaseOrderUuid },
    data: {
      totalQty,
      receivedQty,
      totalAmount,
      paidAmount,
      receiptStatus: receipt,
      billingStatus: billing,
      status: purchaseOrderStatus(receipt, billing),
    },
  });
}
