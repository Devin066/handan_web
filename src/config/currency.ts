/**
 * Currency catalogue.
 *
 * The display currency is a company-wide setting, not a per-user preference:
 * two people reconciling the same order must see the same figures. It is stored
 * server-side in `AppSetting` under `general.currency` and read by
 * `formatCurrency` in src/utils/format.tsx.
 *
 * This is a *display* setting. Amounts are stored as plain Decimals with no
 * currency attached, so switching currency re-labels existing numbers — it does
 * not convert them. There is no exchange-rate handling here by design; a
 * business running two currencies at once needs per-document currency and rates,
 * which is a different feature.
 */

export type CurrencyOption = {
  code: string;
  name: string;
  /** Shown next to price inputs, where a full Intl-formatted value would not fit. */
  symbol: string;
};

export const CURRENCIES: CurrencyOption[] = [
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'TWD', name: 'New Taiwan Dollar', symbol: 'NT$' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
];

/**
 * Existing installs formatted everything as USD, so that stays the default —
 * changing it would silently re-label every historical figure in the system.
 */
/** SRS 4.8: base currency is PHP. */
export const DEFAULT_CURRENCY = 'PHP';

/** The AppSetting key the company-wide currency lives under. */
export const CURRENCY_SETTING_KEY = 'general.currency';

export const isSupportedCurrency = (code: unknown): code is string =>
  typeof code === 'string' && CURRENCIES.some((c) => c.code === code);

export const currencyOption = (code: string): CurrencyOption =>
  CURRENCIES.find((c) => c.code === code) ?? { code, name: code, symbol: code };

/** The bare symbol, for input addons and inline labels. */
export const currencySymbol = (code: string): string => currencyOption(code).symbol;
