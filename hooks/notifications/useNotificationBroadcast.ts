import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useEcho } from '@/providers/EchoProvider';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNotificationHelpers, type NotifData } from './useNotificationHelpers';

/**
 * Listen for notification broadcasts and show toast + refresh notifications.
 * Uses the private 'notifications' channel for all authenticated users.
 */
export function useNotificationBroadcast() {
  const echo = useEcho();
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  const { getTitle, getMessage } = useNotificationHelpers();

  // Use refs to avoid re-subscribing when helpers/queryClient change
  const helpersRef = useRef({ getTitle, getMessage, queryClient });
  useEffect(() => {
    helpersRef.current = { getTitle, getMessage, queryClient };
  });

  useEffect(() => {
    if (!echo || !token) return;

    const channel = echo.private('notifications');

    channel.notification((notification: Api.Broadcast.AnyNotification) => {
      const data: NotifData = {
        action: notification.action,
        model: notification.model,
        modelId: 'modelId' in notification ? notification.modelId : undefined,
        modelName: 'modelName' in notification ? notification.modelName : undefined,
        modelPublicId: 'modelPublicId' in notification ? notification.modelPublicId : undefined,
        catalogId: 'catalogId' in notification ? notification.catalogId : undefined,
        translationKey: notification.translationKey,
        translationParams: notification.translationParams,
      };

      // Show toast notification
      toast(helpersRef.current.getTitle(data), {
        description: helpersRef.current.getMessage(data),
      });

      // Refresh notifications list
      helpersRef.current.queryClient.invalidateQueries({
        queryKey: ['notifications'],
      });
    });

    return () => {
      echo.leaveChannel('private-notifications');
    };
  }, [echo, token]);
}
