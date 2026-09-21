# Migration audit

Audit of the Elixir → TypeScript backend migration. Method: compare the SDL
against implemented resolvers, against the Prisma schema, and against live data;
then attack the running API.

**Result: two critical bugs (one security, one that made core workflows
unreachable), two unimplemented mutations, one permanently-null field, one
incorrect field, and an N+1 performance problem. All fixed and covered by
automated checks.**

---

## Critical

### 1. Cross-tenant write in `scheduleWorkOrder`

`src/server/resolvers/production.ts`

```ts
// before
return ctx.db.workOrder.update({
  where: { uuid: request.workOrderUuid ?? '' },   // not scoped to the company
  data: { status: 'scheduled', companyUuid },     // reassigns ownership
});
```

Two faults in three lines. The `where` was not scoped to the caller's company, so
any authenticated user could schedule **any** work order by uuid. Worse, `data`
wrote `companyUuid`, so the row was *moved into the attacker's company* — they
then owned it outright and could see it in every subsequent list query.

Proven with a live exploit (`scripts/audit/tenancy-test.ts`): a throwaway "Evil
Corp" tenant took ownership of the demo company's `WO000001` and changed its
status from `completed` to `scheduled`.

**Fixed** by looking the row up scoped to the company first, and never writing
`companyUuid` on update. The exploit now fails.

Every other resolver was checked and was already correctly scoped — reads were
never vulnerable. This was the single outlier, and it stood out precisely because
it was the one mutation that skipped the `findFirstOrThrow(... companyUuid)`
pattern the rest of the code follows.

---

## Critical (second pass)

### 1b. Status vocabulary mismatch — core workflows were unreachable

Found only after auditing the *values* flowing through the API, not just field
names and types. The first pass checked the contract's shape and missed this
entirely.

The frontend gates its row actions on the original Elixir status strings:

| Screen | Gate | Backend emitted |
| --- | --- | --- |
| Delivery notes | `status === 'to_deliver'` | `pending` |
| Receipt notes | `status === 'to_receive'` | `pending` |
| Work orders | `status === 'draft'` / `'scheduling'` | `pending` / `scheduled` |
| Sales orders | `deliveryStatus != 'fully_delivered'` | `partial` / `completed` |
| Purchase orders | `receiptStatus != 'fully_received'` | `partial` / `completed` |

Consequences, in order of severity:

- **"Stock In" and "Stock Out" never appeared at all.** A delivery or receipt
  note could be created but never completed from the UI, so no stock could move
  through the application. The API worked; the button was simply never rendered.
- **"Start Scheduling" never appeared**, so work orders could not be scheduled.
- Conversely, "Add Delivery Note" and invoice actions never *stopped* appearing,
  because `!= 'fully_delivered'` was true even for a fully delivered order.

**Fixed** by adopting the documented ERP vocabulary in the backend rather than
rewriting the conditionals in six components. The vocabulary is also more
informative — `to_deliver_and_bill` says what is outstanding, where `processing`
does not. It now lives in one place (`src/server/domain/status.ts`) with the
labels alongside it in `src/utils/enum.tsx`.

Two related bugs fell out of the same review:

- `unpaidSalesInvoicesByCustomer` / `unpaidPurchaseInvoicesBySupplier` filtered on
  a status string that no longer existed, which would have hidden partly-paid
  invoices from the payment screens. Now driven by a shared
  `UNSETTLED_INVOICE_STATUSES` constant.
- The invoice "Pay" action was gated on `status === 'unpaid'`, so a **partly-paid
  invoice could never be paid off**. Now `status !== 'paid'`.

**Lesson for future migrations:** matching the schema is necessary but not
sufficient. Enum-like string values are part of the contract, and nothing in
codegen or typechecking catches a mismatch in them — both sides are just
`String`.

---

## Correctness

### 2. `Workstation.members` returned every employee

The resolver returned all staff in the company rather than the workstation's
members — not imprecise, simply wrong. There was no membership model behind it.

