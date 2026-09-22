import {
  BellOutlined,
  ThunderboltOutlined,
  QuestionCircleOutlined,
  ShoppingCartOutlined,
  AppstoreAddOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { Badge, Popover, List } from 'antd';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import brand from '@/config/brand';

const HELP_URL = brand.helpUrl;

// Notification data (work in progress)
const mockNotifications: any[] = [];

// Quick actions menu (simplified)
const quickActions = [
  {
    key: 'sales-order',
    label: 'Sales Orders',
    icon: <ShoppingCartOutlined />,
    color: '#1890ff',
    path: '/selling/sales-orders',
  },
  {
    key: 'purchase-order',
    label: 'Purchase Orders',
    icon: <ShopOutlined />,
    color: '#52c41a',
    path: '/purchasing/purchase-orders',
  },
  {
    key: 'item',
    label: 'Products',
    icon: <AppstoreAddOutlined />,
    color: '#722ed1',
    path: '/setup/items',
  },
];

interface HeaderActionsProps {
  isMobile?: boolean;
}

/**
 * Header action buttons component
 * includes: notifications, Quick Actions, Help
 */
const HeaderActions: React.FC<HeaderActionsProps> = ({ isMobile = false }) => {
  const router = useRouter();
  const [popoverVisible, setPopoverVisible] = useState(false);

  // Hidden on mobile and during server-side rendering
  if (isMobile) return null;
  if (typeof window === 'undefined') return null;

  // Handle quick action click
  const handleQuickAction = (path: string) => {
    setPopoverVisible(false);
    router.push(path);
  };

  // Notification content
  const notificationContent = (
    <div style={{ width: 320 }}>
      {mockNotifications.length > 0 ? (
        <List
          size="small"
          dataSource={mockNotifications}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta title={item.title} description={item.content} />
            </List.Item>
          )}
        />
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
          <BellOutlined style={{ fontSize: 48, marginBottom: 16, color: '#d9d9d9' }} />
          <div style={{ fontSize: 14 }}>No notifications</div>
        </div>
      )}
    </div>
  );

  // Quick actions content
  const quickActionsContent = (
    <div style={{ width: 220 }}>
      <List
        size="small"
        dataSource={quickActions}
        renderItem={(item) => (
          <List.Item
            style={{
              cursor: 'pointer',
              padding: '10px 12px',
              transition: 'background 0.2s',
            }}
            onClick={() => handleQuickAction(item.path)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f5f5f5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span
                style={{
                  fontSize: 18,
                  color: item.color,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </div>
          </List.Item>
        )}
      />
    </div>
  );

  return (
    <>
      <Popover
        key="notification"
        content={notificationContent}
        title="Notifications"
        trigger="click"
        placement="bottomRight"
      >
        <Badge count={mockNotifications.length} size="small" dot={false}>
          <BellOutlined style={{ fontSize: 16, cursor: 'pointer' }} />
        </Badge>
      </Popover>

      <Popover
        key="quick-actions"
        content={quickActionsContent}
        title="Quick Actions"
        trigger="click"
        placement="bottomRight"
        open={popoverVisible}
        onOpenChange={setPopoverVisible}
      >
        <ThunderboltOutlined style={{ fontSize: 16, cursor: 'pointer' }} />
      </Popover>

      <a
        key="help"
        href={HELP_URL}
        className="text-sm"
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
      >
        <QuestionCircleOutlined />
        Help
      </a>
    </>
  );
};

export default HeaderActions;
