import { useRef, useState } from 'react';
import PartyLedger from '@/components/shared/party-ledger';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Typography } from 'antd';

// locale
import { useMessageContext } from '@/components/common/message-context';
import client from '@/gql/apollo';
import { useCreateCustomerMutation, CustomersDocument, useUpdateCustomerMutation } from '@/gql';
import useModuleAccess from '@/hooks/use-module-access';
import { onError } from '@/utils';
import { customerSourceEnum, customerTypeEnum } from '@/utils/enum';
import CustomerNew from './new';

const { Text } = Typography;

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
  const [editing, setEditing] = useState<any>(null);
  // Business Partners at Edit level (System Settings › Roles) may add and change partners.
  const canEdit = useModuleAccess().canEdit('partners.customers');
  const [updateCustomer] = useUpdateCustomerMutation({
    onCompleted: () => {
      messageApi?.success('Customer updated');
      actionRef.current?.reload();
    },
    onError,
  });
  const [ledgerFor, setLedgerFor] = useState<any>(null);

  const handleReloadTable = () => {
    actionRef.current?.reload();
  };

  const handleCreate = async (values: any) => {
    await createCustomer({ variables: { request: values } });
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
      render: (_, record) => (
        <div>
          <div>{record.name}</div>
          {record.customerType === 'business' && record.contactName ? (
            <div style={{ fontSize: 12, color: '#64748B' }}>Attn: {record.contactName}</div>
          ) : null}
        </div>
      ),
    },
    {
      title: 'Type',
      key: 'customerType',
      dataIndex: 'customerType',
      search: false,
      width: 110,
      render: (_, record) => customerTypeEnum[record.customerType]?.text ?? '—',
    },
    {
      // One column for however the customer is actually reachable: listing
      // every channel separately would be a dozen mostly-empty columns.
      title: 'Contact',
      key: 'contact',
      search: false,
      render: (_, record) => {
        const lines = [
          record.phone,
          record.messengerId ? `Messenger: ${record.messengerId}` : null,
          record.viber ? `Viber: ${record.viber}` : null,
          record.email,
        ].filter(Boolean);

        if (!lines.length) return <Text type="secondary">—</Text>;

        return (
          <div>
            {lines.map((line: string) => (
              <div key={line} style={{ fontSize: 12 }}>
                {line}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      title: 'Address',
      key: 'address',
      search: false,
      render: (_, record) => {
        // Written the way a Philippine address is written, skipping the parts
        // that were left blank.
        const parts = [record.address, record.barangay, record.city, record.province, record.postalCode]
          .map((part: string | null) => part?.trim())
          .filter(Boolean);

        return parts.length ? parts.join(', ') : <Text type="secondary">—</Text>;
      },
    },
    {
      title: 'Source',
      key: 'sourcePlatform',
      dataIndex: 'sourcePlatform',
      search: false,
      width: 150,
      render: (_, record) => customerSourceEnum[record.sourcePlatform]?.text ?? '—',
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
          Sales Ledger
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
        toolBarRender={() =>
          canEdit ? [<CustomerNew key="customer-new" onCreate={(values: any) => handleCreate(values)} />] : []
        }
      />
      <PartyLedger party={ledgerFor} kind="customer" onClose={() => setLedgerFor(null)} />
      {editing ? (
        <CustomerNew
          record={editing}
          onClose={() => setEditing(null)}
          onUpdate={(uuid: string, values: any) => updateCustomer({ variables: { uuid, request: values } })}
        />
      ) : null}
    </>
  );
};

export default CustomerList;
