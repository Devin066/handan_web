import { useEffect, useState } from 'react';
import { Drawer, TabsProps, Tabs } from 'antd';
import { ProDescriptions, ProCard, ProTable } from '@ant-design/pro-components';
import size from 'lodash.size';

// locale
import { useBomLazyQuery, useBomLevelsQuery } from '@/gql';
import { itemTypeEnum } from '@/utils/enum';
import { formatQty } from '@/utils/format';
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

  const levels = useBomLevelsQuery({
    skip: !uuid || !visible,
    variables: { request: { uuid } },
  });

  const items: TabsProps['items'] = [
    {
      key: 'levels',
      label: 'Structure',
      children: (
        <ProTable
          rowKey={(r: any, i?: number) => `${r.level}-${r.itemName}-${i}`}
          columns={[
            {
              title: 'Level',
              dataIndex: 'level',
              width: 70,
              render: (_: any, r: any) => <span className="tabular-figures">{r.level}</span>,
            },
            {
              title: 'Component',
              dataIndex: 'itemName',
              render: (_: any, r: any) => (
                <span
                  style={{
                    paddingLeft: r.level * 16,
                    fontWeight: r.level === 0 ? 600 : undefined,
                  }}
                >
                  {r.itemName}
                  {r.bomCode ? (
                    <span className="doc-code" style={{ marginLeft: 8 }}>
                      {r.bomCode}
                    </span>
                  ) : null}
                </span>
              ),
            },
            {
              title: 'Class',
              dataIndex: 'itemType',
              render: (_: any, r: any) => itemTypeEnum[r.itemType]?.prefix ?? '—',
            },
            {
              title: 'Qty per Kit',
              dataIndex: 'qty',
              align: 'right',
              render: (_: any, r: any) => <span className="tabular-figures">{formatQty(r.qty)}</span>,
            },
          ]}
          dataSource={(levels.data?.bom?.levels ?? []) as any[]}
          loading={levels.loading}
          size="small"
          search={false}
          pagination={false}
          options={false}
        />
      ),
    },
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
    <Drawer
      width="min(960px, 100vw)"
      title={entry?.code ? `${entry.code} · ${entry.name}` : entry?.name}
      onClose={onClose}
      open={visible}
    >
      <ProCard title="Basic Info" style={{ marginTop: '10px' }}>
        <ProDescriptions column={{ xs: 1, sm: 2, lg: 3 }} size="small">
          <ProDescriptions.Item label="BOM Name">{entry?.name}</ProDescriptions.Item>
          <ProDescriptions.Item label="Item Name">{entry?.itemName}</ProDescriptions.Item>
        </ProDescriptions>
      </ProCard>

      <ProCard style={{ marginTop: '10px' }}>
        <Tabs defaultActiveKey="levels" items={items} />
      </ProCard>
    </Drawer>
  );
};

export default BomDetail;
