import { Prisma } from '@/generated/prisma/client';
import { nextCode } from './codes';

export type StockMove = {
  companyUuid: string;
  itemUuid: string;
  warehouseUuid: string;
  stockUomUuid: string;
  /** Positive to receive into stock, negative to issue out of it. */
  qty: Prisma.Decimal | number;
  type: string;
  threadType?: string;
  threadUuid?: string;
};

/**
 * The single path by which stock changes. It keeps StockItem.totalOnHand and the
 * InventoryEntry ledger in step, so on-hand is always explained by the entries
 * behind it. Callers must pass a transaction: a move that half-applies is worse
 * than one that fails.
 */
export async function applyStockMove(tx: Prisma.TransactionClient, move: StockMove) {
  const qty = new Prisma.Decimal(move.qty);

  const stockItem = await tx.stockItem.upsert({
    where: {
      itemUuid_warehouseUuid_stockUomUuid: {
        itemUuid: move.itemUuid,
        warehouseUuid: move.warehouseUuid,
        stockUomUuid: move.stockUomUuid,
      },
    },
    create: {
      companyUuid: move.companyUuid,
      itemUuid: move.itemUuid,
      warehouseUuid: move.warehouseUuid,
      stockUomUuid: move.stockUomUuid,
      totalOnHand: qty,
    },
    update: { totalOnHand: { increment: qty } },
  });

  const code = await nextCode(tx, move.companyUuid, 'inventoryEntry');

  await tx.inventoryEntry.create({
    data: {
      code,
      companyUuid: move.companyUuid,
      itemUuid: move.itemUuid,
      warehouseUuid: move.warehouseUuid,
      stockUomUuid: move.stockUomUuid,
      actualQty: qty,
      qtyAfterTransaction: stockItem.totalOnHand,
      type: move.type,
      threadType: move.threadType,
      threadUuid: move.threadUuid,
    },
  });

  return stockItem;
}
