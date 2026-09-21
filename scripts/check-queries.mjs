/**
 * Executes every query document in src/gql/documents/queries against a running
 * API and reports any that error.
 *
 * `pnpm codegen` proves the documents typecheck against the schema; this proves
 * the resolvers behind them actually run. Read-only — safe against any database.
 *
 * Usage: pnpm check:queries   (with the dev server up and the DB seeded)
 */
import fs from 'node:fs';
import path from 'node:path';

const ENDPOINT = process.env.SMOKE_ENDPOINT ?? 'http://localhost:3000/api/graphql';
const DOCS = 'src/gql/documents';
let token = null;

async function gql(query, variables = {}) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ query, variables })
  });
  return res.json();
}

// Build fragmentName -> definition. Names don't always match filenames
// (PaymentMethodFields.gql defines PaymentMethodsFields).
const fragmentSource = fs
  .readdirSync(path.join(DOCS, 'fragments'))
  .map((f) => fs.readFileSync(path.join(DOCS, 'fragments', f), 'utf8'))
  .join('\n');

const fragmentByName = new Map();
for (const block of fragmentSource.split(/(?=fragment\s+\w+\s+on\s)/)) {
  const m = block.match(/fragment\s+(\w+)\s+on\s/);
  if (m) fragmentByName.set(m[1], block.trim());
}

// GraphQL rejects unused fragments, so attach only what a document references,
// following spreads inside fragments too.
function neededFragments(doc) {
  const seen = new Set();
  const queue = [...doc.matchAll(/\.\.\.(\w+)/g)].map((m) => m[1]);

  while (queue.length) {
    const name = queue.pop();
    if (seen.has(name) || !fragmentByName.has(name)) continue;
    seen.add(name);
    for (const m of fragmentByName.get(name).matchAll(/\.\.\.(\w+)/g)) queue.push(m[1]);
  }

  return [...seen].map((n) => fragmentByName.get(n)).join('\n');
}

const { data: login } = await gql(
  `mutation($request: LoginRequest!){ login(request:$request){ accessToken } }`,
  { request: { email: 'admin@handan.dev', password: 'password123' } }
);
token = login.login.accessToken;

// Real ids for the single-entity queries.
const { data: seedIds } = await gql(`{
  items { uuid } customers { uuid } suppliers { uuid } processes { uuid }
  workstations { uuid } boms { uuid } paymentMethods { uuid } paymentEntries { uuid }
  salesOrders { uuid } purchaseOrders { uuid } deliveryNotes { uuid } receiptNotes { uuid }
  salesInvoices { uuid } purchaseInvoices { uuid } workOrders { uuid } workOrderItems { uuid }
}`);

const first = (k) => seedIds[k]?.[0]?.uuid ?? '00000000-0000-0000-0000-000000000000';

const VARS = {
  Bom: { request: { uuid: first('boms') } },
  Customer: { request: { uuid: first('customers') } },
  Supplier: { request: { uuid: first('suppliers') } },
  Item: { request: { uuid: first('items') } },
  Process: { request: { uuid: first('processes') } },
  Workstation: { request: { uuid: first('workstations') } },
  PaymentMethod: { request: { uuid: first('paymentMethods') } },
  PaymentEntry: { request: { uuid: first('paymentEntries') } },
  workOrder: { request: { uuid: first('workOrders') } },
  workOrderItem: { request: { uuid: first('workOrderItems') } },
  SalesOrder: { request: { salesOrderUuid: first('salesOrders') } },
  PurchaseOrder: { request: { purchaseOrderUuid: first('purchaseOrders') } },
  DeliveryNote: { request: { deliveryNoteUuid: first('deliveryNotes') } },
  ReceiptNote: { request: { receiptNoteUuid: first('receiptNotes') } },
  SalesInvoice: { request: { salesInvoiceUuid: first('salesInvoices') } },
  PurchaseInvoice: { request: { purchaseInvoiceUuid: first('purchaseInvoices') } },
  UnpaidSalesInvoicesByCustomer: { request: { uuid: first('customers') } },
  UnpaidPurchaseInvoicesBySupplier: { request: { uuid: first('suppliers') } }
};

const files = fs.readdirSync(path.join(DOCS, 'queries')).filter((f) => f.endsWith('.gql'));
let ok = 0;
const failed = [];

for (const file of files) {
  const body = fs.readFileSync(path.join(DOCS, 'queries', file), 'utf8');
  const match = body.match(/(query|mutation)\s+(\w+)/);
  if (!match) continue;
  const [, kind, name] = match;
  if (kind === 'mutation') continue; // handled by the smoke test

  const res = await gql(`${body}\n${neededFragments(body)}`, VARS[name] ?? {});

  if (res.errors) {
    failed.push(`${name}: ${res.errors[0].message}`);
  } else {
    ok += 1;
  }
}

console.log(`\nqueries executed: ${ok} ok, ${failed.length} failed`);
failed.forEach((f) => console.log('  FAIL ' + f));
process.exit(failed.length ? 1 : 0);
