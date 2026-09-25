import { useRef } from 'react';
import { useRouter } from 'next/router';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';

// locale
import { useMessageContext } from '../common/message-context';
import client from '@/gql/apollo';
import { ProcessesDocument, useCreateProcessMutation } from '@/gql';
import useModuleAccess from '@/hooks/use-module-access';
import { onError } from '@/utils';

import ProcessNew from './new';

const ProcessList: React.FC = () => {
  const canEdit = useModuleAccess().canEdit('settings');
  const router = useRouter();
  const { messageApi } = useMessageContext();

  const [createProcess] = useCreateProcessMutation({
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
    await createProcess({ variables: { request: values } });
  };

  const columns: ProColumns<any>[] = [
    {
      title: 'Code',
      dataIndex: 'code',
      width: 100,
      render: (_, r) => <span className="doc-code">{r.code ?? '—'}</span>,
    },
    {
      title: 'Name',
      key: 'name',
      dataIndex: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      ellipsis: true,
      render: (_, r) => r.description ?? '—',
    },
    {
      title: 'Created At',
      search: false,
      dataIndex: 'insertedAt',
      valueType: 'dateTime',
    },
  ];

  const renderToolbar = () => [<ProcessNew key="process-new" onCreate={(values: any) => handleCreate(values)} />];

  return (
    <ProTable
      actionRef={actionRef}
      columns={columns}
      request={async (params, sorter, filter) => {
        const { data } = await client.query({
          query: ProcessesDocument,
          variables: {
            request: {},
          },
        });

        return {
          data: data.processes,
          total: data.processes.length,
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
      toolBarRender={canEdit ? renderToolbar : undefined}
    />
  );
};

export default ProcessList;
