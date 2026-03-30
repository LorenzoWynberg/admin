import { useMutation } from '@tanstack/react-query';
import { ChatService } from '@/services/chatService';

export function useMarkRead(orderPublicId: string, channel: string) {
  return useMutation({
    mutationFn: (lastReadMessageId: number) =>
      ChatService.markRead(orderPublicId, channel, lastReadMessageId),
  });
}
