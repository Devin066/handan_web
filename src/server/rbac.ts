import { GraphQLError } from 'graphql';
import type { Prisma } from '@/generated/prisma/client';
import type { Context } from './context';
import { ROLE } from './domain/status';
import { loadRoles } from './roles';
import { ALL_PAGES, isAccessLevel, pageLabel, type AccessLevel } from '@/config/access';

/** The modules of the system hierarchy that access is granted by. */
export const MODULES = {
  dashboard: 'Dashboard',
  sales: 'Sales',
  purchasing: 'Purchasing',
  production: 'Production',
  inventory: 'Inventory',
  finance: 'Finance',
  partners: 'Business Partners',
  hr: 'HR',
  settings: 'System Settings',
} as const;
export type Module = keyof typeof MODULES;

const ALL = Object.keys(MODULES) as Module[];

/** Starting matrix; the owner edits it on Settings > Roles. */
export const DEFAULT_PERMISSIONS: Record<string, Module[]> = {
  [ROLE.owner]: ALL,
  [ROLE.manager]: ALL.filter((m) => m !== 'settings'),
  [ROLE.finance]: ['dashboard', 'sales', 'purchasing', 'finance', 'partners'],
  [ROLE.hr]: ['dashboard', 'hr'],
  [ROLE.employee]: ['dashboard', 'production', 'inventory'],
};

export const PERMISSIONS_KEY = 'rbac.permissions';

/** Which roles may be given a login. The owner always can. */
export const LOGIN_ROLES_KEY = 'rbac.loginRoles';

export async function loadLoginRoles(db: Prisma.TransactionClient, companyUuid: string) {
  const row = await db.appSetting.findUnique({
    where: { companyUuid_key: { companyUuid, key: LOGIN_ROLES_KEY } },
  });
  const stored = (row?.value ?? {}) as Record<string, boolean>;
  const merged: Record<string, boolean> = {};
  for (const { key: role } of await loadRoles(db, companyUuid)) merged[role] = stored[role] !== false;
  merged[ROLE.owner] = true;
  return merged;
}

/**
 * Modules a role may only look at. A module in a role's permission list is
 * Edit unless it is also listed here, which keeps older saved settings (a plain
 * list meant full access) working unchanged.
 */
export const VIEW_ONLY_KEY = 'rbac.viewOnly';

export async function loadViewOnly(db: Prisma.TransactionClient, companyUuid: string) {
  const row = await db.appSetting.findUnique({
    where: { companyUuid_key: { companyUuid, key: VIEW_ONLY_KEY } },
  });
  const stored = (row?.value ?? {}) as Record<string, string[]>;
  const merged: Record<string, Module[]> = {};
  for (const { key: role } of await loadRoles(db, companyUuid)) {
    merged[role] = (Array.isArray(stored[role]) ? stored[role] : []).filter((m): m is Module => m in MODULES);
  }
  merged[ROLE.owner] = [];
  return merged;
}

export async function loadPermissions(db: Prisma.TransactionClient, companyUuid: string) {
  const row = await db.appSetting.findUnique({
    where: { companyUuid_key: { companyUuid, key: PERMISSIONS_KEY } },
  });
  const stored = (row?.value ?? {}) as Record<string, string[]>;
  const merged: Record<string, Module[]> = {};
  for (const { key: role } of await loadRoles(db, companyUuid)) {
    const list = Array.isArray(stored[role]) ? stored[role] : (DEFAULT_PERMISSIONS[role] ?? []);
    merged[role] = list.filter((m): m is Module => m in MODULES);
  }
  // The owner can never lock themselves out of the screen that grants access.
  merged[ROLE.owner] = ALL;
  return merged;
}

/**
 * Per-page access (Settings › Roles), stored as rbac.pageAccess. Pages a role
 * has no stored level for inherit it from the older per-module settings, so a
 * company that never touched the page tree keeps exactly the access it had.
 */
export const PAGE_ACCESS_KEY = 'rbac.pageAccess';

