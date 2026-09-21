import { useRef, useState } from 'react';
import { Button } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-components';

// locale
import client from '@/gql/apollo';
import { invoiceStatusEnum } from '@/utils/enum';
import DataTable from '@/components/shared/data-table';
import { codeColumn, moneyColumn, statusColumn } from '@/components/shared/columns';
import { SalesInvoicesDocument } from '@/gql';

import PaymentEntryNew from '@/components/payment-entry/new';

const SalesInvoiceList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);

  const [detailVisible, setDetailVisible] = useState(false);
  const [record, setRecord] = useState<any>(null);

  const handleReloadTable = () => {
    actionRef.current?.reload();
  };

  const handleEntryNew = (record: any) => {
    setRecord(record);
    setDetailVisible(true);
  };

  const handleClose = () => {
    setRecord(null);
    setDetailVisible(false);
    handleReloadTable();
  };

  const columns: ProColumns<any>[] = [
    codeColumn('No.'),
    {
      title: 'Customer Name',
      dataIndex: 'customerName',
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
        entityName="sales invoices"
        emptyHint="Invoices are raised from a sales order."
        actionRef={actionRef}
        columns={columns}
        request={async (params, sorter, filter) => {
          const { data } = await client.query({
            query: SalesInvoicesDocument,
            variables: {
              request: {},
            },
          });

          return {
            data: data.salesInvoices,
            total: data.salesInvoices.length,
            success: true,
          };
        }}
      />

      <PaymentEntryNew visible={detailVisible} saleInvoice={record} onClose={() => handleClose()} />
    </>
  );
};

export default SalesInvoiceList;
