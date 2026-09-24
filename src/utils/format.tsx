import { DEFAULT_CURRENCY } from '@/config/currency';
import { getCurrency, getDecimalPlaces } from '@/stores/useConfig';

/**
 * Shared display formatting.
 *
 * Operational screens are read by people reconciling numbers against paper and
 * other systems, so amounts and quantities must be formatted the same way
 * everywhere — a raw `4280` in one column and `$4,280.00` in another makes the
 * two impossible to compare at a glance.
 */

/**
 * Built per currency and cached, because constructing an Intl.NumberFormat is
 * expensive and these run once per cell on tables of hundreds of rows.
 *
 * Fraction digits are left to Intl rather than pinned at 2: JPY and KRW have no
 * minor unit, and forcing "¥1,200.00" on them would look wrong to anyone used to
 * reading those amounts.
 */
const currencyFormatters = new Map<string, Intl.NumberFormat>();

const currencyFormatter = (currency: string, decimals?: number): Intl.NumberFormat => {
  const key = `${currency}:${decimals ?? ''}`;
  const cached = currencyFormatters.get(key);
  if (cached) return cached;

  // Currencies with no minor unit (JPY) ignore the company's decimal setting.
  const digits = (code: string) => {
    const natural = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
    }).resolvedOptions().maximumFractionDigits;
    return decimals === undefined || natural === 0
      ? {}
      : { minimumFractionDigits: decimals, maximumFractionDigits: decimals };
  };

  let formatter: Intl.NumberFormat;
  try {
    formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      ...digits(currency),
    });
  } catch {
    // An unknown code would otherwise throw inside a render and blank the page.
    formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: DEFAULT_CURRENCY,
      ...digits(DEFAULT_CURRENCY),
    });
  }

  currencyFormatters.set(key, formatter);
  return formatter;
};

const quantityFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 3,
});

const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

/**
 * Money, in the company's configured display currency (Settings -> Configuration).
 *
 * Returns an em dash for missing values rather than "$0.00", which would read as
 * a real zero balance. Pass `currency` only to override the company setting.
 */
export const formatCurrency = (value: unknown, currency?: string): string => {
  const n = toNumber(value);
  return n === null ? '—' : currencyFormatter(currency ?? getCurrency(), getDecimalPlaces()).format(n);
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
