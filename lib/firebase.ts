/**
 * Firebase web SDK initialisation — FCM web push (matches client/driver setup).
 *
 * Lazy-initialised: the Firebase app and Messaging instance are only created on
 * first call to `getMessagingIfConfigured()`. Subsequent calls return the cached
 * instance.
 *
 * Graceful no-op: returns `null` when
 *   - `NEXT_PUBLIC_FIREBASE_API_KEY` is empty (not yet configured), or
 *   - `isSupported()` returns false (e.g. non-HTTPS context, older browser).
 *
 * All callers MUST handle the `null` case — never assume messaging is available.
 *
 * The Firebase web config below is PUBLIC (safe to expose in the bundle); it is
 * the same project (`mandados-3dc63`) used by the client and driver apps.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getMessaging, isSupported, type Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
};

const FIREBASE_APP_NAME = 'mandados-admin-web';

let cachedApp: FirebaseApp | null = null;
let cachedMessaging: Messaging | null = null;
// Tracks whether we've already resolved (so we don't call isSupported() twice).
let resolved = false;

function getOrInitApp(): FirebaseApp | null {
  if (!firebaseConfig.apiKey) {
    // Not configured — caller should no-op silently.
    return null;
  }

  if (cachedApp) return cachedApp;

  // Avoid double-init if some other import already initialised the app.
  const existing = getApps().find((a) => a.name === FIREBASE_APP_NAME);
  if (existing) {
    cachedApp = existing;
    return cachedApp;
  }

  cachedApp = initializeApp(firebaseConfig, FIREBASE_APP_NAME);
  return cachedApp;
}

/**
 * Returns the FCM `Messaging` instance, or `null` if Firebase is not
 * configured or the current browser does not support the Web Push API.
 *
 * Callers should await this once and cache the result for the session.
 */
export async function getMessagingIfConfigured(): Promise<Messaging | null> {
  if (resolved) return cachedMessaging;

  const app = getOrInitApp();
  if (!app) {
    resolved = true;
    return null;
  }

  try {
    const supported = await isSupported();
    if (supported) {
      cachedMessaging = getMessaging(app);
    }
  } catch {
    cachedMessaging = null;
  }

  resolved = true;
  return cachedMessaging;
}

export const FIREBASE_VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? '';
