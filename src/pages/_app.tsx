import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Roboto, Roboto_Mono } from 'next/font/google';
import type { AppProps } from 'next/app';

import '@/styles/globals.css';

import Loading from '@/components/shared/loading';

// Self-hosted from our own origin. Loading these through an @import in the
// stylesheet cost a DNS lookup, a TLS handshake and a second stylesheet round
// trip before any text could paint.
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  fallback: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
});

const Providers = dynamic(() => import('@/components/common/providers'), {
  ssr: false,
});

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <style jsx global>{`
        :root {
          --font-sans: ${roboto.style.fontFamily};
          --font-mono: ${robotoMono.style.fontFamily};
        }
      `}</style>
      <Suspense fallback={<Loading />}>
        <Providers>
          <Component {...pageProps} />
        </Providers>
      </Suspense>
    </>
  );
};

export default App;
