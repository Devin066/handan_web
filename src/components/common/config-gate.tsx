import { useEffect } from 'react';
import type { ReactNode } from 'react';

import { useConfigurationQuery } from '@/gql';
import useConfigStore from '@/stores/useConfig';

/**
 * Loads company-wide display settings once, near the root, and keeps the store
 * in sync with the server.
 *
 * The subtree is keyed on the currency so that changing it remounts every
 * screen below. Amounts are rendered by plain functions inside table column
 * renderers, which React has no way to invalidate on its own — without the
 * remount a memoised ProTable would keep showing the old symbol until the user
 * navigated away. Currency changes are a rare, deliberate settings action, so
 * paying for one remount is cheaper than threading the currency through every
 * column definition in the app.
 */
const ConfigGate = ({ children }: { children: ReactNode }) => {
  const currency = useConfigStore((state) => state.currency);
  const setCurrency = useConfigStore((state) => state.setCurrency);
  const decimalPlaces = useConfigStore((state) => state.decimalPlaces);
  const setDecimalPlaces = useConfigStore((state) => state.setDecimalPlaces);

  const { data } = useConfigurationQuery({ fetchPolicy: 'cache-and-network' });

  useEffect(() => {
    const loaded = data?.configuration?.currency;
    if (loaded) setCurrency(loaded);
    const decimals = data?.configuration?.decimalPlaces;
    if (decimals != null) setDecimalPlaces(decimals);
  }, [data, setCurrency, setDecimalPlaces]);

  return (
    <div key={`${currency}:${decimalPlaces}`} style={{ display: 'contents' }}>
      {children}
    </div>
  );
};

export default ConfigGate;
