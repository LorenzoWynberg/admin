'use client';

import { usePushNotifications } from '@/hooks/usePushNotifications';

/**
 * Mounts the FCM web push lifecycle for authenticated admins. Renders nothing.
 * Placed inside the dashboard layout so it only runs behind auth.
 */
export function PushRegister(): null {
  usePushNotifications();
  return null;
}
