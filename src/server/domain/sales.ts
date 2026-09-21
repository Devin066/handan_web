import { Prisma } from '@/generated/prisma/client';
import { billingStatus, deliveryStatus, salesOrderStatus } from './status';

/**
 * Recomputes a sales order's rollups from its own lines, deliveries and invoices.
 * Called after anything downstream changes so the order header never drifts from
 * the documents hanging off it.
 */
export async function refreshSalesOrder(tx: Prisma.TransactionClient, salesOrderUuid: string) {
  const order = await tx.salesOrder.findUniqueOrThrow({
    where: { uuid: salesOrderUuid },
    include: { items: true, salesInvoices: true },
  });

  const totalQty = order.items.reduce((a, i) => a.add(i.orderedQty), new Prisma.Decimal(0));
  const deliveredQty = order.items.reduce((a, i) => a.add(i.deliveredQty), new Prisma.Decimal(0));
  const totalAmount = order.items.reduce(
    (a, i) => a.add(new Prisma.Decimal(i.unitPrice).mul(i.orderedQty)),
    new Prisma.Decimal(0),
  );
  const paidAmount = order.salesInvoices.reduce((a, inv) => a.add(inv.paidAmount), new Prisma.Decimal(0));

  const delivery = deliveryStatus(deliveredQty, totalQty);
  const billing = billingStatus(paidAmount, totalAmount);

  return tx.salesOrder.update({
    where: { uuid: salesOrderUuid },
    data: {
      totalQty,
      deliveredQty,
      totalAmount,
      paidAmount,
      deliveryStatus: delivery,
      billingStatus: billing,
      status: salesOrderStatus(delivery, billing),
    },
  });
}
