import { GraphQLError } from 'graphql';
import type { Context } from '../context';
import { requireCompany } from '../context';
import { CURRENCY_SETTING_KEY, DEFAULT_CURRENCY, isSupportedCurrency } from '@/config/currency';
import { MODULES, loadPermissions, allowedModules, PERMISSIONS_KEY, type Module } from '../rbac';
import { ROLE } from '../domain/status';

const TIMEZONE_KEY = 'timezone';
const DECIMALS_KEY = 'decimalPlaces';
/** SRS 4.8: default timezone GMT+8. */
const DEFAULT_TIMEZONE = 'Asia/Manila';
const DEFAULT_DECIMALS = 2;
const CLAIM_MODE_KEY = 'productionClaimMode';
/** Who puts a task in a worker's hands: a manager assigns, or workers claim. */
export const CLAIM_MODES = ['manager', 'self'] as const;
export type ClaimMode = (typeof CLAIM_MODES)[number];
const isClaimMode = (value: unknown): value is ClaimMode => CLAIM_MODES.includes(value as ClaimMode);

const isTimezone = (value: unknown): value is string => {
  if (typeof value !== 'string' || !value) return false;
  try {
    new Intl.DateTimeFormat('en', { timeZone: value });
    return true;
  } catch {
    return false;
  }
};

export async function readConfiguration(ctx: Context, companyUuid: string) {
  const rows = await ctx.db.appSetting.findMany({
    where: { companyUuid, key: { in: [CURRENCY_SETTING_KEY, TIMEZONE_KEY, DECIMALS_KEY, CLAIM_MODE_KEY] } },
  });
  const value = (key: string) => rows.find((r) => r.key === key)?.value;
  const decimals = Number(value(DECIMALS_KEY));
  // An unset or unrecognised value falls back rather than throwing: a bad
  // row in one setting should not take down every screen that shows money.
  return {
    currency: isSupportedCurrency(value(CURRENCY_SETTING_KEY)) ? value(CURRENCY_SETTING_KEY) : DEFAULT_CURRENCY,
    timezone: isTimezone(value(TIMEZONE_KEY)) ? value(TIMEZONE_KEY) : DEFAULT_TIMEZONE,
    decimalPlaces: Number.isInteger(decimals) && decimals >= 0 && decimals <= 4 ? decimals : DEFAULT_DECIMALS,
    // Until the business decides, a manager assigns: the safer default.
    productionClaimMode: (isClaimMode(value(CLAIM_MODE_KEY)) ? value(CLAIM_MODE_KEY) : 'manager') as ClaimMode,
  };
}

async function saveSetting(ctx: Context, companyUuid: string, key: string, value: string | number) {
  await ctx.db.appSetting.upsert({
    where: { companyUuid_key: { companyUuid, key } },
    create: { companyUuid, key, value },
    update: { value },
  });
}

/**
 * Company-wide display settings, stored as rows in AppSetting rather than
 * columns on Company. Settings arrive one at a time as the product grows, and a
 * key/value row avoids a migration for each one.
 */
export const configurationResolvers = {
  RootQueryType: {
    configuration: async (_: unknown, __: unknown, ctx: Context) => readConfiguration(ctx, requireCompany(ctx)),

    rolePermissions: async (_: unknown, __: unknown, ctx: Context) => {
      const permissions = await loadPermissions(ctx.db, requireCompany(ctx));
      return Object.entries(permissions).map(([role, modules]) => ({ role, modules }));
    },

    modules: () => Object.entries(MODULES).map(([key, label]) => ({ key, label })),

    myModules: async (_: unknown, __: unknown, ctx: Context) => allowedModules(ctx),
  },

  RootMutationType: {
    updateConfiguration: async (
      _: unknown,
      {
        request,
      }: { request: { currency?: string; timezone?: string; decimalPlaces?: number; productionClaimMode?: string } },
      ctx: Context,
    ) => {
      const companyUuid = requireCompany(ctx);

      if (request.currency != null) {
        if (!isSupportedCurrency(request.currency)) throw new GraphQLError(`unsupported currency: ${request.currency}`);
        await saveSetting(ctx, companyUuid, CURRENCY_SETTING_KEY, request.currency);
      }
      if (request.timezone != null) {
        if (!isTimezone(request.timezone)) throw new GraphQLError(`unknown timezone: ${request.timezone}`);
        await saveSetting(ctx, companyUuid, TIMEZONE_KEY, request.timezone);
      }
      if (request.decimalPlaces != null) {
        if (!Number.isInteger(request.decimalPlaces) || request.decimalPlaces < 0 || request.decimalPlaces > 4) {
          throw new GraphQLError('Decimal places must be a whole number from 0 to 4.');
        }
        await saveSetting(ctx, companyUuid, DECIMALS_KEY, request.decimalPlaces);
      }
      if (request.productionClaimMode != null) {
        if (!isClaimMode(request.productionClaimMode)) throw new GraphQLError('Choose manager or self for claiming.');
        await saveSetting(ctx, companyUuid, CLAIM_MODE_KEY, request.productionClaimMode);
      }

      return readConfiguration(ctx, companyUuid);
    },

    updateRolePermissions: async (
      _: unknown,
      { request }: { request: { role: string; modules: string[] } },
      ctx: Context,
    ) => {
      const companyUuid = requireCompany(ctx);
      if (!Object.values(ROLE).includes(request.role as never)) throw new GraphQLError(`Unknown role: ${request.role}`);
      if (request.role === ROLE.owner) throw new GraphQLError('The owner always has access to everything.');

      const current = await loadPermissions(ctx.db, companyUuid);
      current[request.role] = request.modules.filter((m): m is Module => m in MODULES);
      await ctx.db.appSetting.upsert({
        where: { companyUuid_key: { companyUuid, key: PERMISSIONS_KEY } },
        create: { companyUuid, key: PERMISSIONS_KEY, value: current },
        update: { value: current },
      });
      return { role: request.role, modules: current[request.role] };
    },

    setUserRole: async (_: unknown, { request }: { request: { staffUuid: string; role: string } }, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      if (!Object.values(ROLE).includes(request.role as never)) throw new GraphQLError(`Unknown role: ${request.role}`);

      const staff = await ctx.db.staff.findFirst({ where: { uuid: request.staffUuid, companyUuid } });
      if (!staff?.userUuid) throw new GraphQLError('This member has no login to give a role to.');
      if (staff.userUuid === ctx.userUuid && request.role !== ROLE.owner) {
        throw new GraphQLError('You cannot change your own role.');
      }

      await ctx.db.user.update({ where: { uuid: staff.userUuid }, data: { role: request.role } });
      return staff;
    },
  },
};
