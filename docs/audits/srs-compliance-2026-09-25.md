# SRS v0.1.0 compliance check (2026-09-25)

Sources: `HANDLATHE_SRS_V0.1.0.docx` and `Handlathe System Hierarchy_V0.1.0.docx`.

Method: each requirement was exercised through the running API (dev server,
port 3001) as a full workflow: sales order → invoice → work order → job cards
→ finished stock; purchase request → approval → PO → goods receipt → purchase
invoice; attendance → payroll. Results were checked in the database. The
database was backed up first and restored afterwards, so none of the test
records remain.

**Result: all 46 requirements checked are met; 2 of them only after fixes
made during this check.** The remaining notes are data to fill in, not
missing features.

## Navigation (System Hierarchy)

The sidebar matches the hierarchy one to one: Dashboard; Sales (Sales Order);
Purchasing (Purchase Request, Purchase Order); Production (Work Order);
Inventory (Goods Receipt, Inventory Ledger, Material Master, Bill of
Materials); Finance (Sales Invoice, Purchase Invoice, Accounting Ledger);
Business Partners (Customer, Supplier); HR (Employee Management, Time and
Attendance, Payroll, Benefits Management); Settings (User Management,
Configuration, Roles, Master Data › Payment Method, Warehouse, Processes, Unit
of Measure).

## §2 Numbering and prefixes

| Prefix | Requirement | Status | Evidence |
| --- | --- | --- | --- |
| SO | Sales order numbers | Met | SO-000004 |
| SO-INV | Fiscal-year sales invoice on SO entry | Met | SO-INV-2026-000002 created with the SO |
| PR | Purchase requests | Met | PR-000002 |
| PO | Standalone or from PRs | Met | PO-000004 from PR line |
| WO | Work orders | Met | WO-000003 |
| GR | Goods receipts | Met | GR-000003 |
| INV | Purchase invoice from GR | Met | INV-2026-000002 linked to GR-000003 |
| BOM | Bills of materials | Met | BOM-000001 |
| RM / MP / FG | Material master codes | **Fixed** | New items were coded, but the 4 items created earlier had none. Migration `20260925020000_backfill_material_codes` gave them RM-000001…3 and FG-000001 and moved the counters on |

Documents created before the numbering rule keep their old numbers (SO000001,
SI000001, RN000001). They were left as issued, since renumbering documents
that may already be on paper breaks the audit trail.

## §3 Dashboard

| Widget | Status | Notes |
| --- | --- | --- |
| Low inventory warning | Met | Uses each item's minimum threshold |
| Critical out-of-stock | Met | |
| Current stock valuation | **Fixed** | Always showed ₱0: stock was valued at standard cost only, and no item has one. It now falls back to the latest supplier price, then to the BOM material cost for made items. The current data shows ₱91,400 |
| Accounts receivable with aging | Met | Current, 1–30, 31–60, 61–90, 90+ |
| Accounts payable | Met | Same aging |
| Open purchase orders with expected dates | Met | Overdue flag |
| Open purchase requests (not on a PO) | Met | |
| Open work orders | Met | |
| Daily manufactured goods | Met | Listed today's WO-000003 output |
| Open sales orders | Met | |
| Delivery date risk | Met | SO due tomorrow flagged `at_risk` |
| Daily workforce presence | Met | |
| Fiscal-year auto-invoicing | Met | |

## §4 Modules

| Ref | Requirement | Status | Evidence |
| --- | --- | --- | --- |
| 4.1 | SO auto-creates fiscal-year invoice | Met | See §2 |
| 4.1 | Prompt to create linked WO when stock is short | Met | 500 ordered, 8 on hand → suggestion for 492 from the BOM; `work-order-prompt.tsx` shows it after saving |
| 4.1 | Delivery schedule monitoring | Met | Risk on SO and dashboard |
| 4.2 | Approved PR lines selectable in PO | Met | Unapproved lines hidden; approved line offered; gone once fully ordered |
| 4.2 | PR line auto-fills part, qty, price | Met | Remaining qty and estimated price returned |
| 4.3 | WO assigned to an employee | Met | |
| 4.3 | Completed tasks feed performance history | Met | Job cards with qty and machine hours on the employee |
| 4.3 | Manufactured goods update finished stock | Met | FG stock 8 → 10 |
| 4.4 | GR raises stock and auto-creates purchase invoice | Met | 112 → 122; INV-2026-000002 |
| 4.4 | RM / MP / FG classification | Met | MP is supported; no MP items exist yet |
| 4.4 | Supplier pricing in material master | Met | Each PO updates the supplier's price for the item |
| 4.4 | Multi-level BOM, level 0 = kit | Met | |
| 4.4 | Inventory ledger of every movement | Met | IE entries for receipts, issues, finished goods |
| 4.5 | Sales invoice linked to SO; OR and method set on payment | Met | Tested earlier (entry-forms audit, PAY4) |
| 4.5 | Purchase invoice linked to GR | Met | |
| 4.5 | Double-entry accounting ledger | Met | Journal entries with debit and credit lines |
| 4.6 | Employee profiles, Regular / Contractual | Met | Contractual pays no statutory deductions |
| 4.6 | Time and attendance | Met | 08:00–17:00 → 8 regular + 1 overtime hour |
| 4.6 | Payroll: attendance + piece-rate WO incentives | Met | Payslip per employee with base, overtime, incentive, SSS, PhilHealth, Pag-IBIG, tax |
| 4.6 | Benefits and incentive matrix | Met | |
| 4.7 | Customer master with build specs and ledger | Met | |
| 4.7 | Supplier master with pricing and ledger | Met | |
| 4.8 | Configuration: PHP, GMT+8, decimals | Met | PHP, Asia/Manila, 2 decimals |
| 4.8 | Master data and RBAC | Met | Payment methods, warehouses, processes, UOM, role permissions |

## §5 Workflow matrix

All six triggers ran end to end as described: SO → invoice and WO option;
approved PR → PO lines; GR → stock, purchase invoice, PO status; completed WO →
finished stock and performance log; payment → OR and method on invoice; hours
and WOs → payroll.

## Data to fill in (not code)

- **Hourly rates**: every employee's base rate is ₱0, so payroll base pay is
  ₱0 until rates are entered in HR › Employees.
- **Item costs**: Bearing 6204 has no standard cost and no purchase yet, so it
  counts as ₱0 in the valuation. Set a standard cost or buy it once.
- **Statutory rates**: Benefits has SSS at 5% and the others at 0%. Enter the
  current government rates.
- **Manufactured parts**: no MP items exist yet.

## Limits of this check

Screens were confirmed to exist and be wired to each flow, and the key forms
were clicked through in earlier audits. Not every screen was clicked through
for this report.
