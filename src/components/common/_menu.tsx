import {
  DashboardOutlined,
  BookOutlined,
  ShoppingCartOutlined,
  ProfileOutlined,
  WalletOutlined,
  TeamOutlined,
  IdcardOutlined,
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
        module: 'dashboard',
      },
      // Opened from the account menu; listed so the page gets its title and breadcrumb.
      { path: '/profile', name: 'Profile Settings', hideInMenu: true },
      {
        path: '/selling',
        name: 'Sales',
        module: 'sales',
        icon: <ProfileOutlined />,
        routes: [{ path: '/selling/sales-orders', name: 'Sales Orders' }],
      },
      {
        path: '/purchasing',
        name: 'Purchasing',
        module: 'purchasing',
        icon: <ShoppingCartOutlined />,
        routes: [
          { path: '/purchasing/purchase-requests', name: 'Purchase Requests' },
          { path: '/purchasing/purchase-orders', name: 'Purchase Orders' },
        ],
      },
      {
        path: '/production',
        name: 'Production',
        module: 'production',
        icon: <RocketOutlined />,
        routes: [
          { path: '/production/board', name: 'Production Board' },
          { path: '/production/work-orders', name: 'Work Orders' },
        ],
      },
      {
        path: '/stock',
        name: 'Inventory',
        module: 'inventory',
        icon: <BookOutlined />,
        routes: [
          { path: '/stock/receipt-notes', name: 'Goods Receipts' },
          { path: '/stock/inventory-entries', name: 'Inventory Ledger' },
          { path: '/setup/items', name: 'Material Master' },
          { path: '/production/boms', name: 'Bills of Materials' },
        ],
      },
      {
        path: '/finance',
        name: 'Finance',
        module: 'finance',
        icon: <WalletOutlined />,
        routes: [
          { path: '/finance/sales-invoices', name: 'Sales Invoices' },
          { path: '/finance/purchase-invoices', name: 'Purchase Invoices' },
          { path: '/finance/accounting-ledger', name: 'Accounting Ledger' },
        ],
      },
      {
        path: '/partners',
        name: 'Business Partners',
        module: 'partners',
        icon: <TeamOutlined />,
        routes: [
          { path: '/selling/customers', name: 'Customers' },
          { path: '/purchasing/suppliers', name: 'Suppliers' },
        ],
      },
      {
        path: '/hr',
        name: 'HR',
        icon: <IdcardOutlined />,
        module: 'hr',
        routes: [
          { path: '/hr/employees', name: 'Employees' },
          { path: '/hr/attendance', name: 'Time and Attendance' },
          { path: '/hr/payroll', name: 'Payroll' },
          { path: '/hr/benefits', name: 'Benefits Management' },
        ],
      },
      {
        path: '/system',
        name: 'System Settings',
        module: 'settings',
        icon: <SettingOutlined />,
        routes: [
          { path: '/system/members', name: 'User Management' },
          { path: '/system/configuration', name: 'Configuration' },
          { path: '/system/roles', name: 'Roles' },
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
