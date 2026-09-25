import { useState } from 'react';
import {
  BookOutlined,
  CheckOutlined,
  DashboardOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  IdcardOutlined,
  LockOutlined,
  MinusOutlined,
  PlusOutlined,
  ProfileOutlined,
  RightOutlined,
  RocketOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  TableOutlined,
  TeamOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Segmented,
  Select,
  Skeleton,
  Switch,
  Table,
  Typography,
} from 'antd';

import {
  useDeleteRoleMutation,
  useListStaffQuery,
  usePageAccessQuery,
  useSaveRoleMutation,
  useSetPageAccessMutation,
  useSetRoleLoginMutation,
  useSetUserRoleMutation,
} from '@/gql';
import { useMessageContext } from '@/components/common/message-context';
import { ACCESS_TREE, ALL_PAGES, modulePages, type AccessPage } from '@/config/access';
import useRoles from '@/hooks/use-roles';
import { onError } from '@/utils';

const { Text, Title } = Typography;

type Level = 'none' | 'view' | 'edit';

const MODULE_ICONS: Record<string, React.ReactNode> = {
  dashboard: <DashboardOutlined />,
  sales: <ProfileOutlined />,
  purchasing: <ShoppingCartOutlined />,
  production: <RocketOutlined />,
  inventory: <BookOutlined />,
  finance: <WalletOutlined />,
  partners: <TeamOutlined />,
  hr: <IdcardOutlined />,
  settings: <SettingOutlined />,
};

// Icon and word together, so the level never rests on colour alone.
const LEVEL_OPTIONS = [
  { value: 'none', label: 'None', icon: <MinusOutlined /> },
  { value: 'view', label: 'View', icon: <EyeOutlined /> },
  { value: 'edit', label: 'Edit', icon: <CheckOutlined /> },
];

const LEVEL_HINT: Record<Level, string> = {
  none: 'Hidden from the menu',
  view: 'Can open, can’t save',
  edit: 'Can open and save',
};

