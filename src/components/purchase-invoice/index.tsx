import { useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-components';

// locale
import { useMessageContext } from '@/components/common/message-context';
import client from '@/gql/apollo';
import { invoiceStatusEnum } from '@/utils/enum';
import DataTable from '@/components/shared/data-table';
import { moneyColumn, statusColumn } from '@/components/shared/columns';
import { PurchaseInvoicesDocument } from '@/gql';

import PaymentEntryNew from '@/components/payment-entry/new';

const PurchaseInvoiceList: React.FC = () => {
  const { messageApi } = useMessageContext();
  const [detailVisible, setDetailVisible] = useState(false);
  const [record, setRecord] = useState(null);

  const router = useRouter();

  const actionRef = useRef<ActionType | null>(null);

  const handleEntryNew = (record: any) => {
    setRecord(record);
    setDetailVisible(true);
  };

  const handleClose = () => {
    setRecord(null);
    setDetailVisible(false);
    handleReloadTable();
  };

  const handleReloadTable = () => {
    actionRef.current?.reload();
  };

  const columns: ProColumns<any>[] = [
    {
      title: 'No.',
      width: 200,
      dataIndex: 'code',
    },
    {
      title: 'Supplier Name',
      dataIndex: 'supplierName',
    },
    moneyColumn('Amount', 'amount'),
    statusColumn('Status', 'status', invoiceStatusEnum, { width: 150 }),
    {
      title: 'Created At',
      dataIndex: 'insertedAt',
      valueType: 'dateTime',
    },
    {
      title: 'Actions',
      width: 180,
      key: 'option',
      valueType: 'option',
      render: (item: any, record: any) => [
        <>
          {record.status !== 'paid' && (
            <Button size="small" type="link" onClick={() => handleEntryNew(record)}>
              Pay
            </Button>
          )}
        </>,
      ],
    },
  ];

  return (
    <>
      <DataTable
        entityName="purchase invoices"
        emptyHint="Invoices are raised from a purchase order."
        actionRef={actionRef}
        columns={columns}
        request={async (params, sorter, filter) => {
          const { data } = await client.query({
            query: PurchaseInvoicesDocument,
            variables: {
              request: {},
            },
          });

          return {
            data: data.purchaseInvoices,
            total: data.purchaseInvoices.length,
            success: true,
          };
        }}
      />

      <PaymentEntryNew visible={detailVisible} purchaseInvoice={record} onClose={() => handleClose()} />
    </>
  );
};

export default PurchaseInvoiceList;