export async function loadPageAccess(db: Prisma.TransactionClient, companyUuid: string) {
  const [row, modules, viewOnly] = await Promise.all([
    db.appSetting.findUnique({ where: { companyUuid_key: { companyUuid, key: PAGE_ACCESS_KEY } } }),
    loadPermissions(db, companyUuid),
    loadViewOnly(db, companyUuid),
  ]);
  const stored = (row?.value ?? {}) as Record<string, Record<string, string>>;
  const result: Record<string, Record<string, AccessLevel>> = {};
  for (const { key: role } of await loadRoles(db, companyUuid)) {
    result[role] = {};
    for (const page of ALL_PAGES) {
      const saved = stored[role]?.[page.key];
      let level: AccessLevel = 'none';
      if (role === ROLE.owner) level = 'edit';
      else if (isAccessLevel(saved)) level = saved;
      else if (modules[role]?.includes(page.module as Module)) {
        level = viewOnly[role]?.includes(page.module as Module) ? 'view' : 'edit';
      }
      result[role][page.key] = level;
    }
  }
  return result;
}

const RANK: Record<AccessLevel, number> = { none: 0, view: 1, edit: 2 };
const pageAccessCache = new WeakMap<Context, Promise<Record<string, AccessLevel>>>();

/** The signed-in user's level on every page, once per request. */
export function userPageAccess(ctx: Context): Promise<Record<string, AccessLevel>> {
  let cached = pageAccessCache.get(ctx);
  if (!cached) {
    cached = (async () => {
      const user = await signedInUser(ctx);
      return (await loadPageAccess(ctx.db, ctx.companyUuid!))[user.role] ?? {};
    })();
    pageAccessCache.set(ctx, cached);
  }
  return cached;
}

/**
 * Root fields that change data or expose restricted records, and the page (in
 * the access tree, src/config/access.ts) they belong to. Queries need View on
 * the page, mutations need Edit. A list means any one of those pages will do;
 * a function picks the page from the arguments. Lookups the forms share
 * (items, warehouses, staff, customers, suppliers, payment methods) stay
 * readable to every signed-in user.
 */
type PageRule = string | string[] | ((args: any) => string);

const invoicePage = (type?: string) => (type === 'purchase' ? 'finance.purchaseInvoices' : 'finance.salesInvoices');

const GUARDED: Record<string, PageRule> = {
  dashboard: 'dashboard',

  createSalesOrder: 'sales.orders',
  createDeliveryNote: 'sales.orders',
  completeDeliveryNote: 'sales.orders',

  purchaseRequests: 'purchasing.requests',
  createPurchaseRequest: 'purchasing.requests',
  reviewPurchaseRequest: 'purchasing.requests',
  createPurchaseOrder: 'purchasing.orders',

  createWorkOrder: 'production.workOrders',
  scheduleWorkOrder: 'production.workOrders',
  reportJobCard: 'production.workOrders',
  storeFinishItem: 'production.workOrders',
  createWorkstation: 'production.workOrders',
  updateWorkstation: 'production.workOrders',
  productionBoard: 'production.board',
  workOrderStageLogs: 'production.board',
  moveWorkOrderStage: 'production.board',

  createReceiptNote: 'inventory.receipts',
  completeReceiptNote: 'inventory.receipts',
  createItem: 'inventory.items',
  updateItem: 'inventory.items',
  saveSupplierPrice: 'inventory.items',
  deleteSupplierPrice: 'inventory.items',
  setLowStockLevel: 'inventory.items',
  createBom: 'inventory.boms',

  createSalesInvoice: 'finance.salesInvoices',
  createPurchaseInvoice: 'finance.purchaseInvoices',
  recordInvoicePayment: (args) => invoicePage(args?.request?.invoiceType),
  createPaymentEntry: (args) => invoicePage(args?.request?.purchaseInvoiceIds?.length ? 'purchase' : 'sales'),
  journalEntries: 'finance.ledger',
  accountBalances: 'finance.ledger',

  createCustomer: 'partners.customers',
  updateCustomer: 'partners.customers',
  customerLedger: 'partners.customers',
  createSupplier: 'partners.suppliers',
  updateSupplier: 'partners.suppliers',
  supplierLedger: 'partners.suppliers',

  saveStaff: ['hr.employees', 'settings.members'],
  attendance: 'hr.attendance',
  saveAttendance: 'hr.attendance',
  clockAttendance: 'hr.attendance',
  payrollPeriods: 'hr.payroll',
  payslips: 'hr.payroll',
  generatePayroll: 'hr.payroll',
  finalizePayroll: 'hr.payroll',
  benefits: 'hr.benefits',
  updateBenefits: 'hr.benefits',

  setMemberLogin: 'settings.members',
  updateConfiguration: 'settings.configuration',
  updateRolePermissions: 'settings.roles',
  setRoleLogin: 'settings.roles',
  setUserRole: 'settings.roles',
  setPageAccess: 'settings.roles',
  saveRole: 'settings.roles',
  deleteRole: 'settings.roles',
  createPaymentMethod: 'settings.paymentMethods',
  updatePaymentMethod: 'settings.paymentMethods',
  saveWarehouse: 'settings.warehouses',
  createProcess: 'settings.processes',
};

