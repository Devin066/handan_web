import { useEffect, useState } from 'react';
import { Drawer, TabsProps, Tabs } from 'antd';
import { ProDescriptions, ProCard, ProTable } from '@ant-design/pro-components';
import size from 'lodash.size';

// locale
import { useBomLazyQuery } from '@/gql';
import { onError } from '@/utils';

const BomDetail = ({ uuid, visible, record, onClose }: any) => {
  const [entry, setEntry] = useState<any>({});

  useEffect(() => {
    if (!uuid) {
      return;
    }
    fetchBom({ variables: { request: { uuid } } });
  }, [uuid]); // eslint-disable-line

  const [fetchBom] = useBomLazyQuery({
    fetchPolicy: 'no-cache',
    onCompleted: (data: any) => {
      setEntry(data.bom);
    },
    onError,
  });

  const bomItemColumns = [
    {
      title: 'Name',
      dataIndex: 'itemName',
      key: 'itemName',
    },
    {
      title: 'Qty',
      dataIndex: 'qty',
      key: 'qty',
    },
    {
      title: 'UOM',
      dataIndex: 'uomName',
      key: 'uomName',
    },
  ];

  const bomProcessColumns = [
    {
      title: 'Process Name',
      dataIndex: 'processName',
      key: 'processName',
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
    },
  ];

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: `BOM Items(${size(entry?.bomItems)})`,
      children: (
        <ProTable
          columns={bomItemColumns}
          dataSource={entry?.bomItems}
          size="small"
          bordered={true}
          search={false}
          pagination={false}
          options={false}
        />
      ),
    },
    {
      key: '2',
      label: `Processes(${size(entry?.bomProcesses)})`,
      children: (
        <ProTable
          columns={bomProcessColumns}
          dataSource={entry?.bomProcesses}
          size="small"
          bordered={true}
          search={false}
          pagination={false}
          options={false}
        />
      ),
    },
  ];

  return (
    <Drawer width={'60%'} title={entry?.uuid} onClose={onClose} open={visible} style={{ backgroundColor: '#f7f8fa' }}>
      <ProCard title="Basic Info" style={{ marginTop: '10px' }}>
        <ProDescriptions column={3} size="small">
          <ProDescriptions.Item label="BOM Name">{entry?.name}</ProDescriptions.Item>
          <ProDescriptions.Item label="Item Name">{entry?.itemName}</ProDescriptions.Item>
        </ProDescriptions>
      </ProCard>

      <ProCard style={{ marginTop: '10px' }}>
        <Tabs defaultActiveKey="1" items={items} />
      </ProCard>
    </Drawer>
  );
};

export default BomDetail;
