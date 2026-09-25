import { useMyEditModulesQuery, useMyModulesQuery } from '@/gql';

/**
 * What the signed-in user's role allows per module (Settings › Roles): View
 * opens the pages, Edit also allows anything that saves. The server enforces
 * the same rules; this only decides which buttons to show.
 */
const useModuleAccess = () => {
  const { data: view } = useMyModulesQuery({ fetchPolicy: 'cache-first' });
  const { data: edit } = useMyEditModulesQuery({ fetchPolicy: 'cache-first' });
  const viewable = new Set((view?.myModules ?? []) as string[]);
  const editable = new Set((edit?.myEditModules ?? []) as string[]);
  return {
    canView: (module: string) => viewable.has(module),
    canEdit: (module: string) => editable.has(module),
  };
};

export default useModuleAccess;
