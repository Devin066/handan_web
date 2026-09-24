import { Alert, Card, Checkbox, Select, Skeleton, Space, Table, Tag, Typography } from 'antd';

import {
  useListStaffQuery,
  useRolePermissionsQuery,
  useSetUserRoleMutation,
  useUpdateRolePermissionsMutation,
} from '@/gql';
import { useMessageContext } from '@/components/common/message-context';
import { onError } from '@/utils';

const { Text } = Typography;

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  manager: 'Manager',
  finance: 'Finance',
  hr: 'HR',
  employee: 'Shop floor',
};

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

  const toggle = (role: any, module: string, on: boolean) => {
    const next = on ? [...role.modules, module] : role.modules.filter((m: string) => m !== module);
    updatePermissions({
      variables: { request: { role: role.role, modules: next } },
    });
  };

  return (
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
      <Card size="small" title="Module Access by Role">
        <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
          A role without a module does not see it in the menu, and its actions there are refused. The owner always has
          full access.
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
            ...modules.map((m) => ({
              title: m.label,
              align: 'center' as const,
              render: (_: any, r: any) => (
                <Checkbox
                  aria-label={`${ROLE_LABELS[r.role] ?? r.role} can use ${m.label}`}
                  checked={r.modules.includes(m.key)}
                  disabled={r.role === 'owner'}
                  onChange={(e) => toggle(r, m.key, e.target.checked)}
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
                  options={Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }))}
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
