import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Emits .next/standalone: a self-contained server with only the packages it
  // actually imports, so the runtime Docker image doesn't ship node_modules.
  output: 'standalone',

  // The GraphQL schema is read from disk at runtime; without this it isn't
  // traced into the standalone bundle.
  outputFileTracingIncludes: {
    '/api/graphql': ['./src/server/schema.graphql']
  },

  poweredByHeader: false,

  /**
   * Files in public/ ship with no Cache-Control, so the browser revalidates the
   * logo, the mark and the favicon on every page load. Their contents change
   * about once a rebrand, so a day of caching removes those conditional
   * requests, and stale-while-revalidate picks up a replacement quietly.
   */
  async headers() {
    return [
      {
        source: '/:file(handlathe-logo.jpg|handlathe-icon.png|favicon.ico|logo.png|logo.svg)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }]
      }
    ];
  },

  compiler: {
    // Diagnostics from the Apollo links and elsewhere; errors still get through.
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false
  },

  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true
  }
};

export default nextConfig;
