import { useRef, useState } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Card, Col, Row, Table, Typography } from 'antd';

import client from '@/gql/apollo';
import { JournalEntriesDocument } from '@/gql';
import DataTable from '@/components/shared/data-table';
import { formatCurrency } from '@/utils/format';
import { tokens } from '@/components/common/theme';

const { Text } = Typography;

const SOURCE_LABELS: Record<string, string> = {
  sales_invoice: 'Sales invoice',
  sales_payment: 'Customer payment',
  purchase_invoice: 'Purchase invoice',
  purchase_payment: 'Supplier payment',
  payroll: 'Payroll',
};

const money = (value: unknown) => (Number(value) ? formatCurrency(value) : '');

/**
 * Accounting Ledger (SRS 4.5): the double-entry journal the system posts from
 * invoices, payments and payroll, with running balances per account.
 */
const AccountingLedger = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [balances, setBalances] = useState<any[]>([]);

  const columns: ProColumns<any>[] = [
    { title: 'Date', dataIndex: 'entryDate', valueType: 'date' },
    {
      title: 'Source',
      dataIndex: 'sourceType',
      render: (_, r) => (
        <div>
          <div className="doc-code">{r.sourceCode ?? '—'}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {SOURCE_LABELS[r.sourceType] ?? r.sourceType}
          </Text>
        </div>
      ),
    },
    { title: 'Description', dataIndex: 'description' },
    {
      title: 'Lines',
      dataIndex: 'lines',
      render: (_, r) => (
        <table className="journal-lines">
          <tbody>
            {(r.lines ?? []).map((l: any) => (
              <tr key={l.uuid}>
                <td style={{ paddingLeft: Number(l.credit) ? 16 : 0 }}>{l.account}</td>
                <td className="tabular-figures" style={{ textAlign: 'right' }}>
                  {money(l.debit)}
                </td>
                <td className="tabular-figures" style={{ textAlign: 'right' }}>
                  {money(l.credit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ),
    },
  ];

  return (
    <Row gutter={[12, 12]}>
      <Col xs={24}>
        <Card size="small" title="Account balances" style={{ borderColor: tokens.border }}>
          <Table
            size="small"
            rowKey="account"
            pagination={false}
            scroll={{ x: 'max-content' }}
            dataSource={balances}
            locale={{
              emptyText: 'Nothing posted yet. Invoices, payments and payroll post here automatically.',
            }}
            columns={[
              { title: 'Account', dataIndex: 'account' },
              {
                title: 'Debits',
                align: 'right',
                render: (_: any, b: any) => <span className="tabular-figures">{formatCurrency(b.debit)}</span>,
              },
              {
                title: 'Credits',
                align: 'right',
                render: (_: any, b: any) => <span className="tabular-figures">{formatCurrency(b.credit)}</span>,
              },
              {
                title: 'Balance',
                align: 'right',
                render: (_: any, b: any) => (
                  <span className="tabular-figures" style={{ fontWeight: 600 }}>
                    {formatCurrency(Math.abs(Number(b.balance)))} {Number(b.balance) >= 0 ? 'Dr' : 'Cr'}
                  </span>
                ),
              },
            ]}
          />
        </Card>
      </Col>
      <Col xs={24}>
        <DataTable
          entityName="journal entries"
          emptyHint="Entries appear as invoices are issued, payments are recorded and payroll is finalized."
          actionRef={actionRef}
          columns={columns}
          request={async () => {
            const { data } = await client.query({
              query: JournalEntriesDocument,
              fetchPolicy: 'network-only',
            });
            setBalances(data?.accountBalances ?? []);
            const entries = data?.journalEntries ?? [];
            return { data: entries, total: entries.length, success: true };
          }}
        />
      </Col>
    </Row>
  );
};

export default AccountingLedger;
