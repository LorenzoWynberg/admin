import { useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationService } from '@/services/notificationService';

export function useNotificationMutations() {
  const queryClient = useQueryClient();

  const invalidateNotifications = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const markAsRead = useMutation({
    mutationFn: NotificationService.markAsRead,
    onSuccess: invalidateNotifications,
  });

  const markAllAsRead = useMutation({
    mutationFn: NotificationService.markAllAsRead,
    onSuccess: invalidateNotifications,
  });

  const deleteNotification = useMutation({
    mutationFn: NotificationService.delete,
    onSuccess: invalidateNotifications,
  });

  return { markAsRead, markAllAsRead, deleteNotification };
}
