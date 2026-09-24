/**
 * SRS 4.6: regular staff get statutory benefits and tax withholding; contractual
 * staff are paid gross with no statutory deductions.
 */
export const EMPLOYMENT_TYPES = {
  regular: 'Regular',
  contractual: 'Contractual',
} as const;

/** Older records may still carry these; payroll treats them as regular. */
export const LEGACY_EMPLOYMENT_TYPES = ['probationary', 'part_time'];

export const STAFF_STATUSES = {
  active: 'Active',
  inactive: 'Inactive',
} as const;
