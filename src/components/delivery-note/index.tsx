import { useRef, useState } from 'react';
import { useRouter } from 'next/router';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Popconfirm, Button } from 'antd';

// locale
import { useMessageContext } from '@/components/common/message-context';
import client from '@/gql/apollo';
import { useCompleteDeliveryNoteMutation, DeliveryNotesDocument } from '@/gql';
import { onError } from '@/utils';
import { deliveryNoteStatusEnum } from '@/utils/enum';
import DataTable from '@/components/shared/data-table';
import { codeColumn, qtyColumn, statusColumn } from '@/components/shared/columns';

import DeliveryNoteDetail from './detail';

const DeliveryNoteList: React.FC = () => {
  const { messageApi } = useMessageContext();
  const router = useRouter();

  const [detailVisible, setDetailVisible] = useState(false);
  const [record, setRecord] = useState<any>({});

  const [completeDeliveryNote] = useCompleteDeliveryNoteMutation({
    onCompleted: () => {
      messageApi?.success('Delivery note completed successfully');
      handleReloadTable();
    },
    onError,
  });

  const actionRef = useRef<ActionType | null>(null);

  const handleReloadTable = () => {
    actionRef.current?.reload();
  };

  const handleCompleteDeliveryNote = async (values: any) => {
    const request = {
      salesOrderUuid: values.salesOrderUuid,
      deliveryNoteUuid: values.uuid,
    };

    await completeDeliveryNote({ variables: { request } });
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
      title: 'Customer Name',
      dataIndex: 'customerName',
    },
    qtyColumn('Total Qty', 'totalQty'),
    statusColumn('Status', 'status', deliveryNoteStatusEnum, { width: 170 }),
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
          {record.status === 'to_deliver' && (
            <Popconfirm
              key="link2"
              title="Confirm completion?"
              onConfirm={() => handleCompleteDeliveryNote(record)}
              okText="Yes"
              cancelText="No"
            >
              <Button size="small" type="link">
                Stock Out
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
        entityName="delivery notes"
        emptyHint="Delivery notes are created from a sales order, then stocked out here."
        actionRef={actionRef}
        columns={columns}
        request={async (params, sorter, filter) => {
          const { data } = await client.query({
            query: DeliveryNotesDocument,
            variables: {
              request: {},
            },
          });

          return {
            data: data.deliveryNotes,
            total: data.deliveryNotes.length,
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

export default DeliveryNoteList;
