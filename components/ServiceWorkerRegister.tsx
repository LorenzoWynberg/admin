'use client';

import { useEffect } from 'react';

/**
 * Registers the PWA service worker (/sw.js) at root scope.
 *
 * Renders nothing. Production only — a caching SW would serve stale assets and
 * fight the Next dev server during development.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
        // Non-fatal: the app works without a SW.
      });
    };

    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register, { once: true });
      return () => window.removeEventListener('load', register);
    }
  }, []);

  return null;
}
