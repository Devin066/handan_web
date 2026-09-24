/**
 * Payment method rules shared by the form and the API, so what the form accepts
 * is exactly what the server stores.
 */

export const PAYMENT_METHOD_KINDS = {
  cash: { label: 'Cash', hasAccount: false, referenceByDefault: false },
  bank_transfer: { label: 'Bank Transfer / Deposit', hasAccount: true, referenceByDefault: true },
  e_wallet: { label: 'E-Wallet (GCash, Maya)', hasAccount: true, referenceByDefault: true },
  check: { label: 'Check', hasAccount: true, referenceByDefault: true },
  card: { label: 'Card', hasAccount: false, referenceByDefault: true },
  other: { label: 'Other', hasAccount: false, referenceByDefault: false },
} as const;

export type PaymentMethodKind = keyof typeof PAYMENT_METHOD_KINDS;

export const CURRENCIES = ['PHP', 'USD', 'EUR', 'JPY', 'CNY', 'SGD'] as const;

export const isPaymentMethodKind = (value: unknown): value is PaymentMethodKind =>
  typeof value === 'string' && value in PAYMENT_METHOD_KINDS;

export type PaymentMethodInput = {
  name?: string | null;
  kind?: string | null;
  provider?: string | null;
  accountName?: string | null;
  accountNumber?: string | null;
  currency?: string | null;
  requiresReference?: boolean | null;
  isActive?: boolean | null;
  notes?: string | null;
};

const clean = (value?: string | null) => value?.trim() || null;

/** Bank and wallet account numbers: digits, spaces and dashes, 6 to 20 digits. */
export function isValidAccountNumber(value: string): boolean {
  if (!/^[\d\s-]+$/.test(value)) return false;
  const digits = value.replace(/\D/g, '');
  return digits.length >= 6 && digits.length <= 20;
}

/**
 * Validates and tidies a payment method. Returns the problems found (keyed by
 * field) and the cleaned values; callers refuse to save while problems exist.
 */
export function normalisePaymentMethod(input: PaymentMethodInput) {
  const errors: Record<string, string> = {};

  const name = clean(input.name);
  if (!name) errors.name = 'Enter a name.';
  else if (name.length > 60) errors.name = 'Keep the name under 60 characters.';

  const kind = input.kind ?? 'cash';
  if (!isPaymentMethodKind(kind)) errors.kind = 'Choose a payment type.';

  const currency = (clean(input.currency) ?? 'PHP').toUpperCase();
  if (!(CURRENCIES as readonly string[]).includes(currency)) errors.currency = 'Choose a supported currency.';

  const accountNumber = clean(input.accountNumber);
  if (accountNumber && !isValidAccountNumber(accountNumber)) {
    errors.accountNumber = 'Use 6 to 20 digits; spaces and dashes are allowed.';
  }

  const hasAccount = isPaymentMethodKind(kind) && PAYMENT_METHOD_KINDS[kind].hasAccount;

  return {
    errors,
    data: {
      name: name ?? '',
      kind: isPaymentMethodKind(kind) ? kind : 'cash',
      // Account details only mean something for methods that pay into an account.
      provider: hasAccount ? clean(input.provider) : null,
      accountName: hasAccount ? clean(input.accountName) : null,
      accountNumber: hasAccount ? accountNumber : null,
      currency,
      requiresReference: Boolean(input.requiresReference),
      isActive: input.isActive ?? true,
      notes: clean(input.notes),
    },
  };
}
