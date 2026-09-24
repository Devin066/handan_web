import { formatCurrency } from '@/utils/format';
import { StatusBadge } from '@/components/shared/columns';
import { receiptNoteStatusEnum } from '@/utils/enum';
import { useEffect, useState } from 'react';
import { Drawer, TabsProps, Tabs } from 'antd';
import { ProDescriptions, ProCard, ProTable } from '@ant-design/pro-components';
import size from 'lodash.size';

// locale
import { useReceiptNoteLazyQuery } from '@/gql';
import { onError } from '@/utils';

const ReceiptNoteDetail = ({ uuid, visible, record, onClose }: any) => {
  const [entry, setEntry] = useState<any>({});

  useEffect(() => {
    if (!uuid) {
      return;
    }
    fetchReceiptNote({ variables: { request: { receiptNoteUuid: uuid } } });
  }, [uuid]); // eslint-disable-line

  const [fetchReceiptNote] = useReceiptNoteLazyQuery({
    fetchPolicy: 'no-cache',
    onCompleted: (data: any) => {
      setEntry(data.receiptNote);
    },
    onError,
  });

  const receiptNoteItemColumns = [
    {
      title: 'Item Name',
      dataIndex: 'itemName',
      key: 'itemName',
    },
    {
      title: 'Qty',
      dataIndex: 'actualQty',
      key: 'actualQty',
      render: (text: any, record: any) => (
        <span>
          {record.actualQty} {record.uomName}
        </span>
      ),
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      align: 'right' as const,
      // Not valueType 'money': that always uses the locale's $, ignoring the company currency.
      renderText: (value: unknown) => <span className="tabular-figures">{formatCurrency(value)}</span>,
      key: 'unitPrice',
    },
    {
      title: 'Amount',
      align: 'right' as const,
      // Not valueType 'money': that always uses the locale's $, ignoring the company currency.
      renderText: (value: unknown) => <span className="tabular-figures">{formatCurrency(value)}</span>,
      dataIndex: 'amount',
      key: 'amount',
    },
  ];

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: `Items(${size(entry?.items)})`,
      children: (
        <ProTable
          columns={receiptNoteItemColumns}
          dataSource={entry?.items}
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
    <Drawer width="min(960px, 100vw)" title={entry?.uuid} onClose={onClose} open={visible}>
      <ProCard title="Basic Info" style={{ marginTop: '10px' }}>
        <ProDescriptions column={{ xs: 1, sm: 2, lg: 3 }} size="small">
          <ProDescriptions.Item label="Supplier Name">{entry?.supplierName}</ProDescriptions.Item>
          <ProDescriptions.Item label="Status">
            <StatusBadge value={entry.status} valueEnum={receiptNoteStatusEnum} />
          </ProDescriptions.Item>
          <ProDescriptions.Item label="Warehouse Name">{entry.warehouseName}</ProDescriptions.Item>
        </ProDescriptions>
      </ProCard>

      <ProCard style={{ marginTop: '10px' }}>
        <Tabs defaultActiveKey="1" items={items} />
      </ProCard>
    </Drawer>
  );
};

export default ReceiptNoteDetail;
