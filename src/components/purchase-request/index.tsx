import { useRef, useState } from 'react';
import dayjs from 'dayjs';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Typography,
} from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

import client from '@/gql/apollo';
import {
  PurchaseRequestsDocument,
  useCreatePurchaseRequestMutation,
  useItemsQuery,
  useReviewPurchaseRequestMutation,
} from '@/gql';
import DataTable from '@/components/shared/data-table';
import { codeColumn, statusColumn } from '@/components/shared/columns';
import { useMessageContext } from '@/components/common/message-context';
import { purchaseRequestStatusEnum } from '@/utils/enum';
import { formatCurrency, formatQty } from '@/utils/format';
import { onError } from '@/utils';

const { Text } = Typography;

/** Raise a request for stock. Prices are estimated server-side from supplier records. */
const PurchaseRequestNew = ({ onCreated }: { onCreated: () => void }) => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const { messageApi } = useMessageContext();
  const items = useItemsQuery({ skip: !open });

  const [create, { loading }] = useCreatePurchaseRequestMutation({
    onCompleted: (data) => {
      messageApi?.success(`${data.createPurchaseRequest?.code} submitted for approval`);
      setOpen(false);
      onCreated();
    },
    onError,
  });

  const itemOptions = (items.data?.items ?? []).map((item: any) => ({
    value: item.uuid,
    label: `${item.sku ? `${item.sku} ` : ''}${item.name}`,
    uom: item.defaultStockUomName,
  }));

  const onFinish = (values: any) =>
    create({
      variables: {
        request: {
          requestedBy: values.requestedBy,
          requiredDate: values.requiredDate ? values.requiredDate.startOf('day').toISOString() : null,
          notes: values.notes,
          items: (values.items ?? []).map((line: any) => ({
            itemUuid: line.itemUuid,
            requestedQty: line.qty,
          })),
        },
      },
    });

  return (
    <>
      <Button size="small" type="primary" onClick={() => setOpen(true)}>
        New Purchase Request
      </Button>
      <Modal
        title="New Purchase Request"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        okText="Submit for Approval"
        confirmLoading={loading}
        width="min(720px, 100vw)"
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false} onFinish={onFinish} initialValues={{ items: [{}] }}>
          <Space wrap size={12} style={{ width: '100%' }}>
            <Form.Item name="requestedBy" label="Requested by" style={{ minWidth: 220 }}>
              <Input placeholder="Name or department" />
            </Form.Item>
            <Form.Item name="requiredDate" label="Needed by">
              <DatePicker disabledDate={(d) => d.isBefore(dayjs().startOf('day'))} />
            </Form.Item>
          </Space>

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <Space key={field.key} align="start" wrap style={{ display: 'flex', marginBottom: 4 }}>
                    <Form.Item
                      name={[field.name, 'itemUuid']}
                      rules={[{ required: true, message: 'Choose an item' }]}
                      style={{ width: 'min(360px, 80vw)', marginBottom: 8 }}
                    >
                      <Select
                        showSearch
                        optionFilterProp="label"
                        placeholder="Material or part"
                        loading={items.loading}
                        options={itemOptions}
                      />
                    </Form.Item>
                    <Form.Item
                      name={[field.name, 'qty']}
                      rules={[{ required: true, message: 'Enter a quantity' }]}
                      style={{ marginBottom: 8 }}
                    >
                      <InputNumber min={0.001} placeholder="Qty" style={{ width: 120 }} />
                    </Form.Item>
                    {fields.length > 1 ? (
                      <Button
                        type="text"
                        aria-label="Remove Line"
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(field.name)}
                      />
                    ) : null}
                  </Space>
                ))}
                <Button type="dashed" icon={<PlusOutlined />} onClick={() => add({})} style={{ marginBottom: 16 }}>
                  Add Item
                </Button>
              </>
            )}
          </Form.List>

          <Form.Item name="notes" label="Reason or Notes">
            <Input.TextArea rows={2} placeholder="What the stock is for" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

