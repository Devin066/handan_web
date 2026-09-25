import { scalarResolvers } from './scalars';
import { authResolvers } from './auth';
import { setupResolvers } from './setup';
import { sellingResolvers } from './selling';
import { purchasingResolvers } from './purchasing';
import { productionResolvers } from './production';
import { financeResolvers } from './finance';
import { configurationResolvers } from './configuration';
import { hrResolvers } from './hr';
import { dashboardResolvers } from './dashboard';
import { productionBoardResolvers } from './production-board';
import { guardRootFields } from '../rbac';

type ResolverMap = Record<string, Record<string, unknown>>;

/**
 * Each domain file owns its slice of RootQueryType/RootMutationType, so merging is
 * per type rather than a shallow spread, which would drop all but the last domain's
 * root fields.
 */
function mergeResolvers(...maps: ResolverMap[]): ResolverMap {
  const merged: ResolverMap = {};

  for (const map of maps) {
    for (const [typeName, fields] of Object.entries(map)) {
      merged[typeName] = { ...(merged[typeName] ?? {}), ...fields };
    }
  }

  return merged;
}

const merged = mergeResolvers(
  scalarResolvers as unknown as ResolverMap,
  authResolvers as unknown as ResolverMap,
  setupResolvers as unknown as ResolverMap,
  sellingResolvers as unknown as ResolverMap,
  purchasingResolvers as unknown as ResolverMap,
  productionResolvers as unknown as ResolverMap,
  financeResolvers as unknown as ResolverMap,
  configurationResolvers as unknown as ResolverMap,
  hrResolvers as unknown as ResolverMap,
  dashboardResolvers as unknown as ResolverMap,
  productionBoardResolvers as unknown as ResolverMap,
);

export const resolvers: ResolverMap = {
  ...merged,
  RootQueryType: guardRootFields(merged.RootQueryType),
  RootMutationType: guardRootFields(merged.RootMutationType, 'edit'),
};
