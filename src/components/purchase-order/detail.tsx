import { useEffect, useState } from 'react';
import { Drawer, TabsProps, Tabs } from 'antd';
import { ProDescriptions, ProCard, ProTable } from '@ant-design/pro-components';
import size from 'lodash.size';

// locale
import { usePurchaseOrderLazyQuery } from '@/gql';
import { onError } from '@/utils';

const PurchaseOrderDetail = ({ uuid, visible, record, onClose }: any) => {
  const [entry, setEntry] = useState<any>({});

  useEffect(() => {
    if (!uuid) {
      return;
    }
    fetchPurchaseOrder({ variables: { request: { purchaseOrderUuid: uuid } } });
  }, [uuid]); // eslint-disable-line

  const [fetchPurchaseOrder] = usePurchaseOrderLazyQuery({
    fetchPolicy: 'no-cache',
    onCompleted: (data: any) => {
      setEntry(data.purchaseOrder);
    },
    onError,
  });

  const purchaseOrderItemColumns = [
    {
      title: 'Item Name',
      dataIndex: 'itemName',
      key: 'itemName',
    },
    {
      title: 'Qty',
      dataIndex: 'orderedQty',
      key: 'orderedQty',
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      valueType: 'money',
      key: 'unitPrice',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      valueType: 'money',
      key: 'amount',
    },
  ];

  const receiptNoteColumns = [
    {
      title: 'No.',
      dataIndex: 'code',
      width: '100px',
      key: 'code',
    },
    {
      title: 'Received Qty',
      dataIndex: 'totalQty',
      key: 'totalQty',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
  ];

  const purchaseInvoiceColumins = [
    {
      title: 'No.',
      dataIndex: 'code',
      width: '100px',
      key: 'code',
    },
    {
      title: 'Amount',
      valueType: 'money',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
  ];

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: `Items(${size(entry?.items)})`,
      children: (
        <ProTable
          columns={purchaseOrderItemColumns}
          dataSource={entry?.items}
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
      label: `Receipt Notes(${size(entry?.receiptNotes)})`,
      children: (
        <ProTable
          columns={receiptNoteColumns}
          dataSource={entry?.receiptNotes}
          size="small"
          bordered={true}
          search={false}
          pagination={false}
          options={false}
        />
      ),
    },
    {
      key: '3',
      label: `Payment Vouchers(${size(entry?.purchaseInvoices)})`,
      children: (
        <ProTable
          columns={purchaseInvoiceColumins}
          dataSource={entry?.purchaseInvoices}
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
    <Drawer width={'60%'} title={entry?.code} onClose={onClose} open={visible} style={{ backgroundColor: '#f7f8fa' }}>
      <ProCard title="Basic Info" style={{ marginTop: '10px' }}>
        <ProDescriptions column={3} size="small">
          <ProDescriptions.Item label="Supplier Name">{entry?.supplierName}</ProDescriptions.Item>
          <ProDescriptions.Item label="Status">{entry.status}</ProDescriptions.Item>
          <ProDescriptions.Item label="Receipt Status">{entry.receiptStatus}</ProDescriptions.Item>
          <ProDescriptions.Item label="Payment Status">{entry.billingStatus}</ProDescriptions.Item>
          <ProDescriptions.Item label="Status">{entry.status}</ProDescriptions.Item>
          <ProDescriptions.Item label="Warehouse">{entry.warehouseName}</ProDescriptions.Item>
          <ProDescriptions.Item label="Created At" valueType="dateTime">
            {entry.insertedAt}
          </ProDescriptions.Item>
        </ProDescriptions>
      </ProCard>

      <ProCard style={{ marginTop: '10px' }}>
        <Tabs defaultActiveKey="1" items={items} />
      </ProCard>
    </Drawer>
  );
};

export default PurchaseOrderDetail;
