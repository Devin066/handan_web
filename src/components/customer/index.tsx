import { useRef } from 'react';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';

// locale
import { useMessageContext } from '@/components/common/message-context';
import client from '@/gql/apollo';
import { useCreateCustomerMutation, CustomersDocument } from '@/gql';
import { onError } from '@/utils';
import CustomerNew from './new';

const CustomerList: React.FC = () => {
  const { messageApi } = useMessageContext();

  const [createCustomer] = useCreateCustomerMutation({
    onCompleted: () => {
      messageApi?.success('Customer created successfully');
      handleReloadTable();
    },
    onError,
  });

  const actionRef = useRef<ActionType | null>(null);

  const handleReloadTable = () => {
    actionRef.current?.reload();
  };

  const handleCreate = async (values: any) => {
    await createCustomer({ variables: { request: values } });
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
          query: CustomersDocument,
          variables: {
            request: {},
          },
        });

        return {
          data: data.customers,
          total: data.customers.length,
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
      toolBarRender={() => [<CustomerNew key="customer-new" onCreate={(values: any) => handleCreate(values)} />]}
    />
  );
};

export default CustomerList;
