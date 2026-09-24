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

  createReceiptNote: 'inventory',
  completeReceiptNote: 'inventory',
  createItem: 'inventory',
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
  createProcess: 'settings',
  updateRolePermissions: 'settings',
  setUserRole: 'settings',
};

export async function allowedModules(ctx: Context): Promise<Module[]> {
  if (!ctx.userUuid || !ctx.companyUuid) return [];
  const user = await ctx.loaders.user.load(ctx.userUuid);
  if (!user) return [];
  const permissions = await loadPermissions(ctx.db, ctx.companyUuid);
  return permissions[user.role] ?? [];
}

type Resolver = (parent: unknown, args: unknown, ctx: Context, info: unknown) => unknown;

/** Wraps guarded root resolvers so a role without the module gets a clear refusal. */
export function guardRootFields(fields: Record<string, unknown>) {
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
      return (resolver as Resolver)(parent, args, ctx, info);
    };
  }
  return guarded;
}
