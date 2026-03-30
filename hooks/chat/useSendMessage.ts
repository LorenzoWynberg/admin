import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChatService } from '@/services/chatService';
import { isApiError } from '@/lib/api/error';
import { toast } from 'sonner';

export function useSendMessage(orderPublicId: string, channel: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { body?: string; image?: File }) =>
      ChatService.sendMessage(orderPublicId, channel, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['chat', orderPublicId, channel],
      });
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error('Failed to send message');
      }
    },
  });
}
