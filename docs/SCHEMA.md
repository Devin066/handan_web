# Schema ↔ PRD traceability

The Prisma schema in `prisma/schema.prisma` is the system of record for the
Business Management Platform PRD (`docs/PRD.md`). This file maps each PRD
requirement to the tables that carry it, so a requirement cannot quietly lose its
storage during a refactor.

Every migration lives in `prisma/migrations/` and is committed. A fresh cloud VPS
reaches the current schema by replaying them — see "Deploying the schema" below.

## Tenancy

Every operational table carries `companyUuid` and is reached through
`requireCompany()` in `src/server/context.ts`. New tables follow the same rule;
`pnpm audit:tenancy` checks it.

## Status vocabularies

Status columns are `String`, not Prisma enums, matching the existing codebase.
The permitted values live in one place — `src/server/domain/status.ts` — because
the UI gates buttons on these exact strings. Add a value there, never inline.

## Requirement map

| PRD section | Requirement | Schema |
| --- | --- | --- |
| 6 Material Master | Category, type, grade, dimensions, min stock, supplier, cost, location, status | `Item.itemType` / `category` / `grade` / `dimensions` / `minStockThreshold` / `standardCost` / `defaultSupplierUuid` / `storageLocation` / `status` |
| 6 Finished Goods | SKU, available vs reserved vs in production, marketplace info | `Item.sku` (unique per company), `Item.marketplaceRef`, `StockItem.totalOnHand` / `reservedQty` / `inProductionQty` |
| 6 Inventory Transactions | User, timestamp, qty, previous qty, new qty, reason | `InventoryEntry.createdByUserUuid` / `insertedAt` / `actualQty` / `qtyBeforeTransaction` / `qtyAfterTransaction` / `reason` |
| 7 Raw material consumption | Partial/fractional consumption, measurement units | `BomItem.qty` is `Decimal(18,4)`; `Uom.category` + `Uom.symbol` classify piece / length / weight |
| 8 Order Management | One order record per sale, whatever the channel | `SalesOrder.channel`, `externalRef`, `requiredDate`, `priority`, `notes`; `SalesOrderItem.customSpec` |
| 2, 8 Make-to-order / make-to-stock | Both production models | `SalesOrder.fulfillmentModel` |
| 9, 11 Order & production workflow | Production progress on the order | `SalesOrder.productionStatus`, `orderProductionStatus()` in `domain/status.ts` |
| 10 Production Queue | Manager-assigned (Option A) *or* floating queue (Option B) | `JobCard.assignedByUserUuid` / `assignedAt` (A) and `acceptedAt` (B); `WorkOrder.priority` / `dueDate` order the queue. Which model is active is the `production.queue_mode` row in `AppSetting`, not a hardcoded workflow — the client has not chosen yet (open requirement 4) |
| 11 Production Tracking | Eight statuses, start/finish times, supervisor validation | `JobCard.status` (`JOB_CARD_STATUS`), `startTime` / `pausedAt` / `pausedSeconds` / `endTime`, `validatedByUserUuid` / `validatedAt` |
| 12 Employee Output | Who produced what, how many, when; quotas vary by difficulty | `JobCard.operatorStaffUuid`, `producedQty`, `targetQty`, `difficulty` |
| 13 CRM | Marketplace account, Messenger, contact, last interaction, follow-up status | `Customer.marketplaceAccount` / `messengerId` / `contactName` / `phone` / `email` / `lastInteractionAt` / `followUpStatus`; `CustomerInteraction` |
| 13 CRM (names) | Customer identity, individual or business | `Customer.customerType`; `firstName` / `middleName` / `lastName` / `suffix` for Philippine personal names, `companyName` + `contactName` for a business. `Customer.name` is the display name derived from these by `customerDisplayName()` and copied onto every order, invoice and delivery note |
| 13 CRM (contact) | Reachable however the customer actually talks | `phone` (mobile) / `alternatePhone` / `landline` / `email`; `messengerId`, `viber`, `facebook`, `whatsapp`, `telegram`, `instagram`, `tiktok` |
| 13 CRM (address) | Philippine address | `address` (house/unit & street), `barangay`, `city`, `province`, `region`, `postalCode` — barangay is separate because an address without it does not locate anything here |
| 13 CRM (acquisition) | Platform the customer was discovered on | `Customer.sourcePlatform` (`CUSTOMER_SOURCE`), kept distinct from `primaryChannel`, which is where they order now |
| 14 Customer Follow-Up | Configurable no-response interval (BR-09) | `FollowUpRule.noResponseHours` (seeded at 72h), `Customer.nextFollowUpAt` |
| 15 Finance | Expense categories, revenue vs costs | `ExpenseCategory`, `Expense`; revenue from `SalesInvoice` / `PaymentEntry` |
| 16 HR & Payroll | Profiles, salary, overtime, SSS, PhilHealth | `Staff.position` / `employmentType` / `shift` / `hiredAt` / `baseRate`; `PayrollPeriod`, `PayrollEntry` |
| 17 Attendance | Time in/out, shift, overtime, status | `AttendanceRecord` (`source` marks manual entry vs an imported timecard feed) |
| 19 Notifications | Low stock, new order, assignment, delays | `Notification` (`channel` lets one row fan out to in-app, email or Messenger later) |
| 20 RBAC | Owner, manager, employee, finance, HR | `User.role` (`ROLE` in `domain/status.ts`), `User.isActive` |
| 21 Audit Trail | User, action, record, previous value, new value, timestamp | `AuditLog` |
| 28 BR-01 | Inventory adjustments identify the user | `InventoryEntry.createdByUserUuid`, `AuditLog` |
| 28 BR-02/03 | Start & completion timestamps, responsible employee | `JobCard.startTime` / `endTime` / `operatorStaffUuid` |
| 28 BR-04 | Supervisor validation before inventory updates | `JobCard.validatedByUserUuid` / `validatedAt` |
| 28 BR-05 | Orders keep their original channel | `SalesOrder.channel` — written on create, never reassigned |
| 31 Q15 | Damaged or rejected production | `JobCard.defectiveQty`, `rejectedQty`, `rejectReason`; `WorkOrder.scrapedQty` |

