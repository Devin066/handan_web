import { useEffect, useState } from 'react';
import { Card, Button, Select, Space, Typography } from 'antd';

import { useConfigurationQuery, useUpdateConfigurationMutation } from '@/gql';
import { useMessageContext } from '@/components/common/message-context';
import useConfigStore from '@/stores/useConfig';
import { CURRENCIES, DEFAULT_CURRENCY } from '@/config/currency';
import { formatCurrency } from '@/utils/format';
import { onError } from '@/utils';

const { Text, Title } = Typography;

/** A representative figure, so the effect of a choice is visible before saving. */
const SAMPLE_AMOUNT = 1234.5;

const Configuration: React.FC = () => {
  const { messageApi } = useMessageContext();
  const setCurrency = useConfigStore((state) => state.setCurrency);

  const { data, loading } = useConfigurationQuery({
    fetchPolicy: 'cache-and-network',
  });
  const saved = data?.configuration?.currency ?? DEFAULT_CURRENCY;

  const [selected, setSelected] = useState<string>(saved);

  // The query resolves after first paint, so the select has to catch up once.
  useEffect(() => setSelected(saved), [saved]);

  const [updateConfiguration, { loading: saving }] = useUpdateConfigurationMutation({
    onCompleted: (result) => {
      const currency = result?.updateConfiguration?.currency;
      if (!currency) return;

      // Update the store directly rather than waiting for a refetch: this is
      // what re-renders every screen in the app with the new currency.
      setCurrency(currency);
      messageApi?.success(`Currency updated to ${currency}`);
    },
    onError,
  });

  const dirty = selected !== saved;

  return (
    <Card loading={loading} style={{ maxWidth: 720 }}>
      <Title level={5} style={{ marginTop: 0 }}>
        Currency
      </Title>

      <Text type="secondary">
        Applies to every screen that shows money: orders, invoices, payments, stock value and the dashboard. This
        changes how amounts are labelled, not what they are worth: existing figures are re-displayed, never converted.
      </Text>

      <div style={{ marginTop: 20 }}>
        <Space align="center" wrap>
          <Select
            style={{ width: 320 }}
            value={selected}
            onChange={setSelected}
            showSearch
            optionFilterProp="label"
            options={CURRENCIES.map((currency) => ({
              value: currency.code,
              label: `${currency.code} · ${currency.name} (${currency.symbol})`,
            }))}
          />

          <Button
            type="primary"
            loading={saving}
            disabled={!dirty}
            onClick={() =>
              updateConfiguration({
                variables: { request: { currency: selected } },
              })
            }
          >
            Save
          </Button>

          {dirty ? (
            <Button disabled={saving} onClick={() => setSelected(saved)}>
              Cancel
            </Button>
          ) : null}
        </Space>
      </div>

      <div style={{ marginTop: 16 }}>
        <Text type="secondary">Preview: </Text>
        <Text strong className="tabular-figures" style={{ fontSize: 16 }}>
          {formatCurrency(SAMPLE_AMOUNT, selected)}
        </Text>
      </div>
    </Card>
  );
};

export default Configuration;
