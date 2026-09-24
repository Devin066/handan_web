import { Prisma } from '@/generated/prisma/client';
import type { Context } from '../context';
import { requireCompany } from '../context';
import { fiscalYear } from '../domain/codes';
import { deliveryRisk, UNSETTLED_INVOICE_STATUSES } from '../domain/status';
import { manilaDay } from '../domain/time';

const DAY_MS = 24 * 60 * 60 * 1000;

/** AR/AP aging by days past due (or past invoice date when there is no due date). */
function aging(
  invoices: Array<{ amount: Prisma.Decimal; paidAmount: Prisma.Decimal; dueDate?: Date | null; insertedAt: Date }>,
) {
  const buckets = { current: 0, days1to30: 0, days31to60: 0, days61to90: 0, over90: 0 };
  let total = 0;
  for (const inv of invoices) {
    const due = Number(inv.amount) - Number(inv.paidAmount);
    if (due <= 0) continue;
    total += due;
    const late = Math.floor((Date.now() - new Date(inv.dueDate ?? inv.insertedAt).getTime()) / DAY_MS);
    if (late <= 0) buckets.current += due;
    else if (late <= 30) buckets.days1to30 += due;
    else if (late <= 60) buckets.days31to60 += due;
    else if (late <= 90) buckets.days61to90 += due;
    else buckets.over90 += due;
  }
  return { total, count: invoices.length, ...buckets };
}