/** The signed-in, active user whose role may sign in; anything else is a dead session. */
async function signedInUser(ctx: Context) {
  // No valid session (missing, expired or re-signed token), or a valid token
  // for a user that no longer exists (e.g. after a database reset), is a dead
  // session, not a user without permissions. Say so, so the client sends them
  // to sign in instead of showing an empty menu.
  const { userUuid, companyUuid } = ctx;
  const user = userUuid && companyUuid ? await ctx.loaders.user.load(userUuid) : null;
  if (!user || !companyUuid || !user.isActive) {
    throw new GraphQLError('unauthenticated', { extensions: { code: 'UNAUTHENTICATED' } });
  }
  // Turning a role's login off signs its people out on their next request.
  if (!(await loadLoginRoles(ctx.db, companyUuid))[user.role]) {
    throw new GraphQLError('unauthenticated', { extensions: { code: 'UNAUTHENTICATED' } });
  }
  return user;
}

/** Modules with at least one page the user can open (drives the menu). */
export async function allowedModules(ctx: Context): Promise<Module[]> {
  const access = await userPageAccess(ctx);
  return ALL.filter((m) => ALL_PAGES.some((p) => p.module === m && access[p.key] !== 'none'));
}

/** Modules with at least one page the user can change. */
export async function editableModules(ctx: Context): Promise<Module[]> {
  const access = await userPageAccess(ctx);
  return ALL.filter((m) => ALL_PAGES.some((p) => p.module === m && access[p.key] === 'edit'));
}

type Resolver = (parent: unknown, args: unknown, ctx: Context, info: unknown) => unknown;

/**
 * Wraps guarded root resolvers so a role without the module gets a clear
 * refusal. Queries need View; mutations (anything that saves) need Edit.
 */
export function guardRootFields(fields: Record<string, unknown>, level: 'view' | 'edit' = 'view') {
  const guarded: Record<string, unknown> = {};
  for (const [name, resolver] of Object.entries(fields)) {
    const required = GUARDED[name];
    if (!required || typeof resolver !== 'function') {
      guarded[name] = resolver;
      continue;
    }
    guarded[name] = async (parent: unknown, args: unknown, ctx: Context, info: unknown) => {
      // Unauthenticated calls fall through to the resolver's own requireCompany.
      if (ctx.userUuid) {
        const pages = typeof required === 'function' ? [required(args)] : ([] as string[]).concat(required);
        const access = await userPageAccess(ctx);
        const best = Math.max(...pages.map((p) => RANK[access[p] ?? 'none']));
        const label = pages.map(pageLabel).join(' or ');
        if (best < RANK.view) {
          throw new GraphQLError(`Your role does not have access to ${label}.`, { extensions: { code: 'FORBIDDEN' } });
        }
        if (level === 'edit' && best < RANK.edit) {
          throw new GraphQLError(`Your role can view ${label} but not change it.`, {
            extensions: { code: 'FORBIDDEN' },
          });
        }
      }
      return (resolver as Resolver)(parent, args, ctx, info);
    };
  }
  return guarded;
}
