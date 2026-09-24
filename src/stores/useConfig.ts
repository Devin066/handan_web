import { create } from 'zustand';

import { DEFAULT_CURRENCY } from '@/config/currency';

/**
 * Company-wide display settings, mirrored client-side.
 *
 * This is kept in a store rather than React context because `formatCurrency` is
 * a plain function called from table column renderers all over the app, and
 * those cannot read context. The store lets the formatter reach the current
 * currency synchronously via `getState()`.
 */
type ConfigState = {
  currency: string;
  /** Fraction digits for money (SRS 4.8 decimal formatting). */
  decimalPlaces: number;
  setDecimalPlaces: (decimalPlaces: number) => void;
  /** False until the server value arrives, so screens can avoid flashing the default. */
  loaded: boolean;
  setCurrency: (currency: string) => void;
};

export const useConfigStore = create<ConfigState>((set) => ({
  currency: DEFAULT_CURRENCY,
  decimalPlaces: 2,
  setDecimalPlaces: (decimalPlaces: number) => set({ decimalPlaces }),
  loaded: false,
  setCurrency: (currency: string) => set({ currency, loaded: true }),
}));

/** For non-React callers such as the formatters. */
export const getCurrency = (): string => useConfigStore.getState().currency;
export const getDecimalPlaces = (): number => useConfigStore.getState().decimalPlaces;

export default useConfigStore;
