import { formatCurrency } from '@/utils/format';
import { StatusBadge } from '@/components/shared/columns';
import { purchaseOrderStatusEnum, purchaseOrderReceiptStatusEnum, purchaseOrderBillingStatusEnum } from '@/utils/enum';
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
      align: 'right' as const,
      // Not valueType 'money': that always uses the locale's $, ignoring the company currency.
      renderText: (value: unknown) => <span className="tabular-figures">{formatCurrency(value)}</span>,
      key: 'unitPrice',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      align: 'right' as const,
      // Not valueType 'money': that always uses the locale's $, ignoring the company currency.
      renderText: (value: unknown) => <span className="tabular-figures">{formatCurrency(value)}</span>,
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
      align: 'right' as const,
      // Not valueType 'money': that always uses the locale's $, ignoring the company currency.
      renderText: (value: unknown) => <span className="tabular-figures">{formatCurrency(value)}</span>,
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
    <Drawer width="min(960px, 100vw)" title={entry?.code} onClose={onClose} open={visible}>
      <ProCard title="Basic Info" style={{ marginTop: '10px' }}>
        <ProDescriptions column={{ xs: 1, sm: 2, lg: 3 }} size="small">
          <ProDescriptions.Item label="Supplier Name">{entry?.supplierName}</ProDescriptions.Item>
          <ProDescriptions.Item label="Status">
            <StatusBadge value={entry.status} valueEnum={purchaseOrderStatusEnum} />
          </ProDescriptions.Item>
          <ProDescriptions.Item label="Receipt Status">
            <StatusBadge value={entry.receiptStatus} valueEnum={purchaseOrderReceiptStatusEnum} />
          </ProDescriptions.Item>
          <ProDescriptions.Item label="Payment Status">
            <StatusBadge value={entry.billingStatus} valueEnum={purchaseOrderBillingStatusEnum} />
          </ProDescriptions.Item>
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
