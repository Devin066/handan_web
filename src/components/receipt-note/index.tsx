import { useRef, useState } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Popconfirm, Button } from 'antd';
import size from 'lodash.size';

// locale
import { useMessageContext } from '@/components/common/message-context';
import client from '@/gql/apollo';
import { useCompleteReceiptNoteMutation, ReceiptNotesDocument } from '@/gql';
import { onError } from '@/utils';
import { receiptNoteStatusEnum } from '@/utils/enum';
import DataTable from '@/components/shared/data-table';
import { codeColumn, qtyColumn, statusColumn } from '@/components/shared/columns';

import DeliveryNoteDetail from './detail';

const ReceiptNoteList: React.FC = () => {
  const { messageApi } = useMessageContext();

  const [detailVisible, setDetailVisible] = useState(false);
  const [record, setRecord] = useState<any>({});

  const [completeReceiptNote] = useCompleteReceiptNoteMutation({
    onCompleted: () => {
      messageApi?.success('Receipt note completed successfully');
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
    qtyColumn('Total Qty', 'totalQty'),
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
              title="Confirm stock in?"
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
        entityName="receipt notes"
        emptyHint="Receipt notes are created from a purchase order, then stocked in here."
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
