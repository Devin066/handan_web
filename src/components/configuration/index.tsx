import { useEffect, useState } from 'react';
import { Card, Button, Radio, Select, Space, Typography } from 'antd';

import { useConfigurationQuery, useUpdateConfigurationMutation } from '@/gql';
import { useMessageContext } from '@/components/common/message-context';
import useConfigStore from '@/stores/useConfig';
import { CURRENCIES, DEFAULT_CURRENCY } from '@/config/currency';
import { formatCurrency } from '@/utils/format';
import { onError } from '@/utils';

const { Text, Title } = Typography;

/** A representative figure, so the effect of a choice is visible before saving. */
const SAMPLE_AMOUNT = 1234.5;

const TIMEZONES = ['Asia/Manila', 'Asia/Singapore', 'Asia/Hong_Kong', 'Asia/Tokyo', 'UTC'];

/** Timezone and decimal formatting (SRS 4.8). */
const Regional = () => {
  const { messageApi } = useMessageContext();
  const setDecimalPlaces = useConfigStore((state) => state.setDecimalPlaces);
  const { data, loading } = useConfigurationQuery({
    fetchPolicy: 'cache-and-network',
  });
  const [timezone, setTimezone] = useState('Asia/Manila');
  const [decimals, setDecimals] = useState(2);

  useEffect(() => {
    if (data?.configuration?.timezone) setTimezone(data.configuration.timezone);
    if (data?.configuration?.decimalPlaces != null) setDecimals(data.configuration.decimalPlaces);
  }, [data]);

  const [update, { loading: saving }] = useUpdateConfigurationMutation({
    onCompleted: (result) => {
      const saved = result?.updateConfiguration;
      if (saved?.decimalPlaces != null) setDecimalPlaces(saved.decimalPlaces);
      messageApi?.success('Regional settings saved');
    },
    onError,
  });

  return (
    <Card loading={loading} style={{ maxWidth: 720, marginTop: 12 }}>
      <Title level={5} style={{ marginTop: 0 }}>
        Timezone and Decimals
      </Title>
      <Text type="secondary">
        The company timezone is saved for reports and exports. Attendance days, the dashboard&apos;s &quot;today&quot;
        and the fiscal year are counted in GMT+8.
      </Text>
      <div style={{ marginTop: 20 }}>
        <Space align="end" wrap>
          <div>
            <div style={{ marginBottom: 4 }}>
              <Text>Timezone</Text>
            </div>
            <Select
              style={{ width: 220 }}
              value={timezone}
              onChange={setTimezone}
              options={TIMEZONES.map((tz) => ({
                value: tz,
                label: tz === 'Asia/Manila' ? 'Asia/Manila (GMT+8)' : tz,
              }))}
            />
          </div>
          <div>
            <div style={{ marginBottom: 4 }}>
              <Text>Decimal Places for Money</Text>
            </div>
            <Select
              style={{ width: 120 }}
              value={decimals}
              onChange={setDecimals}
              options={[0, 1, 2, 3, 4].map((n) => ({
                value: n,
                label: String(n),
              }))}
            />
          </div>
          <Button
            type="primary"
            loading={saving}
            onClick={() =>
              update({
                variables: { request: { timezone, decimalPlaces: decimals } },
              })
            }
          >
            Save
          </Button>
        </Space>
      </div>
    </Card>
  );
};

/** Who hands out production tasks on the office board. */
const ProductionClaiming = () => {
  const { messageApi } = useMessageContext();
  const { data, loading } = useConfigurationQuery({ fetchPolicy: 'cache-and-network' });
  const [update, { loading: saving }] = useUpdateConfigurationMutation({
    onCompleted: () => messageApi?.success('Production board setting saved'),
    onError,
  });
  const mode = data?.configuration?.productionClaimMode ?? 'manager';

  return (
    <Card loading={loading} style={{ maxWidth: 720, marginTop: 12 }}>
      <Title level={5} style={{ marginTop: 0 }}>
        Production Board
      </Title>
      <Text type="secondary">
        Who moves a task out of the queue. Passing quality check, final check and completing a task always need a
        manager or the owner.
      </Text>
      <div style={{ marginTop: 16 }}>
        <Radio.Group
          value={mode}
          disabled={saving}
          onChange={(e) => update({ variables: { request: { productionClaimMode: e.target.value } } })}
        >
          <Space direction="vertical">
            <Radio value="manager">A Manager Assigns Tasks to Workers</Radio>
            <Radio value="self">Workers Claim Tasks Themselves</Radio>
          </Space>
        </Radio.Group>
      </div>
    </Card>
  );
};

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
    <>
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
      <Regional />
      <ProductionClaiming />
    </>
  );
};

export default Configuration;
