import { useMyPageAccessQuery } from '@/gql';
import { ALL_PAGES } from '@/config/access';

/**
 * What the signed-in user's role allows (System Settings › Roles), per page of
 * the access tree: View opens a page, Edit also allows anything that saves.
 * Pass a page key ('purchasing.orders') or a module key ('purchasing', true
 * when any of its pages qualifies). The server enforces the same rules; this
 * only decides what to show.
 */
const useModuleAccess = () => {
  const { data } = useMyPageAccessQuery({ fetchPolicy: 'cache-first' });
  const levels = new Map(((data?.myPageAccess ?? []) as any[]).map((p) => [p.page, p.level]));
  const pagesOf = (key: string) => {
    const inModule = ALL_PAGES.filter((p) => p.module === key).map((p) => p.key);
    return inModule.length ? inModule : [key];
  };
  return {
    loaded: !!data,
    canView: (key: string) => pagesOf(key).some((p) => ['view', 'edit'].includes(levels.get(p))),
    canEdit: (key: string) => pagesOf(key).some((p) => levels.get(p) === 'edit'),
  };
};

export default useModuleAccess;
