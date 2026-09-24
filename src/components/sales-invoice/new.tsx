import { useEffect, useMemo, useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import {
  Alert,
  Button,
  Col,
  DatePicker,
  Descriptions,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Typography,
} from 'antd';
import AddressFields from '@/components/shared/address-fields';
import { addressFromCustomer, composeAddress } from '@/config/address';

import { useMessageContext } from '@/components/common/message-context';
import { tokens } from '@/components/common/theme';
import { useCreateSalesInvoiceMutation, useSalesOrderLazyQuery, useSalesOrdersQuery } from '@/gql';
import {
  PAYMENT_TERMS,
  VAT_MODES,
  computeInvoiceTotals,
  dueDateFor,
  isValidTin,
  type PaymentTerms,
  type VatMode,
} from '@/config/invoice';
import { formatCurrency, formatQty } from '@/utils/format';
import { onError } from '@/utils';

const { Text } = Typography;

type Line = {
  salesOrderItemUuid: string;
  itemName: string;
  uomName?: string | null;
  available: number;
  qty: number;
  unitPrice: number;
  discount: number;
  description?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  /** Opens with this order already chosen, e.g. from the sales order list. */
  salesOrderUuid?: string;
};

const SalesInvoiceNew = ({ open, onClose, onCreated, salesOrderUuid }: Props) => {
  const { messageApi } = useMessageContext();
  const [form] = Form.useForm();
  const [orderUuid, setOrderUuid] = useState<string | undefined>(salesOrderUuid);
  const [lines, setLines] = useState<Line[]>([]);

  const vatMode: VatMode = Form.useWatch('vatMode', form) ?? 'vat_exclusive';

  const orders = useSalesOrdersQuery({ skip: !open, fetchPolicy: 'network-only' });
  const [loadOrder, order] = useSalesOrderLazyQuery({ fetchPolicy: 'network-only' });

  const [createInvoice, { loading: saving }] = useCreateSalesInvoiceMutation({
    onCompleted: (data) => {
      messageApi?.success(`Invoice ${data.createSalesInvoice?.code} created`);
      onCreated?.();
      onClose();
    },
    onError,
  });

  // Orders that still have something to bill.
  const orderOptions = useMemo(
    () =>
      (orders.data?.salesOrders ?? [])
        .filter((o: any) => o && o.status !== 'draft' && o.status !== 'cancelled')
        .filter((o: any) => (o.items ?? []).some((i: any) => Number(i?.uninvoicedQty ?? 0) > 0))
        .map((o: any) => ({
          value: o.uuid,
          label: `${o.code} · ${o.customerName}`,
        })),
    [orders.data],
  );

  // Reset every time the drawer opens.
  useEffect(() => {
    if (!open) return;
    form.resetFields();
    setLines([]);
    setOrderUuid(salesOrderUuid);
  }, [open, salesOrderUuid, form]);

  useEffect(() => {
    if (open && orderUuid) loadOrder({ variables: { request: { salesOrderUuid: orderUuid } } });
  }, [open, orderUuid, loadOrder]);

  // When an order loads, prefill its unbilled lines and the customer details.
  const loaded = order.data?.salesOrder;
  useEffect(() => {
    if (!loaded || loaded.uuid !== orderUuid) return;
    setLines(
      (loaded.items ?? [])
        .filter((item: any) => Number(item?.uninvoicedQty ?? 0) > 0)
        .map((item: any) => ({
          salesOrderItemUuid: item.uuid,
          itemName: item.itemName,
          uomName: item.uomName,
          available: Number(item.uninvoicedQty),
          qty: Number(item.uninvoicedQty),
          unitPrice: Number(item.unitPrice),
          discount: 0,
        })),
    );
    form.setFieldsValue({ customerName: loaded.customerName, billTo: addressFromCustomer(loaded.customer) });
  }, [loaded, orderUuid, form]);

  const totals = computeInvoiceTotals(lines, vatMode);

  const updateLine = (index: number, patch: Partial<Line>) =>
    setLines((current) => current.map((line, i) => (i === index ? { ...line, ...patch } : line)));

  const recomputeDue = (invoiceDate?: Dayjs, terms?: PaymentTerms) => {
    const date = invoiceDate ?? form.getFieldValue('invoiceDate');
    const chosen = terms ?? form.getFieldValue('paymentTerms');
    if (date && chosen) form.setFieldValue('dueDate', dayjs(dueDateFor(date.toDate(), chosen)));
  };

  const billed = lines.filter((line) => line.qty > 0);
  const overBilled = lines.some((line) => line.qty > line.available);

  const onFinish = (values: any) => {
    if (!orderUuid || !billed.length || overBilled) return;
    createInvoice({
      variables: {
        request: {
          salesOrderUuid: orderUuid,
          invoiceDate: values.invoiceDate?.startOf('day').toISOString(),
          paymentTerms: values.paymentTerms,
          dueDate: values.dueDate?.startOf('day').toISOString(),
          customerAddress: composeAddress(values.billTo) || null,
          customerTin: values.customerTin,
          customerReference: values.customerReference,
          vatMode: values.vatMode,
          notes: values.notes,
          items: billed.map((line) => ({
            salesOrderItemUuid: line.salesOrderItemUuid,
            qty: line.qty,
            unitPrice: line.unitPrice,
            discount: line.discount,
            description: line.description,
          })),
        },
      },
    });
  };

  return (
    <Drawer
      title="New sales invoice"
      width="min(1040px, 100vw)"
      open={open}
      onClose={onClose}
      destroyOnClose
      extra={
        <Space>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            loading={saving}
            disabled={!orderUuid || !billed.length || overBilled}
            onClick={() => form.submit()}
          >
            Create invoice
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          invoiceDate: dayjs(),
          paymentTerms: 'net_30',
          dueDate: dayjs(dueDateFor(new Date(), 'net_30')),
          vatMode: 'vat_exclusive',
        }}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label="Sales order" required>
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Choose an order to bill"
                loading={orders.loading}
                value={orderUuid}
                onChange={(value) => setOrderUuid(value)}
                options={orderOptions}
                notFoundContent={orders.loading ? <Spin size="small" /> : 'No orders left to invoice'}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Invoice date" name="invoiceDate" rules={[{ required: true, message: 'Pick a date.' }]}>
              <DatePicker style={{ width: '100%' }} onChange={(date) => recomputeDue(date ?? undefined)} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Your reference / PO no." name="customerReference">
              <Input placeholder="Customer's PO number" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Payment terms" name="paymentTerms">
              <Select
                options={Object.entries(PAYMENT_TERMS).map(([value, { label }]) => ({ value, label }))}
                onChange={(terms) => recomputeDue(undefined, terms)}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item
              label="Due date"
              name="dueDate"
              dependencies={['invoiceDate']}
              rules={[
                ({ getFieldValue }) => ({
                  validator: (_, value) =>
                    !value || !getFieldValue('invoiceDate') || !value.isBefore(getFieldValue('invoiceDate'), 'day')
                      ? Promise.resolve()
                      : Promise.reject(new Error('Due date can’t be before the invoice date.')),
                }),
              ]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="VAT" name="vatMode">
              <Select options={Object.entries(VAT_MODES).map(([value, { label }]) => ({ value, label }))} />
            </Form.Item>
          </Col>
        </Row>

        <Text strong style={{ display: 'block', margin: '4px 0 12px' }}>
          Bill to
        </Text>
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item label="Customer" name="customerName">
              <Input disabled placeholder="From the sales order" />
            </Form.Item>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item
              label="Customer TIN"
              name="customerTin"
              rules={[
                {
                  validator: (_, value) =>
                    !value || isValidTin(value)
                      ? Promise.resolve()
                      : Promise.reject(new Error('9 digits, optionally with a branch code.')),
                },
              ]}
            >
              <Input placeholder="000-000-000-000" />
            </Form.Item>
          </Col>
        </Row>
        <AddressFields
          name="billTo"
          label="Billing address"
          extra="Filled from the customer's address on file. Printed on the invoice."
        />

        <Text strong style={{ display: 'block', margin: '4px 0 12px' }}>
          Lines
        </Text>
        {!orderUuid ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Choose a sales order to load its lines." />
        ) : order.loading ? (
          <Spin style={{ display: 'block', padding: 32 }} />
        ) : order.error ? (
          <Alert type="error" showIcon message="Couldn't load this sales order." description={order.error.message} />
        ) : !lines.length ? (
          <Alert type="info" showIcon message="Everything on this order has already been invoiced." />
        ) : (
          <Table
            size="small"
            rowKey="salesOrderItemUuid"
            pagination={false}
            scroll={{ x: 'max-content' }}
            dataSource={lines}
            columns={[
              {
                title: 'Item',
                dataIndex: 'itemName',
                render: (name, line, index) => (
                  <div style={{ minWidth: 180 }}>
                    <div style={{ fontWeight: 500 }}>{name}</div>
                    <Input
                      size="small"
                      variant="borderless"
                      placeholder="Add a description (optional)"
                      value={line.description}
                      onChange={(e) => updateLine(index, { description: e.target.value })}
                      style={{ paddingInline: 0, fontSize: 12 }}
                      aria-label={`Description for ${name}`}
                    />
                  </div>
                ),
              },
              {
                title: 'Qty',
                dataIndex: 'qty',
                width: 150,
                render: (qty, line, index) => (
                  <div>
                    <InputNumber
                      min={0}
                      max={line.available}
                      value={qty}
                      status={qty > line.available ? 'error' : undefined}
                      onChange={(value) => updateLine(index, { qty: Number(value ?? 0) })}
                      style={{ width: 100 }}
                      aria-label={`Quantity for ${line.itemName}`}
                    />
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        of {formatQty(line.available)} {line.uomName ?? ''} left
                      </Text>
                    </div>
                  </div>
                ),
              },
              {
                title: 'Unit price',
                dataIndex: 'unitPrice',
                width: 140,
                render: (price, line, index) => (
                  <InputNumber
                    min={0}
                    value={price}
                    onChange={(value) => updateLine(index, { unitPrice: Number(value ?? 0) })}
                    style={{ width: 120 }}
                    aria-label={`Unit price for ${line.itemName}`}
                  />
                ),
              },
              {
                title: 'Discount',
                dataIndex: 'discount',
                width: 130,
                render: (discount, line, index) => (
                  <InputNumber
                    min={0}
                    value={discount}
                    onChange={(value) => updateLine(index, { discount: Number(value ?? 0) })}
                    style={{ width: 110 }}
                    aria-label={`Discount for ${line.itemName}`}
                  />
                ),
              },
              {
                title: 'Amount',
                key: 'lineTotal',
                align: 'right',
                width: 130,
                render: (_, __, index) => (
                  <span className="tabular-figures">{formatCurrency(totals.lines[index]?.lineTotal ?? 0)}</span>
                ),
              },
            ]}
          />
        )}

        <Row gutter={24} style={{ marginTop: 20 }}>
          <Col xs={24} md={14}>
            <Form.Item label="Notes" name="notes">
              <Input.TextArea
                autoSize={{ minRows: 3, maxRows: 6 }}
                placeholder="Printed on the invoice, e.g. bank details or delivery notes"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={10}>
            <Descriptions
              size="small"
              column={1}
              bordered
              labelStyle={{ width: '55%' }}
              contentStyle={{ textAlign: 'right' }}
              items={[
                { key: 'sub', label: 'Subtotal', children: formatCurrency(totals.subtotal) },
                { key: 'disc', label: 'Discount', children: `− ${formatCurrency(totals.discountAmount)}` },
                {
                  key: 'vatable',
                  label:
                    vatMode === 'vat_exempt' || vatMode === 'zero_rated' ? VAT_MODES[vatMode].short : 'Vatable sales',
                  children: formatCurrency(totals.vatableAmount),
                },
                { key: 'vat', label: 'VAT (12%)', children: formatCurrency(totals.vatAmount) },
                {
                  key: 'total',
                  label: <Text strong>Total due</Text>,
                  children: (
                    <Text strong className="tabular-figures" style={{ fontSize: 16, color: tokens.text }}>
                      {formatCurrency(totals.total)}
                    </Text>
                  ),
                },
              ]}
            />
          </Col>
        </Row>
      </Form>
    </Drawer>
  );
};

export default SalesInvoiceNew;
