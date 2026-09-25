import { useRef, useState } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Badge, Input, Segmented, Space, Typography } from 'antd';

import { useMessageContext } from '@/components/common/message-context';
import client from '@/gql/apollo';
import { useCreateItemMutation, useUpdateItemMutation, ItemsDocument } from '@/gql';
import useModuleAccess from '@/hooks/use-module-access';
import { itemTypeEnum } from '@/utils/enum';
import { onError } from '@/utils';
import { formatQty } from '@/utils/format';
import DataTable from '@/components/shared/data-table';
import { moneyColumn, qtyColumn } from '@/components/shared/columns';
import { tokens } from '@/components/common/theme';

import ItemNew from './new';
import ItemPurchasing from './supplier-prices';

const { Text } = Typography;

type StockFilter = 'all' | 'low' | 'out';
type ClassFilter = 'all' | 'raw_material' | 'manufactured_part' | 'finished_good';

type StockState = 'out' | 'low' | 'ok';

/**
 * Low means at or under the item's reorder threshold. Items with no threshold
 * set are only flagged when they run out, so the list doesn't cry wolf.
 */
const stockState = (item: any): StockState => {
  const available = Number(item.availableQty ?? 0);
  const threshold = Number(item.minStockThreshold ?? 0);
  if (available <= 0) return 'out';
  if (threshold > 0 && available <= threshold) return 'low';
  return 'ok';
};

const matches = (item: any, term: string) =>
  [item.name, item.sku, item.spec, item.category].some((field) => field?.toLowerCase().includes(term));

const ItemList: React.FC = () => {
  const canEdit = useModuleAccess().canEdit('inventory.items');
  const { messageApi } = useMessageContext();
  const actionRef = useRef<ActionType | null>(null);
  const [keyword, setKeyword] = useState('');
  const [editing, setEditing] = useState<any>(null);
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [classFilter, setClassFilter] = useState<ClassFilter>('all');

  const [createItem] = useCreateItemMutation({
    onCompleted: () => {
      messageApi?.success('Material created');
      actionRef.current?.reload();
    },
    onError,
  });

  const [updateItem] = useUpdateItemMutation({
    onCompleted: () => {
      messageApi?.success('Material updated');
      actionRef.current?.reload();
    },
    // Not the shared onError: it posts through antd's static `message`, which
    // did not appear on this screen (antd v5's static methods are the part that
    // breaks under React 19, hence the console warning). A rejected save has to
    // say why, beside the dialog still holding the typed values.
    onError: (error) => messageApi?.error(error.message),
  });

  const columns: ProColumns<any>[] = [
    {
      title: 'Item',
      dataIndex: 'name',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.name}</div>
          {record.sku || record.spec ? (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {[record.sku, record.spec].filter(Boolean).join(' · ')}
            </Text>
          ) : null}
        </div>
      ),
    },
    {
      title: 'Class',
      dataIndex: 'itemType',
      width: 150,
      render: (_, record) => itemTypeEnum[record.itemType]?.text ?? record.itemType,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      width: 140,
      render: (_, record) => record.category || <Text type="secondary">—</Text>,
    },
    {
      title: 'Available',
      dataIndex: 'availableQty',
      align: 'right',
      width: 150,
      sorter: (a, b) => Number(a.availableQty ?? 0) - Number(b.availableQty ?? 0),
      render: (_, record) => {
        const state = stockState(record);
        return (
          <Space size={6} style={{ justifyContent: 'flex-end' }}>
            <span
              className="tabular-figures"
              style={{
                fontWeight: 600,
                color: state === 'ok' ? tokens.text : tokens.warning,
              }}
            >
              {formatQty(record.availableQty)}
            </span>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.defaultStockUomName}
            </Text>
            {state !== 'ok' ? (
              <Badge status={state === 'out' ? 'error' : 'warning'} text={state === 'out' ? 'Out' : 'Low'} />
            ) : null}
          </Space>
        );
      },
    },
    qtyColumn('On hand', 'onHandQty', 'defaultStockUomName'),
    qtyColumn('Reserved', 'reservedQty', 'defaultStockUomName'),
    moneyColumn('Std. cost', 'standardCost'),
    moneyColumn('Stock value', 'stockValue'),
    moneyColumn('Price', 'sellingPrice'),
  ];

  // Read-only users get no actions column at all, rather than a column of
  // nothing taking up the width the numbers need.
  if (canEdit) {
    columns.push({
      title: 'Actions',
      valueType: 'option',
      width: 80,
      render: (_, record) => [
        <a key="edit" onClick={() => setEditing(record)}>
          Edit
        </a>,
      ],
    });
  }

  const renderToolbar = () => [
    <ItemNew key="item-new" onCreate={(values: any) => createItem({ variables: { request: values } })} />,
  ];

  return (
    <>
      <DataTable
        actionRef={actionRef}
        columns={columns}
        entityName="materials"
        emptyTitle={keyword || stockFilter !== 'all' ? 'No matching items' : undefined}
        emptyHint={
          keyword || stockFilter !== 'all'
            ? 'Try a different search, or switch the filter back to All.'
            : 'Add raw materials, manufactured parts and finished goods to start tracking stock.'
        }
        params={{ keyword, stockFilter, classFilter }}
        expandable={{
          expandedRowRender: (record: any) => (
            <ItemPurchasing itemUuid={record.uuid} canEdit={canEdit} onChanged={() => actionRef.current?.reload()} />
          ),
        }}
        request={async (params) => {
          const { data } = await client.query({
            query: ItemsDocument,
            variables: { request: {} },
            // Stock moves happen on other screens; always show the current figure.
            fetchPolicy: 'network-only',
          });

          const term = String(params.keyword ?? '')
            .trim()
            .toLowerCase();
          const rows = (data.items ?? []).filter((item: any) => {
            if (term && !matches(item, term)) return false;
            if (params.classFilter !== 'all' && item.itemType !== params.classFilter) return false;
            if (params.stockFilter === 'low') return stockState(item) !== 'ok';
            if (params.stockFilter === 'out') return stockState(item) === 'out';
            return true;
          });

          return { data: rows, total: rows.length, success: true };
        }}
        headerTitle={
          <Space wrap>
            <Input.Search
              allowClear
              placeholder="Search name, SKU, spec or category"
              onSearch={setKeyword}
              onChange={(event) => !event.target.value && setKeyword('')}
              style={{ width: 280 }}
              aria-label="Search Items"
            />
            <Segmented<ClassFilter>
              value={classFilter}
              onChange={setClassFilter}
              options={[
                { label: 'All Classes', value: 'all' },
                { label: 'RM', value: 'raw_material' },
                { label: 'MP', value: 'manufactured_part' },
                { label: 'FG', value: 'finished_good' },
              ]}
            />
            <Segmented<StockFilter>
              value={stockFilter}
              onChange={setStockFilter}
              options={[
                { label: 'All', value: 'all' },
                { label: 'Low or Out', value: 'low' },
                { label: 'Out of Stock', value: 'out' },
              ]}
            />
          </Space>
        }
        toolBarRender={canEdit ? renderToolbar : undefined}
      />

      {editing ? (
        <ItemNew
          record={editing}
          onClose={() => setEditing(null)}
          onUpdate={(uuid: string, values: any) => updateItem({ variables: { uuid, request: values } })}
        />
      ) : null}
    </>
  );
};

export default ItemList;
