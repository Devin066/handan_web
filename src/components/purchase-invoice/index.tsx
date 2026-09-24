import { useRef, useState } from 'react';
import { Button, Typography } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-components';

import client from '@/gql/apollo';
import { invoiceStatusEnum } from '@/utils/enum';
import DataTable from '@/components/shared/data-table';
import { codeColumn, moneyColumn, statusColumn } from '@/components/shared/columns';
import RecordPayment from '@/components/shared/record-payment';
import { PurchaseInvoicesDocument } from '@/gql';
import { formatCurrency } from '@/utils/format';

const { Text } = Typography;

/** Purchase invoices (SRS 4.5): raised automatically by each completed goods receipt. */
const PurchaseInvoiceList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [paying, setPaying] = useState<any>(null);
  const [rows, setRows] = useState<any[]>([]);
  const reload = () => actionRef.current?.reload();

  const outstanding = rows.reduce((sum, r) => sum + Number(r.balance ?? 0), 0);

  const columns: ProColumns<any>[] = [
    codeColumn('No.'),
    { title: 'Supplier', dataIndex: 'supplierName' },
    {
      title: 'Source',
      dataIndex: 'receiptNoteCode',
      render: (_, r) => (
        <div>
          <div className="doc-code">{r.receiptNoteCode ?? 'Manual'}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {r.purchaseOrderCode}
          </Text>
        </div>
      ),
    },
    moneyColumn('Amount', 'amount'),
    moneyColumn('Balance', 'balance'),
    statusColumn('Status', 'status', invoiceStatusEnum, { width: 130 }),
    {
      title: 'Paid by',
      dataIndex: 'paymentMethodName',
      render: (_, r) =>
        r.paymentMethodName ? (
          <div>
            <div>{r.paymentMethodName}</div>
            {r.referenceNo ? (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {r.referenceNo}
              </Text>
            ) : null}
          </div>
        ) : (
          '—'
        ),
    },
    { title: 'Created', dataIndex: 'insertedAt', valueType: 'dateTime' },
    {
      title: 'Actions',
      width: 130,
      valueType: 'option',
      render: (_, r) => {
        if (r.status === 'paid' || r.status === 'cancelled') return [];
        return [
          <Button key="pay" size="small" type="link" onClick={() => setPaying(r)}>
            Record payment
          </Button>,
        ];
      },
    },
  ];

  return (
    <>
      <DataTable
        entityName="purchase invoices"
        emptyHint="Completing a goods receipt raises its purchase invoice here."
        actionRef={actionRef}
        columns={columns}
        headerTitle={
          <div className="list-summary">
            <span>
              <span className="list-summary-value tabular-figures">{formatCurrency(outstanding)}</span> owed to
              suppliers
            </span>
          </div>
        }
        request={async () => {
          const { data } = await client.query({
            query: PurchaseInvoicesDocument,
            fetchPolicy: 'network-only',
          });
          const invoices = data?.purchaseInvoices ?? [];
          setRows(invoices);
          return { data: invoices, total: invoices.length, success: true };
        }}
      />
      <RecordPayment invoice={paying} type="purchase" onClose={() => setPaying(null)} onRecorded={reload} />
    </>
  );
};

export default PurchaseInvoiceList;
