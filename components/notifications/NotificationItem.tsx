'use client';

import { formatDistanceToNow } from 'date-fns';
import { BookOpen, Package } from 'lucide-react';
import { useLocalizedRouter } from '@/hooks/useLocalizedRouter';
import { cn } from '@/lib/utils';

type NotificationData = App.Data.NotificationData;

interface NotificationItemProps {
  notification: NotificationData;
  onMarkRead: () => void;
  onNavigate?: () => void;
}

function NotificationIcon({ model }: { model: string }) {
  switch (model) {
    case 'catalog':
    case 'catalog_element':
      return <BookOpen className="text-muted-foreground h-5 w-5" />;
    default:
      return <Package className="text-muted-foreground h-5 w-5" />;
  }
}

function getNotificationData(notification: NotificationData) {
  // Handle both array and object data formats
  const data = Array.isArray(notification.data) ? notification.data[0] : notification.data;
  return data as {
    action?: string;
    model?: string;
    model_id?: number | null;
    model_name?: string | null;
    catalog_id?: number | null;
    title?: string;
    message?: string;
  };
}

function getNotificationUrl(data: ReturnType<typeof getNotificationData>): string | null {
  if (!data.model) return null;

  switch (data.model) {
    case 'catalog':
      return data.model_id ? `/catalogs/${data.model_id}` : null;
    case 'catalog_element':
      return data.catalog_id ? `/catalogs/${data.catalog_id}` : null;
    default:
      return null;
  }
}

export function NotificationItem({ notification, onMarkRead, onNavigate }: NotificationItemProps) {
  const router = useLocalizedRouter();
  const data = getNotificationData(notification);
  const isUnread = !notification.readAt;
  const url = getNotificationUrl(data);

  const handleClick = () => {
    onMarkRead();
    if (url) {
      router.push(url);
      onNavigate?.();
    }
  };

  return (
    <div
      className={cn(
        'hover:bg-muted/50 cursor-pointer border-b p-4 transition-colors',
        isUnread && 'bg-blue-50 dark:bg-blue-950/20'
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <NotificationIcon model={data.model ?? 'default'} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{data.title ?? 'Notification'}</p>
          <p className="text-muted-foreground truncate text-sm">{data.message ?? ''}</p>
          {notification.createdAt && (
            <p className="text-muted-foreground mt-1 text-xs">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </p>
          )}
        </div>
        {isUnread && <div className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
      </div>
    </div>
  );
}
