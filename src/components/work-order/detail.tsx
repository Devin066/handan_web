import { useEffect, useState } from 'react';
import { Drawer } from 'antd';
import { ProDescriptions, ProCard, ProTable } from '@ant-design/pro-components';

// locale
import { useWorkOrderLazyQuery } from '@/gql';
import { onError } from '@/utils';

const WorkOrderDetail = ({ uuid, visible, record, onClose }: any) => {
  const [entry, setEntry] = useState<any>({});

  useEffect(() => {
    if (!uuid) {
      return;
    }
    fetchWorkOrder({ variables: { request: { uuid } } });
  }, [uuid]); // eslint-disable-line

  const [fetchWorkOrder] = useWorkOrderLazyQuery({
    fetchPolicy: 'no-cache',
    onCompleted: (data: any) => {
      setEntry(data.workOrder);
    },
    onError,
  });

  const workOrderItemColumns = [
    {
      title: 'Name',
      dataIndex: 'itemName',
      key: 'itemName',
    },
    {
      title: 'Process Name',
      dataIndex: 'processName',
      key: 'processName',
    },
    {
      title: 'Required Qty',
      dataIndex: 'requiredQty',
      key: 'requiredQty',
    },
    {
      title: 'Completed Qty',
      dataIndex: 'producedQty',
      key: 'producedQty',
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
    },
  ];

  const materialRequestColumns = [
    {
      title: 'Material Name',
      dataIndex: 'itemName',
      key: 'itemName',
    },
    {
      title: 'Warehouse',
      dataIndex: ['warehouse', 'name'],
      key: 'warehouseName',
    },
    {
      title: 'Required Qty',
      dataIndex: 'actualQty',
      key: 'actualQty',
      render: (item: any, record: any) => (
        <div>
          {record.actualQty}
          {record.uomName}
        </div>
      ),
    },
    {
      title: 'Received Qty',
      dataIndex: 'receivedQty',
      key: 'receivedQty',
      render: (item: any, record: any) => (
        <div>
          {record.receivedQty}
          {record.uomName}
        </div>
      ),
    },
    {
      title: 'Pending Qty',
      dataIndex: 'remainingQty',
      key: 'remainingQty',
      render: (item: any, record: any) => (
        <div>
          {record.remainingQty}
          {record.uomName}
        </div>
      ),
    },
  ];

  return (
    <Drawer width={'60%'} title={entry?.code} onClose={onClose} open={visible} style={{ backgroundColor: '#f7f8fa' }}>
      <ProCard title="Basic Info" style={{ marginTop: '10px' }}>
        <ProDescriptions column={3} size="small">
          <ProDescriptions.Item label="Product">{entry.itemName}</ProDescriptions.Item>
          <ProDescriptions.Item label="Status">{entry.status}</ProDescriptions.Item>
          <ProDescriptions.Item label="Start Time" valueType="dateTime">
            {entry.startTime}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="End Time" valueType="dateTime">
            {entry.endTime}
          </ProDescriptions.Item>
        </ProDescriptions>
      </ProCard>

      <ProCard title="Work Order Info" style={{ marginTop: '10px' }}>
        <ProTable
          columns={workOrderItemColumns}
          dataSource={entry?.items}
          size="small"
          bordered={true}
          search={false}
          pagination={false}
          options={false}
        />
      </ProCard>
      <ProCard title="Material Requirements" style={{ marginTop: '10px' }}>
        <ProTable
          columns={materialRequestColumns}
          dataSource={entry?.materialRequests}
          size="small"
          bordered={true}
          search={false}
          pagination={false}
          options={false}
        />
      </ProCard>
    </Drawer>
  );
};

export default WorkOrderDetail;
