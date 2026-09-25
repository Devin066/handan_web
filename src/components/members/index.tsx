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
  Switch,
  Tag,
  Typography,
} from 'antd';

import client from '@/gql/apollo';
import { CheckCircleFilled, MinusCircleOutlined } from '@ant-design/icons';
import {
  ListStaffDocument,
  useMyModulesQuery,
  useRolePermissionsQuery,
  useSaveStaffMutation,
  useSetMemberLoginMutation,
} from '@/gql';
import useModuleAccess from '@/hooks/use-module-access';
import { ROLE_LABELS } from '@/components/roles';
import { tokens } from '@/components/common/theme';
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

  const { data: access } = useMyModulesQuery();
  // Logins are a Settings permission; HR can edit the profile without them.
  const canManageLogins = ((access?.myModules ?? []) as string[]).includes('settings');
  const { data: rolesData } = useRolePermissionsQuery({ skip: !canManageLogins });
  const loginRoles = ((rolesData?.rolePermissions ?? []) as any[]).filter(
    (r) => r.canLogin !== false || r.role === member?.role,
  );
  const loginEnabled = Form.useWatch('loginEnabled', form);

  const [saveStaff, { loading }] = useSaveStaffMutation({ onError });
  const [setMemberLogin, { loading: savingLogin }] = useSetMemberLoginMutation({ onError });

  const onFinish = async ({ loginEnabled: enabled, loginRole, password, ...values }: any) => {
    const saved = await saveStaff({
      variables: {
        request: {
          uuid: member?.uuid,
          ...values,
          hiredAt: values.hiredAt ? values.hiredAt.startOf('day').toISOString() : null,
        },
      },
    });
    const staff = saved.data?.saveStaff;
    if (!staff) return;

    const loginChanged =
      canManageLogins && (!!enabled !== !!member?.hasLogin || (enabled && (loginRole !== member?.role || !!password)));
    if (loginChanged) {
      const result = await setMemberLogin({
        variables: {
          request: {
            staffUuid: staff.uuid!,
            enabled: !!enabled,
            role: enabled ? loginRole : null,
            password: password || null,
          },
        },
      });
      // The profile saved; keep the form open so the login problem can be fixed.
      if (!result.data?.setMemberLogin) return;
    }

    messageApi?.success(`${staff.name} ${editing ? 'updated' : 'added'}`);
    onSaved();
    onClose();
  };

  return (
    <Modal
      title={editing ? `Edit ${member.name ?? member.email}` : 'Add Member'}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText={editing ? 'Save Changes' : 'Add Member'}
      confirmLoading={loading || savingLogin}
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
          loginEnabled: !!member?.hasLogin,
          loginRole: member?.role ?? 'employee',
        }}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="name" label="Full Name" rules={[{ required: true, message: 'Enter a name.' }]}>
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
            <Form.Item name="employmentType" label="Employment Type">
              <Select options={options(EMPLOYMENT_TYPES)} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="shift" label="Shift">
              <Input placeholder="e.g. Day, 7am to 4pm" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="hiredAt" label="Date Hired">
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

        {canManageLogins ? (
          <fieldset className="login-access">
            <legend>Login Access</legend>
            <Form.Item name="loginEnabled" valuePropName="checked" style={{ marginBottom: 8 }}>
              <Switch checkedChildren="Login" unCheckedChildren="No Login" />
            </Form.Item>
            <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
              {loginEnabled
                ? 'They sign in with the email above. What they can open depends on the role (Settings › Roles).'
                : 'Without a login they still appear on work orders, attendance and payroll.'}
            </Text>
            {loginEnabled ? (
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="loginRole" label="Role" rules={[{ required: true, message: 'Choose a role.' }]}>
                    <Select
                      options={loginRoles.map((r) => ({ value: r.role, label: ROLE_LABELS[r.role] ?? r.role }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="password"
                    label={member?.hasLogin ? 'New Password' : 'Temporary Password'}
                    extra={
                      member?.hasLogin ? 'Leave blank to keep their current password.' : 'Give it to them in person.'
                    }
                    rules={[
                      { required: !member?.hasLogin, message: 'Set a password for the new login.' },
                      { min: 8, message: 'At least 8 characters.' },
                    ]}
                  >
                    <Input.Password autoComplete="new-password" />
                  </Form.Item>
                </Col>
              </Row>
            ) : null}
          </fieldset>
        ) : null}
      </Form>
    </Modal>
  );
};

const Members: React.FC = () => {
  const canEdit = useModuleAccess().canEdit('hr');
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
      title: 'Role',
      width: 110,
      key: 'role',
      render: (_, member) =>
        member.role ? (
          <Tag>{member.role.charAt(0).toUpperCase() + member.role.slice(1)}</Tag>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: 'Login',
      width: 120,
      key: 'login',
      render: (_, member) =>
        member.hasLogin ? (
          <Space size={6}>
            <CheckCircleFilled style={{ color: tokens.success }} />
            Login
          </Space>
        ) : (
          <Space size={6}>
            <MinusCircleOutlined style={{ color: tokens.textTertiary }} />
            <Text type="secondary">No Login</Text>
          </Space>
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

  const renderToolbar = () => [
    <Button key="add" type="primary" size="small" onClick={() => setEditing({})}>
      Add Member
    </Button>,
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
              aria-label="Search Members"
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
        toolBarRender={canEdit ? renderToolbar : undefined}
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
