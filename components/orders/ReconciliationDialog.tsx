'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { useState } from 'react';
import { toast } from 'sonner';
import { ExternalLink, FileText } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';
import { useOrderReceipts, useReconcileOrder } from '@/hooks/orders';
import { QuoteLineItemsEditor } from '@/components/quotes/QuoteLineItemsEditor';
import { ImagePreviewDialog } from '@/components/orders/ImagePreviewDialog';
import { formatCurrency } from '@/utils/format';
import { actionLabel } from '@/utils/lang';

type OrderReceiptData = App.Data.Order.OrderReceiptData;
type QuoteData = App.Data.Quote.QuoteData;
type QuoteItemData = App.Data.Quote.QuoteItemData;

export interface ReconciliationLineItem {
  stopPublicId?: string | null;
  label: string;
  quantity: number;
  unitPrice: number;
}

interface ReconciliationDialogProps {
  orderPublicId: string;
  orderStops: App.Data.Order.OrderStopData[];
  currencySymbol: string;
  currentQuote: QuoteData;
  /** Amount the customer paid (in their currency) — display-only reference */
  customerPaid?: number;
  /** Symbol for the customer's currency (e.g. '$') — used only for the paid reference */
  customerCurrencySymbol?: string;
}

/**
 * Mirror the API's reconciliation total formula:
 *   subtotal = serviceFees + itemsTotal
 *   discount = subtotal × discountRate
 *   subtotalAfterDiscount = subtotal - discount
 *   taxTotal = subtotalAfterDiscount × taxRate
 *   total = subtotalAfterDiscount + taxTotal
 *
 * All amounts are in base currency (CRC).
 */
function computeEstimatedTotal(
  quote: QuoteData,
  newItemsTotal: number
): {
  serviceFees: number;
  newItemsTotal: number;
  newSubtotal: number;
  discountAmount: number;
  newSubtotalAfterDiscount: number;
  taxTotal: number;
  estimatedTotal: number;
  delta: number;
} {
  const serviceFees =
    (quote.baseFare ?? 0) +
    (quote.distanceFee ?? 0) +
    (quote.timeFee ?? 0) +
    (quote.surcharge ?? 0);
  const newSubtotal = serviceFees + newItemsTotal;
  const discountRate = quote.discountRate ?? 0;
  const discountAmount = Math.round(newSubtotal * discountRate * 100) / 100;
  const newSubtotalAfterDiscount = newSubtotal - discountAmount;
  const taxRate = quote.taxRate ?? 0;
  const taxTotal = Math.round(newSubtotalAfterDiscount * taxRate * 100) / 100;
  const estimatedTotal = Math.round((newSubtotalAfterDiscount + taxTotal) * 100) / 100;
  // Compare against the original quote total (base currency)
  const originalQuoteTotal = quote.total ?? 0;
  const delta = Math.round((estimatedTotal - originalQuoteTotal) * 100) / 100;

  return {
    serviceFees,
    newItemsTotal,
    newSubtotal,
    discountAmount,
    newSubtotalAfterDiscount,
    taxTotal,
    estimatedTotal,
    delta,
  };
}

function ReceiptThumbnail({
  receipt,
  onPreview,
}: {
  receipt: OrderReceiptData;
  onPreview: (receipt: OrderReceiptData) => void;
}) {
  const isImage = receipt.mimeType?.startsWith('image/');

  if (isImage && receipt.fileUrl) {
    return (
      <button
        type="button"
        onClick={() => onPreview(receipt)}
        className="h-20 w-20 shrink-0 overflow-hidden rounded-md border transition-opacity hover:opacity-80"
        title={receipt.originalName || receipt.publicId}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={receipt.fileUrl}
          alt={receipt.originalName || receipt.publicId || ''}
          className="h-full w-full object-cover"
        />
      </button>
    );
  }

  return (
    <a
      href={receipt.fileUrl ?? undefined}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:bg-muted flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-md border p-2 transition-colors"
      title={receipt.originalName || receipt.publicId}
    >
      <FileText className="text-muted-foreground h-6 w-6" />
      <ExternalLink className="text-muted-foreground h-3 w-3" />
      <span className="text-muted-foreground w-full truncate text-center text-xs">
        {receipt.originalName || 'PDF'}
      </span>
    </a>
  );
}

function buildInitialItems(
  quoteItems: QuoteItemData[],
  orderStops: App.Data.Order.OrderStopData[]
): ReconciliationLineItem[] {
  const stopIdMap = new Map(
    orderStops.filter((s) => s.id && s.publicId).map((s) => [s.id!, s.publicId!])
  );

  // Fallback for items without orderStopId: assign to the first non-dropoff stop
  const fallbackStopPublicId =
    orderStops.find((s) => s.type !== 'dropoff')?.publicId ?? null;

  return [...quoteItems]
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((qi) => ({
      stopPublicId: qi.orderStopId
        ? (stopIdMap.get(qi.orderStopId) ?? fallbackStopPublicId)
        : fallbackStopPublicId,
      label: qi.label ?? '',
      quantity: qi.quantity ?? 1,
      unitPrice: qi.unitPrice ?? 0,
    }));
}

