import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useEcho } from '@/providers/EchoProvider';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNotificationHelpers, type NotifData } from './useNotificationHelpers';

/**
 * Listen for notification broadcasts and show toast + refresh notifications.
 * Subscribes to the recipient's own `App.Models.User.{id}` channel — the same
 * channel the client and driver apps use — so each admin receives exactly the
 * notifications addressed to them, once each.
 */
export function useNotificationBroadcast() {
  const echo = useEcho();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const { getTitle, getMessage } = useNotificationHelpers();

  // Use refs to avoid re-subscribing when helpers/queryClient change
  const helpersRef = useRef({ getTitle, getMessage, queryClient });
  useEffect(() => {
    helpersRef.current = { getTitle, getMessage, queryClient };
  });

  useEffect(() => {
    if (!echo || !user?.id) return;

    const channelName = `App.Models.User.${user.id}`;
    const channel = echo.private(channelName);

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

      if (notification.type === 'refund-request.created') {
        helpersRef.current.queryClient.invalidateQueries({
          queryKey: ['refund-requests', 'pending'],
        });
      }
    });

    return () => {
      echo.leaveChannel(`private-${channelName}`);
    };
  }, [echo, user?.id]);
}
