import {
  DashboardOutlined,
  BookOutlined,
  ShoppingCartOutlined,
  ProfileOutlined,
  WalletOutlined,
  TeamOutlined,
  RocketOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const menuProps = {
  route: {
    path: '/',
    routes: [
      { path: '/dashboard', name: 'Dashboard', icon: <DashboardOutlined /> },
      {
        path: '/selling',
        name: 'Sales',
        icon: <ProfileOutlined />,
        routes: [{ path: '/selling/sales-orders', name: 'Sales Orders' }],
      },
      {
        path: '/purchasing',
        name: 'Purchasing',
        icon: <ShoppingCartOutlined />,
        routes: [{ path: '/purchasing/purchase-orders', name: 'Purchase Orders' }],
      },
      {
        path: '/production',
        name: 'Production',
        icon: <RocketOutlined />,
        routes: [
          { path: '/production/work-orders', name: 'Work Orders' },
          { path: '/production/workstations', name: 'Workstations' },
        ],
      },
      {
        path: '/stock',
        name: 'Inventory',
        icon: <BookOutlined />,
        routes: [
          { path: '/stock/receipt-notes', name: 'Goods Receipts' },
          { path: '/stock/delivery-notes', name: 'Delivery Notes' },
          { path: '/stock/inventory-entries', name: 'Inventory Ledger' },
          { path: '/setup/items', name: 'Material Master' },
          { path: '/production/boms', name: 'Bills of Materials' },
        ],
      },
      {
        path: '/finance',
        name: 'Finance',
        icon: <WalletOutlined />,
        routes: [
          { path: '/finance/sales-invoices', name: 'Sales Invoices' },
          { path: '/finance/purchase-invoices', name: 'Purchase Invoices' },
          { path: '/finance/payment-entries', name: 'Payment Entries' },
        ],
      },
      {
        path: '/partners',
        name: 'Business Partners',
        icon: <TeamOutlined />,
        routes: [
          { path: '/selling/customers', name: 'Customers' },
          { path: '/purchasing/suppliers', name: 'Suppliers' },
        ],
      },
      {
        path: '/system',
        name: 'Settings',
        icon: <SettingOutlined />,
        routes: [
          { path: '/system/members', name: 'User Management' },
          { path: '/system/configuration', name: 'Configuration' },
          {
            path: '/master-data',
            name: 'Master Data',
            routes: [
              { path: '/finance/payment-methods', name: 'Payment Methods' },
              { path: '/setup/warehouses', name: 'Warehouses' },
              { path: '/production/processes', name: 'Processes' },
              { path: '/setup/uoms', name: 'Units of Measure' },
            ],
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
