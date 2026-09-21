import { useRef } from 'react';
import { useRouter } from 'next/router';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';

// locale
import { useMessageContext } from '@/components/common/message-context';
import client from '@/gql/apollo';
import { useCreateItemMutation, ItemsDocument } from '@/gql';
import { onError } from '@/utils';

import ItemNew from './new';

const ItemList: React.FC = () => {
  const { messageApi } = useMessageContext();

  const router = useRouter();

  const [createItem] = useCreateItemMutation({
    onCompleted: () => {
      messageApi?.success('Created successfully');
      handleReloadTable();
    },
    onError,
  });

  const actionRef = useRef<ActionType | null>(null);

  const handleReloadTable = () => {
    actionRef.current?.reload();
  };

  const handleCreate = async (values: any) => {
    await createItem({ variables: { request: values } });
  };

  const columns: ProColumns<any>[] = [
    {
      title: 'Name',
      key: 'name',
      dataIndex: 'name',
    },
    {
      title: 'Spec',
      key: 'spec',
      dataIndex: 'spec',
    },
    {
      title: 'Price',
      valueType: 'money',
      dataIndex: 'sellingPrice',
    },
    {
      title: 'UOM',
      dataIndex: 'defaultStockUomName',
    },
    {
      title: 'Created At',
      search: false,
      dataIndex: 'insertedAt',
      valueType: 'dateTime',
    },
  ];

  return (
    <ProTable
      actionRef={actionRef}
      columns={columns}
      request={async (params, sorter, filter) => {
        const { data } = await client.query({
          query: ItemsDocument,
          variables: {
            request: {},
          },
        });

        return {
          data: data.items,
          total: data.items.length,
          success: true,
        };
      }}
      rowKey="uuid"
      pagination={{
        showQuickJumper: true,
      }}
      search={false}
      // search={{
      //   span: 6,
      //   layout: 'vertical',
      //   defaultCollapsed: true,
      // }}
      dateFormatter="string"
      toolBarRender={() => [<ItemNew key="item-new" onCreate={(values: any) => handleCreate(values)} />]}
    />
  );
};

export default ItemList;
