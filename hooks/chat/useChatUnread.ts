import { useQuery } from '@tanstack/react-query';
import { ChatService } from '@/services/chatService';

export function useChatUnread(orderPublicId: string, enabled = true) {
  return useQuery({
    queryKey: ['chat-unread', orderPublicId],
    queryFn: () => ChatService.getUnreadCounts(orderPublicId),
    enabled,
    staleTime: 30_000,
  });
}
