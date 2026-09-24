import dayjs from 'dayjs';
import { Alert, Drawer, Table, Typography } from 'antd';

import { useCustomerLedgerQuery, useSupplierLedgerQuery } from '@/gql';
import { formatCurrency } from '@/utils/format';

const { Text } = Typography;

/**
 * Customer sales ledger or supplier fulfilment history (SRS 4.7): every order,
 * receipt, invoice and payment with the party, oldest first, and what is owed.
 */
const PartyLedger = ({ party, kind, onClose }: { party: any; kind: 'customer' | 'supplier'; onClose: () => void }) => {
  const variables = { request: { uuid: party?.uuid } };
  const customer = useCustomerLedgerQuery({
    skip: !party || kind !== 'customer',
    variables,
    fetchPolicy: 'network-only',
  });
  const supplier = useSupplierLedgerQuery({
    skip: !party || kind !== 'supplier',
    variables,
    fetchPolicy: 'network-only',
  });
  const query = kind === 'customer' ? customer : supplier;
  const rows = ((kind === 'customer' ? customer.data?.customerLedger : supplier.data?.supplierLedger) ?? []) as any[];
  const balance = rows.length ? rows[rows.length - 1].balance : 0;

  return (
    <Drawer open={!!party} onClose={onClose} width="min(860px, 100vw)" title={party?.name}>
      {party?.buildSpecs ? (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 12 }}
          message="Build specifications"
          description={party.buildSpecs}
        />
      ) : null}
      <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
        {kind === 'customer' ? 'Owed by this customer: ' : 'Owed to this supplier: '}
        <Text strong className="tabular-figures">
          {formatCurrency(balance)}
        </Text>
      </Text>
      {query.error ? (
        <Alert type="error" showIcon message="The ledger couldn't load." description={query.error.message} />
      ) : (
        <Table
          size="small"
          rowKey={(r: any, i?: number) => `${r.code}-${i}`}
          loading={query.loading}
          pagination={{ pageSize: 50, hideOnSinglePage: true }}
          scroll={{ x: 'max-content' }}
          dataSource={rows}
          locale={{
            emptyText:
              kind === 'customer' ? 'No orders from this customer yet.' : 'Nothing bought from this supplier yet.',
          }}
          columns={[
            { title: 'Date', render: (_: any, r: any) => dayjs(r.date).format('YYYY-MM-DD') },
            { title: 'Document', render: (_: any, r: any) => <span className="doc-code">{r.code}</span> },
            { title: 'Type', dataIndex: 'type' },
            { title: 'Details', dataIndex: 'description' },
            {
              title: 'Amount',
              align: 'right',
              render: (_: any, r: any) => <span className="tabular-figures">{formatCurrency(r.amount)}</span>,
            },
            {
              title: 'Balance',
              align: 'right',
              render: (_: any, r: any) => (
                <span className="tabular-figures" style={{ fontWeight: 600 }}>
                  {formatCurrency(r.balance)}
                </span>
              ),
            },
          ]}
        />
      )}
    </Drawer>
  );
};

export default PartyLedger;
