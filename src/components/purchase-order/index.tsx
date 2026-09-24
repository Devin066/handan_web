import { useRef, useState } from 'react';
import { useRouter } from 'next/router';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Popconfirm, Button } from 'antd';

// locale
import { useMessageContext } from '@/components/common/message-context';
import client from '@/gql/apollo';
import {
  useCreatePurchaseOrderMutation,
  useCreateReceiptNoteMutation,
  useCreatePurchaseInvoiceMutation,
  PurchaseOrdersDocument,
} from '@/gql';
import { onError } from '@/utils';
import { purchaseOrderStatusEnum, purchaseOrderReceiptStatusEnum, purchaseOrderBillingStatusEnum } from '@/utils/enum';
import DataTable from '@/components/shared/data-table';
import { amountBreakdownColumn, codeColumn, progressColumn, statusColumn } from '@/components/shared/columns';

import PurchaseOrderNew from './new';
import PurchaseOrderDetail from './detail';
import PurchaseInvoiceNew from './invoice-new';

const PurchaseOrderList: React.FC = () => {
  const { messageApi } = useMessageContext();
  const router = useRouter();

  const [detailVisible, setDetailVisible] = useState(false);
  const [record, setRecord] = useState<any>(null);

  const [createPurchaseOrder] = useCreatePurchaseOrderMutation({
    onCompleted: () => {
      messageApi?.success('Purchase order created successfully');
      handleReloadTable();
    },
    onError,
  });

  const [createReceiptNote] = useCreateReceiptNoteMutation({
    onCompleted: () => {
      messageApi?.success('Goods receipt created');
      handleReloadTable();
    },
    onError,
  });

  const [createPurchaseInvoice] = useCreatePurchaseInvoiceMutation({
    onCompleted: () => {
      messageApi?.success('Purchase invoice created successfully');
      handleReloadTable();
    },
    onError,
  });

  const handleDetail = (record: any) => {
    setDetailVisible(true);
    setRecord(record);
  };

  const actionRef = useRef<ActionType | null>(null);

  const handleReloadTable = () => {
    actionRef.current?.reload();
  };

  const handleCreate = async (values: any) => {
    await createPurchaseOrder({ variables: { request: values } });
  };

  const handleReceiptNote = async (values: any) => {
    const receiptItems = values.items.map((item: any) => ({
      purchaseOrderItemUuid: item.uuid,
      actualQty: item.orderedQty,
    }));

    const request = {
      purchaseOrderUuid: values.uuid,
      receiptItems,
    };

    await createReceiptNote({ variables: { request } });
  };

  const handleInvoice = async (request: any) => {
    await createPurchaseInvoice({ variables: { request } });
  };

  const columns: ProColumns<any>[] = [
    codeColumn('No.', 'code', handleDetail),
    {
      title: 'Supplier Name',
      key: 'supplierName',
      dataIndex: 'supplierName',
    },
    statusColumn('Status', 'status', purchaseOrderStatusEnum, { width: 170 }),
    statusColumn('Receipt', 'receiptStatus', purchaseOrderReceiptStatusEnum),
    statusColumn('Payment', 'billingStatus', purchaseOrderBillingStatusEnum),
    progressColumn('Received', 'receivedQty', 'totalQty'),
    amountBreakdownColumn('Amount', {
      due: 'remainingAmount',
      paid: 'paidAmount',
      total: 'totalAmount',
    }),
    {
      title: 'Warehouse',
      dataIndex: 'warehouseName',
    },
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
            <PurchaseInvoiceNew key="purchase-invoice-new" record={record} onCallback={handleInvoice} />
          )}
        </>,
        <>
          {record.status !== 'draft' && record.receiptStatus != 'fully_received' && (
            <Popconfirm
              key="link2"
              title="Confirm stock in?"
              onConfirm={() => handleReceiptNote(record)}
              okText="Yes"
              cancelText="No"
            >
              <Button size="small" type="link">
                Add Goods Receipt
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
        entityName="purchase orders"
        emptyHint="Raise a purchase order to bring stock in from a supplier."
        actionRef={actionRef}
        columns={columns}
        request={async (params, sorter, filter) => {
          const { data } = await client.query({
            query: PurchaseOrdersDocument,
            variables: {
              request: {},
            },
          });

          return {
            data: data.purchaseOrders,
            total: data.purchaseOrders.length,
            success: true,
          };
        }}
        toolBarRender={() => [
          <PurchaseOrderNew key="purchase-order-new" onCreate={(values: any) => handleCreate(values)} />,
        ]}
      />
      <PurchaseOrderDetail
        uuid={record?.uuid}
        visible={detailVisible}
        record={record}
        onClose={() => setDetailVisible(false)}
      />
    </>
  );
};

export default PurchaseOrderList;
