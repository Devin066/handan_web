import { useState } from 'react';
import { Button, Form, InputNumber, Popconfirm, Select, Space, Table, Typography } from 'antd';
import dayjs from 'dayjs';

import {
  useDeleteSupplierPriceMutation,
  useItemSupplierPricesQuery,
  useSaveSupplierPriceMutation,
  useSetLowStockLevelMutation,
  useSuppliersQuery,
} from '@/gql';
import { useMessageContext } from '@/components/common/message-context';
import { onError } from '@/utils';
import { formatCurrency } from '@/utils/format';

const { Text } = Typography;

/**
 * A material's purchasing details (SRS 4.4): one price per supplier, which
 * purchase requests and orders fill in when that supplier is chosen, and the
 * stock level that triggers the low-stock warning.
 */
const ItemPurchasing = ({
  itemUuid,
  canEdit,
  onChanged,
}: {
  itemUuid: string;
  canEdit: boolean;
  onChanged: () => void;
}) => {
  const { messageApi } = useMessageContext();
  const [priceForm] = Form.useForm();
  const [editingSupplier, setEditingSupplier] = useState<string | null>(null);
  const [level, setLevel] = useState<number | null>(null);

  const { data, loading, refetch } = useItemSupplierPricesQuery({
    variables: { request: { uuid: itemUuid } },
    fetchPolicy: 'network-only',
  });
  const { data: supplierData } = useSuppliersQuery({ skip: !canEdit });

  const item = data?.item;
  const prices = (item?.supplierPrices ?? []) as any[];
  const threshold = Number(item?.minStockThreshold ?? 0);

  const [savePrice, { loading: savingPrice }] = useSaveSupplierPriceMutation({
    onCompleted: (d) => {
      messageApi?.success(`Price saved for ${d.saveSupplierPrice?.supplierName}`);
      priceForm.resetFields();
      setEditingSupplier(null);
      refetch();
    },
    onError,
  });
  const [deletePrice] = useDeleteSupplierPriceMutation({
    onCompleted: () => {
      messageApi?.success('Supplier price removed');
      refetch();
    },
    onError,
  });
  const [saveLevel, { loading: savingLevel }] = useSetLowStockLevelMutation({
    onCompleted: () => {
      messageApi?.success('Low-stock level saved');
      setLevel(null);
      refetch();
      onChanged();
    },
    onError,
  });

  const edit = (p: any) => {
    setEditingSupplier(p.supplierUuid);
    priceForm.setFieldsValue({ supplierUuid: p.supplierUuid, unitPrice: Number(p.unitPrice) });
  };

  const actionColumns: any[] = [];
  if (canEdit) {
    actionColumns.push({
      title: 'Actions',
      width: 140,
      render: (_: any, p: any) => (
        <Space size={4}>
          <Button type="link" size="small" onClick={() => edit(p)}>
            Edit
          </Button>
          <Popconfirm
            title={`Remove ${p.supplierName}'s price?`}
            okText="Remove"
            okButtonProps={{ danger: true }}
            onConfirm={() => deletePrice({ variables: { request: { uuid: p.uuid } } })}
          >
            <Button type="link" size="small" danger>
              Remove
            </Button>
          </Popconfirm>
        </Space>
      ),
    });
  }

  if (loading && !data) return <Text type="secondary">Loading supplier prices</Text>;

  return (
    <div className="item-purchasing">
      <section>
        <Text strong>Supplier Prices</Text>
        <Text type="secondary" style={{ display: 'block', margin: '2px 0 8px', fontSize: 12 }}>
          Choosing a supplier on a purchase request or order fills in its price. Purchase orders also update it.
        </Text>
        <Table
          size="small"
          rowKey="uuid"
          pagination={false}
          dataSource={prices}
          locale={{ emptyText: 'No supplier prices yet.' }}
          columns={[
            { title: 'Supplier', dataIndex: 'supplierName' },
            {
              title: 'Unit Price',
              align: 'right' as const,
              render: (_: any, p: any) => <span className="tabular-figures">{formatCurrency(p.unitPrice)}</span>,
            },
            {
              title: 'Updated',
              render: (_: any, p: any) => dayjs(p.updatedAt).format('YYYY-MM-DD'),
            },
            ...actionColumns,
          ]}
        />
        {canEdit ? (
          <Form
            form={priceForm}
            layout="inline"
            style={{ marginTop: 12, rowGap: 8 }}
            onFinish={(values) =>
              savePrice({
                variables: {
                  request: { itemUuid, supplierUuid: values.supplierUuid, unitPrice: Number(values.unitPrice) },
                },
              })
            }
          >
            <Form.Item name="supplierUuid" rules={[{ required: true, message: 'Choose a supplier' }]}>
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Supplier"
                style={{ width: 220 }}
                disabled={!!editingSupplier}
                aria-label="Supplier"
                options={((supplierData?.suppliers ?? []) as any[]).map((s) => ({ value: s.uuid, label: s.name }))}
              />
            </Form.Item>
            <Form.Item name="unitPrice" rules={[{ required: true, message: 'Enter a price' }]}>
              <InputNumber
                min={0}
                step={0.01}
                prefix="₱"
                placeholder="Unit price"
                style={{ width: 160 }}
                aria-label="Unit price"
              />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={savingPrice}>
              {editingSupplier ? 'Save Price' : 'Add Supplier Price'}
            </Button>
            {editingSupplier ? (
              <Button
                style={{ marginLeft: 8 }}
                onClick={() => {
                  setEditingSupplier(null);
                  priceForm.resetFields();
                }}
              >
                Cancel
              </Button>
            ) : null}
          </Form>
        ) : null}
      </section>

      <section>
        <Text strong>Low-Stock Alert</Text>
        <Text type="secondary" style={{ display: 'block', margin: '2px 0 8px', fontSize: 12 }}>
          When the available quantity drops to this level or below, the material is flagged Low on this list and on the
          dashboard. 0 means only warn when it runs out.
        </Text>
        {canEdit ? (
          <Space wrap>
            <InputNumber
              min={0}
              value={level ?? threshold}
              onChange={(value) => setLevel(value)}
              addonAfter={item?.defaultStockUomName ?? undefined}
              aria-label="Low-stock alert level"
              style={{ width: 200 }}
            />
            <Button
              type="primary"
              loading={savingLevel}
              disabled={level == null || level === threshold}
              onClick={() => saveLevel({ variables: { request: { itemUuid, minStockThreshold: Number(level) } } })}
            >
              Save Level
            </Button>
          </Space>
        ) : (
          <Text>
            {threshold} {item?.defaultStockUomName}
          </Text>
        )}
      </section>
    </div>
  );
};

export default ItemPurchasing;
