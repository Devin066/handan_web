import { useRef } from 'react';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';

// locale
import { useMessageContext } from '@/components/common/message-context';
import client from '@/gql/apollo';
import { SuppliersDocument, useCreateSupplierMutation } from '@/gql';
import { onError } from '@/utils';
import SupplierNew from './new';

const SupplierList: React.FC = () => {
  const { messageApi } = useMessageContext();

  const [createSupplier] = useCreateSupplierMutation({
    onCompleted: () => {
      messageApi?.success('Supplier created successfully');
      handleReloadTable();
    },
    onError,
  });

  const actionRef = useRef<ActionType | null>(null);

  const handleReloadTable = () => {
    actionRef.current?.reload();
  };

  const handleCreate = async (values: any) => {
    await createSupplier({ variables: { request: values } });
  };

  const columns: ProColumns<any>[] = [
    {
      title: 'Name',
      key: 'name',
      dataIndex: 'name',
    },
    {
      title: 'Address',
      key: 'address',
      search: false,
      dataIndex: 'address',
    },
    {
      title: 'Created At',
      dataIndex: 'insertedAt',
      search: false,
      valueType: 'dateTime',
    },
  ];

  return (
    <ProTable
      actionRef={actionRef}
      columns={columns}
      request={async (params, sorter, filter) => {
        const { data } = await client.query({
          query: SuppliersDocument,
          variables: {
            request: {},
          },
        });

        return {
          data: data.suppliers,
          total: data.suppliers.length,
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
      toolBarRender={() => [<SupplierNew key="supplier-new" onCreate={(values: any) => handleCreate(values)} />]}
    />
  );
};

export default SupplierList;
