import { GraphQLError } from 'graphql';
import type { Context } from '../context';
import { requireCompany } from '../context';
import { CURRENCY_SETTING_KEY, DEFAULT_CURRENCY, isSupportedCurrency } from '@/config/currency';

/**
 * Company-wide display settings, stored as rows in AppSetting rather than
 * columns on Company. Settings arrive one at a time as the product grows, and a
 * key/value row avoids a migration for each one.
 */
export const configurationResolvers = {
  RootQueryType: {
    configuration: async (_: unknown, __: unknown, ctx: Context) => {
      const companyUuid = requireCompany(ctx);

      const row = await ctx.db.appSetting.findUnique({
        where: { companyUuid_key: { companyUuid, key: CURRENCY_SETTING_KEY } },
      });

      // An unset or unrecognised value falls back rather than throwing: a bad
      // row in one setting should not take down every screen that shows money.
      const stored = row?.value;
      return {
        currency: isSupportedCurrency(stored) ? stored : DEFAULT_CURRENCY,
      };
    },
  },

  RootMutationType: {
    updateConfiguration: async (_: unknown, { request }: { request: { currency?: string } }, ctx: Context) => {
      const companyUuid = requireCompany(ctx);

      if (request.currency !== undefined) {
        if (!isSupportedCurrency(request.currency)) {
          throw new GraphQLError(`unsupported currency: ${request.currency}`);
        }

        await ctx.db.appSetting.upsert({
          where: {
            companyUuid_key: { companyUuid, key: CURRENCY_SETTING_KEY },
          },
          create: {
            companyUuid,
            key: CURRENCY_SETTING_KEY,
            value: request.currency,
          },
          update: { value: request.currency },
        });
      }

      const row = await ctx.db.appSetting.findUnique({
        where: { companyUuid_key: { companyUuid, key: CURRENCY_SETTING_KEY } },
      });

      return {
        currency: isSupportedCurrency(row?.value) ? row?.value : DEFAULT_CURRENCY,
      };
    },
  },
};
