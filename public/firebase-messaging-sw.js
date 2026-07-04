/* eslint-env serviceworker */
/* global firebase */
/**
 * Firebase Cloud Messaging service worker — web push for the admin dashboard.
 *
 * FCM requires a service worker at a predictable root URL to deliver background
 * push messages. This file fulfils that contract and coexists with `sw.js` (the
 * PWA caching SW); both are registered at root scope simultaneously.
 *
 * ⚠️  CONFIG DUPLICATION — REQUIRED BY FCM
 * Service workers are static files with NO access to build-time env injection,
 * so the Firebase config MUST be a literal object. These values are PUBLIC (the
 * Firebase Web SDK config is not a secret) and match the client/driver apps and
 * `NEXT_PUBLIC_FIREBASE_*` env vars — same project `mandados-3dc63`.
 */

// ── Firebase web config (PUBLIC, safe to commit — same project as client/driver) ──
const firebaseConfig = {
  apiKey: 'AIzaSyCGOyfCoQ3AuBG1mKqKhvewpMb-EdBQgLY',
  authDomain: 'mandados-3dc63.firebaseapp.com',
  projectId: 'mandados-3dc63',
  messagingSenderId: '596443400196',
  appId: '1:596443400196:web:7fd013db8999480e52cd51',
};
// ─────────────────────────────────────────────────────────────────────────────

// Guard: skip init when the config is empty (unconfigured deploy) to avoid
// console errors before Firebase is wired up.
if (firebaseConfig.apiKey) {
  importScripts('https://www.gstatic.com/firebasejs/12.0.0/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging-compat.js');

  firebase.initializeApp(firebaseConfig);

  const messaging = firebase.messaging();

  /**
   * Background message handler — shown when the dashboard is backgrounded or
   * closed. Payload data fields are camelCase (mirroring `Api.Broadcast.*`).
   */
  messaging.onBackgroundMessage((payload) => {
    const notification = payload.notification ?? {};
    const title = notification.title ?? 'Mandados Admin';
    const body = notification.body ?? '';
    const icon = notification.icon ?? '/icon-192.png';

    self.registration.showNotification(title, {
      body,
      icon,
      data: payload.data ?? {},
    });
  });
}