## Deliberately deferred

These are PRD sections 25–27 (Phase 2/3). The tables exist so the operational
data lands in the right shape from day one, but no resolver or screen reads them
yet: `Expense`, `ExpenseCategory`, `AttendanceRecord`, `PayrollPeriod`,
`PayrollEntry`, `FollowUpRule`, `Notification`.

Adding them later is a resolver and UI change, not a migration — which is the
point of defining them now.

## Open requirements that the schema deliberately does not decide

PRD section 31 lists questions the client has not answered. Where an answer would
otherwise be baked into a column, the schema stays neutral:

- **Queue model (Q4)** — `AppSetting['production.queue_mode']`, switchable without
  a migration.
- **Material measurement (Q2)** — `Uom.category` carries the rule; fractional
  quantities are already representable, so a later decision changes seed data
  rather than column types.
- **Follow-up interval (Q10, BR-09)** — `FollowUpRule.noResponseHours`.
- **Statutory deductions** — `PayrollEntry.sssDeduction` /
  `philhealthDeduction` are stored amounts, not computed rates, until the rules
  are confirmed.

## Deploying the schema

The schema is migration-ready at all times. On a cloud VPS:

```bash
docker compose run --rm migrate
```

Compose runs `prisma migrate deploy`, which replays every migration in
`prisma/migrations/` in order and is safe to re-run. See `DEPLOYMENT.md`.

To verify locally that the committed migrations still reproduce the schema
exactly — no drift — replay them into a scratch database and diff:

```bash
docker exec erp-dev-postgres psql -U erp -d postgres -c "CREATE DATABASE erp_shadow;"
DATABASE_URL="postgresql://erp:erp@localhost:5432/erp_shadow?schema=public" pnpm db:deploy
DATABASE_URL="postgresql://erp:erp@localhost:5432/erp_shadow?schema=public" \
  npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script
```

Empty output means the migrations and the schema agree.
