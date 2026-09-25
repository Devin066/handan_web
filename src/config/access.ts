/**
 * The access tree: the sidebar's modules and pages, which Settings › Roles
 * grants None / View / Edit on per role. Page keys are stored in settings, so
 * rename labels freely but keep keys stable.
 */
export type AccessLevel = 'none' | 'view' | 'edit';

export type AccessPage = { key: string; label: string; paths: string[] };
export type AccessGroup = { label: string; pages: AccessPage[] };
export type AccessModule = { key: string; label: string; pages: AccessPage[]; groups?: AccessGroup[] };

export const ACCESS_TREE: AccessModule[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    pages: [{ key: 'dashboard', label: 'Dashboard', paths: ['/dashboard'] }],
  },
  {
    key: 'sales',
    label: 'Sales',
    pages: [{ key: 'sales.orders', label: 'Sales Orders', paths: ['/selling/sales-orders', '/stock/delivery-notes'] }],
  },
  {
    key: 'purchasing',
    label: 'Purchasing',
    pages: [
      { key: 'purchasing.requests', label: 'Purchase Requests', paths: ['/purchasing/purchase-requests'] },
      { key: 'purchasing.orders', label: 'Purchase Orders', paths: ['/purchasing/purchase-orders'] },
    ],
  },
  {
    key: 'production',
    label: 'Production',
    pages: [
      { key: 'production.board', label: 'Production Board', paths: ['/production/board'] },
      {
        key: 'production.workOrders',
        label: 'Work Orders',
        paths: ['/production/work-orders', '/production/workstations', '/production/work-order-items'],
      },
    ],
  },
  {
    key: 'inventory',
    label: 'Inventory',
    pages: [
      { key: 'inventory.receipts', label: 'Goods Receipts', paths: ['/stock/receipt-notes'] },
      { key: 'inventory.ledger', label: 'Inventory Ledger', paths: ['/stock/inventory-entries'] },
      { key: 'inventory.items', label: 'Material Master', paths: ['/setup/items'] },
      { key: 'inventory.boms', label: 'Bills of Materials', paths: ['/production/boms'] },
    ],
  },
  {
    key: 'finance',
    label: 'Finance',
    pages: [
      {
        key: 'finance.salesInvoices',
        label: 'Sales Invoices',
        paths: ['/finance/sales-invoices', '/finance/payment-entries'],
      },
      { key: 'finance.purchaseInvoices', label: 'Purchase Invoices', paths: ['/finance/purchase-invoices'] },
      { key: 'finance.ledger', label: 'Accounting Ledger', paths: ['/finance/accounting-ledger'] },
    ],
  },
  {
    key: 'partners',
    label: 'Business Partners',
    pages: [
      { key: 'partners.customers', label: 'Customers', paths: ['/selling/customers'] },
      { key: 'partners.suppliers', label: 'Suppliers', paths: ['/purchasing/suppliers'] },
    ],
  },
  {
    key: 'hr',
    label: 'HR',
    pages: [
      { key: 'hr.employees', label: 'Employees', paths: ['/hr/employees'] },
      { key: 'hr.attendance', label: 'Time and Attendance', paths: ['/hr/attendance'] },
      { key: 'hr.payroll', label: 'Payroll', paths: ['/hr/payroll'] },
      { key: 'hr.benefits', label: 'Benefits Management', paths: ['/hr/benefits'] },
    ],
  },
  {
    key: 'settings',
    label: 'System Settings',
    pages: [
      { key: 'settings.members', label: 'User Management', paths: ['/system/members'] },
      { key: 'settings.configuration', label: 'Configuration', paths: ['/system/configuration'] },
      { key: 'settings.roles', label: 'Roles', paths: ['/system/roles'] },
    ],
    groups: [
      {
        label: 'Master Data',
        pages: [
          { key: 'settings.paymentMethods', label: 'Payment Methods', paths: ['/finance/payment-methods'] },
          { key: 'settings.warehouses', label: 'Warehouses', paths: ['/setup/warehouses'] },
          { key: 'settings.processes', label: 'Processes', paths: ['/production/processes'] },
          { key: 'settings.uoms', label: 'Units of Measure', paths: ['/setup/uoms'] },
        ],
      },
    ],
  },
];

/** Every page of a module, including those in its groups. */
export const modulePages = (module: AccessModule) => [
  ...module.pages,
  ...(module.groups ?? []).flatMap((group) => group.pages),
];

export const ALL_PAGES = ACCESS_TREE.flatMap((module) =>
  modulePages(module).map((page) => ({ ...page, module: module.key })),
);

export const PAGE_KEYS = ALL_PAGES.map((page) => page.key);

export const pageLabel = (key: string) => ALL_PAGES.find((page) => page.key === key)?.label ?? key;

export const pageForPath = (path: string) => ALL_PAGES.find((page) => page.paths.includes(path))?.key;

export const isAccessLevel = (value: unknown): value is AccessLevel =>
  value === 'none' || value === 'view' || value === 'edit';
