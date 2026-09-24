# Entry forms audit (2026-09-24)

Scope: every screen with a "New …" / "Add …" button that creates a record.
For each: what the record is for, the fields it needs, what the form had, what
was changed, and how it was tested.

Legend: **M** mandatory, **C** conditional, **O** optional.

## Summary

| Form | Screen | Before | Result |
| --- | --- | --- | --- |
| Payment method | Settings › Master data › Payment methods | Name only | **Rebuilt**: 9 fields, edit, active switch |
| Record payment (invoice) | Sales / Purchase invoices › Record payment | OR no., method, amount | **Added** reference no. (conditional) and date paid |
| Workstation | Production › Workstations | Name only | **Rebuilt**: 6 fields, edit, active switch |
| Process | Production › Processes | Name only | **Added** code (required, unique) and description |
| Payment entry (old "New" modal) | none | Never sent the amount; could not save | **Removed**: unreachable since the invoice-level flow replaced it |
| Customer | Business partners › Customers | 28 fields | No change needed (see notes) |
| Supplier | Purchasing › Suppliers | 10 fields incl. point of contact, TIN | No change needed |
| Item | Inventory › Items | 9 fields | Gaps noted, not changed |
| Sales order | Sales › Sales orders | Customer, warehouse, dates, lines | Gaps noted, not changed |
| Purchase order | Purchasing › Purchase orders | Supplier, warehouse, date, lines | Gaps noted, not changed |
| Purchase request | Purchasing › Purchase requests | Requester, date, lines, notes | No change needed |
| Sales invoice | Finance › Sales invoices | Full BIR header, VAT, terms, lines | No change needed |
| Work order | Production › Work orders | BOM, qty, dates, staff, piece rate | No change needed |
| BOM | Production › BOMs | Item, name (+ lines in detail) | No change needed; code is auto-numbered |
| Member | Settings › Members | 8 fields | No change needed |
| Warehouse, Unit of measure | Settings › Master data | No create action exists | Out of scope (no modal) |

## Payment method

**Purpose.** How money moves: named on receipts and payment records, and used
to check that a payment carries the proof finance needs (a transfer reference,
a check number).

| Field | Rule | Validation (form and server) |
| --- | --- | --- |
| Name | M | Trimmed, 1–60 chars, unique per company (case-insensitive) |
| Type | M | cash, bank_transfer, e_wallet, check, card, other |
| Bank / wallet | C: transfer, e-wallet, check | Free text; cleared for other types |
| Account name | C: same | Free text; cleared for other types |
| Account number | C: same | 6–20 digits, spaces and dashes allowed; shown masked (•••• 7890) in the list |
| Currency | M | PHP (default), USD, EUR, JPY, CNY, SGD |
| Require reference | O | Defaults on for transfer, e-wallet, check, card |
| Active | O | Default on; inactive methods are hidden from pickers and refused by the server |
| Notes | O | Up to 500 chars |

**Not added, on purpose.** Processor type, billing descriptors and risk
thresholds belong to a card-acquiring / payment-gateway setup, where the system
charges cards itself. This app records payments that happened elsewhere (cash,
deposit, GCash, check), so those fields would have nothing to act on. Add them
if card processing is ever integrated.

**Existing data.** The migration classified the three existing methods by
name: Bank Transfer (bank transfer, reference required), Cheque (check,
reference required), Cash (cash).

## Record payment (sales and purchase invoice)

| Field | Rule | Validation |
| --- | --- | --- |
| OR number | M for sales, O for purchase | Unchanged |
| Payment method | M | Must be active and in this company |
| Reference number | C: method requires it | Required, trimmed; label names the method |
| Date paid | M | Defaults to today; future dates refused |
| Amount | M | > 0 and ≤ balance (unchanged) |

Stored on `PaymentEntry.referenceNo` and `PaymentEntry.paidOn`; the Payment
entries list now shows Method, Reference and Date paid.

## Workstation

**Purpose.** A machine or bench work is routed to; capacity feeds planning.

| Field | Rule | Validation |
| --- | --- | --- |
| Name | M | Trimmed, up to 60 chars |
| Code | O | Upper-cased, letters/numbers/dashes, up to 12 |
| Location | O | Up to 80 chars |
| Capacity (hours/day) | O | 0–24 |
| Description | O | Up to 500 chars |
| Active | O (edit only) | Default on |

## Process

