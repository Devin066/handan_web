# Design system

Direction: **data-dense dashboard**. This is an operational tool — the people
using it are reconciling numbers against paper, other systems and the shop floor.
Density and legibility beat whitespace and decoration.

## Where things live

| Concern | File |
| --- | --- |
| Colour, type, component tokens | `src/components/common/theme.tsx` |
| Page chrome, fonts, focus, reduced-motion | `src/styles/globals.css` |
| Status vocabularies and labels | `src/utils/enum.tsx` |
| Money / quantity formatting | `src/utils/format.tsx` |
| Shared table behaviour | `src/components/shared/data-table.tsx` |
| Shared column builders | `src/components/shared/columns.tsx` |

Ant Design derives component styling from the theme tokens, so **components
should not carry their own colours**. If you find yourself writing a hex value in
a screen, it belongs in `theme.tsx`.

## Colour

Handlathe orange (from the logo) marks primary actions and where you are.
The sidebar is near-black to match the logo's own background. A restrained
red is reserved for *needs attention* and used sparingly so it keeps that
meaning.

| Role | Value |
| --- | --- |
| Primary (fills: buttons, selected nav) | `#F86901` |
| Text on primary fills | `#1C1917` (white on this orange is only ~2.9:1) |
| Primary as text on white (links, active tabs) | `#C2410C` (~5.2:1) |
| Attention | `#B42318` |
| Success | `#15803D` |
| Danger | `#DC2626` |
| Sidebar | `#141414`, text `#D4D4D4` |
| Page background | `#F4F4F5` |
| Surface | `#FFFFFF` |
| Text / secondary / tertiary | `#0F172A` / `#475569` / `#64748B` |

**Colour never carries meaning alone.** Statuses render as an Ant Design Badge —
a coloured dot *and* a text label. Stock movements show a `+`/`−` sign as well as
colour.

## Type

Fira Sans for UI, Fira Code available for figures. Base size is **14px**, not 16:
these are dense tables read in bulk, and 16px fits roughly a third fewer columns
on screen. Long-form reading surfaces are not what this app is.

Numeric columns use tabular figures (`.tabular-figures`), without which columns
of amounts sit visually ragged and are hard to scan.

## Tables

All list screens go through `DataTable`, which fixes:

- compact row density
- sticky header, horizontal scroll rather than crushing columns
- the row-actions column pinned right, so it is reachable on a wide table
- a default width for date columns, which otherwise collapse and wrap their
  header one letter per line
- pagination with page-size control
- an empty state naming the entity and how to create the first one

Columns come from the builders in `columns.tsx` — `statusColumn`, `moneyColumn`,
`qtyColumn`, `progressColumn`, `amountBreakdownColumn`, `codeColumn` — so a
status or an amount looks and behaves the same on every screen.

### Numbers in tables

- Money: `$4,280.00`, right-aligned. Missing values show `—`, never `$0.00`,
  which would read as a real zero balance.
- Progress: `8 / 40` rather than a bare number, because a single figure hides
  whether a line is part-done. Turns green on completion.
- Amounts on orders: the outstanding figure leads (`$2,780.00 due`) with the
  total beneath and a tooltip breaking out due / paid / total. This replaced
  three unlabelled coloured tags whose only distinction was red vs green.

## Status

Every status string the API returns has an entry in `src/utils/enum.tsx` with a
human label and a badge level. The keys must match
`src/server/domain/status.ts` exactly — the UI gates its actions on these values,
so a key that exists on only one side means either a blank status cell or a
button that never appears. This has bitten the project once already; see
`AUDIT.md`.

## Dark mode

**Not implemented.** The app previously flipped its CSS background variables
under `prefers-color-scheme: dark` while every Ant Design surface stayed light,
which left anyone on a dark OS with dark page chrome behind white tables. The
half-implementation was removed; the app now renders light regardless, which is
at least coherent. Doing it properly means Ant Design's `darkAlgorithm` plus a
review of every hand-written colour, and is a deliberate piece of work rather
than a toggle.

## Accessibility

- Focus is visible (`:focus-visible`, 2px `#C2410C` ring); do not remove it.
- `prefers-reduced-motion` is respected globally.
- Status, movement direction and payment state are conveyed by text or sign as
  well as colour.
- Mobile stacks to a single column with no horizontal page scroll; wide tables
  scroll inside their own container.
