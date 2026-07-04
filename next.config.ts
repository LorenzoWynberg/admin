import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Use Node's native util module instead of Next.js's bundled polyfill
  // to avoid DEP0060 deprecation warning for util._extend
  serverExternalPackages: ['util'],
  turbopack: {
    resolveAlias: {
      util: 'node:util',
    },
  },
};

export default nextConfig;
