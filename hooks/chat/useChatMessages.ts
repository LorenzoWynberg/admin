import { useInfiniteQuery } from '@tanstack/react-query';
import { ChatService } from '@/services/chatService';

type OrderMessageData = App.Data.Chat.OrderMessageData;

export function useChatMessages(
  orderPublicId: string,
  channel: string,
  enabled = true
) {
  return useInfiniteQuery({
    queryKey: ['chat', orderPublicId, channel],
    queryFn: async ({ pageParam }: { pageParam: number | undefined }) => {
      return ChatService.getMessages(orderPublicId, channel, pageParam);
    },
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage: OrderMessageData[]) => {
      if (lastPage.length === 0) return undefined;
      return lastPage[lastPage.length - 1]?.id;
    },
    enabled,
    staleTime: 30_000,
  });
}
