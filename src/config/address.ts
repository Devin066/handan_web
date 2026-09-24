/**
 * A Philippine address in the order it is written: house/unit and street,
 * barangay, city or municipality, province, postal code. Documents store it as
 * one line (what prints on an order or invoice); forms collect it in parts so
 * nothing gets left out.
 */
export type AddressParts = {
  street?: string | null;
  barangay?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
};

export const ADDRESS_FIELDS: Array<{ key: keyof AddressParts; label: string; placeholder: string }> = [
  { key: 'street', label: 'House / Unit and Street', placeholder: 'e.g. 12 Rizal St.' },
  { key: 'barangay', label: 'Barangay', placeholder: 'e.g. Brgy. San Isidro' },
  { key: 'city', label: 'City / Municipality', placeholder: 'e.g. Quezon City' },
  { key: 'province', label: 'Province / Region', placeholder: 'e.g. Metro Manila' },
  { key: 'postalCode', label: 'Postal Code', placeholder: 'e.g. 1100' },
];

/** Philippine ZIP codes are four digits. */
export const isValidPostalCode = (value: string) => /^\d{4}$/.test(value.trim());

/** "12 Rizal St., Brgy. San Isidro, Quezon City, Metro Manila 1100", skipping blanks. */
export function composeAddress(parts?: AddressParts | null): string {
  if (!parts) return '';
  const clean = (v?: string | null) => v?.trim() || '';
  const place = [clean(parts.street), clean(parts.barangay), clean(parts.city), clean(parts.province)].filter(Boolean);
  const line = place.join(', ');
  const postal = clean(parts.postalCode);
  return postal ? `${line} ${postal}`.trim() : line;
}

/** The parts from a customer record, for pre-filling. */
export function addressFromCustomer(customer: Record<string, any> | null | undefined): AddressParts {
  return {
    street: customer?.address ?? '',
    barangay: customer?.barangay ?? '',
    city: customer?.city ?? '',
    province: customer?.province || customer?.region || '',
    postalCode: customer?.postalCode ?? '',
  };
}
