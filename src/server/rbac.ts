import { GraphQLError } from 'graphql';
import type { Prisma } from '@/generated/prisma/client';
import type { Context } from './context';
import { ROLE } from './domain/status';

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
  settings: 'Settings',
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
  for (const role of Object.values(ROLE)) merged[role] = stored[role] !== false;
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
  for (const role of Object.values(ROLE)) {
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
  for (const role of Object.values(ROLE)) {
    const list = Array.isArray(stored[role]) ? stored[role] : DEFAULT_PERMISSIONS[role];
    merged[role] = list.filter((m): m is Module => m in MODULES);
  }
  // The owner can never lock themselves out of the screen that grants access.
  merged[ROLE.owner] = ALL;
  return merged;
}

/**
 * Root fields that change data or expose restricted records, and the module they
 * belong to. Lookups the forms share (items, warehouses, staff, customers,
 * suppliers, payment methods) stay readable to every signed-in user.
 */
const GUARDED: Record<string, Module> = {
  dashboard: 'dashboard',

  createSalesOrder: 'sales',
  createDeliveryNote: 'sales',
  completeDeliveryNote: 'sales',

  purchaseRequests: 'purchasing',
  createPurchaseRequest: 'purchasing',
  reviewPurchaseRequest: 'purchasing',
  createPurchaseOrder: 'purchasing',

  createWorkOrder: 'production',
  scheduleWorkOrder: 'production',
  reportJobCard: 'production',
  storeFinishItem: 'production',
  createWorkstation: 'production',
  productionBoard: 'production',
  workOrderStageLogs: 'production',
  moveWorkOrderStage: 'production',
  updateWorkstation: 'production',

  createReceiptNote: 'inventory',
  completeReceiptNote: 'inventory',
  createItem: 'inventory',
  updateItem: 'inventory',
  saveSupplierPrice: 'inventory',
  deleteSupplierPrice: 'inventory',
  setLowStockLevel: 'inventory',
  createBom: 'inventory',

  createSalesInvoice: 'finance',
  createPurchaseInvoice: 'finance',
  createPaymentEntry: 'finance',
  recordInvoicePayment: 'finance',
  journalEntries: 'finance',
  accountBalances: 'finance',

  createCustomer: 'partners',
  customerLedger: 'partners',
  supplierLedger: 'partners',
  createSupplier: 'partners',

  attendance: 'hr',
  saveAttendance: 'hr',
  clockAttendance: 'hr',
  benefits: 'hr',
  updateBenefits: 'hr',
  payrollPeriods: 'hr',
  payslips: 'hr',
  generatePayroll: 'hr',
  finalizePayroll: 'hr',
  saveStaff: 'hr',

  updateConfiguration: 'settings',
  createPaymentMethod: 'settings',
  updatePaymentMethod: 'settings',
  saveWarehouse: 'settings',
  updateCustomer: 'partners',
  updateSupplier: 'partners',
  createProcess: 'settings',
  updateRolePermissions: 'settings',
  setRoleLogin: 'settings',
  setUserRole: 'settings',
  setMemberLogin: 'settings',
};

export async function allowedModules(ctx: Context): Promise<Module[]> {
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
  const permissions = await loadPermissions(ctx.db, companyUuid);
  return permissions[user.role] ?? [];
}

/** Modules the signed-in user can change data in (Edit), a subset of allowedModules. */
export async function editableModules(ctx: Context): Promise<Module[]> {
  const allowed = await allowedModules(ctx);
  const user = await ctx.loaders.user.load(ctx.userUuid!);
  const viewOnly = (await loadViewOnly(ctx.db, ctx.companyUuid!))[user!.role] ?? [];
  return allowed.filter((m) => !viewOnly.includes(m));
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
      if (ctx.userUuid && !(await allowedModules(ctx)).includes(required)) {
        throw new GraphQLError(`Your role does not have access to ${MODULES[required]}.`, {
          extensions: { code: 'FORBIDDEN' },
        });
      }
      if (ctx.userUuid && level === 'edit' && !(await editableModules(ctx)).includes(required)) {
        throw new GraphQLError(`Your role can view ${MODULES[required]} but not change it.`, {
          extensions: { code: 'FORBIDDEN' },
        });
      }
      return (resolver as Resolver)(parent, args, ctx, info);
    };
  }
  return guarded;
}
