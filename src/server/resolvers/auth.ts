import { GraphQLError } from 'graphql';
import type { Context } from '../context';
import { requireCompany, requireUser } from '../context';
import { hashPassword, signToken, verifyPassword } from '../auth';
import { isValidMobile } from '@/config/ph-contact';
import { allowedModules, loadLoginRoles } from '../rbac';
import { normaliseStaff, type StaffInput } from '../domain/staff';

export const authResolvers = {
  RootQueryType: {
    currentUser: async (_: unknown, __: unknown, ctx: Context) => {
      const userUuid = requireUser(ctx);
      return ctx.loaders.user.load(userUuid);
    },

    company: async (_: unknown, __: unknown, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.loaders.company.load(companyUuid);
    },

    myProfile: async (_: unknown, __: unknown, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.staff.findFirst({ where: { companyUuid, userUuid: requireUser(ctx) } });
    },

    listStaff: async (_: unknown, __: unknown, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.staff.findMany({ where: { companyUuid }, orderBy: { insertedAt: 'asc' } });
    },
  },

  RootMutationType: {
    saveStaff: async (_: unknown, { request }: { request: StaffInput }, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      const data = normaliseStaff(request);

      const duplicate = await ctx.db.staff.findFirst({
        where: { companyUuid, email: data.email, ...(request.uuid ? { NOT: { uuid: request.uuid } } : {}) },
      });
      if (duplicate) throw new GraphQLError(`${data.email} is already a member.`);

      if (!request.uuid) return ctx.db.staff.create({ data: { ...data, companyUuid } });

      const existing = await ctx.db.staff.findFirst({ where: { uuid: request.uuid, companyUuid } });
      if (!existing) throw new GraphQLError('Member not found.');
      return ctx.db.staff.update({ where: { uuid: existing.uuid }, data });
    },

    updateMyProfile: async (
      _: unknown,
      { request }: { request: { name?: string | null; phone?: string | null } },
      ctx: Context,
    ) => {
      const companyUuid = requireCompany(ctx);
      const userUuid = requireUser(ctx);
      const staff = await ctx.db.staff.findFirst({ where: { companyUuid, userUuid } });
      if (!staff) throw new GraphQLError('Your login is not linked to a member record. Ask the owner to link it.');
      // Names appear on payroll and records, so only roles with Settings access change them.
      let name = staff.name;
      if (request.name != null && request.name.trim() !== staff.name) {
        if (!(await allowedModules(ctx)).includes('settings')) {
          throw new GraphQLError('Only someone with Settings access can change a name. Ask the owner.', {
            extensions: { code: 'FORBIDDEN' },
          });
        }
        name = request.name.trim();
        if (!name) throw new GraphQLError('Enter your name.');
        if (name.length > 80) throw new GraphQLError('Keep the name under 80 characters.');
      }
      const phone = request.phone?.trim() || null;
      if (phone && !isValidMobile(phone)) throw new GraphQLError('Mobile number is not valid.');
      await ctx.db.user.update({ where: { uuid: userUuid }, data: { nickname: name } });
      return ctx.db.staff.update({ where: { uuid: staff.uuid }, data: { name, phone } });
    },

    changeMyPassword: async (
      _: unknown,
      { request }: { request: { currentPassword: string; newPassword: string } },
      ctx: Context,
    ) => {
      const user = await ctx.db.user.findUnique({ where: { uuid: requireUser(ctx) } });
      if (!user || !(await verifyPassword(request.currentPassword, user.passwordHash))) {
        throw new GraphQLError('Your current password is not right.', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      if (request.newPassword.length < 8) throw new GraphQLError('The new password needs at least 8 characters.');
      if (request.newPassword === request.currentPassword) {
        throw new GraphQLError('Choose a password different from the current one.');
      }
      await ctx.db.user.update({
        where: { uuid: user.uuid },
        data: { passwordHash: await hashPassword(request.newPassword) },
      });
      return true;
    },

    login: async (_: unknown, { request }: { request: { email?: string; password?: string } }, ctx: Context) => {
      const email = request.email?.trim().toLowerCase();

      if (!email || !request.password) {
        throw new GraphQLError('email and password are required');
      }

      const user = await ctx.db.user.findUnique({ where: { email } });

      // Same message either way, so the response can't be used to enumerate accounts.
      if (!user || !(await verifyPassword(request.password, user.passwordHash))) {
        throw new GraphQLError('invalid email or password', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      if (!user.companyUuid) {
        throw new GraphQLError('user is not attached to a company');
      }
      if (!user.isActive || !(await loadLoginRoles(ctx.db, user.companyUuid))[user.role]) {
        throw new GraphQLError('This login is turned off. Ask the owner to turn it back on.', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return {
        ...user,
        accessToken: signToken({ userUuid: user.uuid, companyUuid: user.companyUuid }),
      };
    },
  },

  Staff: {
    company: (parent: { companyUuid: string }, _: unknown, ctx: Context) =>
      ctx.loaders.company.load(parent.companyUuid),
    user: (parent: { userUuid: string | null }, _: unknown, ctx: Context) =>
      parent.userUuid ? ctx.loaders.user.load(parent.userUuid) : null,
    hasLogin: async (parent: { userUuid: string | null }, _: unknown, ctx: Context) =>
      !!parent.userUuid && !!(await ctx.loaders.user.load(parent.userUuid))?.isActive,
    role: async (parent: { userUuid: string | null }, _: unknown, ctx: Context) =>
      parent.userUuid ? ((await ctx.loaders.user.load(parent.userUuid))?.role ?? null) : null,
  },
};
