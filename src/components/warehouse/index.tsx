import { useEffect, useRef, useState } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Col, Form, Input, Modal, Row, Select, Switch, Tag, Typography } from 'antd';

import client from '@/gql/apollo';
import { WarehousesDocument, useListStaffQuery, useSaveWarehouseMutation } from '@/gql';
import useModuleAccess from '@/hooks/use-module-access';
import { ROLE_LABELS } from '@/components/roles';
import { SUPERVISOR_ROLES } from '@/config/production-stage';
import DataTable from '@/components/shared/data-table';
import { useMessageContext } from '@/components/common/message-context';
import { onError } from '@/utils';

const { Text } = Typography;

const WarehouseForm = ({
  warehouse,
  onClose,
  onSaved,
}: {
  warehouse: any;
  onClose: () => void;
  onSaved: () => void;
}) => {
  const [form] = Form.useForm();
  const { messageApi } = useMessageContext();
  const editing = !!warehouse?.uuid;
  const { data: staffData } = useListStaffQuery({ skip: !warehouse });
  const supervisors = ((staffData?.listStaff ?? []) as any[]).filter(
    (s) => s.hasLogin && SUPERVISOR_ROLES.includes(s.role),
  );
  const currentContact = supervisors.find((s) => s.email === warehouse?.contactEmail);

  const [save, { loading }] = useSaveWarehouseMutation({
    onCompleted: (data) => {
      messageApi?.success(`${data.saveWarehouse?.name} ${editing ? 'updated' : 'added'}`);
      onSaved();
      onClose();
    },
    onError,
  });

  // The form instance outlives the dialog, so load the chosen warehouse each
  // time it opens (and again once the member list arrives for the contact).
  useEffect(() => {
    if (!warehouse) return;
    form.resetFields();
    form.setFieldsValue({
      name: warehouse.name,
      area: warehouse.area,
      address: warehouse.address,
      isDefault: !!warehouse.isDefault,
      contactStaffUuid: currentContact?.uuid,
    });
  }, [warehouse, currentContact?.uuid, form]);

  const onFinish = (values: any) =>
    save({
      variables: {
        request: {
          ...values,
          uuid: warehouse?.uuid,
          contactStaffUuid: values.contactStaffUuid ?? null,
          isDefault: !!values.isDefault,
        },
      },
    });

  return (
    <Modal
      open={!!warehouse}
      title={editing ? `Edit ${warehouse.name}` : 'New Warehouse'}
      okText={editing ? 'Save Changes' : 'Add Warehouse'}
      onOk={() => form.submit()}
      onCancel={onClose}
      confirmLoading={loading}
      width="min(640px, 100vw)"
      destroyOnClose
    >
      <Form form={form} layout="vertical" preserve={false} onFinish={onFinish} key={warehouse?.uuid ?? 'new'}>
        <Row gutter={16}>
          <Col xs={24} sm={14}>
            <Form.Item
              name="name"
              label="Name"
              rules={[
                { required: true, whitespace: true, message: 'Enter a warehouse name.' },
                { max: 60, message: 'Keep the name under 60 characters.' },
              ]}
            >
              <Input autoFocus placeholder="e.g. Main Warehouse" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={10}>
            <Form.Item name="area" label="Area" rules={[{ max: 60, message: 'Keep it under 60 characters.' }]}>
              <Input placeholder="e.g. Building B, Rack 1–12" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="address" label="Address" rules={[{ max: 200, message: 'Keep it under 200 characters.' }]}>
              <Input placeholder="e.g. 1 Factory Road, Valenzuela City" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="contactStaffUuid"
              label="Contact Person"
              extra="Only members with the Owner or Manager role can be the contact."
            >
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                placeholder="Choose an owner or manager"
                notFoundContent="No member has the Owner or Manager role yet."
                options={supervisors.map((s) => ({
                  value: s.uuid,
                  label: `${s.name || s.email} · ${ROLE_LABELS[s.role] ?? s.role}`,
                }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="isDefault"
              label="Default Warehouse"
              valuePropName="checked"
              extra={
                warehouse?.isDefault
                  ? 'This is the default. To change it, turn this on for another warehouse.'
                  : 'Picked first on new orders and receipts. Turning it on here turns it off on the current default.'
              }
            >
              <Switch disabled={!!warehouse?.isDefault} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

const WarehouseList: React.FC = () => {
  const canEdit = useModuleAccess().canEdit('settings');
  const actionRef = useRef<ActionType | null>(null);
  const [editing, setEditing] = useState<any>(null);

  const columns: ProColumns<any>[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      render: (_, record) => (
        <div>
          <span style={{ fontWeight: 500 }}>{record.name}</span>
          {record.isDefault ? <Tag style={{ marginLeft: 8 }}>Default</Tag> : null}
          {record.area ? (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.area}
              </Text>
            </div>
          ) : null}
        </div>
      ),
    },
    {
      title: 'Address',
      dataIndex: 'address',
      render: (_, r) => r.address || <Text type="secondary">—</Text>,
    },
    {
      title: 'Contact Person',
      dataIndex: 'contactName',
      render: (_, r) =>
        r.contactName || r.contactEmail ? (
          <div>
            <div>{r.contactName || '—'}</div>
            {r.contactEmail ? (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {r.contactEmail}
              </Text>
            ) : null}
          </div>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: 'Actions',
      key: 'option',
      valueType: 'option',
      width: 80,
      render: (_, record) => [
        <Button key="edit" size="small" type="link" onClick={() => setEditing(record)}>
          Edit
        </Button>,
      ],
    },
  ];

  const renderToolbar = () => [
    <Button key="new" type="primary" size="small" onClick={() => setEditing({})}>
      New Warehouse
    </Button>,
  ];

  return (
    <>
      <DataTable
        actionRef={actionRef}
        columns={columns}
        entityName="warehouses"
        emptyHint="Add the places stock is kept, so receipts and orders know where goods go."
        request={async () => {
          const { data } = await client.query({ query: WarehousesDocument, fetchPolicy: 'network-only' });
          const rows = data?.warehouses ?? [];
          return { data: rows, total: rows.length, success: true };
        }}
        toolBarRender={canEdit ? renderToolbar : undefined}
      />
      <WarehouseForm warehouse={editing} onClose={() => setEditing(null)} onSaved={() => actionRef.current?.reload()} />
    </>
  );
};

export default WarehouseList;
