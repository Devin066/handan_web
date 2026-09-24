import { useRef, useState } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Badge, Button, Col, Form, Input, InputNumber, Modal, Row, Switch, Typography } from 'antd';

import client from '@/gql/apollo';
import { WorkstationsDocument, useCreateWorkstationMutation, useUpdateWorkstationMutation } from '@/gql';
import DataTable from '@/components/shared/data-table';
import { useMessageContext } from '@/components/common/message-context';
import { onError } from '@/utils';

const { Text } = Typography;

const WorkstationForm = ({ station, onClose, onSaved }: { station: any; onClose: () => void; onSaved: () => void }) => {
  const [form] = Form.useForm();
  const { messageApi } = useMessageContext();
  const editing = !!station?.uuid;

  const done = (name?: string | null) => {
    messageApi?.success(`${name} ${editing ? 'updated' : 'added'}`);
    onSaved();
    onClose();
  };
  const [create, { loading: creating }] = useCreateWorkstationMutation({
    onCompleted: (data) => done(data.createWorkstation?.name),
    onError,
  });
  const [update, { loading: updating }] = useUpdateWorkstationMutation({
    onCompleted: (data) => done(data.updateWorkstation?.name),
    onError,
  });

  const onFinish = (values: any) => {
    const request = {
      ...values,
      uuid: station?.uuid,
      capacityHours: values.capacityHours == null ? null : Number(values.capacityHours),
    };
    if (editing) update({ variables: { request } });
    else create({ variables: { request } });
  };

  return (
    <Modal
      open={!!station}
      title={editing ? `Edit ${station.name}` : 'New workstation'}
      okText={editing ? 'Save changes' : 'Add workstation'}
      onOk={() => form.submit()}
      onCancel={onClose}
      confirmLoading={creating || updating}
      width="min(640px, 100vw)"
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
        onFinish={onFinish}
        initialValues={{
          isActive: true,
          ...station,
          capacityHours: station?.capacityHours == null ? undefined : Number(station.capacityHours),
        }}
      >
        <Row gutter={16}>
          <Col xs={24} sm={14}>
            <Form.Item
              name="name"
              label="Name"
              rules={[
                { required: true, whitespace: true, message: 'Enter a workstation name.' },
                { max: 60, message: 'Keep the name under 60 characters.' },
              ]}
            >
              <Input autoFocus placeholder="e.g. CNC Lathe 2" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={10}>
            <Form.Item
              name="code"
              label="Code"
              extra="Short tag on job cards and labels."
              normalize={(value) => value?.toUpperCase()}
              rules={[{ pattern: /^[A-Z0-9-]{0,12}$/i, message: 'Letters, numbers and dashes, up to 12.' }]}
            >
              <Input placeholder="e.g. CNC-2" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={14}>
            <Form.Item name="location" label="Location" rules={[{ max: 80, message: 'Keep it under 80 characters.' }]}>
              <Input placeholder="e.g. Bay 3, ground floor" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={10}>
            <Form.Item
              name="capacityHours"
              label="Capacity (hours a day)"
              rules={[{ type: 'number', min: 0, max: 24, message: 'Between 0 and 24 hours.' }]}
            >
              <InputNumber min={0} max={24} step={0.5} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="description"
              label="Description"
              rules={[{ max: 500, message: 'Keep it under 500 characters.' }]}
            >
              <Input.TextArea rows={2} placeholder="What this station does, main equipment" />
            </Form.Item>
          </Col>
          {editing ? (
            <Col xs={24}>
              <Form.Item
                name="isActive"
                label="Active"
                valuePropName="checked"
                extra="Inactive workstations stay on past records but aren't offered for new work."
              >
                <Switch />
              </Form.Item>
            </Col>
          ) : null}
        </Row>
      </Form>
    </Modal>
  );
};

const WorkstationList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [editing, setEditing] = useState<any>(null);

  const columns: ProColumns<any>[] = [
    {
      title: 'Workstation',
      dataIndex: 'name',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.code ? <span className="doc-code">{record.code} </span> : null}
            {record.name}
          </div>
          {record.description ? (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.description}
            </Text>
          ) : null}
        </div>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      width: 180,
      render: (_, r) => r.location || <Text type="secondary">—</Text>,
    },
    {
      title: 'Capacity',
      dataIndex: 'capacityHours',
      width: 110,
      align: 'right',
      render: (_, r) =>
        r.capacityHours == null ? (
          <Text type="secondary">—</Text>
        ) : (
          <span className="tabular-figures">{Number(r.capacityHours)} h/day</span>
        ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      width: 100,
      render: (_, r) => <Badge status={r.isActive ? 'success' : 'default'} text={r.isActive ? 'Active' : 'Inactive'} />,
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

  return (
    <>
      <DataTable
        actionRef={actionRef}
        columns={columns}
        entityName="workstations"
        emptyHint="Add the machines or benches where work is done, so work orders can be routed to them."
        request={async () => {
          const { data } = await client.query({ query: WorkstationsDocument, fetchPolicy: 'network-only' });
          const rows = data?.workstations ?? [];
          return { data: rows, total: rows.length, success: true };
        }}
        toolBarRender={() => [
          <Button key="new" type="primary" size="small" onClick={() => setEditing({})}>
            New workstation
          </Button>,
        ]}
      />
      <WorkstationForm station={editing} onClose={() => setEditing(null)} onSaved={() => actionRef.current?.reload()} />
    </>
  );
};

export default WorkstationList;
