'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuote, useSendQuote, useDeleteQuote } from '@/hooks/quotes';
import { QuoteStatusBadge } from '@/components/quotes/QuoteStatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  FileText,
  DollarSign,
  Calendar,
  Send,
  Trash2,
  Package,
} from 'lucide-react';

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

function formatCurrency(amount?: number | null, currency?: string | null): string {
  if (amount == null) return '-';
  const code = currency || 'USD';
  return `${code} ${amount.toFixed(2)}`;
}

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const quoteId = Number(params.id);

  const { data: quote, isLoading, error } = useQuote(quoteId);
  const sendQuote = useSendQuote();
  const deleteQuote = useDeleteQuote();

  const handleSend = () => {
    if (confirm('Are you sure you want to send this quote to the customer?')) {
      sendQuote.mutate(quoteId);
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this quote? This cannot be undone.')) {
      deleteQuote.mutate(quoteId, {
        onSuccess: () => router.push('/quotes'),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive">Failed to load quote</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const isDraft = quote.status === 'draft';
  const canSend = isDraft;
  const canDelete = isDraft;

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
              <h1 className="text-3xl font-bold">Quote #{quote.id}</h1>
              <QuoteStatusBadge status={quote.status as QuoteStatus} />
            </div>
            <p className="text-muted-foreground">
              Created {formatDate(quote.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {canSend && (
            <Button onClick={handleSend} disabled={sendQuote.isPending}>
              <Send className="mr-2 h-4 w-4" />
              Send to Customer
            </Button>
          )}
          {canDelete && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteQuote.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
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
              Quote Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version</span>
              <span className="font-medium">{quote.version || 1}</span>
            </div>
            {quote.orderId && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order</span>
                <Button
                  variant="link"
                  className="h-auto p-0"
                  onClick={() => router.push(`/orders/${quote.orderId}`)}
                >
                  <Package className="mr-1 h-4 w-4" />
                  Order #{quote.orderId}
                </Button>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Final</span>
              <span className="font-medium">{quote.isFinal ? 'Yes' : 'No'}</span>
            </div>
            {quote.finalizedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Finalized At</span>
                <span className="font-medium">{formatDate(quote.finalizedAt)}</span>
              </div>
            )}
            {quote.notes && (
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground">Notes</p>
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
              Pricing Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base Fare</span>
              <span className="font-medium">
                {formatCurrency(quote.baseFare, quote.currencyCode)}
              </span>
            </div>
            {quote.distanceKm != null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Distance</span>
                <span className="font-medium">{quote.distanceKm.toFixed(1)} km</span>
              </div>
            )}
            {quote.distanceFee != null && quote.distanceFee > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Distance Fee</span>
                <span className="font-medium">
                  {formatCurrency(quote.distanceFee, quote.currencyCode)}
                </span>
              </div>
            )}
            {quote.timeFee != null && quote.timeFee > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time Fee</span>
                <span className="font-medium">
                  {formatCurrency(quote.timeFee, quote.currencyCode)}
                </span>
              </div>
            )}
            {quote.surcharge != null && quote.surcharge > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Surcharge</span>
                <span className="font-medium">
                  {formatCurrency(quote.surcharge, quote.currencyCode)}
                </span>
              </div>
            )}
            {quote.discountRate != null && quote.discountRate > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-medium text-green-600">
                  -{quote.discountRate}%
                </span>
              </div>
            )}
            {quote.taxRate != null && quote.taxRate > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax ({quote.taxRate}%)</span>
                <span className="font-medium">
                  {formatCurrency(quote.taxTotal, quote.currencyCode)}
                </span>
              </div>
            )}
            <div className="border-t pt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(quote.total, quote.currencyCode)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pickup Proposed</span>
              <span className="font-medium">{formatDate(quote.pickupProposedFor)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery Proposed</span>
              <span className="font-medium">{formatDate(quote.deliveryProposedFor)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valid Until</span>
              <span className="font-medium">{formatDate(quote.validUntil)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle>Timestamps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span className="font-medium">{formatDate(quote.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Updated</span>
              <span className="font-medium">{formatDate(quote.updatedAt)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
