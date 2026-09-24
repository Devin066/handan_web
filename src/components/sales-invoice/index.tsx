import Link from 'next/link';
import { useRef, useState } from 'react';
import dayjs from 'dayjs';
import { Badge, Button, Typography } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-components';

import client from '@/gql/apollo';
import { invoiceStatusEnum } from '@/utils/enum';
import DataTable from '@/components/shared/data-table';
import { codeColumn, moneyColumn, statusColumn } from '@/components/shared/columns';
import { SalesInvoicesDocument } from '@/gql';
import { formatCurrency } from '@/utils/format';

import RecordPayment from '@/components/shared/record-payment';
import SalesInvoiceNew from './new';
import SalesInvoiceDetail from './detail';

const { Text } = Typography;

const isOverdue = (record: any) =>
  record.status !== 'paid' &&
  record.status !== 'cancelled' &&
  !!record.dueDate &&
  dayjs(record.dueDate).isBefore(dayjs(), 'day');

const SalesInvoiceList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);

  const [creating, setCreating] = useState(false);
  const [viewing, setViewing] = useState<string | undefined>();
  const [paying, setPaying] = useState<any>(null);
  const [rows, setRows] = useState<any[]>([]);

  // What the list adds up to: the figure someone scanning invoices is after.
  const open = rows.filter((r) => r.status !== 'paid' && r.status !== 'cancelled');
  const outstanding = open.reduce((total, r) => total + Number(r.balance ?? 0), 0);
  const overdue = open.filter(isOverdue);

  const reload = () => actionRef.current?.reload();

  const columns: ProColumns<any>[] = [
    codeColumn('No.', 'code', (record: any) => setViewing(record.uuid)),
    {
      title: 'Customer',
      dataIndex: 'customerName',
      render: (_, record) => (
        <div>
          <div>{record.customerName}</div>
          {record.salesOrderCode ? (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.salesOrderCode}
              {record.customerReference ? ` · ${record.customerReference}` : ''}
            </Text>
          ) : null}
        </div>
      ),
    },
    {
      title: 'Invoice Date',
      dataIndex: 'invoiceDate',
      valueType: 'date',
      sorter: (a, b) => dayjs(a.invoiceDate).valueOf() - dayjs(b.invoiceDate).valueOf(),
    },
    {
      title: 'Due',
      dataIndex: 'dueDate',
      width: 140,
      render: (_, record) =>
        record.dueDate ? (
          <span>
            {dayjs(record.dueDate).format('YYYY-MM-DD')}
            {isOverdue(record) ? (
              <div>
                <Badge status="error" text="Overdue" />
              </div>
            ) : null}
          </span>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    moneyColumn('Total', 'amount'),
    moneyColumn('Balance', 'balance'),
    statusColumn('Status', 'status', invoiceStatusEnum, { width: 130 }),
    {
      title: 'OR no.',
      dataIndex: 'orNumber',
      width: 140,
      render: (_, record) =>
        record.orNumber ? (
          <div>
            <div className="doc-code">{record.orNumber}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.paymentMethodName}
            </Text>
          </div>
        ) : (
          <Text type="secondary">Awaiting payment</Text>
        ),
    },
    {
      title: 'Actions',
      width: 100,
      key: 'option',
      valueType: 'option',
      render: (_, record) => {
        if (record.status === 'paid' || record.status === 'cancelled') return [];
        return [
          <Button key="pay" size="small" type="link" onClick={() => setPaying(record)}>
            Record Payment
          </Button>,
        ];
      },
    },
  ];

  return (
    <>
      <DataTable
        entityName="sales invoices"
        emptyHint="Invoices are issued automatically when a sales order is created."
        actionRef={actionRef}
        columns={columns}
        request={async () => {
          const { data } = await client.query({
            query: SalesInvoicesDocument,
            variables: { request: {} },
            fetchPolicy: 'network-only',
          });
          const invoices = data?.salesInvoices ?? [];
          setRows(invoices);
          return { data: invoices, total: invoices.length, success: true };
        }}
        headerTitle={
          <div className="list-summary">
            <span>
              <span className="list-summary-value tabular-figures">{formatCurrency(outstanding)}</span> outstanding on{' '}
              {open.length} invoice{open.length === 1 ? '' : 's'}
            </span>
            {overdue.length ? <Badge status="error" text={`${overdue.length} overdue`} /> : null}
          </div>
        }
        toolBarRender={() => [
          <Link key="payments" href="/finance/payment-entries">
            <Button size="small">Payment History</Button>
          </Link>,
          <Button key="new" type="primary" size="small" onClick={() => setCreating(true)}>
            New Invoice
          </Button>,
        ]}
      />

      <SalesInvoiceNew open={creating} onClose={() => setCreating(false)} onCreated={reload} />
      <SalesInvoiceDetail uuid={viewing} onClose={() => setViewing(undefined)} />
      <RecordPayment invoice={paying} type="sales" onClose={() => setPaying(null)} onRecorded={reload} />
    </>
  );
};

export default SalesInvoiceList;
