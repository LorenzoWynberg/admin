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
  async rewrites() {
    // Use local API for locales (HTTP to avoid SSL cert issues)
    const localesUrl = process.env.LOCALES_URL || 'http://api.mandados.test:60';

    return [
      {
        source: '/locales/:path*',
        destination: `${localesUrl}/locales/:path*`,
      },
    ];
  },
};

export default nextConfig;
