import { GraphQLError } from 'graphql';
import type { Prisma } from '@/generated/prisma/client';
import { ROLE } from './domain/status';

/**
 * The company's roles (System Settings › Roles). Stored as rbac.roles so a
 * company can rename them and add its own; the owner is built in and fixed.
 * Keys are stable ids saved on users; only labels change on rename.
 */
export type RoleDef = { key: string; label: string };

export const ROLES_KEY = 'rbac.roles';

export const DEFAULT_ROLES: RoleDef[] = [
  { key: ROLE.employee, label: 'Shop Floor' },
  { key: ROLE.hr, label: 'HR' },
  { key: ROLE.finance, label: 'Finance' },
  { key: ROLE.manager, label: 'Manager' },
  { key: ROLE.owner, label: 'Owner' },
];

export async function loadRoles(db: Prisma.TransactionClient, companyUuid: string): Promise<RoleDef[]> {
  const row = await db.appSetting.findUnique({ where: { companyUuid_key: { companyUuid, key: ROLES_KEY } } });
  const stored = Array.isArray(row?.value) ? (row!.value as RoleDef[]) : DEFAULT_ROLES;
  const others = stored.filter((r) => r?.key && r.key !== ROLE.owner);
  // The owner is always there, always last, always called Owner.
  return [...others, { key: ROLE.owner, label: 'Owner' }];
}

export async function saveRoles(db: Prisma.TransactionClient, companyUuid: string, roles: RoleDef[]) {
  await db.appSetting.upsert({
    where: { companyUuid_key: { companyUuid, key: ROLES_KEY } },
    create: { companyUuid, key: ROLES_KEY, value: roles },
    update: { value: roles },
  });
}

export async function assertRole(db: Prisma.TransactionClient, companyUuid: string, key?: string | null) {
  const roles = await loadRoles(db, companyUuid);
  const role = roles.find((r) => r.key === key);
  if (!role) throw new GraphQLError('That role no longer exists. Refresh and choose another.');
  return role;
}
