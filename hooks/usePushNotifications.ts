import { useEffect, useRef } from 'react';

import { PushService } from '@/services/pushService';
import { useAuthStore } from '@/stores/useAuthStore';

/**
 * Registers the FCM web push token once the admin is authenticated, and cleans
 * up the foreground-message listener on unmount. Mirrors the client/driver
 * `usePushNotifications` hook.
 *
 * Production-only side effect: registration prompts for notification permission
 * and hits `/device-tokens`. The FCM service worker is registered lazily inside
 * `PushService.registerToken()`.
 */
export function usePushNotifications(): void {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!user || !token) {
      registeredRef.current = false;
      return;
    }

    if (registeredRef.current) return;
    registeredRef.current = true;

    void PushService.registerToken();

    const unsubMessage = PushService.onMessage(() => {
      // Foreground pushes are surfaced in-app via the Reverb notifications feed;
      // no extra handling needed here beyond keeping the listener attached.
    });

    return () => {
      unsubMessage();
    };
  }, [user, token]);
}