/** Add a role, or rename one. Keys stay fixed so people keep their role. */
const RoleDialog = ({
  role,
  onClose,
  onSaved,
}: {
  role: any;
  onClose: () => void;
  onSaved: (key?: string) => void;
}) => {
  const [form] = Form.useForm();
  const { messageApi } = useMessageContext();
  const editing = !!role?.key;
  const [save, { loading }] = useSaveRoleMutation({
    onCompleted: (d) => {
      messageApi?.success(editing ? `Renamed to ${d.saveRole?.label}` : `${d.saveRole?.label} added. Set its access.`);
      onSaved(d.saveRole?.key ?? undefined);
      onClose();
    },
    onError,
  });
  return (
    <Modal
      open={!!role}
      title={editing ? `Rename ${role.label}` : 'Add Role'}
      okText={editing ? 'Save Name' : 'Add Role'}
      onOk={() => form.submit()}
      onCancel={onClose}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
        initialValues={{ label: role?.label }}
        onFinish={(values) => save({ variables: { request: { key: role?.key ?? null, label: values.label } } })}
      >
        <Form.Item
          name="label"
          label="Role Name"
          extra={
            editing ? 'People with this role keep it; only the name changes.' : 'A new role starts with no access.'
          }
          rules={[
            { required: true, whitespace: true, message: 'Enter a role name.' },
            { max: 40, message: 'Keep it under 40 characters.' },
          ]}
        >
          <Input autoFocus placeholder="e.g. Purchasing Clerk" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

/** One row of the access tree: a label and a one-click None / View / Edit choice. */
const AccessRow = ({
  label,
  icon,
  levels,
  depth,
  locked,
  expanded,
  onToggle,
  onChange,
}: {
  label: string;
  icon?: React.ReactNode;
  levels: Level[];
  depth: number;
  locked: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  onChange: (level: Level) => void;
}) => {
  const unique = Array.from(new Set(levels));
  const value = unique.length === 1 ? unique[0] : undefined;
  const counts = (['edit', 'view', 'none'] as Level[])
    .map((l) => [l, levels.filter((x) => x === l).length] as const)
    .filter(([, n]) => n > 0)
    .map(([l, n]) => `${n} ${LEVEL_OPTIONS.find((o) => o.value === l)!.label}`)
    .join(' · ');

  return (
    <div className={`access-tree-row depth-${depth}${onToggle ? ' is-parent' : ''}`}>
      <div className="access-tree-label">
        {onToggle ? (
          <button
            type="button"
            className="access-tree-toggle"
            aria-expanded={expanded}
            aria-label={`${expanded ? 'Collapse' : 'Expand'} ${label}`}
            onClick={onToggle}
          >
            {expanded ? <DownOutlined /> : <RightOutlined />}
          </button>
        ) : (
          <span className="access-tree-spacer" />
        )}
        {icon ? <span className="access-tree-icon">{icon}</span> : null}
        <span className="access-tree-name">{label}</span>
        {value ? (
          <Text type="secondary" className="access-tree-hint">
            {LEVEL_HINT[value]}
          </Text>
        ) : (
          <Text className="access-tree-hint access-tree-mixed">Mixed: {counts}</Text>
        )}
      </div>
      <Segmented
        className={`access-segmented access-${value ?? 'mixed'}`}
        aria-label={`Access to ${label}`}
        value={value}
        disabled={locked}
        options={LEVEL_OPTIONS}
        onChange={(v) => onChange(v as Level)}
      />
    </div>
  );
};

/** Read-only overview of every role side by side, for checking at a glance. */
const CompareRoles = ({ roles, levelOf, roleLabel }: { roles: any[]; levelOf: any; roleLabel: any }) => {
  const rows = ACCESS_TREE.map((m) => ({
    key: m.key,
    label: m.label,
    pages: modulePages(m).map((p) => p.key),
    children:
      m.key === 'dashboard' ? undefined : modulePages(m).map((p) => ({ key: p.key, label: p.label, pages: [p.key] })),
  }));
  const cell = (role: string, pages: string[]) => {
    const levels = Array.from(new Set(pages.map((p) => levelOf(role, p))));
    if (levels.length > 1) return <Text type="secondary">Mixed</Text>;
    const level = levels[0] as Level;
    const option = LEVEL_OPTIONS.find((o) => o.value === level)!;
    return (
      <span className={`compare-level compare-${level}`}>
        {option.icon} {option.label}
      </span>
    );
  };
  return (
    <Table
      size="small"
      rowKey="key"
      pagination={false}
      scroll={{ x: 'max-content' }}
      dataSource={rows}
      expandable={{ defaultExpandAllRows: false, indentSize: 16 }}
      columns={[
        {
          title: 'Page',
          fixed: 'left',
          width: 220,
          render: (_: any, r: any) => (r.children ? <strong>{r.label}</strong> : r.label),
        },
        ...roles.map((role) => ({
          title: roleLabel(role.key),
          width: 120,
          render: (_: any, r: any) => cell(role.key, r.pages),
        })),
      ]}
    />
  );
};

/** Roles (SRS 4.8): pick a role, then set what it can open or change, page by page. */
const Roles = () => {
  const { messageApi } = useMessageContext();
  const { data, loading, error, refetch } = usePageAccessQuery({ fetchPolicy: 'network-only' });
  const staff = useListStaffQuery({ fetchPolicy: 'network-only' });
  const { roles, roleLabel, refetch: refetchRoles } = useRoles();

  const [selected, setSelected] = useState<string>();
  const [dialogRole, setDialogRole] = useState<any>(null);
  const [comparing, setComparing] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const refreshAll = () => {
    refetch();
    refetchRoles();
    staff.refetch();
  };

  const [setPageAccess] = useSetPageAccessMutation({
    onCompleted: () => {
      messageApi?.success('Access saved');
      refetch();
    },
    onError,
  });
  const [setRoleLogin] = useSetRoleLoginMutation({
    onCompleted: (d) =>
      messageApi?.success(
        d.setRoleLogin?.canLogin ? 'People with this role can be given a login' : 'This role can no longer sign in',
      ),
    onError,
    refetchQueries: ['PageAccess', 'ListStaff'],
  });
  const [setRole] = useSetUserRoleMutation({
    onCompleted: () => {
      messageApi?.success('Role changed. It applies the next time they load a page.');
      refreshAll();
    },
    onError,
  });
  const [deleteRole] = useDeleteRoleMutation({
    onCompleted: () => {
      messageApi?.success('Role deleted');
      setSelected(undefined);
      refreshAll();
    },
    onError,
  });

  if (error) return <Alert type="error" showIcon message="Roles couldn't load." description={error.message} />;
  if ((loading && !data) || !roles.length) return <Skeleton active />;

  const access = new Map<string, Map<string, Level>>(
    ((data?.pageAccess ?? []) as any[]).map((r) => [r.role, new Map(r.pages.map((p: any) => [p.page, p.level]))]),
  );
  const loginFor = new Map<string, boolean>(
    ((data?.pageAccess ?? []) as any[]).map((r) => [r.role, r.canLogin !== false]),
  );
  const levelOf = (role: string, page: string): Level => access.get(role)?.get(page) ?? 'none';

  const current = roles.find((r) => r.key === selected) ?? roles[0];
  const isOwner = current.isOwner;
  const people = ((staff.data?.listStaff ?? []) as any[]).filter((s) => s.hasLogin && s.role === current.key);

  const set = (pages: string[], level: Level) =>
    setPageAccess({ variables: { request: { role: current.key, pages, level } } });

  const summary = (['edit', 'view', 'none'] as Level[]).map(
    (l) => [l, ALL_PAGES.filter((p) => levelOf(current.key, p.key) === l).length] as const,
  );

  const isOpen = (key: string) => !collapsed[key];
  const toggle = (key: string) => setCollapsed((c) => ({ ...c, [key]: !c[key] }));

  const pageRows = (pages: AccessPage[], depth: number) =>
    pages.map((page) => (
      <AccessRow
        key={page.key}
        label={page.label}
        depth={depth}
        locked={isOwner}
        levels={[levelOf(current.key, page.key)]}
        onChange={(level) => set([page.key], level)}
      />
    ));

  return (
    <div className="roles-layout">
      <Card
        size="small"
        className="roles-list"
        title="Roles"
        extra={
          <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setDialogRole({})}>
            Add Role
          </Button>
        }
      >
        {/* On narrow screens the list becomes a picker above the detail. */}
        <Select
          className="roles-picker"
          value={current.key}
          onChange={(key) => {
            setSelected(key);
            setComparing(false);
          }}
          aria-label="Role"
          options={roles.map((r) => ({ value: r.key, label: r.label }))}
        />
        <nav aria-label="Roles" className="roles-nav">
          {roles.map((r) => (
            <button
              key={r.key}
              type="button"
              className={`roles-nav-item${r.key === current.key && !comparing ? ' is-active' : ''}`}
              aria-current={r.key === current.key && !comparing ? 'page' : undefined}
              onClick={() => {
                setSelected(r.key);
                setComparing(false);
              }}
            >
              <span className="roles-nav-name">
                {r.isOwner ? <LockOutlined aria-hidden /> : null}
                {r.label}
              </span>
              <span className="roles-nav-meta">
                {r.memberCount} {r.memberCount === 1 ? 'person' : 'people'}
                {loginFor.get(r.key) === false ? ' · No sign-in' : ''}
              </span>
            </button>
          ))}
        </nav>
        <Button block icon={<TableOutlined />} className="roles-compare" onClick={() => setComparing((c) => !c)}>
          {comparing ? 'Back to Role' : 'Compare Roles'}
        </Button>
      </Card>

      <Card size="small" className="roles-detail">
        {comparing ? (
          <>
            <Title level={4} style={{ marginTop: 0 }}>
              Compare Roles
            </Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
              Every role side by side. Pick a role on the left to change it.
            </Text>
            <CompareRoles roles={roles} levelOf={levelOf} roleLabel={roleLabel} />
          </>
        ) : (
          <>
            <header className="role-header">
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  {current.label}
                </Title>
                <Text type="secondary">
                  {summary.map(([l, n]) => `${n} ${l === 'none' ? 'hidden' : l}`).join(' · ')}
                </Text>
              </div>
              {isOwner ? null : (
                <div className="role-actions">
                  <Button icon={<EditOutlined />} onClick={() => setDialogRole(current)}>
                    Rename
                  </Button>
                  <Popconfirm
                    title={`Delete the ${current.label} role?`}
                    description={
                      current.memberCount
                        ? `${current.memberCount} ${current.memberCount === 1 ? 'person has' : 'people have'} it. Move them to another role first.`
                        : 'Nobody has this role. This can’t be undone.'
                    }
                    okText="Delete Role"
                    okButtonProps={{ danger: true, disabled: current.memberCount > 0 }}
                    onConfirm={() => deleteRole({ variables: { request: { key: current.key } } })}
                  >
                    <Button danger icon={<DeleteOutlined />}>
                      Delete
                    </Button>
                  </Popconfirm>
                </div>
              )}
            </header>

            <div className="role-login">
              <div>
                <Text strong>Can Sign In</Text>
                <Text type="secondary" style={{ display: 'block', fontSize: 13 }}>
                  Off means nobody with this role can log in, and anyone signed in is signed out.
                </Text>
              </div>
              <Switch
                aria-label={`${current.label} can sign in`}
                checked={isOwner || loginFor.get(current.key) !== false}
                disabled={isOwner}
                onChange={(canLogin) => setRoleLogin({ variables: { request: { role: current.key, canLogin } } })}
              />
            </div>

            {isOwner ? (
              <Alert
                type="info"
                showIcon
                style={{ marginBottom: 12 }}
                message="The Owner always has full access. It can’t be renamed, limited or deleted."
              />
            ) : null}

            <section aria-label="Access" className="access-tree">
              <div className="access-tree-head">
                <Text strong>Access</Text>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Laid out like the sidebar. Setting a section sets every page in it.
                </Text>
              </div>
              {ACCESS_TREE.map((module) => {
                const pages = modulePages(module).map((p) => p.key);
                if (module.key === 'dashboard') {
                  return (
                    <AccessRow
                      key={module.key}
                      label={module.label}
                      icon={MODULE_ICONS[module.key]}
                      depth={0}
                      locked={isOwner}
                      levels={pages.map((p) => levelOf(current.key, p))}
                      onChange={(level) => set(pages, level)}
                    />
                  );
                }
                return (
                  <div key={module.key} className="access-tree-group">
                    <AccessRow
                      label={module.label}
                      icon={MODULE_ICONS[module.key]}
                      depth={0}
                      locked={isOwner}
                      expanded={isOpen(module.key)}
                      onToggle={() => toggle(module.key)}
                      levels={pages.map((p) => levelOf(current.key, p))}
                      onChange={(level) => set(pages, level)}
                    />
                    {isOpen(module.key) ? (
                      <>
                        {pageRows(module.pages, 1)}
                        {(module.groups ?? []).map((group) => {
                          const groupKey = `${module.key}:${group.label}`;
                          const groupPages = group.pages.map((p) => p.key);
                          return (
                            <div key={groupKey}>
                              <AccessRow
                                label={group.label}
                                depth={1}
                                locked={isOwner}
                                expanded={isOpen(groupKey)}
                                onToggle={() => toggle(groupKey)}
                                levels={groupPages.map((p) => levelOf(current.key, p))}
                                onChange={(level) => set(groupPages, level)}
                              />
                              {isOpen(groupKey) ? pageRows(group.pages, 2) : null}
                            </div>
                          );
                        })}
                      </>
                    ) : null}
                  </div>
                );
              })}
            </section>

            <section aria-label="People with this role" className="role-people">
              <Text strong>People with this Role</Text>
              {people.length ? (
                <ul>
                  {people.map((s) => (
                    <li key={s.uuid}>
                      <div>
                        <div>{s.name ?? s.email}</div>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          {s.email}
                        </Text>
                      </div>
                      <Select
                        style={{ width: 200 }}
                        value={s.role}
                        disabled={isOwner}
                        aria-label={`Role for ${s.name ?? s.email}`}
                        onChange={(role) => setRole({ variables: { request: { staffUuid: s.uuid, role } } })}
                        options={roles
                          .filter((r) => r.key === s.role || loginFor.get(r.key) !== false)
                          .map((r) => ({ value: r.key, label: r.label }))}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Nobody has this role yet. Give someone a login under User Management."
                />
              )}
            </section>
          </>
        )}
      </Card>

      <RoleDialog
        role={dialogRole}
        onClose={() => setDialogRole(null)}
        onSaved={(key) => {
          if (key) setSelected(key);
          refreshAll();
        }}
      />
    </div>
  );
};

export default Roles;
