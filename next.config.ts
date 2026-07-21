import type { NextConfig } from 'next';

const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://api.mandados.test:60';

const nextConfig: NextConfig = {
  // Use Node's native util module instead of Next.js's bundled polyfill
  // to avoid DEP0060 deprecation warning for util._extend
  serverExternalPackages: ['util'],
  turbopack: {
    resolveAlias: {
      util: 'node:util',
    },
  },
  // The API's static locale files are served by nginx without CORS headers, so
  // the browser can't fetch them cross-origin. Serve them same-origin and let
  // Next forward to the API server-side (works in dev AND prod). i18next's
  // loadPath is the matching relative `/locales/...`.
  async rewrites() {
    return [{ source: '/locales/:path*', destination: `${apiBase}/locales/:path*` }];
  },
};

export default nextConfig;
