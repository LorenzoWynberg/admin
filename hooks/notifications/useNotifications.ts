import { useQuery } from '@tanstack/react-query';
import { NotificationService } from '@/services/notificationService';

interface UseNotificationsParams {
  unreadOnly?: boolean;
  perPage?: number;
  page?: number;
  model?: string;
  action?: string;
  fromDate?: string;
  toDate?: string;
  enabled?: boolean;
}

export function useNotifications(params: UseNotificationsParams = {}) {
  const { enabled = true, ...listParams } = params;

  return useQuery({
    queryKey: ['notifications', listParams],
    queryFn: () => NotificationService.list(listParams),
    enabled,
    refetchInterval: 60000, // Refetch every 60s as fallback
  });
}

export function useUnreadCount() {
  const { data } = useNotifications({ perPage: 1 });
  return data?.extra?.unread_count ?? 0;
}
