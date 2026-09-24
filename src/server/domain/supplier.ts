import { GraphQLError } from 'graphql';

import { isValidEmail, isValidLandline, isValidMobile } from '@/config/ph-contact';

export type SupplierInput = {
  name: string;
  address: string;
  tin?: string | null;
  contactFirstName: string;
  contactLastName: string;
  contactPosition?: string | null;
  phone?: string | null;
  landline?: string | null;
  email?: string | null;
  notes?: string | null;
};

const clean = (value?: string | null) => value?.trim().replace(/\s+/g, ' ') || null;

/**
 * Trims every field, derives `contactName`, and enforces the same rules as the
 * form, so a record created through the API can't skip them.
 */
export function normaliseSupplier(request: SupplierInput) {
  const input = {
    name: clean(request.name),
    address: clean(request.address),
    tin: clean(request.tin),
    contactFirstName: clean(request.contactFirstName),
    contactLastName: clean(request.contactLastName),
    contactPosition: clean(request.contactPosition),
    phone: clean(request.phone),
    landline: clean(request.landline),
    email: clean(request.email),
    notes: request.notes?.trim() || null,
  };

  if (!input.name) throw new GraphQLError('Business name is required');
  if (!input.address) throw new GraphQLError('Address is required');
  if (!input.contactFirstName || !input.contactLastName) {
    throw new GraphQLError('Contact person first and last name are required');
  }
  if (!input.phone && !input.landline && !input.email) {
    throw new GraphQLError('Add at least one way to reach the contact person: mobile, landline or email');
  }
  if (input.phone && !isValidMobile(input.phone)) throw new GraphQLError('Mobile number is not valid');
  if (input.landline && !isValidLandline(input.landline)) throw new GraphQLError('Landline number is not valid');
  if (input.email && !isValidEmail(input.email)) throw new GraphQLError('Email address is not valid');

  return {
    ...input,
    name: input.name,
    contactName: `${input.contactFirstName} ${input.contactLastName}`,
  };
}
