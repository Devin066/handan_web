import { GraphQLError } from 'graphql';

import { isValidEmail, isValidMobile } from '@/config/ph-contact';
import { EMPLOYMENT_TYPES, LEGACY_EMPLOYMENT_TYPES, STAFF_STATUSES } from '@/config/staff';

export type StaffInput = {
  uuid?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  position?: string | null;
  employmentType?: string | null;
  shift?: string | null;
  hiredAt?: Date | null;
  status?: string | null;
  baseRate?: number | null;
};

const clean = (value?: string | null) => value?.trim().replace(/\s+/g, ' ') || null;

/** Same rules as the member form, so the API can't store what the form would reject. */
export function normaliseStaff(request: StaffInput) {
  const name = clean(request.name);
  const email = clean(request.email)?.toLowerCase();
  const phone = clean(request.phone);

  if (!name) throw new GraphQLError('Name is required.');
  if (!email || !isValidEmail(email)) throw new GraphQLError('A valid email is required.');
  if (phone && !isValidMobile(phone)) throw new GraphQLError('Mobile number is not valid.');

  const employmentType = request.employmentType ?? 'regular';
  if (!(employmentType in EMPLOYMENT_TYPES) && !LEGACY_EMPLOYMENT_TYPES.includes(employmentType)) throw new GraphQLError(`Unknown employment type: ${employmentType}`);
  const status = request.status ?? 'active';
  if (!(status in STAFF_STATUSES)) throw new GraphQLError(`Unknown status: ${status}`);

  return {
    name,
    email,
    phone,
    position: clean(request.position),
    employmentType,
    shift: clean(request.shift),
    hiredAt: request.hiredAt ? new Date(request.hiredAt) : null,
    status,
    ...(request.baseRate != null ? { baseRate: Math.max(Number(request.baseRate) || 0, 0) } : {}),
  };
}
