/**
 * Mandados Admin — PWA service worker.
 *
 * Conservative for a Next.js SSR app:
 *   • Navigations → network-first; on failure fall back to /offline.html.
 *     We do NOT cache page HTML or RSC payloads (they're authed and dynamic).
 *   • Immutable static assets (/_next/static, /icons) → stale-while-revalidate.
 *   • Everything else (API, RSC fetches, etc.) → straight to network.
 *
 * Registered in production only (see ServiceWorkerRegister) so it never
 * interferes with the Next dev server.
 */

const CACHE = 'mandados-admin-shell-v1';
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.add(OFFLINE_URL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isCacheableAsset(url) {
  return url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/');
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Page navigations: network-first, offline page on failure. Never cached.
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  // Immutable static assets: stale-while-revalidate.
  if (isCacheableAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              const copy = response.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
            }
            return response;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
  // Everything else (API, RSC payloads): default network handling.
});
