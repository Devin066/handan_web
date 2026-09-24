import { GraphQLError } from 'graphql';
import { prisma, type Db } from './db';
import { verifyToken } from './auth';
import { createLoaders, type Loaders } from './loaders';

export type Context = {
  db: Db;
  loaders: Loaders;
  userUuid: string | null;
  companyUuid: string | null;
  /** Per-request cache of item unit costs, filled on first use. */
  unitCosts?: Promise<Map<string, number>>;
};

export async function createContext({ request }: { request: Request }): Promise<Context> {
  const header = request.headers.get('authorization') ?? '';
  const token = header.replace(/^Bearer\s+/i, '').trim();
  const payload = token ? verifyToken(token) : null;

  return {
    db: prisma,
    // Fresh per request: DataLoader caches, and a cache that outlived the
    // request would leak rows between tenants.
    loaders: createLoaders(prisma),
    userUuid: payload?.userUuid ?? null,
    companyUuid: payload?.companyUuid ?? null,
  };
}

/**
 * Every tenant-scoped resolver goes through this. Returning the company uuid from
 * one place is what keeps `companyUuid` out of the individual resolvers, where it
 * would eventually be forgotten and leak another tenant's rows.
 */
export function requireCompany(ctx: Context): string {
  if (!ctx.companyUuid) {
    throw new GraphQLError('unauthenticated', { extensions: { code: 'UNAUTHENTICATED' } });
  }
  return ctx.companyUuid;
}

export function requireUser(ctx: Context): string {
  if (!ctx.userUuid) {
    throw new GraphQLError('unauthenticated', { extensions: { code: 'UNAUTHENTICATED' } });
  }
  return ctx.userUuid;
}
