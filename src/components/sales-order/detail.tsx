import { useEffect, useState } from 'react';
import { Drawer, TabsProps, Tabs } from 'antd';
import { ProDescriptions, ProCard, ProTable } from '@ant-design/pro-components';
import size from 'lodash.size';

// locale
import { useSalesOrderLazyQuery } from '@/gql';
import { onError } from '@/utils';

const SalesOrderDetail = ({ uuid, visible, record, onClose }: any) => {
  const [entry, setEntry] = useState<any>({});

  useEffect(() => {
    if (!uuid) {
      return;
    }
    fetchSalesOrder({ variables: { request: { salesOrderUuid: uuid } } });
  }, [uuid]); // eslint-disable-line

  const [fetchSalesOrder] = useSalesOrderLazyQuery({
    fetchPolicy: 'no-cache',
    onCompleted: (data: any) => {
      setEntry(data.salesOrder);
    },
    onError,
  });

  const salesOrderItemColumns = [
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
      key: 'unitPrice',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
    },
  ];

  const deliveryNoteColumns = [
    {
      title: 'No.',
      dataIndex: 'code',
      width: '100px',
      key: 'code',
    },
    {
      title: 'Delivered Qty',
      dataIndex: 'totalQty',
      key: 'totalQty',
    },
    // {
    //   title: 'Item Name',
    //   dataIndex: 'itemName',
    //   key: 'itemName',
    // },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
  ];

  const salesInvoiceColumins = [
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
          columns={salesOrderItemColumns}
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
      label: `Delivery Notes(${size(entry?.deliveryNotes)})`,
      children: (
        <ProTable
          columns={deliveryNoteColumns}
          dataSource={entry?.deliveryNotes}
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
      label: `Receipt Vouchers(${size(entry?.salesInvoices)})`,
      children: (
        <ProTable
          columns={salesInvoiceColumins}
          dataSource={entry?.salesInvoices}
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
          <ProDescriptions.Item label="Customer Name">{entry?.customerName}</ProDescriptions.Item>
          <ProDescriptions.Item label="Status">{entry.status}</ProDescriptions.Item>
          <ProDescriptions.Item label="Payment Status">{entry.billingStatus}</ProDescriptions.Item>
          <ProDescriptions.Item label="Delivery Status">{entry.deliveryStatus}</ProDescriptions.Item>
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

export default SalesOrderDetail;
