import { useEffect, useState } from 'react';
import { Drawer } from 'antd';
import { ProDescriptions, ProCard, ProTable } from '@ant-design/pro-components';

// locale
import { useWorkOrderItemLazyQuery } from '@/gql';
import { onError } from '@/utils';

const WorkOrderDetail = ({ uuid, visible, record, onClose }: any) => {
  const [entry, setEntry] = useState<any>({});

  useEffect(() => {
    if (!uuid) {
      return;
    }
    fetchWorkOrderItem({ variables: { request: { uuid } } });
  }, [uuid]); // eslint-disable-line

  const [fetchWorkOrderItem] = useWorkOrderItemLazyQuery({
    fetchPolicy: 'no-cache',
    onCompleted: (data: any) => {
      setEntry(data.workOrderItem);
    },
    onError,
  });

  const jobCardColumns = [
    {
      title: 'Operator',
      key: 'operatorStaffUuid',
      dataIndex: ['operatorStaff', 'email'],
    },
    {
      title: 'Produced Qty',
      dataIndex: 'producedQty',
      key: 'producedQty',
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      valueType: 'dateTime',
      key: 'startTime',
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      valueType: 'dateTime',
      key: 'endTime',
    },
  ];

  return (
    <Drawer width={'60%'} title={entry?.uuid} onClose={onClose} open={visible} style={{ backgroundColor: '#f7f8fa' }}>
      <ProCard title="Basic Info" style={{ marginTop: '10px' }}>
        <ProDescriptions column={3} size="small">
          <ProDescriptions.Item label="Product Name">{entry.itemName}</ProDescriptions.Item>
          <ProDescriptions.Item label="Process Name">{entry.processName}</ProDescriptions.Item>
          <ProDescriptions.Item label="Position">{entry.position}</ProDescriptions.Item>
          <ProDescriptions.Item label="Qty">{entry.requiredQty}</ProDescriptions.Item>
          {/* <ProDescriptions.Item label="Defective Qty">{entry.defectiveQty}</ProDescriptions.Item> */}
          <ProDescriptions.Item label="Produced Qty">{entry.producedQty}</ProDescriptions.Item>
        </ProDescriptions>
      </ProCard>

      <ProCard title="Report Job Card" style={{ marginTop: '10px' }}>
        <ProTable
          columns={jobCardColumns}
          dataSource={entry?.jobCards}
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
