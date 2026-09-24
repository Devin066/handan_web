/**
 * Sales invoice rules shared by the form and the API, so the totals a user sees
 * before saving are exactly the totals that get stored.
 */

/** Philippine VAT rate. */
export const VAT_RATE = 0.12;

export const VAT_MODES = {
  vat_exclusive: { label: 'VAT exclusive (add 12%)', short: 'VAT exclusive' },
  vat_inclusive: { label: 'VAT inclusive (prices include 12%)', short: 'VAT inclusive' },
  vat_exempt: { label: 'VAT exempt', short: 'VAT exempt' },
  zero_rated: { label: 'Zero-rated', short: 'Zero-rated' },
} as const;

export type VatMode = keyof typeof VAT_MODES;

export const PAYMENT_TERMS = {
  due_on_receipt: { label: 'Due on receipt', days: 0 },
  net_7: { label: 'Net 7', days: 7 },
  net_15: { label: 'Net 15', days: 15 },
  net_30: { label: 'Net 30', days: 30 },
  net_60: { label: 'Net 60', days: 60 },
} as const;

export type PaymentTerms = keyof typeof PAYMENT_TERMS;

export const isVatMode = (value: unknown): value is VatMode => typeof value === 'string' && value in VAT_MODES;

export const isPaymentTerms = (value: unknown): value is PaymentTerms =>
  typeof value === 'string' && value in PAYMENT_TERMS;

/** The due date for a set of terms, counted from the invoice date. */
export function dueDateFor(invoiceDate: Date, terms: PaymentTerms): Date {
  const due = new Date(invoiceDate);
  due.setDate(due.getDate() + PAYMENT_TERMS[terms].days);
  return due;
}

/** Money is kept to the centavo; rounding once per figure keeps the parts adding up. */
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export type InvoiceLineInput = { qty: number; unitPrice: number; discount?: number };

export type InvoiceTotals = {
  subtotal: number;
  discountAmount: number;
  vatableAmount: number;
  vatAmount: number;
  total: number;
  lines: Array<{ gross: number; discount: number; lineTotal: number }>;
};

/**
 * - VAT exclusive: prices are net; 12% is added on top of the discounted amount.
 * - VAT inclusive: prices already contain VAT; it is backed out as 12/112.
 * - Exempt and zero-rated: no VAT.
 */
export function computeInvoiceTotals(lines: InvoiceLineInput[], vatMode: VatMode): InvoiceTotals {
  const computed = lines.map((line) => {
    const gross = round2((Number(line.qty) || 0) * (Number(line.unitPrice) || 0));
    const discount = round2(Math.min(Math.max(Number(line.discount) || 0, 0), gross));
    return { gross, discount, lineTotal: round2(gross - discount) };
  });

  const subtotal = round2(computed.reduce((sum, l) => sum + l.gross, 0));
  const discountAmount = round2(computed.reduce((sum, l) => sum + l.discount, 0));
  const net = round2(subtotal - discountAmount);

  let vatableAmount = net;
  let vatAmount = 0;
  let total = net;

  if (vatMode === 'vat_exclusive') {
    vatAmount = round2(net * VAT_RATE);
    total = round2(net + vatAmount);
  } else if (vatMode === 'vat_inclusive') {
    vatAmount = round2((net * VAT_RATE) / (1 + VAT_RATE));
    vatableAmount = round2(net - vatAmount);
  }

  return { subtotal, discountAmount, vatableAmount, vatAmount, total, lines: computed };
}

/** BIR TINs are 9 digits plus a 3 to 5 digit branch code. */
export function isValidTin(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return digits.length === 9 || (digits.length >= 12 && digits.length <= 14);
}
