import { GraphQLError } from 'graphql';
import type { Context } from '../context';
import { requireCompany, requireUser } from '../context';
import { signToken, verifyPassword } from '../auth';

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

    listStaff: async (_: unknown, __: unknown, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.staff.findMany({ where: { companyUuid }, orderBy: { insertedAt: 'asc' } });
    },
  },

  RootMutationType: {
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
  },
};
