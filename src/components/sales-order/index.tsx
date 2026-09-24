import Link from 'next/link';
import { useRef, useState } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Popconfirm, Button, Space } from 'antd';
import dayjs from 'dayjs';
import size from 'lodash.size';

// locale
import { useMessageContext } from '@/components/common/message-context';
import client from '@/gql/apollo';
import { useCreateSalesOrderMutation, SalesOrdersDocument, useCreateDeliveryNoteMutation } from '@/gql';
import { onError } from '@/utils';
import { fetchCustomers } from '@/utils/api';
import {
  deliveryRiskEnum,
  salesOrderStatusEnum,
  salesOrderDeliveryStatusEnum,
  salesOrderBillingStatusEnum,
} from '@/utils/enum';
import DataTable from '@/components/shared/data-table';
import {
  StatusBadge,
  amountBreakdownColumn,
  codeColumn,
  progressColumn,
  statusColumn,
} from '@/components/shared/columns';

import SalesOrderNew from './new';
import SalesOrderDetail from './detail';
import WorkOrderPrompt from './work-order-prompt';

const SalesOrderList: React.FC = () => {
  const { messageApi } = useMessageContext();

  const [detailVisible, setDetailVisible] = useState(false);
  const [record, setRecord] = useState<any>(null);
  const [workOrdersFor, setWorkOrdersFor] = useState<string | undefined>();

  const [createSalesOrder] = useCreateSalesOrderMutation({
    onCompleted: (data) => {
      const order = data.createSalesOrder;
      messageApi?.success(`${order?.code} created with invoice ${order?.salesInvoiceCode}`);
      handleReloadTable();
      // Straight on to the shop floor for anything that has to be made.
      setWorkOrdersFor(order?.uuid ?? undefined);
    },
    onError,
  });

  const [createDeliveryNote] = useCreateDeliveryNoteMutation({
    onCompleted: () => {
      messageApi?.success('Delivery note created successfully');
      handleReloadTable();
    },
    onError,
  });

  const actionRef = useRef<ActionType | null>(null);

  const handleReloadTable = () => {
    actionRef.current?.reload();
  };

  const handleCreate = async (values: any) => {
    await createSalesOrder({ variables: { request: values } });
  };

  const handleCreateDeliveryNote = async (values: any) => {
    const deliveryItems = values.items.map((item: any) => ({
      salesOrderItemUuid: item.uuid,
      actualQty: item.orderedQty,
    }));

    const request = {
      salesOrderUuid: values.uuid,
      deliveryItems,
    };

    await createDeliveryNote({ variables: { request } });
  };

  const handleDetail = (record: any) => {
    setDetailVisible(true);
    setRecord(record);
  };

  const columns: ProColumns<any>[] = [
    codeColumn('No.', 'code', handleDetail),
    {
      title: 'Customer Name',
      key: 'customerUuid',
      dataIndex: 'customerName',
      valueType: 'select',
      request: () => fetchCustomers({}),
    },
    statusColumn('Status', 'status', salesOrderStatusEnum, { width: 170 }),
    {
      title: 'Target Date',
      dataIndex: 'requiredDate',
      width: 150,
      render: (_: any, r: any) =>
        r.requiredDate ? (
          <Space direction="vertical" size={0}>
            <span>{dayjs(r.requiredDate).format('YYYY-MM-DD')}</span>
            {r.deliveryRisk && r.deliveryRisk !== 'on_track' ? (
              <StatusBadge value={r.deliveryRisk} valueEnum={deliveryRiskEnum} />
            ) : null}
          </Space>
        ) : (
          '—'
        ),
    },
    {
      title: 'Invoice',
      dataIndex: 'salesInvoiceCode',
      render: (_: any, r: any) => r.salesInvoiceCode ?? '—',
    },
    statusColumn('Delivery', 'deliveryStatus', salesOrderDeliveryStatusEnum),
    statusColumn('Payment', 'billingStatus', salesOrderBillingStatusEnum),
    progressColumn('Delivered', 'deliveredQty', 'totalQty'),
    {
      title: 'Warehouse',
      dataIndex: 'warehouseName',
    },
    amountBreakdownColumn('Amount', {
      due: 'remainingAmount',
      paid: 'paidAmount',
      total: 'totalAmount',
    }),
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
          {record.status !== 'cancelled' && record.deliveryStatus != 'fully_delivered' && (
            <Button key="work-orders" size="small" type="link" onClick={() => setWorkOrdersFor(record.uuid)}>
              Work Orders
            </Button>
          )}
        </>,
        <>
          {record.status !== 'draft' && record.deliveryStatus != 'fully_delivered' && (
            <Popconfirm
              key="link2"
              title="Confirm stock out?"
              onConfirm={() => handleCreateDeliveryNote(record)}
              okText="Yes"
              cancelText="No"
            >
              <Button size="small" type="link">
                Add Delivery Note
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
        entityName="sales orders"
        emptyHint="Create a sales order to start the order-to-cash flow."
        actionRef={actionRef}
        columns={columns}
        request={async () => {
          const { data } = await client.query({
            query: SalesOrdersDocument,
            fetchPolicy: 'network-only',
          });

          return {
            data: data.salesOrders,
            total: size(data.salesOrders),
            success: true,
          };
        }}
        toolBarRender={() => [
          <Link key="delivery-notes" href="/stock/delivery-notes">
            <Button size="small">Delivery Notes</Button>
          </Link>,
          <SalesOrderNew key="sales-order-new" onCreate={(values: any) => handleCreate(values)} />,
        ]}
      />

      <WorkOrderPrompt salesOrderUuid={workOrdersFor} onClose={() => setWorkOrdersFor(undefined)} />

      <SalesOrderDetail
        uuid={record?.uuid}
        visible={detailVisible}
        record={record}
        onClose={() => setDetailVisible(false)}
      />
    </>
  );
};

export default SalesOrderList;
