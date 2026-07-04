/**
 * Web push service — FCM web SDK + VAPID (matches client/driver `pushService.web.ts`).
 *
 * Graceful no-op path (every method returns without throwing) when:
 *   - Firebase is not configured (`NEXT_PUBLIC_FIREBASE_API_KEY` empty),
 *   - the VAPID key is missing,
 *   - the browser does not support Web Push (`isSupported()` → false),
 *   - the user denies notification permission.
 *
 * Background messages are handled by `public/firebase-messaging-sw.js`, which
 * FCM requires at the site root alongside the SDK (a separate file; it coexists
 * with the PWA `sw.js`).
 *
 * onTokenRefresh caveat: the FCM modular web SDK (v9+) has no `onTokenRefresh`
 * event — tokens rotate internally, so callers re-call `registerToken()` on
 * re-login instead.
 */

import { getToken, deleteToken, onMessage as fcmOnMessage } from 'firebase/messaging';

import { api } from '@/lib/api/client';
import { getMessagingIfConfigured, FIREBASE_VAPID_KEY } from '@/lib/firebase';

// Tracked so unregister can reuse it without an extra getToken() round-trip.
let currentToken: string | null = null;

/**
 * Register (or re-use) the `/firebase-messaging-sw.js` SW registration.
 * FCM needs an explicit `serviceWorkerRegistration` so it uses the FCM SW,
 * not the PWA sw.js (both coexist at root scope).
 */
async function getFcmSwRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    // register() is idempotent — returns the existing registration if active.
    return await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
  } catch {
    return null;
  }
}

export const PushService = {
  /**
   * Request browser notification permission. Returns `true` when granted.
   */
  async requestPermission(): Promise<boolean> {
    if (typeof Notification === 'undefined') {
      return false;
    }

    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;

    const result = await Notification.requestPermission();
    return result === 'granted';
  },

  /**
   * Obtain an FCM token and register it with the backend.
   *
   * Flow: ensure Firebase is configured + supported → VAPID present → permission
   * granted → register FCM SW → getToken() → POST /device-tokens (platform: web).
   */
  async registerToken(): Promise<void> {
    const messaging = await getMessagingIfConfigured();
    if (!messaging) return;
    if (!FIREBASE_VAPID_KEY) return;

    const hasPermission = await this.requestPermission();
    if (!hasPermission) return;

    const swReg = await getFcmSwRegistration();
    if (!swReg) return;

    try {
      const token = await getToken(messaging, {
        vapidKey: FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: swReg,
      });

      if (!token) return;

      currentToken = token;
      await api.post('/device-tokens', { token, platform: 'web' });
    } catch {
      // Non-fatal — the dashboard works without push.
    }
  },

  /**
   * Unregister the current FCM token from the backend (call on logout).
   * Both operations are independent and run in parallel; errors are swallowed.
   */
  async unregisterToken(): Promise<void> {
    const messaging = await getMessagingIfConfigured();
    if (!messaging || !currentToken) return;

    const token = currentToken;
    currentToken = null;

    await Promise.allSettled([deleteToken(messaging), api.destroy('/device-tokens', { token })]);
  },

  /**
   * Listen for FOREGROUND push messages. Returns an unsubscribe function.
   */
  onMessage(handler: (message: unknown) => void): () => void {
    let unsub: (() => void) | undefined;

    getMessagingIfConfigured()
      .then((messaging) => {
        if (!messaging) return;
        unsub = fcmOnMessage(messaging, (payload) => handler(payload));
      })
      .catch(() => {});

    return () => {
      unsub?.();
    };
  },
};
