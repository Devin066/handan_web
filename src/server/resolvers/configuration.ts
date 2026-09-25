import { GraphQLError } from 'graphql';
import type { Context } from '../context';
import { requireCompany } from '../context';
import { CURRENCY_SETTING_KEY, DEFAULT_CURRENCY, isSupportedCurrency } from '@/config/currency';
import {
  MODULES,
  loadPermissions,
  loadLoginRoles,
  loadViewOnly,
  editableModules,
  VIEW_ONLY_KEY,
  loadPageAccess,
  userPageAccess,
  PAGE_ACCESS_KEY,
  allowedModules,
  PERMISSIONS_KEY,
  LOGIN_ROLES_KEY,
  type Module,
} from '../rbac';
import { hashPassword } from '../auth';
import { assertRole, loadRoles, saveRoles } from '../roles';
import { PAGE_KEYS, isAccessLevel } from '@/config/access';
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
      const companyUuid = requireCompany(ctx);
      const [permissions, loginRoles, viewOnly] = await Promise.all([
        loadPermissions(ctx.db, companyUuid),
        loadLoginRoles(ctx.db, companyUuid),
        loadViewOnly(ctx.db, companyUuid),
      ]);
      return Object.entries(permissions).map(([role, modules]) => ({
        role,
        modules,
        canLogin: loginRoles[role],
        viewOnly: viewOnly[role].filter((m) => modules.includes(m)),
      }));
    },

    modules: () => Object.entries(MODULES).map(([key, label]) => ({ key, label })),

    myModules: async (_: unknown, __: unknown, ctx: Context) => allowedModules(ctx),

    myEditModules: async (_: unknown, __: unknown, ctx: Context) => editableModules(ctx),

    roles: async (_: unknown, __: unknown, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      const [roles, users] = await Promise.all([
        loadRoles(ctx.db, companyUuid),
        ctx.db.user.groupBy({ by: ['role'], where: { companyUuid, isActive: true }, _count: true }),
      ]);
      const counts = new Map(users.map((u) => [u.role, u._count]));
      return roles.map((r) => ({ ...r, isOwner: r.key === ROLE.owner, memberCount: counts.get(r.key) ?? 0 }));
    },

    pageAccess: async (_: unknown, __: unknown, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      const [access, loginRoles] = await Promise.all([
        loadPageAccess(ctx.db, companyUuid),
        loadLoginRoles(ctx.db, companyUuid),
      ]);
      return Object.entries(access).map(([role, pages]) => ({
        role,
        canLogin: loginRoles[role],
        pages: Object.entries(pages).map(([page, level]) => ({ page, level })),
      }));
    },

    myPageAccess: async (_: unknown, __: unknown, ctx: Context) =>
      Object.entries(await userPageAccess(ctx)).map(([page, level]) => ({ page, level })),
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
      { request }: { request: { role: string; modules: string[]; viewOnly?: string[] | null } },
      ctx: Context,
    ) => {
      const companyUuid = requireCompany(ctx);
      await assertRole(ctx.db, companyUuid, request.role);
      if (request.role === ROLE.owner) throw new GraphQLError('The owner always has access to everything.');

      const current = await loadPermissions(ctx.db, companyUuid);
      current[request.role] = request.modules.filter((m): m is Module => m in MODULES);
      await ctx.db.appSetting.upsert({
        where: { companyUuid_key: { companyUuid, key: PERMISSIONS_KEY } },
        create: { companyUuid, key: PERMISSIONS_KEY, value: current },
        update: { value: current },
      });
      const viewOnly = await loadViewOnly(ctx.db, companyUuid);
      if (request.viewOnly) {
        viewOnly[request.role] = request.viewOnly.filter((m): m is Module => m in MODULES);
        await ctx.db.appSetting.upsert({
          where: { companyUuid_key: { companyUuid, key: VIEW_ONLY_KEY } },
          create: { companyUuid, key: VIEW_ONLY_KEY, value: viewOnly },
          update: { value: viewOnly },
        });
      }
      const loginRoles = await loadLoginRoles(ctx.db, companyUuid);
      return {
        role: request.role,
        modules: current[request.role],
        canLogin: loginRoles[request.role],
        viewOnly: viewOnly[request.role].filter((m) => current[request.role].includes(m)),
      };
    },

    saveRole: async (_: unknown, { request }: { request: { key?: string | null; label: string } }, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      const label = request.label?.trim().replace(/\s+/g, ' ');
      if (!label) throw new GraphQLError('Enter a role name.');
      if (label.length > 40) throw new GraphQLError('Keep the role name under 40 characters.');
      if (request.key === ROLE.owner) throw new GraphQLError('The Owner role cannot be renamed.');

      const roles = await loadRoles(ctx.db, companyUuid);
      const clash = roles.find((r) => r.label.toLowerCase() === label.toLowerCase() && r.key !== request.key);
      if (clash) throw new GraphQLError(`There is already a role called ${clash.label}.`);

      let key = request.key;
      if (key) {
        await assertRole(ctx.db, companyUuid, key);
      } else {
        // A stable id; the label can change later without touching users.
        const slug =
          label
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_|_$/g, '')
            .slice(0, 24) || 'role';
        key = `${slug}_${Math.random().toString(36).slice(2, 6)}`;
      }
      const next = roles.filter((r) => r.key !== ROLE.owner);
      const index = next.findIndex((r) => r.key === key);
      if (index >= 0) next[index] = { key, label };
      else next.push({ key, label });
      await saveRoles(ctx.db, companyUuid, next);
      return {
        key,
        label,
        isOwner: false,
        memberCount: await ctx.db.user.count({ where: { companyUuid, role: key } }),
      };
    },

    deleteRole: async (_: unknown, { request }: { request: { key: string } }, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      if (request.key === ROLE.owner) throw new GraphQLError('The Owner role cannot be deleted.');
      const role = await assertRole(ctx.db, companyUuid, request.key);
      const holders = await ctx.db.user.count({ where: { companyUuid, role: role.key } });
      if (holders) {
        throw new GraphQLError(
          `${holders} ${holders === 1 ? 'person has' : 'people have'} the ${role.label} role. Give them another role first.`,
        );
      }
      const roles = await loadRoles(ctx.db, companyUuid);
      await saveRoles(
        ctx.db,
        companyUuid,
        roles.filter((r) => r.key !== role.key && r.key !== ROLE.owner),
      );
      return true;
    },

    setPageAccess: async (
      _: unknown,
      { request }: { request: { role: string; pages: string[]; level: string } },
      ctx: Context,
    ) => {
      const companyUuid = requireCompany(ctx);
      await assertRole(ctx.db, companyUuid, request.role);
      if (request.role === ROLE.owner) throw new GraphQLError('The owner always has access to everything.');
      if (!isAccessLevel(request.level)) throw new GraphQLError('Choose None, View or Edit.');
      const unknown = request.pages.filter((p) => !PAGE_KEYS.includes(p));
      if (unknown.length) throw new GraphQLError(`Unknown page: ${unknown.join(', ')}`);

      // Store the full resolved map, so later changes to the module defaults can't shift it.
      const access = await loadPageAccess(ctx.db, companyUuid);
      for (const page of request.pages) access[request.role][page] = request.level;
      await ctx.db.appSetting.upsert({
        where: { companyUuid_key: { companyUuid, key: PAGE_ACCESS_KEY } },
        create: { companyUuid, key: PAGE_ACCESS_KEY, value: access },
        update: { value: access },
      });
      const loginRoles = await loadLoginRoles(ctx.db, companyUuid);
      return {
        role: request.role,
        canLogin: loginRoles[request.role],
        pages: Object.entries(access[request.role]).map(([page, level]) => ({ page, level })),
      };
    },

    setRoleLogin: async (_: unknown, { request }: { request: { role: string; canLogin: boolean } }, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      await assertRole(ctx.db, companyUuid, request.role);
      if (request.role === ROLE.owner) throw new GraphQLError('The owner can always sign in.');

      const current = await loadLoginRoles(ctx.db, companyUuid);
      current[request.role] = request.canLogin;
      await ctx.db.appSetting.upsert({
        where: { companyUuid_key: { companyUuid, key: LOGIN_ROLES_KEY } },
        create: { companyUuid, key: LOGIN_ROLES_KEY, value: current },
        update: { value: current },
      });
      const permissions = await loadPermissions(ctx.db, companyUuid);
      return { role: request.role, modules: permissions[request.role], canLogin: request.canLogin };
    },

    setMemberLogin: async (
      _: unknown,
      { request }: { request: { staffUuid: string; enabled: boolean; role?: string | null; password?: string | null } },
      ctx: Context,
    ) => {
      const companyUuid = requireCompany(ctx);
      const staff = await ctx.db.staff.findFirst({ where: { uuid: request.staffUuid, companyUuid } });
      if (!staff) throw new GraphQLError('Member not found.');
      const me = ctx.userUuid ? await ctx.loaders.user.load(ctx.userUuid) : null;
      const user = staff.userUuid ? await ctx.db.user.findUnique({ where: { uuid: staff.userUuid } }) : null;

      if (!request.enabled) {
        if (!user) return staff;
        if (user.uuid === ctx.userUuid) throw new GraphQLError('You cannot turn off your own login.');
        // The user row stays: past records point at it. It just can't sign in.
        await ctx.db.user.update({ where: { uuid: user.uuid }, data: { isActive: false } });
        return staff;
      }

      const role = request.role ?? user?.role;
      if (!role || !(await loadRoles(ctx.db, companyUuid)).some((r) => r.key === role))
        throw new GraphQLError('Choose a role for this login.');
      if (!(await loadLoginRoles(ctx.db, companyUuid))[role]) {
        throw new GraphQLError('That role is not allowed to sign in. Turn it on under System Settings › Roles.');
      }
      if (role === ROLE.owner && me?.role !== ROLE.owner && user?.role !== ROLE.owner) {
        throw new GraphQLError('Only the owner can give someone the owner role.');
      }
      if (user && user.uuid === ctx.userUuid && role !== user.role) {
        throw new GraphQLError('You cannot change your own role.');
      }

      const password = request.password ?? '';
      if (!user && !password) throw new GraphQLError('Set a password for the new login.');
      if (password && password.length < 8) throw new GraphQLError('The password needs at least 8 characters.');
      const passwordHash = password ? await hashPassword(password) : undefined;

      if (user) {
        await ctx.db.user.update({ where: { uuid: user.uuid }, data: { role, isActive: true, passwordHash } });
        return staff;
      }

      const email = staff.email.trim().toLowerCase();
      const taken = await ctx.db.user.findUnique({ where: { email } });
      if (
        taken &&
        (taken.companyUuid !== companyUuid || (await ctx.db.staff.findFirst({ where: { userUuid: taken.uuid } })))
      ) {
        throw new GraphQLError(`${email} already has a login elsewhere. Use a different email for this member.`);
      }
      const data = { role, isActive: true, passwordHash };
      const newUser = { ...data, email, companyUuid, nickname: staff.name, passwordHash: passwordHash! };
      const created = taken
        ? await ctx.db.user.update({ where: { uuid: taken.uuid }, data })
        : await ctx.db.user.create({ data: newUser });
      return ctx.db.staff.update({ where: { uuid: staff.uuid }, data: { userUuid: created.uuid } });
    },

    setUserRole: async (_: unknown, { request }: { request: { staffUuid: string; role: string } }, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      await assertRole(ctx.db, companyUuid, request.role);

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
