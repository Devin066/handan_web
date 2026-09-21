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

  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true
  }
};

export default nextConfig;
