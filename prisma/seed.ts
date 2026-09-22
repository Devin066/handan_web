import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { PrismaClient, Prisma } from '../src/generated/prisma/client';
import { FULFILLMENT_MODEL, ROLE } from '../src/server/domain/status';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL as string }),
});

async function main() {
  console.log('Seeding demo data...');

  // Wipe in dependency order so re-seeding is idempotent.
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.customerInteraction.deleteMany(),
    prisma.followUpRule.deleteMany(),
    prisma.payrollEntry.deleteMany(),
    prisma.payrollPeriod.deleteMany(),
    prisma.attendanceRecord.deleteMany(),
    prisma.expense.deleteMany(),
    prisma.expenseCategory.deleteMany(),
    prisma.appSetting.deleteMany(),
    prisma.jobCard.deleteMany(),
    prisma.workOrderMaterialRequest.deleteMany(),
    prisma.workOrderItem.deleteMany(),
    prisma.workOrder.deleteMany(),
    prisma.deliveryNoteItem.deleteMany(),
    prisma.deliveryNote.deleteMany(),
    prisma.salesInvoice.deleteMany(),
    prisma.salesOrderItem.deleteMany(),
    prisma.salesOrder.deleteMany(),
    prisma.receiptNoteItem.deleteMany(),
    prisma.receiptNote.deleteMany(),
    prisma.purchaseInvoice.deleteMany(),
    prisma.purchaseOrderItem.deleteMany(),
    prisma.purchaseOrder.deleteMany(),
    prisma.paymentEntry.deleteMany(),
    prisma.paymentMethod.deleteMany(),
    prisma.inventoryEntry.deleteMany(),
    prisma.stockItem.deleteMany(),
    prisma.bomProcess.deleteMany(),
    prisma.bomItem.deleteMany(),
    prisma.bom.deleteMany(),
    prisma.process.deleteMany(),
    prisma.workstation.deleteMany(),
    prisma.stockUom.deleteMany(),
    prisma.item.deleteMany(),
    prisma.uom.deleteMany(),
    prisma.warehouse.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.supplier.deleteMany(),
    prisma.counter.deleteMany(),
    prisma.staff.deleteMany(),
    prisma.user.deleteMany(),
    prisma.company.deleteMany(),
  ]);

  const company = await prisma.company.create({
    data: { name: 'Demo Manufacturing Co.', description: 'Seeded demo company' },
  });
  const companyUuid = company.uuid;

  const user = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      nickname: 'Admin',
      role: ROLE.owner,
      companyUuid,
    },
  });

  await prisma.staff.createMany({
    data: [
      { companyUuid, userUuid: user.uuid, email: user.email, name: 'Admin' },
      { companyUuid, email: 'operator@example.com', name: 'Lin Operator' },
      { companyUuid, email: 'foreman@example.com', name: 'Chen Foreman' },
    ],
  });

  const [pcs, kg, box] = await Promise.all([
    prisma.uom.create({ data: { companyUuid, name: 'PCS' } }),
    prisma.uom.create({ data: { companyUuid, name: 'KG' } }),
    prisma.uom.create({ data: { companyUuid, name: 'BOX' } }),
  ]);

  const mainWarehouse = await prisma.warehouse.create({
    data: {
      companyUuid,
      name: 'Main Warehouse',
      address: '1 Factory Road',
      isDefault: true,
      contactName: 'Admin',
    },
  });

  await prisma.warehouse.create({
    data: { companyUuid, name: 'Finished Goods Store', address: '2 Factory Road' },
  });

  const makeItem = async (name: string, spec: string, sellingPrice: number, uomUuid: string, openingQty: number) => {
    const item = await prisma.item.create({
      data: {
        companyUuid,
        name,
        spec,
        sellingPrice: new Prisma.Decimal(sellingPrice),
        stockUoms: { create: [{ uomUuid, conversionFactor: 1, sequence: 0 }] },
      },
      include: { stockUoms: true },
    });

    const stockUom = item.stockUoms[0];

    if (openingQty > 0) {
      await prisma.stockItem.create({
        data: {
          companyUuid,
          itemUuid: item.uuid,
          warehouseUuid: mainWarehouse.uuid,
          stockUomUuid: stockUom.uuid,
          totalOnHand: new Prisma.Decimal(openingQty),
        },
      });

      await prisma.inventoryEntry.create({
        data: {
          companyUuid,
          code: `IE-OPEN-${name.replace(/\s+/g, '-').toUpperCase()}`,
          type: 'opening_stock',
          itemUuid: item.uuid,
          warehouseUuid: mainWarehouse.uuid,
          stockUomUuid: stockUom.uuid,
          actualQty: new Prisma.Decimal(openingQty),
          qtyAfterTransaction: new Prisma.Decimal(openingQty),
          threadType: 'item',
          threadUuid: item.uuid,
        },
      });
    }

    return item;
  };

  const steelPlate = await makeItem('Steel Plate 5mm', '1200x600mm', 45, kg.uuid, 500);
  const bearing = await makeItem('Bearing 6204', 'Sealed, 20mm bore', 12, pcs.uuid, 300);
  const boltSet = await makeItem('Bolt Set M8', 'Zinc plated, 50pc', 8, box.uuid, 120);
  const gearbox = await makeItem('Gearbox Housing', 'Cast, machined', 380, pcs.uuid, 0);

  const [cutting, machining, assembly, inspection] = await Promise.all([
    prisma.process.create({ data: { companyUuid, name: 'Cutting', code: 'CUT' } }),
    prisma.process.create({ data: { companyUuid, name: 'CNC Machining', code: 'CNC' } }),
    prisma.process.create({ data: { companyUuid, name: 'Assembly', code: 'ASM' } }),
    prisma.process.create({ data: { companyUuid, name: 'Inspection', code: 'QC' } }),
  ]);

  await prisma.workstation.createMany({
    data: [
      { companyUuid, name: 'Line A' },
      { companyUuid, name: 'Line B' },
      { companyUuid, name: 'QC Bench' },
    ],
  });

  const stockUomFor = async (itemUuid: string) =>
    (await prisma.stockUom.findFirstOrThrow({ where: { itemUuid }, orderBy: { sequence: 'asc' } })).uuid;

  await prisma.bom.create({
    data: {
      companyUuid,
      name: 'Gearbox Housing BOM',
      itemUuid: gearbox.uuid,
      bomItems: {
        create: [
          { itemUuid: steelPlate.uuid, qty: 3, stockUomUuid: await stockUomFor(steelPlate.uuid) },
          { itemUuid: bearing.uuid, qty: 2, stockUomUuid: await stockUomFor(bearing.uuid) },
          { itemUuid: boltSet.uuid, qty: 1, stockUomUuid: await stockUomFor(boltSet.uuid) },
        ],
      },
      bomProcesses: {
        create: [
          { processUuid: cutting.uuid, position: 0 },
          { processUuid: machining.uuid, position: 1 },
          { processUuid: assembly.uuid, position: 2 },
          { processUuid: inspection.uuid, position: 3 },
        ],
      },
    },
  });

  const [acme, northern] = await Promise.all([
    prisma.customer.create({
      data: { companyUuid, name: 'Acme Machinery Co.', address: '88 Industrial Ave' },
    }),
    prisma.customer.create({
      data: { companyUuid, name: 'Northern Tools Ltd.', address: '12 Harbour Rd' },
    }),
  ]);

  await Promise.all([
    prisma.supplier.create({
      data: { companyUuid, name: 'Steelworks Supply', address: '5 Mill Street' },
    }),
    prisma.supplier.create({
      data: { companyUuid, name: 'Fastener Depot', address: '30 Trade Park' },
    }),
  ]);

  await prisma.paymentMethod.createMany({
    data: [
      { companyUuid, name: 'Bank Transfer' },
      { companyUuid, name: 'Cash' },
      { companyUuid, name: 'Cheque' },
    ],
  });

  // One open sales order so the selling screens have something real to show.
  const gearboxUom = await stockUomFor(gearbox.uuid);
  const bearingUom = await stockUomFor(bearing.uuid);

  const order = await prisma.salesOrder.create({
    data: {
      companyUuid,
      code: 'SO000001',
      customerUuid: acme.uuid,
      customerName: acme.name,
      customerAddress: acme.address,
      warehouseUuid: mainWarehouse.uuid,
      items: {
        create: [
          {
            itemUuid: gearbox.uuid,
            itemName: gearbox.name,
            uomName: 'PCS',
            stockUomUuid: gearboxUom,
            unitPrice: new Prisma.Decimal(380),
            orderedQty: new Prisma.Decimal(10),
          },
          {
            itemUuid: bearing.uuid,
            itemName: bearing.name,
            uomName: 'PCS',
            stockUomUuid: bearingUom,
            unitPrice: new Prisma.Decimal(12),
            orderedQty: new Prisma.Decimal(40),
          },
        ],
      },
    },
    include: { items: true },
  });

  const totalQty = order.items.reduce((a, i) => a.add(i.orderedQty), new Prisma.Decimal(0));
  const totalAmount = order.items.reduce(
    (a, i) => a.add(new Prisma.Decimal(i.unitPrice).mul(i.orderedQty)),
    new Prisma.Decimal(0),
  );

  await prisma.salesOrder.update({
    where: { uuid: order.uuid },
    data: { totalQty, totalAmount },
  });

  // The PRD leaves the queue model (Option A vs B) and the follow-up interval to
  // the client. Both are settings rather than code, so switching them later is a
  // row update, not a migration.
  await prisma.appSetting.createMany({
    data: [
      { companyUuid, key: 'production.queue_mode', value: 'manager_assigned' },
      { companyUuid, key: 'inventory.low_stock_alerts', value: true },
      { companyUuid, key: 'production.require_supervisor_validation', value: true },
      { companyUuid, key: 'sales.default_fulfillment_model', value: FULFILLMENT_MODEL.makeToOrder },
    ],
  });

  await prisma.followUpRule.create({
    data: {
      companyUuid,
      name: 'Messenger follow-up after no response',
      channel: 'messenger',
      trigger: 'no_response',
      // Three days, the interval discussed during discovery.
      noResponseHours: 72,
      messageTemplate: 'Hi! Just following up on your inquiry — are you still interested?',
    },
  });

  await prisma.expenseCategory.createMany({
    data: [
      { companyUuid, name: 'Raw Materials', kind: 'cost_of_goods' },
      { companyUuid, name: 'Salaries', kind: 'payroll' },
      { companyUuid, name: 'Rent', kind: 'operating' },
      { companyUuid, name: 'Utilities', kind: 'operating' },
      { companyUuid, name: 'Supplier Purchases', kind: 'cost_of_goods' },
      { companyUuid, name: 'Miscellaneous', kind: 'operating' },
    ],
  });

  await prisma.counter.createMany({
    data: [
      { companyUuid, name: 'salesOrder', value: 1 },
      { companyUuid, name: 'inventoryEntry', value: 4 },
    ],
  });

  console.log(`
Seed complete.

  Company : ${company.name}
  Login   : admin@example.com
  Password: password123
`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
