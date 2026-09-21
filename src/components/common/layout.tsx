import { PageContainer, ProLayout } from '@ant-design/pro-components';
import type { MenuDataItem } from '@ant-design/pro-components';
import { useRouter } from 'next/router';
import React, { createContext, useContext, useState } from 'react';
import type { FC, ReactNode } from 'react';

import useAuthUserStore from '@/stores/persisted/useAuthUser';

import menuProps from './_menu';
import { tokens } from './theme';
import AvatarDropdown from './avatar-dropdown';
import GlobalFloatButtons from './global-float-buttons';
import HeaderActions from './header-actions';

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
  const { currentUser, logout } = useAuthUserStore();

  const menuDataRender = (menuList: MenuDataItem[]): MenuDataItem[] => {
    const menuListTemp = menuList
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
          siderWidth: 180,
          ...menuProps,
          logo: '/logo.png',
          title: 'Handan',
          layout: 'mix',
          onMenuHeaderClick: handleLogoClick,
          // Chrome stays quiet so the data carries the visual weight. The
          // previous warm-beige palette and blurred, rounded panels fought the
          // tables for attention and cost a blur pass on every scroll.
          token: {
            colorTextMenuTitle: tokens.text,
            colorTextMenu: tokens.textSecondary,
            colorTextMenuSelected: tokens.primary,
            colorTextMenuActive: tokens.primary,
            colorBgMenuItemSelected: '#EFF6FF',
            colorBgMenuItemHover: tokens.surfaceMuted,
            colorBgCollapsedButton: tokens.surface,
            colorTextCollapsedButtonHover: tokens.primary,
            colorTextCollapsedButton: tokens.textTertiary,
            sider: {
              colorMenuBackground: tokens.surface,
              colorBgMenuItemCollapsedElevated: tokens.surface,
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
          siderMenuProps: {
            style: {
              borderRight: `1px solid ${tokens.border}`,
            },
          },
          location: {
            pathname: window?.location.pathname,
          },
          menuDataRender: menuDataRender,
          avatarProps: {
            title: currentUser?.email,
            size: 'small',
            style: { backgroundColor: tokens.primary },
            children: currentUser?.email?.charAt(0)?.toUpperCase(),
            render: (_: any, avatarChildren: any) => {
              return <AvatarDropdown signOut={logout}>{avatarChildren}</AvatarDropdown>;
            },
          },
          actionsRender: (props: any) => {
            return [<HeaderActions key="header-actions" isMobile={props.isMobile} />];
          },
          menuItemRender: (item: any, dom: any) => (
            <div
              onClick={() => {
                router.push(item.path || '/');
              }}
            >
              {dom}
            </div>
          ),
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
