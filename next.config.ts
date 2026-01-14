import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