export function ReconciliationDialog({
  orderPublicId,
  orderStops,
  currencySymbol,
  currentQuote,
  customerPaid,
  customerCurrencySymbol,
}: ReconciliationDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ReconciliationLineItem[]>([]);
  const [notes, setNotes] = useState('');
  const [previewReceipt, setPreviewReceipt] = useState<OrderReceiptData | null>(null);
  const reconcile = useReconcileOrder();
  const { data: receipts } = useOrderReceipts({ orderPublicId, enabled: open });

  const newItemsTotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const est = computeEstimatedTotal(currentQuote, newItemsTotal);
  const originalTotal = currentQuote.total ?? 0;
  const hasDiscount = (currentQuote.discountRate ?? 0) > 0;
  const hasTax = (currentQuote.taxRate ?? 0) > 0;

  const handleOpenChange = (val: boolean) => {
    if (val && currentQuote.items?.length) {
      setItems(buildInitialItems(currentQuote.items, orderStops));
    }
    setOpen(val);
  };

  const handleSubmit = () => {
    if (items.length === 0) {
      toast.error(
        t('orders:reconciliation.no_items', { defaultValue: 'Add at least one line item.' })
      );
      return;
    }

    const stopMap = new Map<string, number>();
    for (const stop of orderStops) {
      if (stop.publicId && stop.id) {
        stopMap.set(stop.publicId, stop.id);
      }
    }

    const apiItems = items.map((item) => ({
      orderStopId: item.stopPublicId ? (stopMap.get(item.stopPublicId) ?? null) : null,
      label: item.label,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }));

    reconcile.mutate(
      { orderPublicId, items: apiItems, notes: notes || null },
      {
        onSuccess: () => {
          toast.success(
            t('orders:reconciliation.success', { defaultValue: 'Reconciliation completed.' })
          );
          setOpen(false);
          setItems([]);
          setNotes('');
        },
      }
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline">
            {t('orders:reconciliation.button', { defaultValue: 'Reconcile' })}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {t('orders:reconciliation.title', { defaultValue: 'Reconcile Order' })}
            </DialogTitle>
            <DialogDescription>
              {t('orders:reconciliation.description', {
                defaultValue:
                  'Enter the actual costs for this order to reconcile with the original quote.',
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Receipt Thumbnails */}
            {receipts && receipts.length > 0 && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  {t('models:order_receipt', { count: 2, defaultValue: 'Receipts' })}
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {receipts.map((receipt) => (
                    <ReceiptThumbnail
                      key={receipt.publicId || receipt.id}
                      receipt={receipt}
                      onPreview={setPreviewReceipt}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Original Quote Total + customer paid reference */}
            <div className="rounded-lg border p-3 space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('orders:reconciliation.original_total', {
                    defaultValue: 'Original Quote Total',
                  })}
                </span>
                <span className="font-semibold">{formatCurrency(originalTotal, currencySymbol)}</span>
              </div>
              {customerPaid != null && customerCurrencySymbol && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {t('orders:reconciliation.customer_paid', {
                      defaultValue: 'Customer paid',
                    })}
                  </span>
                  <span>{formatCurrency(customerPaid, customerCurrencySymbol)}</span>
                </div>
              )}
            </div>

            {/* Line Items Editor */}
            <QuoteLineItemsEditor
              stops={orderStops}
              items={items}
              onItemsChange={setItems}
              currencySymbol={currencySymbol}
            />

            {/* Cost Breakdown & Delta — same formula as the API */}
            {items.length > 0 && (
              <div className="space-y-1.5 rounded-lg border p-3 text-sm">
                {est.serviceFees > 0 && (
                  <div className="text-muted-foreground flex justify-between">
                    <span>
                      {t('orders:reconciliation.service_fees', { defaultValue: 'Service fees' })}
                    </span>
                    <span>{formatCurrency(est.serviceFees, currencySymbol)}</span>
                  </div>
                )}
                <div className="text-muted-foreground flex justify-between">
                  <span>{t('quotes:items.items_total', { defaultValue: 'Items total' })}</span>
                  <span>{formatCurrency(est.newItemsTotal, currencySymbol)}</span>
                </div>
                {hasDiscount && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>
                      {t('orders:reconciliation.discount', { defaultValue: 'Discount' })}{' '}
                      <span className="text-xs">
                        ({((currentQuote.discountRate ?? 0) * 100).toFixed(0)}%)
                      </span>
                    </span>
                    <span>−{formatCurrency(est.discountAmount, currencySymbol)}</span>
                  </div>
                )}
                {hasTax && (
                  <div className="text-muted-foreground flex justify-between">
                    <span>
                      {t('orders:reconciliation.tax', { defaultValue: 'Tax' })}{' '}
                      <span className="text-xs">
                        ({((currentQuote.taxRate ?? 0) * 100).toFixed(0)}%)
                      </span>
                    </span>
                    <span>+{formatCurrency(est.taxTotal, currencySymbol)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-1.5 font-semibold">
                  <span>
                    {t('orders:reconciliation.estimated_total', {
                      defaultValue: 'Estimated new total',
                    })}
                  </span>
                  <span>{formatCurrency(est.estimatedTotal, currencySymbol)}</span>
                </div>
                <div
                  className={`flex justify-between border-t pt-1.5 font-semibold ${
                    est.delta > 0
                      ? 'text-red-600'
                      : est.delta < 0
                        ? 'text-green-600'
                        : 'text-muted-foreground'
                  }`}
                >
                  <span>{t('orders:reconciliation.delta', { defaultValue: 'Difference' })}</span>
                  <span>
                    {est.delta > 0 ? '+' : ''}
                    {formatCurrency(est.delta, currencySymbol)}
                  </span>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label>{t('common:notes', { defaultValue: 'Notes' })}</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('orders:reconciliation.notes_placeholder', {
                  defaultValue: 'Optional notes about the reconciliation...',
                })}
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                {actionLabel('cancel')}
              </Button>
              <Button onClick={handleSubmit} disabled={reconcile.isPending || items.length === 0}>
                {reconcile.isPending
                  ? t('common:loading', { defaultValue: 'Loading...' })
                  : t('orders:reconciliation.submit', { defaultValue: 'Submit Reconciliation' })}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ImagePreviewDialog receipt={previewReceipt} onClose={() => setPreviewReceipt(null)} />
    </>
  );
}
