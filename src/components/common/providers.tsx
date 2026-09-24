import { ApolloProvider } from '@apollo/client';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';

import theme from './theme';
import client from '@/gql/apollo';
import ErrorBoundary from './error-boundary';
import Layout from './layout';
import { MessageProvider } from './message-context';
import ConfigGate from './config-gate';

const Providers = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const noAuthRoutes = ['/', '/login'];
  const isPublic = noAuthRoutes.includes(router.pathname);

  // Without a stored session, go straight to sign-in rather than waiting for
  // the first API call to be rejected.
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    if (isPublic) return;
    const token = localStorage.getItem('accessToken');
    if (token && token !== 'undefined') {
      setSignedIn(true);
      return;
    }
    router.replace(`/login?next=${encodeURIComponent(router.asPath)}`);
  }, [isPublic, router]);

  if (isPublic) {
    return (
      <ErrorBoundary>
        <ConfigProvider locale={enUS} theme={theme}>
          <ApolloProvider client={client}>{children}</ApolloProvider>
        </ConfigProvider>
      </ErrorBoundary>
    );
  }

  if (!signedIn) return null;

  return (
    <ErrorBoundary>
      <ConfigProvider locale={enUS} theme={theme}>
        <ApolloProvider client={client}>
          <MessageProvider>
            <ConfigGate>
              <Layout>{children}</Layout>
            </ConfigGate>
          </MessageProvider>
        </ApolloProvider>
      </ConfigProvider>
    </ErrorBoundary>
  );
};

export default Providers;
