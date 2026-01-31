'use client';

import {
  TableHeader,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Table,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useNotifications,
  useNotificationMutations,
  useNotificationHelpers,
  getNotificationUrl,
  getNotificationData,
} from '@/hooks/notifications';

import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { capitalize } from '@/utils/lang';
import { getDateLocale } from '@/utils/format';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalizedRouter } from '@/hooks/useLocalizedRouter';
import {
  Bell,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Package,
  Check,
  Filter,
  Search,
  X,
} from 'lucide-react';

type NotificationData = App.Data.NotificationData;

function NotificationIcon({ model }: { model: string }) {
  switch (model) {
    case 'catalog':
    case 'element':
      return <BookOpen className="text-muted-foreground h-5 w-5" />;
    case 'order':
      return <Package className="text-muted-foreground h-5 w-5" />;
    default:
      return <Bell className="text-muted-foreground h-5 w-5" />;
  }
}

export default function NotificationsPage() {
  const { t, ready, i18n } = useTranslation('notifications');
  const { getTitle, getMessage, getModelLabel, getActionLabel } = useNotificationHelpers();
  const router = useLocalizedRouter();
  const dateLocale = getDateLocale(i18n.language);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [action, setAction] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  const { data, isLoading, error } = useNotifications({
    page,
    perPage: 10,
    search: search || undefined,
    status: (status as 'read' | 'unread') || undefined,
    model: model || undefined,
    action: action || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });
  const { markAsRead, markAllAsRead } = useNotificationMutations();

  const notifications = data?.items || [];
  const meta = data?.meta;
  const hasUnread = (data?.extra?.unread_count ?? 0) > 0;
  const hasFilters = search || status || model || action || fromDate || toDate;

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

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setModel('');
    setAction('');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  if (!ready) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {capitalize(t('models:notification_other', { defaultValue: 'Notifications' }))}
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            {t('common:filters', { defaultValue: 'Filters' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder={t('notifications:filter.search_placeholder', {
                defaultValue: 'Search notifications...',
              })}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>{t('notifications:filter.status', { defaultValue: 'Status' })}</Label>
              <Select
                value={status || 'all'}
                onValueChange={(value) => {
                  setStatus(value === 'all' ? '' : value);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('notifications:filter.all_statuses', {
                      defaultValue: 'All statuses',
                    })}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('notifications:filter.all_statuses', { defaultValue: 'All statuses' })}
                  </SelectItem>
                  <SelectItem value="unread">
                    {t('statuses:unread', { defaultValue: 'Unread' })}
                  </SelectItem>
                  <SelectItem value="read">
                    {t('statuses:read', { defaultValue: 'Read' })}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('notifications:filter.model', { defaultValue: 'Type' })}</Label>
              <Select
                value={model || 'all'}
                onValueChange={(value) => {
                  setModel(value === 'all' ? '' : value);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('notifications:filter.all_types', { defaultValue: 'All types' })}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('notifications:filter.all_types', { defaultValue: 'All types' })}
                  </SelectItem>
                  <SelectItem value="catalog">{capitalize(getModelLabel('catalog'))}</SelectItem>
                  <SelectItem value="element">{capitalize(getModelLabel('element'))}</SelectItem>
                  <SelectItem value="order">{capitalize(getModelLabel('order'))}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('notifications:filter.action', { defaultValue: 'Action' })}</Label>
              <Select
                value={action || 'all'}
                onValueChange={(value) => {
                  setAction(value === 'all' ? '' : value);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('notifications:filter.all_actions', {
                      defaultValue: 'All actions',
                    })}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('notifications:filter.all_actions', { defaultValue: 'All actions' })}
                  </SelectItem>
                  <SelectItem value="created">{capitalize(getActionLabel('created'))}</SelectItem>
                  <SelectItem value="updated">{capitalize(getActionLabel('updated'))}</SelectItem>
                  <SelectItem value="deleted">{capitalize(getActionLabel('deleted'))}</SelectItem>
                  <SelectItem value="restored">{capitalize(getActionLabel('restored'))}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('notifications:filter.from_date', { defaultValue: 'From date' })}</Label>
              <div className="relative">
                <Input
                  type="date"
                  value={fromDate}
                  max={toDate || undefined}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setPage(1);
                  }}
                  className={fromDate ? 'pr-8' : ''}
                />
                {fromDate && (
                  <button
                    type="button"
                    onClick={() => {
                      setFromDate('');
                      setPage(1);
                    }}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('notifications:filter.to_date', { defaultValue: 'To date' })}</Label>
              <div className="relative">
                <Input
                  type="date"
                  value={toDate}
                  min={fromDate || undefined}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setPage(1);
                  }}
                  className={toDate ? 'pr-8' : ''}
                />
                {toDate && (
                  <button
                    type="button"
                    onClick={() => {
                      setToDate('');
                      setPage(1);
                    }}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {hasFilters && (
            <Button variant="ghost" size="sm" className="mt-4" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              {t('common:clearFilters', { defaultValue: 'Clear filters' })}
            </Button>
          )}
        </CardContent>
      </Card>

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
                    {capitalize(t('models:notification_one', { defaultValue: 'Notification' }))}
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
                          <p className="font-medium">{getTitle(notifData)}</p>
                          <p className="text-muted-foreground text-sm">{getMessage(notifData)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={isUnread ? 'default' : 'secondary'}>
                          {isUnread
                            ? t('statuses:unread', { defaultValue: 'Unread' })
                            : t('statuses:read', { defaultValue: 'Read' })}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {notification.createdAt
                          ? formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                              locale: dateLocale,
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
