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
    const localesUrl =
      process.env.NEXT_PUBLIC_API_URL || 'https://api.mandados.cr';

    return [
      {
        source: '/locales/:path*',
        destination: `${localesUrl}/locales/:path*`,
      },
    ];
  },
};

export default nextConfig;
