import { useRef, useState } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Popconfirm, Button } from 'antd';
import size from 'lodash.size';

// locale
import { useMessageContext } from '@/components/common/message-context';
import client from '@/gql/apollo';
import {
  useCreateSalesOrderMutation,
  SalesOrdersDocument,
  useCreateDeliveryNoteMutation,
  useCreateSalesInvoiceMutation,
} from '@/gql';
import { onError } from '@/utils';
import { fetchCustomers } from '@/utils/api';
import { salesOrderStatusEnum, salesOrderDeliveryStatusEnum, salesOrderBillingStatusEnum } from '@/utils/enum';
import DataTable from '@/components/shared/data-table';
import { amountBreakdownColumn, codeColumn, progressColumn, statusColumn } from '@/components/shared/columns';

import SalesOrderNew from './new';
import SalesOrderDetail from './detail';
import SalesInvoiceNew from './invoice-new';

const SalesOrderList: React.FC = () => {
  const { messageApi } = useMessageContext();

  const [detailVisible, setDetailVisible] = useState(false);
  const [record, setRecord] = useState<any>(null);

  const [createSalesOrder] = useCreateSalesOrderMutation({
    onCompleted: () => {
      messageApi?.success('Sales order created successfully');
      handleReloadTable();
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

  const [createSalesInvoice] = useCreateSalesInvoiceMutation({
    onCompleted: () => {
      messageApi?.success('Payment receipt created successfully');
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

  const handleCreateSalesInvoice = async (request: any) => {
    await createSalesInvoice({ variables: { request } });
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
          {record.status !== 'draft' && record.billingStatus != 'fully_billed' && (
            <SalesInvoiceNew key="sales-invoice-new" record={record} onCallback={handleCreateSalesInvoice} />
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
        request={async (params, sorter, filter) => {
          const { data } = await client.query({
            query: SalesOrdersDocument,
            variables: {
              request: {},
            },
          });

          return {
            data: data.salesOrders,
            total: size(data.salesOrders),
            success: true,
          };
        }}
        toolBarRender={() => [<SalesOrderNew key="sales-order-new" onCreate={(values: any) => handleCreate(values)} />]}
      />

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
