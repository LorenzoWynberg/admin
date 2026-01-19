'use client';

import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, useNotificationMutations } from '@/hooks/notifications';
import { NotificationItem } from './NotificationItem';

interface NotificationDropdownProps {
  onClose: () => void;
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const { t } = useTranslation();
  const { data, isLoading } = useNotifications({ perPage: 20 });
  const { markAsRead, markAllAsRead } = useNotificationMutations();

  const notifications = data?.items ?? [];
  const hasUnread = (data?.extra?.unread_count ?? 0) > 0;

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate(undefined);
    onClose();
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b p-4">
        <h4 className="font-semibold">
          {t('common:notifications', { defaultValue: 'Notifications' })}
        </h4>
        {hasUnread && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markAllAsRead.isPending}
          >
            {t('common:markAllRead', { defaultValue: 'Mark all read' })}
          </Button>
        )}
      </div>

      <ScrollArea className="h-80">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-muted-foreground p-8 text-center text-sm">
            {t('common:noNotifications', { defaultValue: 'No notifications' })}
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkRead={() => handleMarkAsRead(notification.id)}
              onNavigate={onClose}
            />
          ))
        )}
      </ScrollArea>
    </div>
  );
}
