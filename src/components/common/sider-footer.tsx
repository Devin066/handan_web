import { QuestionCircleOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, Tooltip, message } from 'antd';
import { useRouter } from 'next/router';

import { useListStaffQuery } from '@/gql';
import brand from '@/config/brand';
import useAuthUserStore from '@/stores/persisted/useAuthUser';
import { tokens } from './theme';
import useRoles from '@/hooks/use-roles';

/** A left-panel glyph with an arrow: reads as "open / close the sidebar". */
const PanelIcon = ({ collapsed }: { collapsed: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <rect x="2.75" y="3.75" width="14.5" height="12.5" rx="2.25" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7.5 4v12" stroke="currentColor" strokeWidth="1.5" />
    <path
      d={collapsed ? 'M4.4 8.4 5.9 10l-1.5 1.6' : 'M5.9 8.4 4.4 10l1.5 1.6'}
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Foot of the sidebar: who is signed in, with their account menu, and the
 * toggle that collapses the rail to icons.
 */
const SiderFooter = ({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) => {
  const router = useRouter();
  const { currentUser, logout } = useAuthUserStore();
  const email: string | undefined = currentUser?.email;

  // The login only returns an email; the member record has the name and role.
  const { data } = useListStaffQuery({ fetchPolicy: 'cache-first', skip: !email });
  const me: any = (data?.listStaff ?? []).find((staff: any) => staff?.email === email);
  const name = me?.name || email || 'Account';
  const { roleLabel } = useRoles();
  const role = [roleLabel(me?.role), me?.position].filter(Boolean).join(' · ') || email;

  const signOut = async () => {
    localStorage.removeItem('accessToken');
    logout();
    await router.push('/login');
    message.success('Signed out');
  };

  const toggleLabel = collapsed ? 'Expand sidebar' : 'Collapse sidebar';

  const account = (
    <Dropdown
      trigger={['click']}
      placement="topLeft"
      menu={{
        items: [
          { key: 'profile', icon: <UserOutlined />, label: 'Profile Settings' },
          {
            key: 'help',
            icon: <QuestionCircleOutlined />,
            label: (
              <a href={brand.helpUrl} target="_blank" rel="noopener noreferrer">
                Help
              </a>
            ),
          },
          { type: 'divider' as const },
          { key: 'logout', icon: <LogoutOutlined />, label: 'Sign Out', danger: true },
        ],
        onClick: ({ key }) => {
          if (key === 'profile') router.push('/profile');
          if (key === 'logout') signOut();
        },
      }}
    >
      <button type="button" className="sider-account" aria-label={`Account menu for ${name}`}>
        <Avatar size={32} style={{ backgroundColor: tokens.primary, color: tokens.onPrimary, flexShrink: 0 }}>
          {name.charAt(0).toUpperCase()}
        </Avatar>
        {collapsed ? null : (
          <span className="sider-account-text">
            <span className="sider-account-name">{name}</span>
            <span className="sider-account-role">{role}</span>
          </span>
        )}
      </button>
    </Dropdown>
  );

  return (
    <div className={collapsed ? 'sider-footer is-collapsed' : 'sider-footer'}>
      {account}
      <Tooltip title={toggleLabel} placement="right">
        <button type="button" className="sider-toggle" onClick={onToggle} aria-label={toggleLabel}>
          <PanelIcon collapsed={collapsed} />
        </button>
      </Tooltip>
    </div>
  );
};

export default SiderFooter;
