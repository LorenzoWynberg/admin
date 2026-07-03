import type { MetadataRoute } from 'next';

/**
 * Web app manifest (served at /manifest.webmanifest). Makes the admin dashboard
 * installable as a standalone desktop/mobile app with the Mandados brand.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mandados Admin',
    short_name: 'Mandados Admin',
    description: 'Admin dashboard for Mandados delivery service',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4EBD93',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      {
        src: '/icons/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
