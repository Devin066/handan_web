import { useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * The root has no page of its own: signed-in users go to the dashboard,
 * everyone else to sign in. The sign-in screen already names the modules.
 */
const Home = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    router.replace(token && token !== 'undefined' ? '/dashboard' : '/login');
  }, [router]);

  return null;
};

export default Home;
