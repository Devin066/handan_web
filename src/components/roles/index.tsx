import { Alert, Card, Select, Skeleton, Space, Switch, Table, Tag, Typography } from 'antd';

import {
  useListStaffQuery,
  useRolePermissionsQuery,
  useSetRoleLoginMutation,
  useSetUserRoleMutation,
  useUpdateRolePermissionsMutation,
} from '@/gql';
import { useMessageContext } from '@/components/common/message-context';
import { onError } from '@/utils';

const { Text } = Typography;

export const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  manager: 'Manager',
  finance: 'Finance',
  hr: 'HR',
  employee: 'Shop Floor',
};

const ACCESS_LEVELS = [
  { value: 'none', label: 'None' },
  { value: 'view', label: 'View' },
  { value: 'edit', label: 'Edit' },
];

/** Roles (SRS 4.8): which modules each role can use, and who holds which role. */
const Roles = () => {
  const { messageApi } = useMessageContext();
  const { data, loading, error, refetch } = useRolePermissionsQuery({
    fetchPolicy: 'network-only',
  });
  const staff = useListStaffQuery({ fetchPolicy: 'network-only' });

  const [updatePermissions] = useUpdateRolePermissionsMutation({
    onCompleted: () => refetch(),
    onError,
  });
  const [setRoleLogin] = useSetRoleLoginMutation({
    onCompleted: (d) =>
      messageApi?.success(
        `${ROLE_LABELS[d.setRoleLogin?.role ?? ''] ?? 'Role'} ${d.setRoleLogin?.canLogin ? 'can now be given a login' : 'can no longer sign in'}`,
      ),
    onError,
    refetchQueries: ['RolePermissions', 'ListStaff'],
  });
  const [setRole] = useSetUserRoleMutation({
    onCompleted: () => {
      messageApi?.success('Role updated. It applies the next time they load a page.');
      staff.refetch();
    },
    onError,
  });

  if (error) return <Alert type="error" showIcon message="Roles couldn't load." description={error.message} />;
  if (loading && !data) return <Skeleton active />;

  const modules = (data?.modules ?? []) as any[];
  const roles = (data?.rolePermissions ?? []) as any[];
  const logins = ((staff.data?.listStaff ?? []) as any[]).filter((s) => s.hasLogin);

  const levelOf = (role: any, module: string) => {
    if (!role.modules.includes(module)) return 'none';
    return (role.viewOnly ?? []).includes(module) ? 'view' : 'edit';
  };

  const setLevel = (role: any, module: string, level: string) => {
    const modules = role.modules.filter((m: string) => m !== module);
    const viewOnly = (role.viewOnly ?? []).filter((m: string) => m !== module);
    if (level !== 'none') modules.push(module);
    if (level === 'view') viewOnly.push(module);
    updatePermissions({ variables: { request: { role: role.role, modules, viewOnly } } });
  };

  return (
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
      <Card size="small" title="Module Access by Role">
        <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
          None hides a module from the role. View opens its pages but refuses anything that saves; Edit allows both.
          Login decides whether people with that role can be given a sign-in at all; turning it off signs them out. The
          owner always has full access.
        </Text>
        <Table
          size="small"
          rowKey="role"
          pagination={false}
          scroll={{ x: 'max-content' }}
          dataSource={roles}
          columns={[
            {
              title: 'Role',
              fixed: 'left',
              render: (_: any, r: any) => <strong>{ROLE_LABELS[r.role] ?? r.role}</strong>,
            },
            {
              title: 'Login',
              align: 'center' as const,
              render: (_: any, r: any) => (
                <Switch
                  size="small"
                  aria-label={`${ROLE_LABELS[r.role] ?? r.role} can sign in`}
                  checked={r.role === 'owner' || r.canLogin !== false}
                  disabled={r.role === 'owner'}
                  onChange={(canLogin) => setRoleLogin({ variables: { request: { role: r.role, canLogin } } })}
                />
              ),
            },
            ...modules.map((m) => ({
              title: m.label,
              align: 'center' as const,
              render: (_: any, r: any) => (
                <Select
                  size="small"
                  className={`access-level access-${levelOf(r, m.key)}`}
                  aria-label={`${ROLE_LABELS[r.role] ?? r.role} access to ${m.label}`}
                  value={r.role === 'owner' ? 'edit' : levelOf(r, m.key)}
                  disabled={r.role === 'owner'}
                  popupMatchSelectWidth={false}
                  onChange={(level) => setLevel(r, m.key, level)}
                  options={ACCESS_LEVELS}
                />
              ),
            })),
          ]}
        />
      </Card>

      <Card size="small" title="People with a Login">
        <Table
          size="small"
          rowKey="uuid"
          loading={staff.loading}
          pagination={false}
          scroll={{ x: 'max-content' }}
          dataSource={logins}
          locale={{
            emptyText: 'Nobody has a login yet. Invite people under User Management.',
          }}
          columns={[
            {
              title: 'Name',
              render: (_: any, s: any) => (
                <div>
                  <div>{s.name ?? s.email}</div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {s.email}
                  </Text>
                </div>
              ),
            },
            {
              title: 'Role',
              render: (_: any, s: any) => (
                <Select
                  style={{ width: 180 }}
                  value={s.role}
                  aria-label={`Role for ${s.name ?? s.email}`}
                  onChange={(role) =>
                    setRole({
                      variables: { request: { staffUuid: s.uuid, role } },
                    })
                  }
                  options={Object.entries(ROLE_LABELS)
                    .filter(([value]) => value === s.role || roles.find((r) => r.role === value)?.canLogin !== false)
                    .map(([value, label]) => ({ value, label }))}
                />
              ),
            },
            {
              title: 'Can Use',
              render: (_: any, s: any) =>
                (roles.find((r) => r.role === s.role)?.modules ?? []).map((key: string) => (
                  <Tag key={key}>{modules.find((m) => m.key === key)?.label ?? key}</Tag>
                )),
            },
          ]}
        />
      </Card>
    </Space>
  );
};

export default Roles;