/** Executive & Operations Dashboard (SRS 3), computed in one pass per request. */
export const dashboardResolvers = {
  RootQueryType: {
    dashboard: async (_: unknown, __: unknown, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      const { start: todayStart, end: todayEnd, day } = manilaDay();
      const fy = fiscalYear();

      const [
        items,
        stockItems,
        salesInvoices,
        purchaseInvoices,
        purchaseOrders,
        purchaseRequests,
        workOrders,
        manufactured,
        salesOrders,
        activeStaff,
        attendance,
        fyInvoices,
      ] = await Promise.all([
        ctx.db.item.findMany({ where: { companyUuid, status: 'active' } }),
        ctx.db.stockItem.findMany({
          where: { companyUuid },
          include: { stockUom: { select: { conversionFactor: true } } },
        }),
        ctx.db.salesInvoice.findMany({ where: { companyUuid, status: { in: [...UNSETTLED_INVOICE_STATUSES] } } }),
        ctx.db.purchaseInvoice.findMany({ where: { companyUuid, status: { in: [...UNSETTLED_INVOICE_STATUSES] } } }),
        ctx.db.purchaseOrder.findMany({
          where: {
            companyUuid,
            receiptStatus: { not: 'fully_received' },
            status: { notIn: ['cancelled', 'completed'] },
          },
          orderBy: [{ expectedDate: 'asc' }, { insertedAt: 'asc' }],
        }),
        ctx.db.purchaseRequest.findMany({
          where: { companyUuid, status: { in: ['pending', 'approved'] } },
          include: { items: true },
          orderBy: { insertedAt: 'asc' },
        }),
        ctx.db.workOrder.findMany({
          where: { companyUuid, status: { in: ['draft', 'scheduling', 'in_process'] } },
          orderBy: [{ dueDate: 'asc' }, { insertedAt: 'asc' }],
        }),
        ctx.db.inventoryEntry.findMany({
          where: { companyUuid, type: 'production', insertedAt: { gte: todayStart, lt: todayEnd } },
          include: { item: { select: { name: true } } },
        }),
        ctx.db.salesOrder.findMany({
          where: { companyUuid, status: { notIn: ['completed', 'cancelled'] } },
          orderBy: [{ requiredDate: 'asc' }, { insertedAt: 'asc' }],
        }),
        ctx.db.staff.findMany({ where: { companyUuid, status: 'active' } }),
        ctx.db.attendanceRecord.findMany({
          where: { companyUuid, workDate: new Date(`${day}T00:00:00Z`), status: { in: ['present', 'late'] } },
        }),
        ctx.db.salesInvoice.findMany({
          where: { companyUuid, code: { startsWith: `SO-INV-${fy}-` } },
          orderBy: { insertedAt: 'desc' },
        }),
      ]);

      // Stock per item in its base unit, valued at standard cost.
      const onHand = new Map<string, number>();
      for (const row of stockItems) {
        onHand.set(
          row.itemUuid,
          (onHand.get(row.itemUuid) ?? 0) + Number(row.totalOnHand) * (row.stockUom.conversionFactor || 1),
        );
      }
      const stockRows = items.map((item) => ({
        uuid: item.uuid,
        name: item.name,
        sku: item.sku,
        itemType: item.itemType,
        onHandQty: onHand.get(item.uuid) ?? 0,
        minStockThreshold: Number(item.minStockThreshold),
      }));
      // Out of stock only matters for things kept in stock: raw materials, or anything with a threshold.
      const tracked = stockRows.filter((r) => r.itemType === 'raw_material' || r.minStockThreshold > 0);
      const outOfStock = tracked.filter((r) => r.onHandQty <= 0);
      const lowStock = tracked.filter((r) => r.onHandQty > 0 && r.onHandQty <= r.minStockThreshold);

      const valuation = { rawMaterial: 0, manufacturedPart: 0, finishedGood: 0, total: 0 };
      for (const item of items) {
        const value = (onHand.get(item.uuid) ?? 0) * Number(item.standardCost);
        if (item.itemType === 'manufactured_part') valuation.manufacturedPart += value;
        else if (item.itemType === 'finished_good') valuation.finishedGood += value;
        else valuation.rawMaterial += value;
        valuation.total += value;
      }

      const openRequests = purchaseRequests
        .map((pr) => ({
          uuid: pr.uuid,
          code: pr.code,
          status: pr.status,
          requestedBy: pr.requestedBy,
          requiredDate: pr.requiredDate,
          openLines: pr.items.filter((i) => new Prisma.Decimal(i.requestedQty).gt(i.orderedQty)).length,
          onPurchaseOrder: pr.items.some((i) => new Prisma.Decimal(i.orderedQty).gt(0)),
        }))
        // Hierarchy doc: open PRs are the ones not linked to any PO yet.
        .filter((pr) => !pr.onPurchaseOrder);

      const ordersWithRisk = salesOrders.map((so) => ({
        uuid: so.uuid,
        code: so.code,
        customerName: so.customerName,
        requiredDate: so.requiredDate,
        status: so.status,
        totalAmount: Number(so.totalAmount),
        risk: deliveryRisk(so),
      }));

      const presentStaff = new Set(attendance.map((a) => a.staffUuid));
      const manufacturedByItem = new Map<string, { itemName: string; qty: number }>();
      for (const entry of manufactured) {
        const row = manufacturedByItem.get(entry.itemUuid) ?? { itemName: entry.item.name, qty: 0 };
        row.qty += Number(entry.actualQty);
        manufacturedByItem.set(entry.itemUuid, row);
      }

      return {
        date: day,
        fiscalYear: fy,
        lowStock,
        outOfStock,
        stockValuation: valuation,
        accountsReceivable: aging(salesInvoices),
        accountsPayable: aging(purchaseInvoices),
        openPurchaseOrders: purchaseOrders.map((po) => ({
          uuid: po.uuid,
          code: po.code,
          supplierName: po.supplierName,
          expectedDate: po.expectedDate,
          totalAmount: Number(po.totalAmount),
          overdue: !!po.expectedDate && po.expectedDate.getTime() < todayStart.getTime(),
        })),
        openPurchaseRequests: openRequests,
        openWorkOrders: workOrders.map((wo) => ({
          uuid: wo.uuid,
          code: wo.code,
          itemName: wo.itemName,
          status: wo.status,
          plannedQty: Number(wo.plannedQty),
          producedQty: Number(wo.producedQty),
          dueDate: wo.dueDate,
        })),
        manufacturedToday: [...manufacturedByItem.values()],
        openSalesOrders: ordersWithRisk,
        delayedSalesOrders: ordersWithRisk.filter((so) => so.risk === 'overdue' || so.risk === 'at_risk'),
        workforce: {
          present: activeStaff.filter((s) => presentStaff.has(s.uuid)).length,
          total: activeStaff.length,
          absent: activeStaff.filter((s) => !presentStaff.has(s.uuid)).map((s) => s.name ?? s.email),
        },
        fiscalYearInvoices: {
          count: fyInvoices.length,
          total: fyInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0),
          latest: fyInvoices.slice(0, 5).map((inv) => ({
            uuid: inv.uuid,
            code: inv.code,
            customerName: inv.customerName,
            amount: Number(inv.amount),
            insertedAt: inv.insertedAt,
          })),
        },
      };
    },
  },
};
