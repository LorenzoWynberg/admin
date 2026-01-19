import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useEcho } from '@/providers/EchoProvider';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNotificationHelpers, type NotifData } from './useNotificationHelpers';

interface BroadcastNotification {
  id: string;
  type: string;
  action: string;
  model: string;
  model_id: number | null;
  model_name: string | null;
  catalog_id?: number | null;
}

/**
 * Listen for notification broadcasts and show toast + refresh notifications.
 * Uses the private 'notifications' channel for all authenticated users.
 */
export function useNotificationBroadcast() {
  const echo = useEcho();
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  const { getTitle, getMessage } = useNotificationHelpers();

  // Use refs to avoid re-subscribing when helpers change
  const helpersRef = useRef({ getTitle, getMessage });
  useEffect(() => {
    helpersRef.current = { getTitle, getMessage };
  });

  useEffect(() => {
    if (!echo || !token) return;

    const channel = echo.private('notifications');

    channel.notification((notification: BroadcastNotification) => {
      const data: NotifData = {
        action: notification.action,
        model: notification.model,
        model_id: notification.model_id,
        model_name: notification.model_name,
        catalog_id: notification.catalog_id,
      };

      // Show toast notification
      toast(helpersRef.current.getTitle(data), {
        description: helpersRef.current.getMessage(data),
      });

      // Refresh notifications list
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    return () => {
      echo.leaveChannel('private-notifications');
    };
  }, [echo, token, queryClient]);
}
