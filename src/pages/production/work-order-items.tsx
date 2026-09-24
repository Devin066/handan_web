import type { GetServerSideProps } from 'next';

/**
 * Production steps now live inside each work order's detail drawer. This keeps
 * old bookmarks working.
 */
export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: { destination: '/production/work-orders', permanent: false },
});

export default function WorkOrderItemsRedirect() {
  return null;
}
