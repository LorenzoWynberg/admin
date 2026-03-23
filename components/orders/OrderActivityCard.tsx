'use client';

import { Calendar, Loader2 } from 'lucide-react';

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuditLogList } from '@/hooks/audit-logs';
import { formatDateTime } from '@/utils/format';
import { actionLabel, statusLabel } from '@/utils/lang';

type OrderData = App.Data.Order.OrderData;

interface OrderActivityCardProps {
  order: OrderData;
}

export function OrderActivityCard({ order }: OrderActivityCardProps) {
  const { t } = useTranslation();
  const { data: auditData, isLoading } = useAuditLogList({
    modelKey: 'order',
    modelId: order.id,
    perPage: 50,
    enabled: !!order.id,
  });

  const auditEntries = auditData?.items ?? [];

  // Build timeline from audit logs (oldest first)
  const timeline = [...auditEntries].reverse().map((entry) => {
    const statusChange =
      entry.data && typeof entry.data === 'object' && 'status' in entry.data
        ? String(entry.data.status)
        : null;

    return {
      id: entry.id,
      label: statusChange ? statusLabel(statusChange) : actionLabel(entry.action),
      time: entry.createdAt,
      user: entry.userName,
    };
  });

  const hasSchedule = !!(order.desiredPickupAt || order.desiredDeliveryAt);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {t('audit_logs:activity', { defaultValue: 'Activity' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Desired schedule */}
        {order.desiredPickupAt && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {t('orders:detail.pick_up_by', { defaultValue: 'Pick Up By' })}
            </span>
            <span className="font-medium">{formatDateTime(order.desiredPickupAt)}</span>
          </div>
        )}
        {order.desiredDeliveryAt && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {t('orders:detail.deliver_by', { defaultValue: 'Deliver By' })}
            </span>
            <span className="font-medium">{formatDateTime(order.desiredDeliveryAt)}</span>
          </div>
        )}

        {/* Activity trail */}
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
          </div>
        ) : timeline.length > 0 ? (
          <div className={`space-y-1${hasSchedule ? ' border-t pt-3' : ''}`}>
            {timeline.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="bg-muted h-1.5 w-1.5 rounded-full" />
                  <span>{entry.label}</span>
                  {entry.user && (
                    <span className="text-muted-foreground text-xs">— {entry.user}</span>
                  )}
                </div>
                {entry.time && (
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {formatDateTime(entry.time)}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          !hasSchedule && (
            <p className="text-muted-foreground text-center">
              {t('orders:detail.no_schedule', { defaultValue: 'No schedule set' })}
            </p>
          )
        )}
      </CardContent>
    </Card>
  );
}
