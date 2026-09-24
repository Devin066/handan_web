import type { Db } from '../db';

/**
 * Unit cost used to value stock, per item:
 *
 * 1. the standard cost, when someone has set one;
 * 2. otherwise the latest price a supplier charged (updated on every PO);
 * 3. otherwise, for made items, the cost of the materials on its latest BOM.
 *
 * Without the fallbacks every item created without a standard cost is worth
 * nothing, and the dashboard's stock valuation reads ₱0 however much is on hand.
 */
export async function unitCostsByItem(db: Db, companyUuid: string): Promise<Map<string, number>> {
  const [items, prices, boms] = await Promise.all([
    db.item.findMany({ where: { companyUuid }, select: { uuid: true, standardCost: true } }),
    db.supplierPrice.findMany({ where: { companyUuid }, orderBy: { updatedAt: 'desc' } }),
    db.bom.findMany({
      where: { companyUuid },
      orderBy: { insertedAt: 'desc' },
      include: { bomItems: { include: { stockUom: { select: { conversionFactor: true } } } } },
    }),
  ]);

  const latestPrice = new Map<string, number>();
  for (const price of prices) {
    if (!latestPrice.has(price.itemUuid) && Number(price.unitPrice) > 0) {
      latestPrice.set(price.itemUuid, Number(price.unitPrice));
    }
  }

  const latestBom = new Map<string, (typeof boms)[number]>();
  for (const bom of boms) if (!latestBom.has(bom.itemUuid)) latestBom.set(bom.itemUuid, bom);

  const standard = new Map(items.map((item) => [item.uuid, Number(item.standardCost)]));
  const costs = new Map<string, number>();

  const costOf = (itemUuid: string, path: Set<string>): number => {
    if (costs.has(itemUuid)) return costs.get(itemUuid)!;
    let cost = standard.get(itemUuid) ?? 0;
    if (cost <= 0) cost = latestPrice.get(itemUuid) ?? 0;
    const bom = latestBom.get(itemUuid);
    // A BOM that (directly or not) contains its own item would recurse forever.
    if (cost <= 0 && bom && !path.has(itemUuid)) {
      const next = new Set(path).add(itemUuid);
      cost = bom.bomItems.reduce(
        (sum, line) => sum + Number(line.qty) * (line.stockUom?.conversionFactor ?? 1) * costOf(line.itemUuid, next),
        0,
      );
    }
    costs.set(itemUuid, cost);
    return cost;
  };

  for (const item of items) costOf(item.uuid, new Set());
  return costs;
}
