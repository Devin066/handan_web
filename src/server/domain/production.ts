import { GraphQLError } from 'graphql';

import { Prisma } from '@/generated/prisma/client';
import { WORK_ORDER_STATUS } from './status';
import { applyStockMove } from './stock';

/**
 * Expands a BOM into the rows a work order is actually executed against:
 * one WorkOrderItem per process step (what the shop floor reports against) and
 * one material request per component (what stores has to issue), scaled by qty.
 */
export async function expandBom(
  tx: Prisma.TransactionClient,
  args: {
    companyUuid: string;
    workOrderUuid: string;
    bomUuid: string;
    warehouseUuid: string;
    plannedQty: Prisma.Decimal;
  },
) {
  const bom = await tx.bom.findUniqueOrThrow({
    where: { uuid: args.bomUuid },
    include: {
      item: true,
      bomItems: { include: { item: true, stockUom: { include: { uom: true } } } },
      bomProcesses: { include: { process: true }, orderBy: { position: 'asc' } },
    },
  });

  for (const step of bom.bomProcesses) {
    await tx.workOrderItem.create({
      data: {
        workOrderUuid: args.workOrderUuid,
        itemName: bom.item.name,
        processName: step.process.name,
        position: step.position,
        requiredQty: args.plannedQty,
      },
    });
  }

  for (const component of bom.bomItems) {
    await tx.workOrderMaterialRequest.create({
      data: {
        workOrderUuid: args.workOrderUuid,
        itemUuid: component.itemUuid,
        itemName: component.item.name,
        uomName: component.stockUom?.uom.name,
        stockUomUuid: component.stockUomUuid,
        bomUuid: bom.uuid,
        warehouseUuid: args.warehouseUuid,
        actualQty: new Prisma.Decimal(component.qty).mul(args.plannedQty),
      },
    });
  }

  return bom;
}

/**
 * A work order's produced quantity is the output of its LAST process step, not the
 * sum across steps — the same physical piece passes through every step, so summing
 * would multiply production by the number of operations.
 */
export async function refreshWorkOrder(tx: Prisma.TransactionClient, workOrderUuid: string) {
  const workOrder = await tx.workOrder.findUniqueOrThrow({
    where: { uuid: workOrderUuid },
    include: { items: { orderBy: { position: 'asc' } } },
  });

  const lastStep = workOrder.items.at(-1);
  const producedQty = lastStep ? new Prisma.Decimal(lastStep.producedQty) : new Prisma.Decimal(0);
  const scrapedQty = workOrder.items.reduce((a, i) => a.add(i.defectiveQty), new Prisma.Decimal(0));

  const stored = new Prisma.Decimal(workOrder.storedQty);

  // Once everything planned has been stored the order is done; before that it
  // stays in whichever stage the shop floor put it in, so scheduling state set
  // by scheduleWorkOrder is not overwritten by a job card report.
  const status = stored.gte(workOrder.plannedQty)
    ? WORK_ORDER_STATUS.completed
    : producedQty.gt(0)
      ? WORK_ORDER_STATUS.inProcess
      : workOrder.status;

  return tx.workOrder.update({
    where: { uuid: workOrderUuid },
    data: { producedQty, scrapedQty, status },
  });
}

/**
 * Moves finished goods into the warehouse and consumes the materials that went
 * into them, in proportion to the quantity stored (so extra pieces consume extra
 * material). Used by "store finished goods" and by completing a board task.
 */
export async function storeFinishedGoods(
  tx: Prisma.TransactionClient,
  companyUuid: string,
  workOrderUuid: string,
  storedQty: Prisma.Decimal,
) {
  const workOrder = await tx.workOrder.findFirstOrThrow({
    where: { uuid: workOrderUuid, companyUuid },
    include: { materialRequests: true },
  });

  const alreadyStored = new Prisma.Decimal(workOrder.storedQty);
  const producible = new Prisma.Decimal(workOrder.producedQty).sub(alreadyStored);

  if (storedQty.gt(producible)) {
    throw new GraphQLError(`cannot store ${storedQty}: only ${producible} produced but not yet stored`);
  }

  if (!workOrder.stockUomUuid) {
    throw new GraphQLError('work order item has no stock UOM, cannot store it');
  }

  // Components are consumed in proportion to what is actually being stored,
  // so a partial store only burns its share of the material.
  const ratio = storedQty.div(workOrder.plannedQty);

  for (const material of workOrder.materialRequests) {
    if (!material.stockUomUuid) continue;

    const consumed = new Prisma.Decimal(material.actualQty).mul(ratio);

    await applyStockMove(tx, {
      companyUuid,
      itemUuid: material.itemUuid,
      warehouseUuid: material.warehouseUuid,
      stockUomUuid: material.stockUomUuid,
      qty: consumed.negated(),
      type: 'material_consumption',
      threadType: 'work_order',
      threadUuid: workOrder.uuid,
    });

    await tx.workOrderMaterialRequest.update({
      where: { uuid: material.uuid },
      data: { receivedQty: { increment: consumed } },
    });
  }

  await applyStockMove(tx, {
    companyUuid,
    itemUuid: workOrder.itemUuid,
    warehouseUuid: workOrder.warehouseUuid,
    stockUomUuid: workOrder.stockUomUuid,
    qty: storedQty,
    type: 'production',
    threadType: 'work_order',
    threadUuid: workOrder.uuid,
  });

  await tx.workOrder.update({
    where: { uuid: workOrder.uuid },
    data: { storedQty: { increment: storedQty } },
  });

  return refreshWorkOrder(tx, workOrder.uuid);
}
