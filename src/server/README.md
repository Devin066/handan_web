# Backend

The GraphQL API that the frontend talks to. It lives in this repo and runs inside
the same Next.js process — `src/pages/api/graphql.ts` is the only route, and it
does nothing but hand the request to GraphQL Yoga.

```
src/server/
├─ schema.graphql   the contract (SDL). Source of truth for pnpm codegen.
├─ schema.ts        SDL + resolvers -> executable schema
├─ db.ts            PrismaClient singleton (survives dev hot-reload)
├─ auth.ts          password hashing + JWT
├─ context.ts       per-request { db, userUuid, companyUuid }
├─ domain/          business rules. No GraphQL, no HTTP, no React.
└─ resolvers/       thin: validate input, call domain, shape output
```

## Why it is arranged this way

**`domain/` knows nothing about GraphQL.** The ERP rules — how stock moves, how a
BOM expands, how a payment is allocated — are the part worth protecting. Keeping
them free of request/response types means they can be tested directly, and means
this backend could be lifted out into its own service later without untangling it
from Next.js. If you add a rule, it goes in `domain/`, not in a resolver.

**Tenancy is enforced in one place.** Every scoped resolver starts with
`requireCompany(ctx)` and filters on the result. It is deliberately not a default
applied somewhere clever: a `companyUuid` that is easy to forget is a cross-tenant
data leak, so the call is explicit and visible in each resolver.

**Stock only moves through `applyStockMove`.** It updates `StockItem.totalOnHand`
and writes the matching `InventoryEntry` in the same transaction, so on-hand is
always explained by the ledger behind it. Nothing else should write those tables.

**Documents record intent; completion moves stock.** Creating a delivery or receipt
note changes no inventory. `completeDeliveryNote` / `completeReceiptNote` do. That
split is what lets a draft be corrected without a compensating entry.

**Headers are derived, not accumulated.** `refreshSalesOrder`, `refreshPurchaseOrder`
and `refreshWorkOrder` recompute totals and statuses from the rows underneath them
and are called after anything downstream changes. Incrementing a running total in
several places is how those numbers drift.

## Things that are easy to get wrong

- **Work order `producedQty` is the last process step's output, not the sum of all
  steps.** The same physical piece passes through cutting, machining, assembly and
  inspection; summing them would report 4x the real production.
- **Storing finished goods consumes materials proportionally.** Storing 5 of a
  planned 10 burns half the material requirement, not all of it.
- **Document numbers come from a row-locked `Counter`**, not `count() + 1`, which
  hands two concurrent creates the same number.
- **Over-delivery and over-receipt are rejected, not clamped.** Silently shortening
  a line hides an operator error until someone reconciles stock.

## Changing the schema

1. Edit `src/server/schema.graphql`.
2. Add or update the resolver in `resolvers/`.
3. `pnpm codegen` — regenerates the typed hooks in `src/gql/index.ts`.
4. If it needs new storage: edit `prisma/schema.prisma`, then `pnpm db:migrate`.

Keep the SDL and the `.gql` documents in step; codegen fails loudly if a document
asks for a field the schema does not have, which is the check you want.

## Testing

`pnpm smoke` (with the dev server running) drives a full business cycle against a
seeded database and asserts the resulting numbers — stock levels, rollups, payment
allocation, material consumption. It writes data, so point it at a scratch
database, never at live books.
