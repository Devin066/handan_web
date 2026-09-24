import type { ProColumns } from '@ant-design/pro-components';

// locale
import client from '@/gql/apollo';
import { inventoryEntryTypeEnum } from '@/utils/enum';
import DataTable from '@/components/shared/data-table';
import { qtyColumn, statusColumn } from '@/components/shared/columns';
import { InventoryEntriesDocument } from '@/gql';
import { tokens } from '@/components/common/theme';

const InventoryEntryList: React.FC = () => {
  const columns: ProColumns<any>[] = [
    // {
    //   title: 'No.',
    //   width: 200,
    //   dataIndex: 'code',
    // },
    statusColumn('Type', 'type', inventoryEntryTypeEnum, {
      width: 170,
      search: false,
    }),
    {
      title: 'Item',
      search: false,
      dataIndex: ['item', 'name'],
    },
    {
      title: 'Movement',
      dataIndex: 'actualQty',
      search: false,
      align: 'right',
      width: 120,
      // Sign carries the meaning here: a receipt adds, an issue removes.
      render: (_: any, record: any) => {
        const qty = Number(record.actualQty ?? 0);
        const inbound = qty >= 0;
        return (
          <span
            className="tabular-figures"
            style={{
              color: inbound ? tokens.success : tokens.warning,
              fontWeight: 500,
            }}
          >
            {inbound ? '+' : '−'}
            {Math.abs(qty).toLocaleString()}
          </span>
        );
      },
    },
    qtyColumn('Balance After', 'qtyAfterTransaction'),

    {
      title: 'Warehouse',
      dataIndex: ['warehouse', 'name'],
      search: false,
    },
    {
      title: 'Stock UOM',
      dataIndex: ['stockUom', 'uomName'],
      search: false,
    },
    {
      title: 'Created At',
      dataIndex: 'insertedAt',
      search: false,
      valueType: 'dateTime',
    },
  ];

  return (
    <DataTable
      entityName="stock movements"
      emptyHint="Stock movements appear here as goods are received, issued or produced."
      columns={columns}
      request={async (params: any, sorter: any, filter: any) => {
        const { data } = await client.query({
          query: InventoryEntriesDocument,
          variables: {
            request: {},
          },
        });

        return {
          data: data.inventoryEntries,
          total: data.inventoryEntries.length,
          success: true,
        };
      }}
    />
  );
};

export default InventoryEntryList;
