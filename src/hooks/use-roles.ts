import { useRolesQuery } from '@/gql';

/** The company's roles (System Settings › Roles) and a key → name lookup. */
const useRoles = () => {
  const { data, loading, refetch } = useRolesQuery({ fetchPolicy: 'cache-and-network' });
  const roles = (data?.roles ?? []) as { key: string; label: string; isOwner: boolean; memberCount: number }[];
  const labels = new Map(roles.map((r) => [r.key, r.label]));
  return {
    roles,
    loading,
    refetch,
    // Before the list loads, fall back to the key with a capital, never a blank.
    roleLabel: (key?: string | null) => (key ? (labels.get(key) ?? key.charAt(0).toUpperCase() + key.slice(1)) : ''),
  };
};

export default useRoles;
