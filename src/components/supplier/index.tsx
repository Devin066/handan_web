import { useRef, useState } from 'react';
import PartyLedger from '@/components/shared/party-ledger';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Typography } from 'antd';

// locale
import { useMessageContext } from '@/components/common/message-context';
import client from '@/gql/apollo';
import { SuppliersDocument, useCreateSupplierMutation, useUpdateSupplierMutation } from '@/gql';
import useModuleAccess from '@/hooks/use-module-access';
import { onError } from '@/utils';
import SupplierNew from './new';

const { Text } = Typography;

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
  const [editing, setEditing] = useState<any>(null);
  // Business Partners at Edit level (Settings › Roles) may add and change partners.
  const canEdit = useModuleAccess().canEdit('partners');
  const [updateSupplier] = useUpdateSupplierMutation({
    onCompleted: () => {
      messageApi?.success('Supplier updated');
      actionRef.current?.reload();
    },
    onError,
  });
  const [ledgerFor, setLedgerFor] = useState<any>(null);

  const handleReloadTable = () => {
    actionRef.current?.reload();
  };

  const handleCreate = async (values: any) => {
    await createSupplier({ variables: { request: values } });
  };

  const editLink = (record: any) => {
    if (!canEdit) return [];
    return [
      <a key="edit" onClick={() => setEditing(record)}>
        Edit
      </a>,
    ];
  };

  const columns: ProColumns<any>[] = [
    {
      title: 'Name',
      key: 'name',
      dataIndex: 'name',
    },
    {
      title: 'Contact Person',
      key: 'contactName',
      search: false,
      render: (_, record) =>
        record.contactName ? (
          <div>
            <div>{record.contactName}</div>
            {record.contactPosition ? (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.contactPosition}
              </Text>
            ) : null}
          </div>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: 'Phone',
      key: 'phone',
      search: false,
      render: (_, record) => record.phone || record.landline || <Text type="secondary">—</Text>,
    },
    {
      title: 'Email',
      key: 'email',
      search: false,
      render: (_, record) =>
        record.email ? <a href={`mailto:${record.email}`}>{record.email}</a> : <Text type="secondary">—</Text>,
    },
    {
      title: 'Address',
      key: 'address',
      search: false,
      dataIndex: 'address',
      ellipsis: true,
    },
    {
      title: 'Created At',
      dataIndex: 'insertedAt',
      search: false,
      valueType: 'dateTime',
    },
    {
      title: 'Actions',
      valueType: 'option',
      width: 140,
      render: (_, record) => [
        ...editLink(record),
        <Button key="ledger" size="small" type="link" onClick={() => setLedgerFor(record)}>
          Purchase History
        </Button>,
      ],
    },
  ];

  return (
    <>
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
        toolBarRender={() =>
          canEdit ? [<SupplierNew key="supplier-new" onCreate={(values: any) => handleCreate(values)} />] : []
        }
      />
      <PartyLedger party={ledgerFor} kind="supplier" onClose={() => setLedgerFor(null)} />
      {editing ? (
        <SupplierNew
          record={editing}
          onClose={() => setEditing(null)}
          onUpdate={(uuid: string, values: any) => updateSupplier({ variables: { uuid, request: values } })}
        />
      ) : null}
    </>
  );
};

export default SupplierList;
