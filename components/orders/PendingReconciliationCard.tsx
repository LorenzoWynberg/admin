'use client';

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ReconciliationDialog } from './ReconciliationDialog';
import { useLocalizedRouter } from '@/hooks/useLocalizedRouter';
import { useCurrencyList } from '@/hooks/currencies/useCurrencyList';
import { capitalize, actionLabel } from '@/utils/lang';
import { getDateLocale } from '@/utils/format';
import { Eye, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type OrderData = App.Data.Order.OrderData;

interface PendingReconciliationCardProps {
  order: OrderData;
}

export function PendingReconciliationCard({ order }: PendingReconciliationCardProps) {
  const { t, i18n } = useTranslation('orders');
  const router = useLocalizedRouter();

  const stopCount = order.stops?.length ?? 0;
  const tierValue = typeof order.deliveryTier === 'string' ? order.deliveryTier : '';
  const completedAgo = order.updatedAt
    ? formatDistanceToNow(new Date(order.updatedAt as string), {
        addSuffix: true,
        locale: getDateLocale(i18n.language),
      })
    : null;

  const { data: currencyListData } = useCurrencyList();
  const currencySymbol = currencyListData?.items?.find((c) => c.isBase)?.symbol || '₡';
  const orderStops = (order.stops ?? []) as App.Data.Order.OrderStopData[];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-semibold">#{order.publicId}</span>
          <Badge variant="outline" className="bg-amber-50 text-amber-700">
            {t('reconciliation.pending', { defaultValue: 'Pending Reconciliation' })}
          </Badge>
          {completedAgo && (
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3" />
              {completedAgo}
            </span>
          )}
        </div>
        <div className="text-muted-foreground flex flex-wrap gap-x-3 text-sm">
          {order.user && <span>{order.user.name}</span>}
          {order.business && <span>{order.business.name}</span>}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {tierValue && (
            <span className="text-muted-foreground text-xs">
              {capitalize(t(`tiers.${tierValue}`, { defaultValue: tierValue }))}
            </span>
          )}
          {stopCount > 0 && (
            <span className="text-muted-foreground text-xs">
              {stopCount} {t('models:order_stop', { count: stopCount })}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {order.currentQuote ? (
            <ReconciliationDialog
              orderPublicId={order.publicId as string}
              orderStops={orderStops}
              currencySymbol={currencySymbol}
              currentQuote={order.currentQuote}
              customerPaid={order.totalPaid ?? undefined}
              customerCurrencySymbol={
                currencyListData?.items?.find((c) => c.code === order.currencyCode)?.symbol
              }
            />
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/orders/${order.publicId}`)}
            >
              {actionLabel('view')}
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/orders/${order.publicId}`)}
          >
            <Eye className="mr-1 h-4 w-4" />
            {actionLabel('view')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