**Fixed:** added a `Staff` ⇄ `Workstation` relation (migration
`workstation_members`) and the resolver now returns actual members.

### 3. `Customer.balance` was permanently null

Declared in the SDL, but with no Prisma column and no resolver, it returned null
for every customer regardless of data — a field the schema promised and never
delivered.

**Fixed:** implemented as a derived value (invoiced minus paid, over unpaid and
partially paid invoices), so it cannot drift from the invoices behind it.

### 4. `register` and `createCompany` were declared but unimplemented

Both returned null silently. Neither is used by the frontend; both were inherited
from the Elixir schema.

**Fixed** by removing them from the SDL — a schema should not advertise
operations that do nothing — and adding `pnpm create-company` instead. For an ERP
this is the right shape: tenants are provisioned by an operator, not self-served
by anyone who can reach the API.

### 5. Missing records surfaced as "Internal server error"

Prisma raises `P2025` when `findFirstOrThrow` matches nothing. In production the
error mask turned that into `Internal server error`, which is both alarming and
uninformative for an ordinary "that record isn't there".

**Fixed:** `P2025` now maps to a clean `not found` (`NOT_FOUND`). Genuine faults
are still masked and logged server-side.

---

## Performance

### 6. N+1 on every nested list query

Field resolvers fetched relations one row at a time, so a list of sales orders
asking for `customer`, `warehouse` and `items` issued one query per order per
field. Measured by scaling row count:

| sales orders | flat query | nested query |
| --- | --- | --- |
| 1 | 5ms | 6ms |
| 10 | 4ms | 7ms |
| 30 | 4ms | 12ms |
| 60 | 4ms | **19ms** |

Flat stayed constant while nested grew linearly — the N+1 signature.

**Fixed** with per-request DataLoader batching (`src/server/loaders.ts`) covering
52 by-uuid lookups plus the one-to-many child lists. After:

| sales orders | flat query | nested query |
| --- | --- | --- |
| 1 | 4ms | 4ms |
| 30 | 4ms | 7ms |
| 60 | 7ms | **8ms** |

Nested is now effectively flat. Loaders are created per request and never shared,
because a cache outliving the request would serve one tenant another's rows.

---

## Verified as correct

- **All 41 queries and 21 mutations** in the SDL have resolvers (`pnpm check:queries`
  executes all 40 frontend query documents against live data).
- **Tenant isolation on reads** — list queries, and direct fetch by another
  tenant's uuid, both return nothing.
- **Stock integrity** — every movement goes through `applyStockMove`, keeping
  `StockItem.totalOnHand` and the `InventoryEntry` ledger in step.
- **Business rules** — 47 assertions across the full order-to-cash and
  procure-to-pay cycles, plus BOM expansion, job cards and material consumption.
- **Guard rails** — over-delivery, over-receipt, double completion, and storing
  more than produced are all rejected with clear messages.
- **`.env.example`** documents exactly the variables the code reads, no more and
  no less (`pnpm check:env`).

## Known limitations (unchanged, by design)

- **No pagination.** Every list query returns all rows (`inventoryEntries` caps at
  500). Fine at SME scale; will need cursors before a customer accumulates years
  of transactions.
- **No role-based permissions.** Any authenticated user of a company can do
  anything within it. The original Elixir backend had no roles either.
- **Job cards are additive only.** A mis-keyed quantity cannot be corrected or
  reversed through the API.
- **Payments over-allocate silently.** Paying more than an invoice's balance
  drops the excess rather than recording a credit.

## Running the audit

```bash
pnpm check:env        # .env.example matches the code
pnpm check:queries    # all 40 frontend queries execute (read-only)
pnpm audit:tenancy    # cross-tenant read/write isolation
pnpm smoke            # 47 business-rule assertions
```

`audit:tenancy` and `smoke` write data — run them against a seeded scratch
database, never against live books.
