import { useRef, useState } from 'react';
import dayjs from 'dayjs';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  Badge,
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Row,
  Segmented,
  Select,
  Space,
  Tag,
  Typography,
} from 'antd';

import client from '@/gql/apollo';
import { ListStaffDocument, useSaveStaffMutation } from '@/gql';
import DataTable from '@/components/shared/data-table';
import { useMessageContext } from '@/components/common/message-context';
import { EMPLOYMENT_TYPES, STAFF_STATUSES } from '@/config/staff';
import { MOBILE_HINT, isValidEmail, isValidMobile } from '@/config/ph-contact';
import { onError } from '@/utils';

const { Text } = Typography;

type StatusFilter = 'active' | 'inactive' | 'all';

const options = (source: Record<string, string>) => Object.entries(source).map(([value, label]) => ({ value, label }));

const MemberForm = ({ member, open, onClose, onSaved }: any) => {
  const [form] = Form.useForm();
  const { messageApi } = useMessageContext();
  const editing = !!member?.uuid;

  const [saveStaff, { loading }] = useSaveStaffMutation({
    onCompleted: (data) => {
      messageApi?.success(`${data.saveStaff?.name} ${editing ? 'updated' : 'added'}`);
      onSaved();
      onClose();
    },
    onError,
  });

  const onFinish = (values: any) =>
    saveStaff({
      variables: {
        request: {
          uuid: member?.uuid,
          ...values,
          hiredAt: values.hiredAt ? values.hiredAt.startOf('day').toISOString() : null,
        },
      },
    });

  return (
    <Modal
      title={editing ? `Edit ${member.name ?? member.email}` : 'Add member'}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText={editing ? 'Save Changes' : 'Add Member'}
      confirmLoading={loading}
      width="min(640px, 100vw)"
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
        onFinish={onFinish}
        initialValues={{
          employmentType: 'regular',
          status: 'active',
          ...member,
          hiredAt: member?.hiredAt ? dayjs(member.hiredAt) : undefined,
        }}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="name" label="Full name" rules={[{ required: true, message: 'Enter a name.' }]}>
              <Input autoFocus />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Enter an email.' },
                {
                  validator: (_, value) =>
                    !value || isValidEmail(value)
                      ? Promise.resolve()
                      : Promise.reject(new Error('Enter a valid email.')),
                },
              ]}
            >
              <Input type="email" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="position" label="Position">
              <Input placeholder="e.g. CNC Operator" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="phone"
              label="Mobile"
              rules={[
                {
                  validator: (_, value) =>
                    !value || isValidMobile(value) ? Promise.resolve() : Promise.reject(new Error(MOBILE_HINT)),
                },
              ]}
            >
              <Input placeholder="0917 123 4567" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="employmentType" label="Employment type">
              <Select options={options(EMPLOYMENT_TYPES)} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="shift" label="Shift">
              <Input placeholder="e.g. Day, 7am to 4pm" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="hiredAt" label="Date hired">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          {editing ? (
            <Col xs={24} sm={12}>
              <Form.Item
                name="status"
                label="Status"
                extra="Inactive members stay on past records but can't be assigned new work."
              >
                <Select options={options(STAFF_STATUSES)} />
              </Form.Item>
            </Col>
          ) : null}
        </Row>
      </Form>
    </Modal>
  );
};

const Members: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  const [editing, setEditing] = useState<any>(null);

  const columns: ProColumns<any>[] = [
    {
      title: 'Member',
      dataIndex: 'name',
      render: (_, member) => (
        <div>
          <div style={{ fontWeight: 500 }}>{member.name || member.email}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {member.email}
          </Text>
        </div>
      ),
    },
    {
      title: 'Position',
      width: 160,
      dataIndex: 'position',
      render: (_, member) => member.position || <Text type="secondary">—</Text>,
    },
    {
      title: 'Mobile',
      width: 140,
      dataIndex: 'phone',
      render: (_, member) => member.phone || <Text type="secondary">—</Text>,
    },
    {
      title: 'Employment',
      width: 130,
      dataIndex: 'employmentType',
      render: (_, member) => EMPLOYMENT_TYPES[member.employmentType as keyof typeof EMPLOYMENT_TYPES] ?? '—',
    },
    {
      title: 'Hired',
      width: 120,
      dataIndex: 'hiredAt',
      render: (_, member) =>
        member.hiredAt ? dayjs(member.hiredAt).format('YYYY-MM-DD') : <Text type="secondary">—</Text>,
    },
    {
      title: 'Sign-in',
      width: 110,
      key: 'login',
      render: (_, member) =>
        member.hasLogin ? (
          <Tag>{member.role ? member.role.charAt(0).toUpperCase() + member.role.slice(1) : 'Has login'}</Tag>
        ) : (
          <Text type="secondary">No login</Text>
        ),
    },
    {
      title: 'Status',
      width: 110,
      dataIndex: 'status',
      render: (_, member) => (
        <Badge
          status={member.status === 'inactive' ? 'default' : 'success'}
          text={STAFF_STATUSES[member.status as keyof typeof STAFF_STATUSES] ?? member.status}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'option',
      valueType: 'option',
      width: 80,
      render: (_, member) => [
        <Button key="edit" size="small" type="link" onClick={() => setEditing(member)}>
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
        entityName="members"
        emptyTitle={keyword || statusFilter !== 'all' ? 'No matching members' : undefined}
        emptyHint="Add the people who work here so work can be assigned and reported against them."
        params={{ keyword, statusFilter }}
        request={async (params) => {
          const { data } = await client.query({ query: ListStaffDocument, fetchPolicy: 'network-only' });
          const term = String(params.keyword ?? '')
            .trim()
            .toLowerCase();
          const rows = (data.listStaff ?? []).filter((member: any) => {
            if (params.statusFilter !== 'all' && (member.status ?? 'active') !== params.statusFilter) return false;
            if (!term) return true;
            return [member.name, member.email, member.position, member.phone].some((f) =>
              f?.toLowerCase().includes(term),
            );
          });
          return { data: rows, total: rows.length, success: true };
        }}
        headerTitle={
          <Space wrap>
            <Input.Search
              allowClear
              placeholder="Search name, email, position"
              onSearch={setKeyword}
              onChange={(e) => !e.target.value && setKeyword('')}
              style={{ width: 260 }}
              aria-label="Search members"
            />
            <Segmented<StatusFilter>
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
                { label: 'All', value: 'all' },
              ]}
            />
          </Space>
        }
        toolBarRender={() => [
          <Button key="add" type="primary" size="small" onClick={() => setEditing({})}>
            Add Member
          </Button>,
        ]}
      />

      <MemberForm
        open={!!editing}
        member={editing}
        onClose={() => setEditing(null)}
        onSaved={() => actionRef.current?.reload()}
      />
    </>
  );
};

export default Members;
