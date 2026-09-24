import { useRef } from 'react';
import { useRouter } from 'next/router';
import type { ActionType, ProColumns } from '@ant-design/pro-components';

// locale
import client from '@/gql/apollo';
import { paymentEntryTypeEnum } from '@/utils/enum';
import DataTable from '@/components/shared/data-table';
import { codeColumn, moneyColumn, statusColumn } from '@/components/shared/columns';
import { PaymentEntriesDocument } from '@/gql';

const PaymentEntryList: React.FC = () => {
  const router = useRouter();
  const actionRef = useRef<ActionType | null>(null);

  const handleReloadTable = () => {
    actionRef.current?.reload();
  };

  const columns: ProColumns<any>[] = [
    codeColumn('No.'),
    statusColumn('Type', 'type', paymentEntryTypeEnum, { width: 140 }),
    {
      title: 'Partners',
      dataIndex: 'partyName',
    },
    moneyColumn('Amount', 'totalAmount'),
    {
      title: 'Method',
      dataIndex: ['paymentMethod', 'name'],
    },
    {
      title: 'Reference',
      dataIndex: 'referenceNo',
      render: (_, r) => r.referenceNo || r.memo || '—',
    },
    {
      title: 'Date Paid',
      dataIndex: 'paidOn',
      valueType: 'date',
      render: (_, r) => (r.paidOn ?? r.insertedAt ?? '').slice(0, 10) || '—',
    },
  ];

  return (
    <DataTable
      entityName="payment entries"
      emptyHint="Record a payment against an outstanding invoice."
      actionRef={actionRef}
      columns={columns}
      request={async (params: any, sorter: any, filter: any) => {
        const { data } = await client.query({
          query: PaymentEntriesDocument,
          variables: {
            request: {},
          },
        });

        return {
          data: data.paymentEntries,
          total: data.paymentEntries.length,
          success: true,
        };
      }}
    />
  );
};

export default PaymentEntryList;
