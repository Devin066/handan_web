import DataLoader from 'dataloader';
import type { Db } from './db';

/**
 * Per-request batching for the by-uuid lookups that nested fields do.
 *
 * Without this, a list of 60 sales orders asking for `customer { name }` issues
 * 60 separate SELECTs — the classic N+1. DataLoader collects the uuids requested
 * in one tick and resolves them with a single `IN (...)` query.
 *
 * These are created per request, never shared: a cache that outlived the request
 * would serve one tenant stale rows from another.
 */
function byUuid<T extends { uuid: string }>(find: (uuids: string[]) => Promise<T[]>) {
  return new DataLoader<string, T | null>(async (uuids) => {
    const rows = await find([...uuids]);
    const byId = new Map(rows.map((row) => [row.uuid, row]));
    // Must return results positionally, one per requested key.
    return uuids.map((uuid) => byId.get(uuid) ?? null);
  });
}

/**
 * Batches a one-to-many child list keyed by its parent id. `SalesOrders` asking
 * for `items { ... }` is otherwise one SELECT per order.
 */
function byParent<T>(find: (parentIds: string[]) => Promise<T[]>, parentIdOf: (row: T) => string) {
  return new DataLoader<string, T[]>(async (parentIds) => {
    const rows = await find([...parentIds]);

    const grouped = new Map<string, T[]>();
    for (const row of rows) {
      const key = parentIdOf(row);
      const list = grouped.get(key) ?? [];
      list.push(row);
      grouped.set(key, list);
    }

    return parentIds.map((id) => grouped.get(id) ?? []);
  });
}

export function createLoaders(db: Db) {
  return {
    item: byUuid((uuids) => db.item.findMany({ where: { uuid: { in: uuids } } })),
    customer: byUuid((uuids) => db.customer.findMany({ where: { uuid: { in: uuids } } })),
    supplier: byUuid((uuids) => db.supplier.findMany({ where: { uuid: { in: uuids } } })),
    warehouse: byUuid((uuids) => db.warehouse.findMany({ where: { uuid: { in: uuids } } })),
    process: byUuid((uuids) => db.process.findMany({ where: { uuid: { in: uuids } } })),
    staff: byUuid((uuids) => db.staff.findMany({ where: { uuid: { in: uuids } } })),
    company: byUuid((uuids) => db.company.findMany({ where: { uuid: { in: uuids } } })),
    user: byUuid((uuids) => db.user.findMany({ where: { uuid: { in: uuids } } })),
    bom: byUuid((uuids) => db.bom.findMany({ where: { uuid: { in: uuids } } })),
    salesOrder: byUuid((uuids) => db.salesOrder.findMany({ where: { uuid: { in: uuids } } })),
    purchaseOrder: byUuid((uuids) => db.purchaseOrder.findMany({ where: { uuid: { in: uuids } } })),
    deliveryNote: byUuid((uuids) => db.deliveryNote.findMany({ where: { uuid: { in: uuids } } })),
    salesOrderItem: byUuid((uuids) => db.salesOrderItem.findMany({ where: { uuid: { in: uuids } } })),
    workOrder: byUuid((uuids) => db.workOrder.findMany({ where: { uuid: { in: uuids } } })),
    workOrderItem: byUuid((uuids) => db.workOrderItem.findMany({ where: { uuid: { in: uuids } } })),

    salesOrderItems: byParent(
      (ids) =>
        db.salesOrderItem.findMany({
          where: { salesOrderUuid: { in: ids } },
          orderBy: { insertedAt: 'asc' },
        }),
      (row) => row.salesOrderUuid,
    ),

    purchaseOrderItems: byParent(
      (ids) =>
        db.purchaseOrderItem.findMany({
          where: { purchaseOrderUuid: { in: ids } },
          orderBy: { insertedAt: 'asc' },
        }),
      (row) => row.purchaseOrderUuid,
    ),

    deliveryNoteItems: byParent(
      (ids) => db.deliveryNoteItem.findMany({ where: { deliveryNoteUuid: { in: ids } } }),
      (row) => row.deliveryNoteUuid,
    ),

    receiptNoteItems: byParent(
      (ids) => db.receiptNoteItem.findMany({ where: { receiptNoteUuid: { in: ids } } }),
      (row) => row.receiptNoteUuid,
    ),

    workOrderSteps: byParent(
      (ids) =>
        db.workOrderItem.findMany({
          where: { workOrderUuid: { in: ids } },
          orderBy: { position: 'asc' },
        }),
      (row) => row.workOrderUuid,
    ),

    // Stock UOM is nearly always read for its unit name, so pull the name with it.
    stockUom: byUuid((uuids) => db.stockUom.findMany({ where: { uuid: { in: uuids } }, include: { uom: true } })),

    // An item's stock UOMs, keyed by item — used for both stockUoms and the
    // defaultStockUom* fields, so one batch serves all three.
    stockUomsByItem: new DataLoader<
      string,
      Array<{ uuid: string; uomUuid: string; sequence: number; conversionFactor: number; uom: { name: string } }>
    >(async (itemUuids) => {
      const rows = await db.stockUom.findMany({
        where: { itemUuid: { in: [...itemUuids] } },
        orderBy: { sequence: 'asc' },
        include: { uom: true },
      });

      const grouped = new Map<string, typeof rows>();
      for (const row of rows) {
        const list = grouped.get(row.itemUuid) ?? [];
        list.push(row);
        grouped.set(row.itemUuid, list);
      }

      return itemUuids.map((uuid) => grouped.get(uuid) ?? []);
    }),

    /**
     * Stock totals per item across every warehouse, in the item's default
     * (base) unit. Rows are stored per stock UOM, so each is multiplied by its
     * conversion factor before summing: 2 boxes of 12 count as 24.
     */
    stockLevelByItem: new DataLoader<string, { onHand: number; reserved: number }>(async (itemUuids) => {
      const rows = await db.stockItem.findMany({
        where: { itemUuid: { in: [...itemUuids] } },
        include: { stockUom: { select: { conversionFactor: true } } },
      });

      const totals = new Map<string, { onHand: number; reserved: number }>();
      for (const row of rows) {
        const factor = row.stockUom.conversionFactor || 1;
        const total = totals.get(row.itemUuid) ?? { onHand: 0, reserved: 0 };
        total.onHand += Number(row.totalOnHand) * factor;
        total.reserved += Number(row.reservedQty) * factor;
        totals.set(row.itemUuid, total);
      }

      return itemUuids.map((uuid) => totals.get(uuid) ?? { onHand: 0, reserved: 0 });
    }),
  };
}

export type Loaders = ReturnType<typeof createLoaders>;
