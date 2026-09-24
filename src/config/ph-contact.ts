/**
 * Philippine contact-detail validation.
 *
 * Lives outside the server domain so the form and the API enforce byte-identical
 * rules — a number the form accepts must never be rejected on submit, and a
 * number the form rejects must never sneak in through the API.
 */

/** Digits only, so the same number typed three ways validates the same way. */
const digits = (value: string) => value.replace(/\D/g, '');

/**
 * Mobile numbers: 09XX XXX XXXX locally, +639XX XXX XXXX from abroad. Accepts
 * either and any spacing, because staff copy numbers out of Messenger exactly
 * as the customer typed them.
 */
export function isValidMobile(value: string): boolean {
  const d = digits(value);
  if (d.startsWith('639')) return d.length === 12;
  if (d.startsWith('09')) return d.length === 11;
  // A bare 9XXXXXXXXX happens when a leading zero is lost in a spreadsheet.
  if (d.startsWith('9')) return d.length === 10;
  return false;
}

/** Landlines run 7 digits, or 8 in Metro Manila since the 2019 migration, plus an area code. */
export function isValidLandline(value: string): boolean {
  const length = digits(value).length;
  return length >= 7 && length <= 12;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

/** PSA postal codes are four digits. */
export function isValidPostalCode(value: string): boolean {
  return /^\d{4}$/.test(value);
}

export const MOBILE_HINT = 'Use 0917 123 4567 or +63 917 123 4567';
export const LANDLINE_HINT = 'Use an area code plus 7 or 8 digits';
export const POSTAL_HINT = 'Postal code is 4 digits';

/**
 * Every channel that counts as a way of actually reaching someone. A customer
 * with none of these cannot be followed up, so both the form and the API
 * require at least one.
 */
export const CONTACT_FIELDS = [
  'phone',
  'alternatePhone',
  'landline',
  'email',
  'messengerId',
  'viber',
  'facebook',
  'whatsapp',
  'telegram',
  'instagram',
  'tiktok',
  'marketplaceAccount',
] as const;

export const NO_CONTACT_MESSAGE =
  'Give at least one way to reach this customer: mobile, email, Messenger, Viber or a marketplace account';
