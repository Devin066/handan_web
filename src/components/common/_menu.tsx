import {
  DashboardOutlined,
  BookOutlined,
  ShoppingCartOutlined,
  ProfileOutlined,
  WalletOutlined,
  DatabaseOutlined,
  RocketOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const menuProps = {
  route: {
    path: '/',
    routes: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        icon: <DashboardOutlined />,
      },
      {
        path: '/selling',
        name: 'Selling',
        icon: <ProfileOutlined />,
        routes: [
          {
            path: '/selling/sales-orders',
            name: 'Sales Orders',
          },
          {
            path: '/selling/customers',
            name: 'Customers',
          },
        ],
      },
      {
        path: '/purchasing',
        name: 'Purchasing',
        icon: <ShoppingCartOutlined />,
        routes: [
          {
            path: '/purchasing/purchase-orders',
            name: 'Purchase Orders',
          },
          {
            path: '/purchasing/suppliers',
            name: 'Suppliers',
          },
        ],
      },
      {
        path: '/production',
        name: 'Production',
        icon: <RocketOutlined />,
        routes: [
          {
            path: '/production/work-orders',
            name: 'Work Orders',
          },
          {
            path: '/production/boms',
            name: 'BOM Management',
          },
          {
            path: '/production/processes',
            name: 'Processes',
          },
          {
            name: 'Workstations',
            path: '/production/workstations',
          },
        ],
      },
      {
        path: '/stock',
        name: 'Stock',
        icon: <BookOutlined />,
        routes: [
          {
            name: 'Delivery Notes',
            path: '/stock/delivery-notes',
          },
          {
            name: 'Receipt Notes',
            path: '/stock/receipt-notes',
          },
          {
            name: 'Inventory Entries',
            path: '/stock/inventory-entries',
          },
        ],
      },
      {
        path: '/finance',
        name: 'Finance',
        icon: <WalletOutlined />,
        routes: [
          {
            name: 'Sales Invoices',
            path: '/finance/sales-invoices',
          },
          {
            name: 'Purchase Invoices',
            path: '/finance/purchase-invoices',
          },
          {
            name: 'Payment Entries',
            path: '/finance/payment-entries',
          },
          {
            name: 'Payment Methods',
            path: '/finance/payment-methods',
          },
        ],
      },
      {
        path: '/setup',
        name: 'Products',
        icon: <DatabaseOutlined />,
        routes: [
          {
            path: '/setup/items',
            name: 'Items',
          },
          {
            path: '/setup/uoms',
            name: 'Units of Measure',
          },
          {
            path: '/setup/warehouses',
            name: 'Warehouses',
          },
        ],
      },
      {
        path: '/system',
        name: 'Settings',
        icon: <SettingOutlined />,
        routes: [
          {
            name: 'Members',
            path: '/system/members',
          },
          {
            name: 'Configuration',
            path: '/system/configuration',
          },
        ],
      },
    ],
  },
  location: {
    pathname: '/',
  },
};

export default menuProps;