**Purpose.** A routing step on a BOM; its code is printed on job cards.

| Field | Rule | Validation |
| --- | --- | --- |
| Name | M | Trimmed, up to 60 chars |
| Code | M | Upper-cased, 1–12 letters/numbers/dashes, unique per company |
| Description | O | Up to 500 chars |

## Gaps noted, not changed

These forms work and save what they collect. The items below would round them
out; they were left for a decision because they change how documents behave,
not just what they record.

- **Item**: no barcode, no reorder quantity (only a minimum threshold), no
  default supplier or lead time.
- **Sales order**: no payment terms or customer PO reference at order time (the
  invoice has both).
- **Purchase order**: no payment terms, no supplier quote reference, no notes.
- **Supplier**: no default payment terms or currency.
- **Customer**: covers identity, address and channels; credit limit and
  default terms are absent.

## Changes

- Database migration `20260924160000_entry_form_fields`: PaymentMethod (kind,
  provider, accountName, accountNumber, currency, requiresReference, isActive,
  notes), Workstation (code, location, description, capacityHours, isActive),
  PaymentEntry (referenceNo, paidOn).
- API: `updatePaymentMethod`, `updateWorkstation` (settings / production
  permission). Updates only change the fields they are sent.
- Shared rules in `src/config/payment-method.ts`, used by the form and the
  server so both accept and reject the same input.

## Test results

API tests ran against the dev server; each case also checked the stored row
in PostgreSQL.

| # | Case | Expected | Result |
| --- | --- | --- | --- |
| PM1 | Create bank transfer with every field | Saved; currency upper-cased | Pass; DB row matches |
| PM2 | Blank name | "Enter a name." | Pass |
| PM3 | Same name, different case | Duplicate refused | Pass |
| PM4 | Account number "12ab" | Digits message | Pass |
| PM5 | Unknown type and currency | Both messages together | Pass |
| PM6 | Cash with bank details | Bank details dropped | Pass |
| PM7 | Rename and deactivate | Saved | Pass |
| PM8 | Update unknown id | "Payment method not found." | Pass |
| PM9 | Update with only `isActive` | Other fields kept | Pass (after fix, see below) |
| WS1 | Create with every field | Saved; code upper-cased | Pass; DB row matches |
| WS2 | Capacity 30 h | Refused | Pass |
| WS3 | No name | Refused | Pass |
| WS4 | Update with only `isActive` | Other fields kept | Pass (after fix) |
| PR1 | Create with code and description | Saved; code upper-cased | Pass |
| PR2 | Duplicate code | Refused | Pass |
| PR3 | Missing code | Refused | Pass |
| PAY1 | Method requires reference, none given | Refused, names the method | Pass |
| PAY2 | Inactive method | Refused | Pass |
| PAY3 | Date in 2099 | Refused | Pass |
| PAY4 | ₱1.00 with reference and date | PaymentEntry stores reference and date; invoice paid amount and OR updated | Pass |
| UI1 | Payment method form: choose Bank transfer | Account fields appear; reference switch turns on | Pass |
| UI2 | Submit blank name, account "12ab" | Both field errors inline | Pass |
| UI3 | Submit valid | Toast; row in list with masked account | Pass |
| UI4 | Workstations list renders new columns | Pass | Pass |

**Bug found by testing.** Updates first replaced unsent fields with blanks
(WS4 wiped a workstation's code, location and capacity). Updates now merge
with the stored record; PM9 and WS4 were re-run and pass.

**Test data left behind.** Payment method "ZZTEST BPI Current" (inactive) and
payment PE-000005 (₱1.00 on SI000002, reference BPI-778812) remain because a
recorded payment can't be deleted without unwinding the ledger. Everything
else created during testing was deleted.

## Follow-up: "No record was found" errors

A server log showed Prisma's raw `findFirstOrThrow` error for a payment method.
It came from the production build on port 3000 (old code), hit by an early test
that used a placeholder method id. Two fixes:

- `recordInvoicePayment` no longer looks the method up a second time inside the
  transaction; `checkPaymentMethodUse` already refuses a missing or inactive
  method with "Payment method not found." / "… is inactive".
- Every other lookup that can miss (25 `…OrThrow` calls across the API) now
  returns a message naming the record, e.g. "That BOM no longer exists or isn't
  in your company. Refresh and try again.", instead of "not found".

Tested: payment with an unknown method, and a work order with an unknown BOM.
