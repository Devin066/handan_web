import { GraphQLError } from 'graphql';

import { CUSTOMER_TYPE } from './status';
import {
  CONTACT_FIELDS,
  NO_CONTACT_MESSAGE,
  isValidEmail,
  isValidLandline,
  isValidMobile,
  isValidPostalCode,
} from '@/config/ph-contact';

type NameParts = {
  name?: string | null;
  customerType?: string | null;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  suffix?: string | null;
  companyName?: string | null;
  contactName?: string | null;
};

type CustomerFields = NameParts &
  Partial<Record<(typeof CONTACT_FIELDS)[number], string | null>> & {
    postalCode?: string | null;
  };

const clean = (value?: string | null) => value?.trim().replace(/\s+/g, ' ') || '';

/**
 * The single display name carried onto orders, invoices and delivery notes.
 *
 * Those documents copy the customer's name at the time they are raised, so this
 * has to be derived in one place: if two screens assembled it differently, the
 * same customer would appear under two names across the system.
 *
 * Written the way a Philippine name is spoken rather than how it is filed —
 * "Juan Santos Dela Cruz Jr." — because that is what staff read back to a
 * customer over Messenger. An explicit `name` still wins, which keeps the
 * marketplace case working where all that arrives is a buyer handle.
 */
export function customerDisplayName(input: NameParts): string {
  const explicit = clean(input.name);
  if (explicit) return explicit;

  if (input.customerType === CUSTOMER_TYPE.business) {
    const business = clean(input.companyName) || clean(input.contactName);
    if (business) return business;
  }

  const person = [input.firstName, input.middleName, input.lastName, input.suffix].map(clean).filter(Boolean).join(' ');

  if (person) return person;

  // Fall back to whatever identifies them at all rather than inventing a
  // placeholder: a blank name would propagate onto every document they touch.
  const fallback = clean(input.companyName) || clean(input.contactName);
  if (fallback) return fallback;

  throw new GraphQLError('a customer needs a name: give a first/last name, a company name, or a display name');
}

/**
 * Rejects a customer record nobody could ever contact.
 *
 * This is the rule that makes the table a CRM rather than a list of names: a
 * row with no phone, no email and no Messenger cannot be followed up, so the
 * follow-up features in the PRD would silently skip it forever. Enforced here
 * rather than only in the form because the API is callable directly, and
 * imports and marketplace sync will eventually come through it too.
 */
export function assertCustomerValid(input: CustomerFields): void {
  const reachable = CONTACT_FIELDS.some((field) => clean(input[field]));

  if (!reachable) {
    throw new GraphQLError(NO_CONTACT_MESSAGE);
  }

  const checks: Array<[string | null | undefined, (value: string) => boolean, string]> = [
    [input.phone, isValidMobile, 'mobile number must look like 0917 123 4567 or +63 917 123 4567'],
    [input.alternatePhone, isValidMobile, 'alternate mobile must look like 0917 123 4567'],
    [input.landline, isValidLandline, 'landline must be an area code plus 7 or 8 digits'],
    [input.email, isValidEmail, 'email address is not valid'],
    [input.postalCode, isValidPostalCode, 'postal code must be 4 digits'],
  ];

  for (const [value, isValid, message] of checks) {
    const trimmed = clean(value);
    if (trimmed && !isValid(trimmed)) throw new GraphQLError(message);
  }
}

/**
 * Trims every string and drops the empties.
 *
 * Forms submit untouched optional inputs as empty strings, and an empty string
 * stored in `email` is worse than a null: it looks like an answer, and it
 * defeats the "has a contact" check above.
 */
export function normalizeCustomerInput<T extends Record<string, unknown>>(input: T): T {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    if (typeof value !== 'string') {
      result[key] = value;
      continue;
    }

    const trimmed = clean(value);
    if (trimmed) result[key] = trimmed;
  }

  return result as T;
}
