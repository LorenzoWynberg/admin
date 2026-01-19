import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useEcho } from '@/providers/EchoProvider';
import { useAuthStore } from '@/stores/useAuthStore';

interface BroadcastNotification {
  id: string;
  type: string;
  action: string;
  model: string;
  model_id: number | null;
  model_name: string | null;
  title: string;
  message: string;
}

/**
 * Listen for notification broadcasts and show toast + refresh notifications.
 * Uses the private 'notifications' channel for all authenticated users.
 */
export function useNotificationBroadcast() {
  const echo = useEcho();
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!echo || !token) return;

    const channel = echo.private('notifications');

    channel.notification((notification: BroadcastNotification) => {
      // Show toast notification
      toast(notification.title, {
        description: notification.message,
      });

      // Refresh notifications list
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    return () => {
      echo.leaveChannel('private-notifications');
    };
  }, [echo, token, queryClient]);
}
