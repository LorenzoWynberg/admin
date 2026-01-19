'use client';

import {
  TableHeader,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Table,
} from '@/components/ui/table';

import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { useLocalizedRouter } from '@/hooks/useLocalizedRouter';
import { useNotifications, useNotificationMutations } from '@/hooks/notifications';
import { Bell, BookOpen, ChevronLeft, ChevronRight, Package, Check } from 'lucide-react';

type NotificationData = App.Data.NotificationData;

function getNotificationData(notification: NotificationData) {
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

function NotificationIcon({ model }: { model: string }) {
  switch (model) {
    case 'catalog':
    case 'catalog_element':
      return <BookOpen className="text-muted-foreground h-5 w-5" />;
    default:
      return <Package className="text-muted-foreground h-5 w-5" />;
  }
}

export default function NotificationsPage() {
  const { t, ready } = useTranslation();
  const router = useLocalizedRouter();
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useNotifications({ page, perPage: 20 });
  const { markAsRead, markAllAsRead } = useNotificationMutations();

  const notifications = data?.items || [];
  const meta = data?.meta;
  const hasUnread = (data?.extra?.unread_count ?? 0) > 0;

  const handleRowClick = (notification: NotificationData) => {
    if (!notification.readAt) {
      markAsRead.mutate(notification.id);
    }
    const notifData = getNotificationData(notification);
    const url = getNotificationUrl(notifData);
    if (url) {
      router.push(url);
    }
  };

  if (!ready) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {t('common:notifications', { defaultValue: 'Notifications' })}
          </h1>
          <p className="text-muted-foreground">
            {t('notifications:page_description', {
              defaultValue: 'View and manage your notifications',
            })}
          </p>
        </div>
        {hasUnread && (
          <Button
            variant="outline"
            onClick={() => markAllAsRead.mutate(undefined)}
            disabled={markAllAsRead.isPending}
          >
            <Check className="mr-2 h-4 w-4" />
            {t('common:markAllRead', { defaultValue: 'Mark all as read' })}
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="text-destructive py-12 text-center">
              {t('notifications:failed_to_load', { defaultValue: 'Failed to load notifications' })}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center py-12">
              <Bell className="mb-4 h-12 w-12" />
              <p>{t('common:noNotifications', { defaultValue: 'No notifications' })}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>
                    {t('common:notification', { defaultValue: 'Notification' })}
                  </TableHead>
                  <TableHead className="w-32">
                    {t('common:status', { defaultValue: 'Status' })}
                  </TableHead>
                  <TableHead className="w-40">
                    {t('common:time', { defaultValue: 'Time' })}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => {
                  const notifData = getNotificationData(notification);
                  const isUnread = !notification.readAt;
                  const url = getNotificationUrl(notifData);

                  return (
                    <TableRow
                      key={notification.id}
                      className={`hover:bg-muted/50 ${url ? 'cursor-pointer' : ''} ${isUnread ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}
                      onClick={() => handleRowClick(notification)}
                    >
                      <TableCell>
                        <NotificationIcon model={notifData.model ?? 'default'} />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{notifData.title ?? 'Notification'}</p>
                          <p className="text-muted-foreground text-sm">{notifData.message ?? ''}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={isUnread ? 'default' : 'secondary'}>
                          {isUnread
                            ? t('common:unread', { defaultValue: 'Unread' })
                            : t('common:read', { defaultValue: 'Read' })}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {notification.createdAt
                          ? formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                            })
                          : '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>

        {meta && meta.lastPage > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-muted-foreground text-sm">
              {t('pagination:page_info', {
                current: meta.currentPage,
                last: meta.lastPage,
                total: meta.total,
                defaultValue: `Page ${meta.currentPage} of ${meta.lastPage} (${meta.total} total)`,
              })}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                {t('pagination:previous', { defaultValue: 'Previous' })}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= meta.lastPage}
              >
                {t('pagination:next', { defaultValue: 'Next' })}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
