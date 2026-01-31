'use client';

import { formatDistanceToNow } from 'date-fns';
import { BookOpen, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getDateLocale } from '@/utils/format';
import { useLocalizedRouter } from '@/hooks/useLocalizedRouter';
import {
  useNotificationHelpers,
  getNotificationUrl,
  getNotificationData,
} from '@/hooks/notifications';
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

export function NotificationItem({ notification, onMarkRead, onNavigate }: NotificationItemProps) {
  const { i18n } = useTranslation();
  const { getTitle, getMessage } = useNotificationHelpers();
  const router = useLocalizedRouter();
  const dateLocale = getDateLocale(i18n.language);
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
          <p className="text-sm font-medium">{getTitle(data)}</p>
          <p className="text-muted-foreground truncate text-sm">{getMessage(data)}</p>
          {notification.createdAt && (
            <p className="text-muted-foreground mt-1 text-xs">
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
                locale: dateLocale,
              })}
            </p>
          )}
        </div>
        {isUnread && <div className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
      </div>
    </div>
  );
}
