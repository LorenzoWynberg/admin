'use client';

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UrgencyBadge } from './UrgencyBadge';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { ReasonBadge } from './ReasonBadge';
import { CancelOrderDialog } from './CancelOrderDialog';
import { useChangeTier, useOutsourceOrder, useRetryDispatch } from '@/hooks/orders';
import { useLocalizedRouter } from '@/hooks/useLocalizedRouter';
import { Enums } from '@/data/app-enums';
import { actionLabel, capitalize } from '@/utils/lang';
import { MessageSquare, FileText, Truck, Eye, RefreshCw } from 'lucide-react';
import type { NeedsAttentionOrder } from '@/services/orderService';

interface NeedsAttentionCardProps {
  item: NeedsAttentionOrder;
}

export function NeedsAttentionCard({ item }: NeedsAttentionCardProps) {
  const { t } = useTranslation('orders');
  const router = useLocalizedRouter();
  const changeTier = useChangeTier();
  const outsource = useOutsourceOrder();
  const retryDispatch = useRetryDispatch();

  const { order, urgency, reason, outsourceEligible, hoursUntilWindowEnd } = item;

  const windowLabel =
    hoursUntilWindowEnd !== null && hoursUntilWindowEnd <= 0
      ? t('needs_attention.window_expired', { defaultValue: 'Window expired' })
      : hoursUntilWindowEnd !== null
        ? t('needs_attention.window_ends_in', {
            hours: Math.abs(hoursUntilWindowEnd).toFixed(1),
            defaultValue: `Window ends in ${Math.abs(hoursUntilWindowEnd).toFixed(1)} h`,
          })
        : null;

  const stopCount = order.stops && 'length' in order.stops ? order.stops.length : 0;
  const tierValue = typeof order.deliveryTier === 'string' ? order.deliveryTier : '';

  const handleTierChange = (newTier: string) => {
    changeTier.mutate({ publicId: order.publicId as string, deliveryTier: newTier });
  };

  const handleOutsource = () => {
    outsource.mutate(order.publicId as string);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-semibold">#{order.publicId}</span>
          <UrgencyBadge urgency={urgency} />
          <PaymentStatusBadge status={order.paymentStatus as App.Enums.PaymentStatus} />
          {windowLabel && <span className="text-muted-foreground text-xs">{windowLabel}</span>}
        </div>
        <div className="text-muted-foreground flex flex-wrap gap-x-3 text-sm">
          {order.user && 'name' in order.user && (
            <span>{(order.user as { name: string }).name}</span>
          )}
          {order.business && 'name' in order.business && (
            <span>{(order.business as { name: string }).name}</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <ReasonBadge reason={reason} />
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/orders/${order.publicId}#chat`)}
          >
            <MessageSquare className="mr-1 h-4 w-4" />
            {t('detail.support_chat', { defaultValue: 'Chat' })}
          </Button>

          <Select value={tierValue} onValueChange={handleTierChange}>
            <SelectTrigger className="h-8 w-[140px]">
              <SelectValue placeholder={t('tiers.title', { defaultValue: 'Delivery Speed' })} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Enums.DeliveryTier.Expedited}>
                {t('tiers.expedited', { defaultValue: 'Expedited' })}
              </SelectItem>
              <SelectItem value={Enums.DeliveryTier.Regular}>
                {t('tiers.regular', { defaultValue: 'Regular' })}
              </SelectItem>
              <SelectItem value={Enums.DeliveryTier.Cheapest}>
                {t('tiers.cheapest', { defaultValue: 'Economy' })}
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/orders/${order.publicId}`)}
          >
            <FileText className="mr-1 h-4 w-4" />
            {t('detail.view_quote', { defaultValue: 'New Quote' })}
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={retryDispatch.isPending}
            onClick={() => retryDispatch.mutate(order.publicId as string)}
          >
            <RefreshCw className={`mr-1 h-4 w-4 ${retryDispatch.isPending ? 'animate-spin' : ''}`} />
            {t('needs_attention.retry_dispatch', { defaultValue: 'Retry' })}
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={!outsourceEligible || outsource.isPending}
            onClick={handleOutsource}
          >
            <Truck className="mr-1 h-4 w-4" />
            {actionLabel('outsource')}
          </Button>

          <CancelOrderDialog
            publicId={order.publicId as string}
            cancellationFee={order.currentQuote?.cancellationFee}
          />

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
