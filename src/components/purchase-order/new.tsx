import { useState } from 'react';
import dayjs from 'dayjs';
import { Alert, Button, DatePicker, Form, InputNumber, Modal, Select, Space, Typography } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

import client from '@/gql/apollo';
import { SupplierPricesDocument, useItemsQuery, useOpenPurchaseRequestItemsQuery } from '@/gql';
import { fetchSuppliers, fetchWarehouses } from '@/utils/api';
import { formatCurrency, formatQty } from '@/utils/format';
import { useMessageContext } from '@/components/common/message-context';

const { Text } = Typography;

/**
 * New purchase order (SRS 4.2). Lines are entered by hand or pulled from approved
 * purchase requests; either way the supplier's last price fills the unit price.
 */
const PurchaseOrderNew = ({ onCreate }: { onCreate: (request: any) => Promise<unknown> }) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [prices, setPrices] = useState<Map<string, number>>(new Map());
  const [form] = Form.useForm();
  const { messageApi } = useMessageContext();

  const items = useItemsQuery({ skip: !open });
  const openLines = useOpenPurchaseRequestItemsQuery({
    skip: !open,
    fetchPolicy: 'network-only',
  });

  const itemsByUuid = new Map((items.data?.items ?? []).map((i: any) => [i.uuid, i]));
  const lines = Form.useWatch('lines', form) ?? [];
  const total = lines.reduce((sum: number, l: any) => sum + Number(l?.qty ?? 0) * Number(l?.unitPrice ?? 0), 0);
  const pulled = new Set(lines.map((l: any) => l?.purchaseRequestItemUuid).filter(Boolean));
  const available = (openLines.data?.openPurchaseRequestItems ?? []).filter((l: any) => !pulled.has(l.uuid));

  const openModal = async () => {
    setOpen(true);
    form.resetFields();
    const [s, w] = await Promise.all([fetchSuppliers({}), fetchWarehouses({})]);
    setSuppliers(s ?? []);
    setWarehouses(w ?? []);
  };

  const priceFor = (itemUuid: string, fallback?: number) => prices.get(itemUuid) ?? fallback ?? 0;

  const onSupplierChange = async (supplierUuid: string) => {
    const { data } = await client.query({
      query: SupplierPricesDocument,
      variables: { request: { uuid: supplierUuid } },
      fetchPolicy: 'network-only',
    });
    setPrices(new Map((data.supplierPrices ?? []).map((p: any) => [p.itemUuid, Number(p.unitPrice)])));
  };

  const addFromRequests = (uuids: string[]) => {
    const chosen = available.filter((l: any) => uuids.includes(l.uuid));
    const current = (form.getFieldValue('lines') ?? []).filter((l: any) => l?.itemUuid);
    form.setFieldValue('lines', [
      ...current,
      ...chosen.map((l: any) => ({
        purchaseRequestItemUuid: l.uuid,
        purchaseRequestCode: l.purchaseRequestCode,
        maxQty: Number(l.remainingQty),
        itemUuid: l.itemUuid,
        qty: Number(l.remainingQty),
        unitPrice: priceFor(l.itemUuid, Number(l.estimatedUnitPrice)),
      })),
    ]);
  };

  const onFinish = async (values: any) => {
    // The whole store, so request links set outside a Form.Item come along.
    const purchaseItems = (form.getFieldValue('lines') ?? [])
      .filter((l: any) => l?.itemUuid && Number(l.qty) > 0)
      .map((l: any) => {
        const item: any = itemsByUuid.get(l.itemUuid);
        return {
          purchaseRequestItemUuid: l.purchaseRequestItemUuid ?? null,
          itemUuid: l.itemUuid,
          stockUomUuid: item?.defaultStockUomUuid,
          uomName: item?.defaultStockUomName,
          orderedQty: Number(l.qty),
          unitPrice: Number(l.unitPrice ?? 0),
        };
      });
    if (!purchaseItems.length) {
      messageApi?.error('Add at least one line with a quantity.');
      return;
    }

    setSaving(true);
    try {
      await onCreate({
        supplierUuid: values.supplierUuid,
        warehouseUuid: values.warehouseUuid,
        expectedDate: values.expectedDate ? values.expectedDate.startOf('day').toISOString() : null,
        purchaseItems,
      });
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button size="small" type="primary" onClick={openModal}>
        New Purchase Order
      </Button>
      <Modal
        title="New Purchase Order"
        open={open}
        onCancel={() => setOpen(false)}
        width="min(860px, 100vw)"
        destroyOnClose
        footer={
          <Space
            style={{
              justifyContent: 'space-between',
              width: '100%',
              flexWrap: 'wrap',
            }}
          >
            <span>
              Total{' '}
              <span className="tabular-figures" style={{ fontSize: 18, fontWeight: 600 }}>
                {formatCurrency(total)}
              </span>
            </span>
            <Space>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="primary" loading={saving} onClick={() => form.submit()}>
                Create Purchase Order
              </Button>
            </Space>
          </Space>
        }
      >
        <Form form={form} layout="vertical" preserve={false} onFinish={onFinish} initialValues={{ lines: [] }}>
          <Space wrap size={12} style={{ width: '100%' }}>
            <Form.Item name="supplierUuid" label="Supplier" rules={[{ required: true, message: 'Choose a supplier' }]}>
              <Select
                showSearch
                optionFilterProp="label"
                style={{ width: 240 }}
                options={suppliers}
                placeholder="Supplier"
                onChange={onSupplierChange}
              />
            </Form.Item>
            <Form.Item
              name="warehouseUuid"
              label="Deliver to"
              rules={[{ required: true, message: 'Choose a warehouse' }]}
            >
              <Select style={{ width: 200 }} options={warehouses} placeholder="Warehouse" />
            </Form.Item>
            <Form.Item name="expectedDate" label="Expected Delivery">
              <DatePicker disabledDate={(d) => d.isBefore(dayjs().startOf('day'))} />
            </Form.Item>
          </Space>

          <Form.Item
            label="Add from Approved Purchase Requests"
            extra={
              openLines.loading
                ? undefined
                : available.length
                  ? 'Each line fills its item, the quantity left to order and the supplier price.'
                  : 'No approved request lines are waiting to be ordered.'
            }
          >
            <Select
              mode="multiple"
              value={[]}
              placeholder="Choose request lines"
              loading={openLines.loading}
              disabled={!available.length}
              optionFilterProp="label"
              onChange={(uuids: string[]) => addFromRequests(uuids)}
              options={available.map((l: any) => ({
                value: l.uuid,
                label: `${l.purchaseRequestCode} · ${l.itemName} · ${formatQty(l.remainingQty)} ${l.uomName ?? ''}`,
              }))}
            />
          </Form.Item>

          <Form.List name="lines">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => {
                  const line = lines[field.name] ?? {};
                  return (
                    <div key={field.key} style={{ marginBottom: 4 }}>
                      {line.purchaseRequestCode ? (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          From {line.purchaseRequestCode}, up to {formatQty(line.maxQty)}
                        </Text>
                      ) : null}
                      <Space align="start" wrap style={{ display: 'flex' }}>
                        <Form.Item
                          name={[field.name, 'itemUuid']}
                          rules={[{ required: true, message: 'Choose an item' }]}
                          style={{ width: 'min(320px, 80vw)', marginBottom: 8 }}
                        >
                          <Select
                            showSearch
                            optionFilterProp="label"
                            placeholder="Item"
                            disabled={!!line.purchaseRequestItemUuid}
                            loading={items.loading}
                            options={(items.data?.items ?? []).map((i: any) => ({
                              value: i.uuid,
                              label: `${i.sku ? `${i.sku} ` : ''}${i.name}`,
                            }))}
                            onChange={(itemUuid: string) =>
                              form.setFieldValue(['lines', field.name, 'unitPrice'], priceFor(itemUuid))
                            }
                          />
                        </Form.Item>
                        <Form.Item
                          name={[field.name, 'qty']}
                          rules={[{ required: true, message: 'Qty' }]}
                          style={{ marginBottom: 8 }}
                        >
                          <InputNumber
                            min={0.001}
                            max={line.maxQty}
                            placeholder="Qty"
                            style={{ width: 110 }}
                            addonAfter={(itemsByUuid.get(line.itemUuid) as any)?.defaultStockUomName}
                          />
                        </Form.Item>
                        <Form.Item
                          name={[field.name, 'unitPrice']}
                          rules={[{ required: true, message: 'Price' }]}
                          style={{ marginBottom: 8 }}
                        >
                          <InputNumber min={0} placeholder="Unit price" style={{ width: 130 }} />
                        </Form.Item>
                        <span className="tabular-figures" style={{ lineHeight: '32px', minWidth: 100 }}>
                          {formatCurrency(Number(line.qty ?? 0) * Number(line.unitPrice ?? 0))}
                        </span>
                        <Button
                          type="text"
                          aria-label="Remove Line"
                          icon={<MinusCircleOutlined />}
                          onClick={() => remove(field.name)}
                        />
                      </Space>
                    </div>
                  );
                })}
                {!fields.length ? (
                  <Alert type="info" showIcon style={{ marginBottom: 12 }} message="No lines yet." />
                ) : null}
                <Button type="dashed" icon={<PlusOutlined />} onClick={() => add({})}>
                  Add Item
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </>
  );
};

export default PurchaseOrderNew;
