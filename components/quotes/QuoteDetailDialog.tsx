'use client';

import { useState } from 'react';
import { Calendar, DollarSign, List, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QuoteStatusBadge } from './QuoteStatusBadge';
import { formatDate, formatDateTime, formatCurrency } from '@/utils/format';
import { actionLabel, capitalize, validationAttribute } from '@/utils/lang';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

type QuoteData = App.Data.Quote.QuoteData;
type QuoteItemData = App.Data.Quote.QuoteItemData;
type QuoteStatus = App.Enums.QuoteStatus;

interface QuoteDetailDialogProps {
  quote: QuoteData;
  currencySymbol: string;
  isCurrent?: boolean;
  trigger: React.ReactNode;
}

export function QuoteDetailDialog({
  quote,
  currencySymbol,
  isCurrent,
  trigger,
}: QuoteDetailDialogProps) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <span onClick={() => setOpen(true)} className="cursor-pointer">
        {trigger}
      </span>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="font-mono">{quote.publicId}</span>
            <QuoteStatusBadge status={quote.status as QuoteStatus} />
            {isCurrent && (
              <Badge variant="outline" className="text-xs">
                {t('orders:detail.current_quote', { defaultValue: 'Current' })}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            v{quote.version || 1} &middot; {formatDate(quote.createdAt)}
          </DialogDescription>
        </DialogHeader>

        {/* Pricing Breakdown */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <DollarSign className="h-4 w-4" />
            {t('quotes:detail.pricing', { defaultValue: 'Pricing Breakdown' })}
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {validationAttribute('serviceFee', true)}
              </span>
              <span>{formatCurrency(quote.baseFare || 0, currencySymbol)}</span>
            </div>
            {quote.distanceFee != null && quote.distanceFee > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {validationAttribute('distanceFee', true)}
                </span>
                <span>{formatCurrency(quote.distanceFee, currencySymbol)}</span>
              </div>
            )}
            {quote.timeFee != null && quote.timeFee > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {validationAttribute('timeFee', true)}
                </span>
                <span>{formatCurrency(quote.timeFee, currencySymbol)}</span>
              </div>
            )}
            {quote.surcharge != null && quote.surcharge > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {validationAttribute('surcharge', true)}
                </span>
                <span>{formatCurrency(quote.surcharge, currencySymbol)}</span>
              </div>
            )}
            {quote.discountRate != null && quote.discountRate > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {validationAttribute('discount', true)}
                </span>
                <span className="text-green-600">-{quote.discountRate}%</span>
              </div>
            )}
            {quote.taxRate != null && quote.taxRate > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {validationAttribute('tax', true)} ({quote.taxRate}%)
                </span>
                <span>{formatCurrency(quote.taxTotal || 0, currencySymbol)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-1.5 font-bold">
              <span>{validationAttribute('total', true)}</span>
              <span>{formatCurrency(quote.total || 0, currencySymbol)}</span>
            </div>
            {quote.cancellationFee != null && quote.cancellationFee > 0 && (
              <div className="flex justify-between text-amber-600 dark:text-amber-400">
                <span>{t('quotes:cancellation_fee', { defaultValue: 'Cancellation Fee' })}</span>
                <span>{formatCurrency(quote.cancellationFee, currencySymbol)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Line Items */}
        {quote.items && quote.items.length > 0 && (
          <QuoteLineItemsSection items={quote.items} currencySymbol={currencySymbol} t={t} />
        )}

        {/* Schedule */}
        {(quote.pickupProposedFor || quote.deliveryProposedFor || quote.validUntil) && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4" />
              {t('quotes:detail.schedule', { defaultValue: 'Schedule' })}
            </div>
            <div className="space-y-1.5 text-sm">
              {quote.pickupProposedFor && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t('quotes:detail.pickup_proposed', { defaultValue: 'Pickup Proposed' })}
                  </span>
                  <span>{formatDateTime(quote.pickupProposedFor)}</span>
                </div>
              )}
              {quote.deliveryProposedFor && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t('quotes:detail.delivery_proposed', { defaultValue: 'Delivery Proposed' })}
                  </span>
                  <span>{formatDateTime(quote.deliveryProposedFor)}</span>
                </div>
              )}
              {quote.validUntil && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t('quotes:valid_until', { defaultValue: 'Valid Until' })}
                  </span>
                  <span>{formatDateTime(quote.validUntil)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {quote.notes && (
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm">{validationAttribute('notes', true)}</p>
            <p className="text-sm">{quote.notes}</p>
          </div>
        )}

        {/* Rejection Reason */}
        {quote.rejectionReason && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
            <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                {t('orders:detail.rejection_reason', { defaultValue: 'Customer Feedback' })}
              </p>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                {quote.rejectionReason}
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            {actionLabel('close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function QuoteLineItemsSection({
  items,
  currencySymbol,
  t,
}: {
  items: QuoteItemData[];
  currencySymbol: string;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  // Group items by stop
  const stopGroups = new Map<
    number,
    { stop: QuoteItemData['orderStop']; items: QuoteItemData[] }
  >();

  for (const item of items) {
    const stopId = item.orderStopId;
    if (stopId) {
      if (!stopGroups.has(stopId)) {
        stopGroups.set(stopId, { stop: item.orderStop, items: [] });
      }
      stopGroups.get(stopId)!.items.push(item);
    }
  }

  const itemsTotal = items.reduce((sum, item) => sum + (item.total || 0), 0);

  const renderItemRow = (item: QuoteItemData) => (
    <div key={item.id || item.publicId} className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <span>{item.label}</span>
        <span className="text-muted-foreground text-xs">
          {item.quantity} x {formatCurrency(item.unitPrice || 0, currencySymbol)}
        </span>
      </div>
      <span>{formatCurrency(item.total || 0, currencySymbol)}</span>
    </div>
  );

  const stopLabel = (stop?: QuoteItemData['orderStop']) => {
    if (!stop) return '';
    const type = stop.type
      ? t(`routes:stop_types.${stop.type}`, { defaultValue: capitalize(stop.type) })
      : '';
    const addr = stop.address?.humanReadableAddress || stop.address?.streetAddress || '';
    return addr ? `${type} — ${addr}` : type;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <List className="h-4 w-4" />
        {t('quotes:items.title', { defaultValue: 'Line Items' })}
      </div>
      <div className="space-y-3">
        {Array.from(stopGroups.entries()).map(([stopId, { stop, items: stopItems }]) => (
          <div key={stopId} className="space-y-1">
            <p className="text-muted-foreground truncate text-xs font-medium">{stopLabel(stop)}</p>
            {stopItems.map(renderItemRow)}
          </div>
        ))}
        <div className="flex justify-between border-t pt-1.5 text-sm font-semibold">
          <span>{t('quotes:items.items_total', { defaultValue: 'Items Total' })}</span>
          <span>{formatCurrency(itemsTotal, currencySymbol)}</span>
        </div>
      </div>
    </div>
  );
}
