import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useEcho } from '@/providers/EchoProvider';
import { useAuthStore } from '@/stores/useAuthStore';

export function useChatBroadcast(orderId: number | undefined, channel: string) {
  const echo = useEcho();
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  const helpersRef = useRef({ queryClient });
  useEffect(() => {
    helpersRef.current = { queryClient };
  });

  useEffect(() => {
    if (!echo || !token || !orderId) return;

    const channelName = `order.${orderId}.chat.${channel}`;
    const echoChannel = echo.private(channelName);

    echoChannel.listen('.message.sent', () => {
      helpersRef.current.queryClient.invalidateQueries({
        queryKey: ['chat'],
      });
      helpersRef.current.queryClient.invalidateQueries({
        queryKey: ['chat-unread'],
      });
    });

    return () => {
      echo.leaveChannel(`private-${channelName}`);
    };
  }, [echo, token, orderId, channel]);
}