/** Purchase Requests (SRS 4.2): approved lines become selectable on a new PO. */
const PurchaseRequestList = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { messageApi } = useMessageContext();
  const reload = () => actionRef.current?.reload();

  const [review] = useReviewPurchaseRequestMutation({
    onCompleted: (data) => {
      const pr = data.reviewPurchaseRequest;
      messageApi?.success(`${pr?.code} ${pr?.status === 'approved' ? 'approved' : 'rejected'}`);
      reload();
    },
    onError,
  });

  const columns: ProColumns<any>[] = [
    codeColumn('No.'),
    statusColumn('Status', 'status', purchaseRequestStatusEnum),
    {
      title: 'Requested by',
      dataIndex: 'requestedBy',
      width: 160,
      render: (_, r) => r.requestedBy ?? '—',
    },
    { title: 'Needed by', dataIndex: 'requiredDate', valueType: 'date' },
    {
      title: 'Lines',
      dataIndex: 'items',
      align: 'right',
      width: 80,
      render: (_, r) => <span className="tabular-figures">{r.items?.length ?? 0}</span>,
    },
    {
      title: 'Estimated Cost',
      dataIndex: 'items',
      align: 'right',
      width: 140,
      render: (_, r) => (
        <span className="tabular-figures">
          {formatCurrency(
            (r.items ?? []).reduce(
              (sum: number, i: any) => sum + Number(i.requestedQty) * Number(i.estimatedUnitPrice),
              0,
            ),
          )}
        </span>
      ),
    },
    {
      title: 'On Purchase Orders',
      dataIndex: 'purchaseOrderCodes',
      width: 170,
      render: (_, r) => (r.purchaseOrderCodes?.length ? r.purchaseOrderCodes.join(', ') : '—'),
    },
    { title: 'Raised', dataIndex: 'insertedAt', valueType: 'dateTime' },
    {
      title: 'Actions',
      valueType: 'option',
      width: 150,
      render: (_, r) => {
        if (r.status !== 'pending') return [];
        return [
          <Popconfirm
            key="approve"
            title={`Approve ${r.code}?`}
            description="Its lines can then be pulled into a purchase order."
            okText="Approve"
            onConfirm={() =>
              review({
                variables: { request: { uuid: r.uuid, approve: true } },
              })
            }
          >
            <Button size="small" type="link">
              Approve
            </Button>
          </Popconfirm>,
          <Popconfirm
            key="reject"
            title={`Reject ${r.code}?`}
            okText="Reject"
            okButtonProps={{ danger: true }}
            onConfirm={() =>
              review({
                variables: { request: { uuid: r.uuid, approve: false } },
              })
            }
          >
            <Button size="small" type="link" danger>
              Reject
            </Button>
          </Popconfirm>,
        ];
      },
    },
  ];

  return (
    <DataTable
      entityName="purchase requests"
      emptyHint="Raise a request when raw stock, tooling or hardware runs low. Once approved, it can be ordered."
      actionRef={actionRef}
      columns={columns}
      expandable={{
        expandedRowRender: (r: any) => (
          <>
            {r.notes ? (
              <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                {r.notes}
              </Text>
            ) : null}
            <Table
              size="small"
              rowKey="uuid"
              pagination={false}
              dataSource={r.items ?? []}
              columns={[
                { title: 'Item', dataIndex: 'itemName' },
                {
                  title: 'Requested',
                  align: 'right',
                  render: (_: any, l: any) => `${formatQty(l.requestedQty)} ${l.uomName ?? ''}`,
                },
                {
                  title: 'Ordered',
                  align: 'right',
                  render: (_: any, l: any) => formatQty(l.orderedQty),
                },
                {
                  title: 'Left to Order',
                  align: 'right',
                  render: (_: any, l: any) => formatQty(l.remainingQty),
                },
                {
                  title: 'Est. Unit Price',
                  align: 'right',
                  render: (_: any, l: any) => formatCurrency(l.estimatedUnitPrice),
                },
              ]}
            />
          </>
        ),
      }}
      request={async () => {
        const { data } = await client.query({
          query: PurchaseRequestsDocument,
          fetchPolicy: 'network-only',
        });
        return {
          data: data.purchaseRequests,
          total: data.purchaseRequests.length,
          success: true,
        };
      }}
      toolBarRender={() => [<PurchaseRequestNew key="new" onCreated={reload} />]}
    />
  );
};

export default PurchaseRequestList;
