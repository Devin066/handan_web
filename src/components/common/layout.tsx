import { PageContainer, ProLayout } from '@ant-design/pro-components';
import type { MenuDataItem } from '@ant-design/pro-components';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { createContext, useContext, useState } from 'react';
import type { FC, ReactNode } from 'react';

import menuProps from './_menu';
import { useMyModulesQuery } from '@/gql';
import { tokens } from './theme';
import brand from '@/config/brand';
import GlobalFloatButtons from './global-float-buttons';
import SiderFooter from './sider-footer';

interface LayoutProps {
  children: ReactNode;
}

interface LayoutConfig {
  extra?: ReactNode;
  title?: ReactNode;
}

interface LayoutContextValue {
  layoutConfig: LayoutConfig;
  setLayoutConfig: (config: LayoutConfig) => void;
}

const LayoutContext = createContext<LayoutContextValue>({
  layoutConfig: {},
  setLayoutConfig: () => {},
});

export const LayoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({});

  return <LayoutContext.Provider value={{ layoutConfig, setLayoutConfig }}>{children}</LayoutContext.Provider>;
};

export const useLayout = () => useContext(LayoutContext);

const GlobalLayout: FC<LayoutProps> = ({ children }) => {
  const { layoutConfig } = useLayout();
  const router = useRouter();

  // Remember whether the sidebar is collapsed to icons across page loads.
  const [collapsed, setCollapsed] = useState(() => {
    // On phones the sidebar is a drawer; "not collapsed" would open it on load.
    if (window.innerWidth < 768) return true;
    try {
      return localStorage.getItem('sidebar-collapsed') === '1';
    } catch {
      return false;
    }
  });
  const handleCollapse = (next: boolean) => {
    setCollapsed(next);
    try {
      localStorage.setItem('sidebar-collapsed', next ? '1' : '0');
    } catch {
      // Storage can be unavailable (private mode); the toggle still works.
    }
  };

  // Modules this user's role can open (Settings > Roles). Until it loads, show
  // nothing gated rather than flashing menu entries that will be refused.
  const { data: access } = useMyModulesQuery({
    fetchPolicy: 'cache-and-network',
  });
  const allowed = new Set((access?.myModules ?? []) as string[]);

  const menuDataRender = (menuList: MenuDataItem[]): MenuDataItem[] => {
    const menuListTemp = menuList
      .filter((item: MenuDataItem) => !item.module || allowed.has(item.module))
      .map((item: MenuDataItem) => {
        const localItem = {
          ...item,
          children: item.children ? menuDataRender(item.children) : [],
        };
        return localItem;
      })
      .filter((item) => Object.keys(item).length > 0);

    return menuListTemp;
  };

  const renderTitle = () => {
    if (!layoutConfig.title) return false;
    return layoutConfig.title;
  };

  const handleLogoClick = () => {
    router.push('/dashboard');
  };

  return (
    <div
      id="layout"
      style={{
        height: '100vh',
      }}
    >
      <ProLayout
        {...({
          siderWidth: 232,
          collapsed,
          onCollapse: handleCollapse,
          // Without this ProLayout collapses by screen width on load and reports it
          // through onCollapse, overwriting the user's saved choice.
          breakpoint: false,
          // The default toggle floats over the sidebar edge and covers the logo
          // when collapsed; a footer button keeps it in the rail.
          collapsedButtonRender: false,
          menuFooterRender: () => <SiderFooter collapsed={collapsed} onToggle={() => handleCollapse(!collapsed)} />,
          ...menuProps,
          logo: '/logo.png',
          title: brand.name,
          layout: 'side',
          onMenuHeaderClick: handleLogoClick,
          // Chrome stays quiet so the data carries the visual weight. The
          // previous warm-beige palette and blurred, rounded panels fought the
          // tables for attention and cost a blur pass on every scroll.
          token: {
            colorBgCollapsedButton: tokens.surface,
            colorTextCollapsedButtonHover: tokens.primary,
            colorTextCollapsedButton: tokens.textTertiary,
            sider: {
              colorMenuBackground: tokens.chrome,
              colorBgMenuItemCollapsedElevated: tokens.chrome,
              colorMenuItemDivider: tokens.chromeHover,
              colorTextMenuTitle: '#FFFFFF',
              colorTextMenu: tokens.chromeText,
              colorTextMenuSecondary: tokens.chromeTextMuted,
              colorTextMenuSelected: '#FFFFFF',
              colorTextMenuActive: '#FFFFFF',
              colorTextMenuItemHover: '#FFFFFF',
              colorBgMenuItemHover: tokens.chromeHover,
              colorBgMenuItemSelected: tokens.chromeSelected,
              colorTextSubMenuSelected: '#FFFFFF',
            },
            header: {
              colorBgHeader: tokens.surface,
            },
            pageContainer: {
              paddingBlockPageContainerContent: 0,
              paddingInlinePageContainerContent: 0,
            },
          },
          header: {
            style: {
              borderBottom: `1px solid ${tokens.border}`,
              boxShadow: 'none',
            },
          },
          siderMenuProps: { className: 'app-sider' },
          location: {
            pathname: window?.location.pathname,
          },
          menuDataRender: menuDataRender,
          menuItemRender: (item: any, dom: any) => <Link href={item.path || '/'}>{dom}</Link>,
        } as any)}
      >
        <PageContainer
          title={renderTitle()}
          extra={layoutConfig.extra}
          header={{
            style: {
              padding: '12px 20px 0',
              backgroundColor: 'transparent',
            },
          }}
        >
          <div style={{ padding: '12px 20px 24px' }}>{children}</div>
        </PageContainer>
      </ProLayout>

      {/* Global float buttons */}
      <GlobalFloatButtons />
    </div>
  );
};

const GlobalLayoutWrapper: FC<LayoutProps> = (props) => (
  <LayoutProvider>
    <GlobalLayout {...props} />
  </LayoutProvider>
);

export default GlobalLayoutWrapper;
