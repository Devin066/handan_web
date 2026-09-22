/**
 * End-to-end check of the GraphQL API against a seeded database.
 * Run the dev server, then: pnpm smoke
 *
 * `pnpm smoke` re-seeds first: the assertions use known seed quantities and the
 * test consumes them as it runs, so a second run against the same data fails on
 * stock levels. Use `pnpm smoke:only` to skip the re-seed deliberately.
 *
 * Exercises the paths that carry state (stock, rollups, allocation) rather than
 * just asserting that queries return 200.
 */

const ENDPOINT = process.env.SMOKE_ENDPOINT ?? 'http://localhost:3000/api/graphql';

let token = null;
let failures = 0;
let checks = 0;

async function gql(query, variables = {}) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  const body = await res.json();

  if (body.errors) {
    const error = new Error(body.errors[0].message);
    error.graphQLErrors = body.errors;
    throw error;
  }

  return body.data;
}

function check(label, actual, expected) {
  checks += 1;
  const ok = JSON.stringify(actual) === JSON.stringify(expected);

  if (!ok) {
    failures += 1;
    console.log(`  FAIL  ${label}\n        expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  } else {
    console.log(`  ok    ${label} = ${JSON.stringify(actual)}`);
  }
}

async function expectError(label, fn, fragment) {
  checks += 1;

  try {
    await fn();
    failures += 1;
    console.log(`  FAIL  ${label}: expected an error, but the call succeeded`);
  } catch (error) {
    if (error.message.includes(fragment)) {
      console.log(`  ok    ${label} rejected: "${error.message}"`);
    } else {
      failures += 1;
      console.log(`  FAIL  ${label}: wrong error "${error.message}" (wanted "${fragment}")`);
    }
  }
}

const onHand = async (itemName) => {
  const { stockItems } = await gql(`{ stockItems { totalOnHand item { name } } }`);
  return stockItems.filter((s) => s.item.name === itemName).reduce((a, s) => a + s.totalOnHand, 0);
};

async function main() {
  console.log('\n== auth ==');
  const { login } = await gql(
    `mutation($request: LoginRequest!) { login(request: $request) { uuid email accessToken } }`,
    { request: { email: 'admin@example.com', password: 'password123' } },
  );
  token = login.accessToken;
  check('login email', login.email, 'admin@example.com');

  const { currentUser, company } = await gql(`{ currentUser { email } company { name } }`);
  check('currentUser', currentUser.email, 'admin@example.com');
  check('company', company.name, 'Demo Manufacturing Co.');

  await expectError(
    'unauthenticated query',
    async () => {
      const saved = token;
      token = null;
      try {
        await gql(`{ items { uuid } }`);
      } finally {
        token = saved;
      }
    },
    'unauthenticated',
  );

  console.log('\n== master data ==');
  const { items, warehouses, uoms, customers, suppliers, paymentMethods } = await gql(`{
    items { uuid name defaultStockUomName stockUoms { uuid uomName } }
    warehouses { uuid name }
    uoms { uuid name }
    customers { uuid name }
    suppliers { uuid name }
    paymentMethods { uuid name }
  }`);
  check('item count', items.length, 4);
  check('uom count', uoms.length, 3);
  check('customer count', customers.length, 2);
  check('supplier count', suppliers.length, 2);

  const byName = (list, name) => list.find((x) => x.name === name);
  const mainWarehouse = byName(warehouses, 'Main Warehouse');
  const bearing = byName(items, 'Bearing 6204');
  const gearbox = byName(items, 'Gearbox Housing');
  check('bearing default uom', bearing.defaultStockUomName, 'PCS');

  console.log('\n== selling: order -> delivery -> stock ==');
  const bearingBefore = await onHand('Bearing 6204');
  check('bearing opening stock', bearingBefore, 300);

  const { createSalesOrder } = await gql(
    `mutation($request: CreateSalesOrderRequest!) {
      createSalesOrder(request: $request) { customerUuid items { itemName } }
    }`,
    {
      request: {
        customerUuid: customers[0].uuid,
        warehouseUuid: mainWarehouse.uuid,
        salesItems: [
          {
            itemUuid: bearing.uuid,
            orderedQty: 20,
            unitPrice: 12,
            stockUomUuid: bearing.stockUoms[0].uuid,
            uomName: 'PCS',
          },
        ],
      },
    },
  );
  check('sales order lines', createSalesOrder.items.length, 1);

  const { salesOrders } = await gql(
    `{ salesOrders { uuid code totalAmount totalQty deliveryStatus items { uuid itemName } } }`,
  );
  const order = salesOrders.find((o) => o.items.some((i) => i.itemName === 'Bearing 6204') && o.totalQty === 20);
  check('new order total', order.totalAmount, 240);

  const { createDeliveryNote } = await gql(
    `mutation($request: CreateDeliveryNoteRequest!) {
      createDeliveryNote(request: $request) { uuid totalQty totalAmount status }
    }`,
    {
      request: {
        salesOrderUuid: order.uuid,
        deliveryItems: [{ salesOrderItemUuid: order.items[0].uuid, actualQty: 8 }],
      },
    },
  );
  check('delivery note qty', createDeliveryNote.totalQty, 8);
  check('delivery note starts open', createDeliveryNote.status, 'to_deliver');
  check('stock unchanged before completion', await onHand('Bearing 6204'), bearingBefore);

  await gql(`mutation($request: DeliveryNoteRequest!) { completeDeliveryNote(request: $request) { status } }`, {
    request: { deliveryNoteUuid: createDeliveryNote.uuid },
  });
  check('stock issued on completion', await onHand('Bearing 6204'), bearingBefore - 8);

  const { salesOrder: afterDelivery } = await gql(
    `query($request: SalesOrderRequest!) {
      salesOrder(request: $request) { deliveryStatus deliveredQty remainingQty status }
    }`,
    { request: { salesOrderUuid: order.uuid } },
  );
  check('delivery status', afterDelivery.deliveryStatus, 'partly_delivered');
  check('delivered qty', afterDelivery.deliveredQty, 8);
  check('remaining qty', afterDelivery.remainingQty, 12);

  await expectError(
    'over-delivery',
    () =>
      gql(
        `mutation($request: CreateDeliveryNoteRequest!) {
          createDeliveryNote(request: $request) { uuid }
        }`,
        {
          request: {
            salesOrderUuid: order.uuid,
            deliveryItems: [{ salesOrderItemUuid: order.items[0].uuid, actualQty: 999 }],
          },
        },
      ),
    'only 12 outstanding',
  );

  await expectError(
    'double completion',
    () =>
      gql(`mutation($request: DeliveryNoteRequest!) { completeDeliveryNote(request: $request) { status } }`, {
        request: { deliveryNoteUuid: createDeliveryNote.uuid },
      }),
    'already completed',
  );

  console.log('\n== finance: invoice -> payment allocation ==');
  const { createSalesInvoice } = await gql(
    `mutation($request: CreateSalesInvoiceRequest!) {
      createSalesInvoice(request: $request) { status amount }
    }`,
    { request: { salesOrderUuid: order.uuid, amount: 240 } },
  );
  check('invoice starts unpaid', createSalesInvoice.status, 'unpaid');

  const { unpaidSalesInvoicesByCustomer } = await gql(
    `query($request: IdRequest!) {
      unpaidSalesInvoicesByCustomer(request: $request) { uuid amount status }
    }`,
    { request: { uuid: customers[0].uuid } },
  );
  check('one unpaid invoice', unpaidSalesInvoicesByCustomer.length, 1);

  const invoice = unpaidSalesInvoicesByCustomer[0];

  // Partial payment: 100 of 240.
  await gql(`mutation($request: CreatePaymentEntryRequest!) { createPaymentEntry(request: $request) { uuid code } }`, {
    request: {
      type: 'receive',
      partyType: 'customer',
      partyUuid: customers[0].uuid,
      paymentMethodUuid: paymentMethods[0].uuid,
      totalAmount: 100,
      salesInvoiceIds: [invoice.uuid],
    },
  });

  const { salesInvoices } = await gql(`{ salesInvoices { uuid status } }`);
  check('invoice partially paid', salesInvoices.find((i) => i.uuid === invoice.uuid).status, 'partly_paid');

  const { salesOrder: afterPayment } = await gql(
    `query($request: SalesOrderRequest!) {
      salesOrder(request: $request) { paidAmount remainingAmount billingStatus }
    }`,
    { request: { salesOrderUuid: order.uuid } },
  );
  check('order paid amount', afterPayment.paidAmount, 100);
  check('order billing status', afterPayment.billingStatus, 'partly_billed');

  // Pay the rest.
  await gql(`mutation($request: CreatePaymentEntryRequest!) { createPaymentEntry(request: $request) { uuid } }`, {
    request: {
      type: 'receive',
      partyType: 'customer',
      partyUuid: customers[0].uuid,
      paymentMethodUuid: paymentMethods[0].uuid,
      totalAmount: 140,
      salesInvoiceIds: [invoice.uuid],
    },
  });

  const { salesInvoices: settled } = await gql(`{ salesInvoices { uuid status } }`);
  check('invoice fully paid', settled.find((i) => i.uuid === invoice.uuid).status, 'paid');

  console.log('\n== purchasing: order -> receipt -> stock ==');
  const steelBefore = await onHand('Steel Plate 5mm');
  const steel = byName(items, 'Steel Plate 5mm');

  await gql(
    `mutation($request: CreatePurchaseOrderRequest!) {
      createPurchaseOrder(request: $request) { supplierUuid status }
    }`,
    {
      request: {
        supplierUuid: suppliers[0].uuid,
        warehouseUuid: mainWarehouse.uuid,
        purchaseItems: [
          {
            itemUuid: steel.uuid,
            orderedQty: 100,
            unitPrice: 40,
            stockUomUuid: steel.stockUoms[0].uuid,
            uomName: 'KG',
          },
        ],
      },
    },
  );

  const { purchaseOrders } = await gql(
    `{ purchaseOrders { uuid totalAmount totalQty receiptStatus items { uuid itemName } } }`,
  );
  const po = purchaseOrders[0];
  check('purchase order total', po.totalAmount, 4000);

  const { createReceiptNote } = await gql(
    `mutation($request: CreateReceiptNoteRequest!) {
      createReceiptNote(request: $request) { uuid totalQty }
    }`,
    {
      request: {
        purchaseOrderUuid: po.uuid,
        receiptItems: [{ purchaseOrderItemUuid: po.items[0].uuid, actualQty: 60 }],
      },
    },
  );
  check('receipt note qty', createReceiptNote.totalQty, 60);

  await gql(`mutation($request: ReceiptNoteRequest!) { completeReceiptNote(request: $request) { status } }`, {
    request: { receiptNoteUuid: createReceiptNote.uuid },
  });
  check('stock received', await onHand('Steel Plate 5mm'), steelBefore + 60);

  const { purchaseOrder: afterReceipt } = await gql(
    `query($request: PurchaseOrderRequest!) {
      purchaseOrder(request: $request) { receiptStatus receivedQty remainingQty }
    }`,
    { request: { purchaseOrderUuid: po.uuid } },
  );
  check('receipt status', afterReceipt.receiptStatus, 'partly_received');
  check('remaining to receive', afterReceipt.remainingQty, 40);

  console.log('\n== production: BOM -> work order -> job cards -> store ==');
  const { boms } = await gql(`{ boms { uuid name } }`);
  const bom = boms[0];

  const { createWorkOrder } = await gql(
    `mutation($request: CreateWorkOrderRequest!) { createWorkOrder(request: $request) { itemUuid status } }`,
    { request: { bomUuid: bom.uuid, warehouseUuid: mainWarehouse.uuid, plannedQty: 5 } },
  );
  check('work order item', createWorkOrder.itemUuid, gearbox.uuid);

  const { workOrders } = await gql(`{ workOrders { uuid code plannedQty status } }`);
  const wo = workOrders.find((w) => w.plannedQty === 5);

  const { workOrder } = await gql(
    `query($request: IdRequest!) {
      workOrder(request: $request) {
        items { uuid position processName requiredQty }
        materialRequests { itemName actualQty }
      }
    }`,
    { request: { uuid: wo.uuid } },
  );
  check('process steps expanded', workOrder.items.length, 4);
  check(
    'steel required (3 x 5)',
    workOrder.materialRequests.find((m) => m.itemName === 'Steel Plate 5mm').actualQty,
    15,
  );
  check(
    'bearings required (2 x 5)',
    workOrder.materialRequests.find((m) => m.itemName === 'Bearing 6204').actualQty,
    10,
  );

  const { listStaff } = await gql(`{ listStaff { uuid name } }`);
  const operator = listStaff.find((s) => s.name === 'Lin Operator');

  // Report each step in sequence, as the shop floor would.
  for (const step of workOrder.items) {
    await gql(`mutation($request: ReportJobCardRequest!) { reportJobCard(request: $request) { status producedQty } }`, {
      request: {
        workOrderUuid: wo.uuid,
        workOrderItemUuid: step.uuid,
        operatorStaffUuid: operator.uuid,
        producedQty: 5,
        defectiveQty: 0,
        startTime: '2026-09-21T08:00:00.000Z',
        endTime: '2026-09-21T12:00:00.000Z',
      },
    });
  }

  const { workOrder: produced } = await gql(
    `query($request: IdRequest!) { workOrder(request: $request) { producedQty scrapedQty status } }`,
    { request: { uuid: wo.uuid } },
  );
  check('produced qty from final step', produced.producedQty, 5);
  check('work order status', produced.status, 'in_process');

  const { workOrderItem } = await gql(
    `query($request: IdRequest!) {
      workOrderItem(request: $request) { producedQty jobCards { producedQty operatorStaff { email } } }
    }`,
    { request: { uuid: workOrder.items[0].uuid } },
  );
  check('job card recorded', workOrderItem.jobCards.length, 1);
  check('job card operator', workOrderItem.jobCards[0].operatorStaff.email, 'operator@example.com');

  await expectError(
    'storing more than produced',
    () =>
      gql(`mutation($request: StoreFinishItemRequest!) { storeFinishItem(request: $request) { status } }`, {
        request: { workOrderUuid: wo.uuid, storedQty: 99 },
      }),
    'only 5 produced',
  );

  const gearboxBefore = await onHand('Gearbox Housing');
  const steelBeforeStore = await onHand('Steel Plate 5mm');
  const bearingBeforeStore = await onHand('Bearing 6204');

  const { storeFinishItem } = await gql(
    `mutation($request: StoreFinishItemRequest!) {
      storeFinishItem(request: $request) { storedQty status }
    }`,
    { request: { workOrderUuid: wo.uuid, storedQty: 5 } },
  );
  check('stored qty', storeFinishItem.storedQty, 5);
  check('work order completed', storeFinishItem.status, 'completed');
  check('finished goods in stock', await onHand('Gearbox Housing'), gearboxBefore + 5);
  check('steel consumed (3 x 5)', await onHand('Steel Plate 5mm'), steelBeforeStore - 15);
  check('bearings consumed (2 x 5)', await onHand('Bearing 6204'), bearingBeforeStore - 10);

  console.log('\n== ledger ==');
  const { inventoryEntries } = await gql(
    `{ inventoryEntries { code type actualQty qtyAfterTransaction item { name } warehouse { name } stockUom { uomName } } }`,
  );
  const types = [...new Set(inventoryEntries.map((e) => e.type))].sort();
  check('movement types recorded', types, [
    'delivery',
    'material_consumption',
    'opening_stock',
    'production',
    'receipt',
  ]);

  console.log(`\n${failures === 0 ? 'PASS' : 'FAIL'} — ${checks - failures}/${checks} checks passed\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error('\nsmoke test crashed:', error.message);
  if (error.graphQLErrors) console.error(JSON.stringify(error.graphQLErrors, null, 2));
  process.exit(1);
});
