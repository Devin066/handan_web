import { useRef, useState } from 'react';
import { Button, Popconfirm } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-components';

// locale
import { useMessageContext } from '@/components/common/message-context';
import client from '@/gql/apollo';
import {
  WorkOrdersDocument,
  useCreateWorkOrderMutation,
  useStoreFinishItemMutation,
  useScheduleWorkOrderMutation,
} from '@/gql';
import { onError } from '@/utils';
import { workOrderStatusEnum } from '@/utils/enum';
import DataTable from '@/components/shared/data-table';
import { codeColumn, progressColumn, qtyColumn, statusColumn } from '@/components/shared/columns';

import WorkOrderNew from './new';
import WorkOrderDetail from './detail';
import StoredItem from './stored-item';

const WorkOrderList: React.FC = () => {
  const { messageApi } = useMessageContext();

  const [detailVisible, setDetailVisible] = useState(false);
  const [record, setRecord] = useState<any>(null);

  const [storeFinishItem] = useStoreFinishItemMutation({
    onCompleted: () => {
      messageApi?.success('Stocked in successfully');
      handleReloadTable();
    },
    onError,
  });

  const [createWorkOrder] = useCreateWorkOrderMutation({
    onCompleted: () => {
      messageApi?.success('Work order created successfully');
      handleReloadTable();
    },
    onError,
  });

  const [scheduleWorkOrder] = useScheduleWorkOrderMutation({
    onCompleted: () => {
      messageApi?.success('Scheduled successfully');
      handleReloadTable();
    },
    onError,
  });

  const actionRef = useRef<ActionType | null>(null);

  const handleReloadTable = () => {
    actionRef.current?.reload();
  };

  const handleCreate = async (values: any) => {
    await createWorkOrder({ variables: { request: values } });
  };

  const handleDetail = (record: any) => {
    setDetailVisible(true);
    setRecord(record);
  };

  const handleStoredItem = async (values: any) => {
    await storeFinishItem({ variables: { request: values } });
  };

  const handleScheduleWorkOrder = async (values: any) => {
    const request = {
      workOrderUuid: values.uuid,
    };

    await scheduleWorkOrder({ variables: { request } });
  };

  const columns: ProColumns<any>[] = [
    codeColumn('No.', 'code', handleDetail),
    {
      title: 'Product Name',
      key: 'itemName',
      dataIndex: 'itemName',
    },
    statusColumn('Status', 'status', workOrderStatusEnum, { width: 150 }),
    qtyColumn('Planned', 'plannedQty', 'uomName'),
    progressColumn('Produced', 'producedQty', 'plannedQty'),
    progressColumn('Stored', 'storedQty', 'plannedQty'),
    {
      title: 'Assigned to',
      dataIndex: 'assignedStaffName',
      render: (_: any, r: any) => r.assignedStaffName ?? '—',
    },
    {
      title: 'Sales order',
      dataIndex: 'salesOrderCode',
      render: (_: any, r: any) => r.salesOrderCode ?? 'For stock',
    },
    { title: 'Due', dataIndex: 'dueDate', valueType: 'date' },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      valueType: 'date',
      width: 120,
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      valueType: 'date',
      width: 120,
    },
    {
      title: 'Created At',
      valueType: 'dateTime',
      dataIndex: 'insertedAt',
    },
    {
      title: 'Actions',
      width: 180,
      key: 'option',
      valueType: 'option',
      render: (item: any, record: any) => [
        <>
          {record.status === 'draft' && (
            <Popconfirm
              key="link2"
              title="Confirm scheduling?"
              onConfirm={() => handleScheduleWorkOrder(record)}
              okText="Yes"
              cancelText="No"
            >
              <Button size="small" type="link">
                Start Scheduling
              </Button>
            </Popconfirm>
          )}
        </>,
        <>
          {record.status === 'scheduling' && (
            <Button size="small" type="link" onClick={() => handleDetail(record)}>
              View Material Requirements
            </Button>
          )}
        </>,
        <>
          {record.producedQty > record.storedQty && (
            <StoredItem key="link2" record={record} onCreate={handleStoredItem} />
          )}
        </>,
      ],
    },
  ];

  return (
    <>
      <DataTable
        entityName="work orders"
        emptyHint="Create a work order from a BOM to start production."
        actionRef={actionRef}
        columns={columns}
        request={async (params, sorter, filter) => {
          const { data } = await client.query({
            query: WorkOrdersDocument,
            variables: {
              request: {},
            },
          });

          return {
            data: data.workOrders,
            total: data.workOrders.length,
            success: true,
          };
        }}
        toolBarRender={() => [<WorkOrderNew key="work-order-new" onCreate={(values: any) => handleCreate(values)} />]}
      />
      <WorkOrderDetail
        uuid={record?.uuid}
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        onChanged={handleReloadTable}
      />
    </>
  );
};

export default WorkOrderList;
