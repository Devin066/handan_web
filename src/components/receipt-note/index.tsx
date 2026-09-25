import { useRef, useState } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Popconfirm, Button } from 'antd';
import size from 'lodash.size';

// locale
import { useMessageContext } from '@/components/common/message-context';
import client from '@/gql/apollo';
import { useCompleteReceiptNoteMutation, ReceiptNotesDocument } from '@/gql';
import { onError } from '@/utils';
import useModuleAccess from '@/hooks/use-module-access';
import { receiptNoteStatusEnum } from '@/utils/enum';
import DataTable from '@/components/shared/data-table';
import { codeColumn, qtyColumn, statusColumn } from '@/components/shared/columns';

import DeliveryNoteDetail from './detail';
import ReceiptNoteNew from './new';

const ReceiptNoteList: React.FC = () => {
  const canEdit = useModuleAccess().canEdit('inventory.receipts');
  const { messageApi } = useMessageContext();

  const [detailVisible, setDetailVisible] = useState(false);
  const [record, setRecord] = useState<any>({});

  const [completeReceiptNote] = useCompleteReceiptNoteMutation({
    onCompleted: (data) => {
      const gr = data.completeReceiptNote;
      messageApi?.success(`${gr?.code} stocked in, purchase invoice ${gr?.purchaseInvoiceCode} raised`);
      handleReloadTable();
    },
    onError,
  });

  const actionRef = useRef<ActionType | null>(null);

  const handleReloadTable = () => {
    actionRef.current?.reload();
  };

  const handleCompleteReceiptNote = async (values: any) => {
    const request = {
      purchaseOrderUuid: values.purchaseOrderUuid,
      receiptNoteUuid: values.uuid,
    };

    await completeReceiptNote({ variables: { request } });
  };

  const handleDetail = (record: any) => {
    setDetailVisible(true);
    setRecord(record);
  };

  const columns: ProColumns<any>[] = [
    codeColumn('No.', 'code', handleDetail),
    {
      title: 'Warehouse Name',
      key: 'warehouseUuid',
      dataIndex: ['warehouse', 'name'],
    },
    {
      title: 'Supplier Name',
      dataIndex: 'supplierName',
    },
    { title: 'Purchase Order', dataIndex: 'purchaseOrderCode' },
    qtyColumn('Total Qty', 'totalQty'),
    {
      title: 'Purchase Invoice',
      dataIndex: 'purchaseInvoiceCode',
      render: (_: any, r: any) => r.purchaseInvoiceCode ?? 'Raised on stock in',
    },
    statusColumn('Status', 'status', receiptNoteStatusEnum, { width: 170 }),
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
          {record.status === 'to_receive' && (
            <Popconfirm
              key="link2"
              title="Stock these goods in?"
              description="Stock levels update and the supplier's purchase invoice is raised."
              onConfirm={() => handleCompleteReceiptNote(record)}
              okText="Yes"
              cancelText="No"
            >
              <Button size="small" type="link">
                Stock In
              </Button>
            </Popconfirm>
          )}
        </>,
      ],
    },
  ];

  return (
    <>
      <DataTable
        entityName="goods receipts"
        emptyHint="Record a delivery against a purchase order with New Goods Receipt."
        toolBarRender={canEdit ? () => [<ReceiptNoteNew key="new" onCreated={handleReloadTable} />] : undefined}
        actionRef={actionRef}
        columns={columns}
        request={async (params, sorter, filter) => {
          const { data } = await client.query({
            query: ReceiptNotesDocument,
            variables: {
              request: {},
            },
          });

          return {
            data: data.receiptNotes,
            total: size(data.receiptNotes),
            success: true,
          };
        }}
      />

      <DeliveryNoteDetail
        uuid={record?.uuid}
        visible={detailVisible}
        record={record}
        onClose={() => setDetailVisible(false)}
      />
    </>
  );
};

export default ReceiptNoteList;
