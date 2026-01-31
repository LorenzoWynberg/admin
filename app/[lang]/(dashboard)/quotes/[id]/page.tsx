'use client';

import { capitalize, resourceMessage, validationAttribute } from '@/utils/lang';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useLocalizedRouter } from '@/hooks/useLocalizedRouter';
import { QuoteStatusBadge } from '@/components/quotes/QuoteStatusBadge';
import { useQuote, useSendQuote, useDeleteQuote } from '@/hooks/quotes';
import { useCurrencyList } from '@/hooks/currencies';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText, DollarSign, Calendar, Send, Trash2, Package } from 'lucide-react';

type QuoteStatus = App.Enums.QuoteStatus;

function formatDate(dateString?: string | null): string {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

function formatCurrency(amount?: number | null, currencyCode?: string): string {
  if (amount == null) return '-';
  const formatted = amount.toFixed(2);
  return currencyCode ? `${currencyCode} ${formatted}` : formatted;
}

export default function QuoteDetailPage() {
  const params = useParams();
  const { t, ready } = useTranslation();
  const router = useLocalizedRouter();
  const quoteId = params.id as string;

  const { data: quote, isLoading, error } = useQuote(quoteId);
  const { data: currencies } = useCurrencyList();
  const sendQuote = useSendQuote();
  const deleteQuote = useDeleteQuote();

  const handleSend = () => {
    if (
      confirm(
        t('quotes:detail.confirm_send', {
          defaultValue: 'Are you sure you want to send this quote to the customer?',
        })
      )
    ) {
      sendQuote.mutate(quoteId);
    }
  };

  const handleDelete = () => {
    if (
      confirm(
        t('quotes:detail.confirm_delete', {
          defaultValue: 'Are you sure you want to delete this quote? This cannot be undone.',
        })
      )
    ) {
      deleteQuote.mutate(quoteId, {
        onSuccess: () => router.push('/quotes'),
      });
    }
  };

  if (!ready || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive">{resourceMessage('failed_to_load', 'quote')}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          {t('common:go_back', { defaultValue: 'Go Back' })}
        </Button>
      </div>
    );
  }

  const isDraft = quote.status === 'draft';
  const canSend = isDraft;
  const canDelete = isDraft;
  const baseCurrency = currencies?.items?.find((c) => c.isBase);
  const currencyCode = baseCurrency?.code || 'CRC';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">
                {capitalize(t('models:quote_one', { defaultValue: 'Quote' }))} {quote.publicId}
              </h1>
              <QuoteStatusBadge status={quote.status as QuoteStatus} />
            </div>
            <p className="text-muted-foreground">
              {capitalize(t('common:created', { defaultValue: 'Created' }))}{' '}
              {formatDate(quote.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {canSend && (
            <Button onClick={handleSend} disabled={sendQuote.isPending}>
              <Send className="mr-2 h-4 w-4" />
              {t('quotes:detail.send_to_customer', { defaultValue: 'Send to Customer' })}
            </Button>
          )}
          {canDelete && (
            <Button variant="destructive" onClick={handleDelete} disabled={deleteQuote.isPending}>
              <Trash2 className="mr-2 h-4 w-4" />
              {capitalize(t('common:delete', { defaultValue: 'Delete' }))}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quote Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('quotes:detail.title', { defaultValue: 'Quote Details' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{validationAttribute('version', true)}</span>
              <span className="font-medium">{quote.version || 1}</span>
            </div>
            {quote.orderId && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {capitalize(t('models:order_one', { defaultValue: 'Order' }))}
                </span>
                <Button
                  variant="link"
                  className="h-auto p-0"
                  onClick={() => router.push(`/orders/${quote.order?.publicId}`)}
                >
                  <Package className="mr-1 h-4 w-4" />
                  {t('orders:order_id', {
                    id: quote.order?.publicId,
                    defaultValue: `Order ${quote.order?.publicId}`,
                  })}
                </Button>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t('quotes:detail.is_final', { defaultValue: 'Final' })}
              </span>
              <span className="font-medium">
                {quote.isFinal
                  ? t('common:yes', { defaultValue: 'Yes' })
                  : t('common:no', { defaultValue: 'No' })}
              </span>
            </div>
            {quote.finalizedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('quotes:detail.finalized_at', { defaultValue: 'Finalized At' })}
                </span>
                <span className="font-medium">{formatDate(quote.finalizedAt)}</span>
              </div>
            )}
            {quote.notes && (
              <div className="border-t pt-4">
                <p className="text-muted-foreground text-sm">
                  {validationAttribute('notes', true)}
                </p>
                <p className="mt-1">{quote.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {t('quotes:detail.pricing', { defaultValue: 'Pricing Breakdown' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{validationAttribute('baseFare', true)}</span>
              <span className="font-medium">{formatCurrency(quote.baseFare, currencyCode)}</span>
            </div>
            {quote.distanceKm != null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {validationAttribute('distance', true)}
                </span>
                <span className="font-medium">{quote.distanceKm.toFixed(1)} km</span>
              </div>
            )}
            {quote.distanceFee != null && quote.distanceFee > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {validationAttribute('distanceFee', true)}
                </span>
                <span className="font-medium">
                  {formatCurrency(quote.distanceFee, currencyCode)}
                </span>
              </div>
            )}
            {quote.timeFee != null && quote.timeFee > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {validationAttribute('timeFee', true)}
                </span>
                <span className="font-medium">{formatCurrency(quote.timeFee, currencyCode)}</span>
              </div>
            )}
            {quote.surcharge != null && quote.surcharge > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {validationAttribute('surcharge', true)}
                </span>
                <span className="font-medium">{formatCurrency(quote.surcharge, currencyCode)}</span>
              </div>
            )}
            {quote.discountRate != null && quote.discountRate > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {validationAttribute('discount', true)}
                </span>
                <span className="font-medium text-green-600">-{quote.discountRate}%</span>
              </div>
            )}
            {quote.taxRate != null && quote.taxRate > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {validationAttribute('tax', true)} ({quote.taxRate}%)
                </span>
                <span className="font-medium">{formatCurrency(quote.taxTotal, currencyCode)}</span>
              </div>
            )}
            <div className="border-t pt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>{validationAttribute('total', true)}</span>
                <span>{formatCurrency(quote.total, currencyCode)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t('quotes:detail.schedule', { defaultValue: 'Schedule' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quote.order?.fulfilledBefore && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t('quotes:detail.fulfilled_before', { defaultValue: 'Requested By' })}
                  </span>
                  <span className="font-medium">{formatDate(quote.order.fulfilledBefore)}</span>
                </div>
                <div className="border-t" />
              </>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t('quotes:detail.pickup_proposed', { defaultValue: 'Pickup Proposed' })}
              </span>
              <span className="font-medium">{formatDate(quote.pickupProposedFor)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t('quotes:detail.delivery_proposed', { defaultValue: 'Delivery Proposed' })}
              </span>
              <span className="font-medium">{formatDate(quote.deliveryProposedFor)}</span>
            </div>
            <div className="border-t" />
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t('quotes:valid_until', { defaultValue: 'Valid Until' })}
              </span>
              <span className="font-medium">{formatDate(quote.validUntil)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle>{validationAttribute('timestamps', true)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {capitalize(t('common:created', { defaultValue: 'Created' }))}
              </span>
              <span className="font-medium">{formatDate(quote.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {capitalize(t('common:updated', { defaultValue: 'Updated' }))}
              </span>
              <span className="font-medium">{formatDate(quote.updatedAt)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
