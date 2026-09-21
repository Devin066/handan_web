/**
 * Shared display formatting.
 *
 * Operational screens are read by people reconciling numbers against paper and
 * other systems, so amounts and quantities must be formatted the same way
 * everywhere — a raw `4280` in one column and `$4,280.00` in another makes the
 * two impossible to compare at a glance.
 */

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const quantityFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 3,
});

const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

/** Money. Returns an em dash for missing values rather than "$0.00", which would read as a real zero balance. */
export const formatCurrency = (value: unknown): string => {
  const n = toNumber(value);
  return n === null ? '—' : currencyFormatter.format(n);
};

/** Quantities: no forced decimals, so 5 stays "5" and 2.5 stays "2.5". */
export const formatQty = (value: unknown): string => {
  const n = toNumber(value);
  return n === null ? '—' : quantityFormatter.format(n);
};

/** A quantity with its unit, e.g. "40 PCS". */
export const formatQtyWithUom = (value: unknown, uom?: string | null): string => {
  const qty = formatQty(value);
  return uom ? `${qty} ${uom}` : qty;
};

/**
 * Progress through a quantity, e.g. "8 / 40". Used where a single number would
 * hide whether a line is part-done.
 */
export const formatProgress = (done: unknown, total: unknown): string => `${formatQty(done)} / ${formatQty(total)}`;
