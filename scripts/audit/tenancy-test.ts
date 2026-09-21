/**
 * Proves that one tenant cannot read or modify another tenant's data.
 *
 * Creates a throwaway "Evil Corp" tenant, logs in as it, and tries to reach the
 * seeded demo company's records. Cleans up after itself.
 *
 * Usage: pnpm audit:tenancy   (dev server running, database seeded)
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../../src/generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL as string }),
});

const ENDPOINT = process.env.SMOKE_ENDPOINT ?? 'http://localhost:3000/api/graphql';

async function gql(query: string, variables: unknown = {}, token?: string) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });
  return res.json() as Promise<{ data?: any; errors?: Array<{ message: string }> }>;
}

let failures = 0;

function check(label: string, safe: boolean, detail: string) {
  if (safe) {
    console.log(`  ok    ${label} — ${detail}`);
  } else {
    failures += 1;
    console.log(`  FAIL  ${label} — ${detail}`);
  }
}

async function main() {
  const evil = await prisma.company.create({ data: { name: 'Evil Corp (audit)' } });

  await prisma.user.create({
    data: {
      email: 'evil@audit.test',
      passwordHash: await bcrypt.hash('evilpass123', 10),
      companyUuid: evil.uuid,
    },
  });

  try {
    const login = await gql(`mutation($request: LoginRequest!){ login(request:$request){ accessToken } }`, {
      request: { email: 'evil@audit.test', password: 'evilpass123' },
    });
    const evilToken = login.data.login.accessToken;

    const victimOrder = await prisma.salesOrder.findFirstOrThrow({
      where: { NOT: { companyUuid: evil.uuid } },
    });

    // The seed does not create a work order, so make one to attack if needed.
    // Without this the audit silently depends on leftover state from a previous run.
    let victimWorkOrder = await prisma.workOrder.findFirst({
      where: { NOT: { companyUuid: evil.uuid } },
    });

    if (!victimWorkOrder) {
      const item = await prisma.item.findFirstOrThrow({
        where: { companyUuid: victimOrder.companyUuid },
      });

      victimWorkOrder = await prisma.workOrder.create({
        data: {
          code: 'WO-AUDIT',
          companyUuid: victimOrder.companyUuid,
          itemUuid: item.uuid,
          itemName: item.name,
          warehouseUuid: victimOrder.warehouseUuid,
          plannedQty: 1,
        },
      });
    }

    console.log(`\nvictim: work order ${victimWorkOrder.code}, sales order ${victimOrder.code}\n`);

    // Reads must not cross the tenant boundary.
    const lists = await gql(
      `{ workOrders { code } salesOrders { code } items { name } customers { name } inventoryEntries { code } }`,
      {},
      evilToken,
    );
    const counts = Object.entries(lists.data).map(([k, v]) => `${k}=${(v as unknown[]).length}`);
    check(
      'list queries isolated',
      Object.values(lists.data).every((v) => (v as unknown[]).length === 0),
      counts.join(' '),
    );

    // Direct fetch by another tenant's uuid must return nothing.
    const direct = await gql(
      `query($r: IdRequest!){ workOrder(request:$r){ code } }`,
      { r: { uuid: victimWorkOrder.uuid } },
      evilToken,
    );
    check(
      'workOrder by uuid blocked',
      direct.data?.workOrder == null,
      `returned ${JSON.stringify(direct.data?.workOrder)}`,
    );

    const directSo = await gql(
      `query($r: SalesOrderRequest!){ salesOrder(request:$r){ code } }`,
      { r: { salesOrderUuid: victimOrder.uuid } },
      evilToken,
    );
    check(
      'salesOrder by uuid blocked',
      directSo.data?.salesOrder == null,
      `returned ${JSON.stringify(directSo.data?.salesOrder)}`,
    );

    // Writes must not touch another tenant's rows.
    const before = { status: victimWorkOrder.status, companyUuid: victimWorkOrder.companyUuid };

    await gql(
      `mutation($r: WorkOrderRequest!){ scheduleWorkOrder(request:$r){ uuid status } }`,
      { r: { workOrderUuid: victimWorkOrder.uuid } },
      evilToken,
    );

    const after = await prisma.workOrder.findUniqueOrThrow({ where: { uuid: victimWorkOrder.uuid } });
    check(
      'scheduleWorkOrder cannot reassign tenant',
      after.companyUuid === before.companyUuid,
      `companyUuid ${before.companyUuid} -> ${after.companyUuid}`,
    );
    check(
      'scheduleWorkOrder cannot modify other tenant',
      after.status === before.status,
      `status ${before.status} -> ${after.status}`,
    );

    // Restore if anything did get through, so a failing audit is not destructive.
    if (after.companyUuid !== before.companyUuid || after.status !== before.status) {
      await prisma.workOrder.update({ where: { uuid: victimWorkOrder.uuid }, data: before });
      console.log('\n  (victim row restored)');
    }

    // Completing another tenant's delivery note must not move their stock.
    // Create one if the seed state has none, so this path is always exercised.
    let victimNote = await prisma.deliveryNote.findFirst({
      where: { NOT: { companyUuid: evil.uuid }, status: 'pending' },
    });

    if (!victimNote) {
      const line = await prisma.salesOrderItem.findFirstOrThrow({
        where: { salesOrderUuid: victimOrder.uuid },
      });

      victimNote = await prisma.deliveryNote.create({
        data: {
          code: 'DN-AUDIT',
          companyUuid: victimOrder.companyUuid,
          customerUuid: victimOrder.customerUuid,
          customerName: victimOrder.customerName,
          salesOrderUuid: victimOrder.uuid,
          warehouseUuid: victimOrder.warehouseUuid,
          totalQty: 1,
          items: {
            create: [
              {
                salesOrderItemUuid: line.uuid,
                itemUuid: line.itemUuid,
                itemName: line.itemName,
                stockUomUuid: line.stockUomUuid,
                actualQty: 1,
                unitPrice: line.unitPrice,
              },
            ],
          },
        },
      });
    }

    if (victimNote) {
      const res = await gql(
        `mutation($r: DeliveryNoteRequest!){ completeDeliveryNote(request:$r){ status } }`,
        { r: { deliveryNoteUuid: victimNote.uuid } },
        evilToken,
      );
      const still = await prisma.deliveryNote.findUniqueOrThrow({ where: { uuid: victimNote.uuid } });
      // Compare against the note's own prior state rather than a hardcoded
      // status, so this keeps working if the vocabulary changes again.
      check(
        'completeDeliveryNote blocked across tenants',
        still.status === victimNote.status,
        res.errors ? `rejected: ${res.errors[0].message.slice(0, 60)}` : `status now ${still.status}`,
      );
    }
  } finally {
    await prisma.workOrder.deleteMany({ where: { code: 'WO-AUDIT' } });
    await prisma.deliveryNoteItem.deleteMany({ where: { deliveryNote: { code: 'DN-AUDIT' } } });
    await prisma.deliveryNote.deleteMany({ where: { code: 'DN-AUDIT' } });
    await prisma.jobCard.deleteMany({ where: { companyUuid: evil.uuid } });
    await prisma.user.deleteMany({ where: { companyUuid: evil.uuid } });
    await prisma.staff.deleteMany({ where: { companyUuid: evil.uuid } });
    await prisma.company.delete({ where: { uuid: evil.uuid } });
  }

  console.log(`\n${failures === 0 ? 'PASS' : 'FAIL'} — tenancy isolation\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
