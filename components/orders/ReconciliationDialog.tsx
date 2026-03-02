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
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';
import { useReconcileOrder } from '@/hooks/orders';
import { QuoteLineItemsEditor } from '@/components/quotes/QuoteLineItemsEditor';
import { formatCurrency } from '@/utils/format';

export interface ReconciliationLineItem {
  stopPublicId?: string | null;
  label: string;
  quantity: number;
  unitPrice: number;
}

interface ReconciliationDialogProps {
  orderPublicId: string;
  orderStops: App.Data.Order.OrderStopData[];
  originalQuoteTotal: number;
  currencySymbol: string;
}

export function ReconciliationDialog({
  orderPublicId,
  orderStops,
  originalQuoteTotal,
  currencySymbol,
}: ReconciliationDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ReconciliationLineItem[]>([]);
  const [notes, setNotes] = useState('');
  const reconcile = useReconcileOrder();

  const itemsTotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const delta = itemsTotal - originalQuoteTotal;

  const handleSubmit = () => {
    if (items.length === 0) {
      toast.error(
        t('orders:reconciliation.no_items', { defaultValue: 'Add at least one line item.' })
      );
      return;
    }

    // Map stopPublicId to stopId for the API
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          {t('orders:reconciliation.button', { defaultValue: 'Reconcile' })}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
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
          {/* Original Quote Total */}
          <div className="flex justify-between rounded-lg border p-3">
            <span className="text-muted-foreground">
              {t('orders:reconciliation.original_total', { defaultValue: 'Original Quote Total' })}
            </span>
            <span className="font-semibold">
              {formatCurrency(originalQuoteTotal, currencySymbol)}
            </span>
          </div>

          {/* Line Items Editor */}
          <QuoteLineItemsEditor
            stops={orderStops}
            items={items}
            onItemsChange={setItems}
            currencySymbol={currencySymbol}
          />

          {/* Items Total + Delta */}
          {items.length > 0 && (
            <div className="space-y-2 rounded-lg border p-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('quotes:items.items_total', { defaultValue: 'Items Total' })}
                </span>
                <span className="font-semibold">{formatCurrency(itemsTotal, currencySymbol)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">
                  {t('orders:reconciliation.delta', { defaultValue: 'Difference' })}
                </span>
                <span
                  className={`font-semibold ${delta > 0 ? 'text-red-600' : delta < 0 ? 'text-green-600' : ''}`}
                >
                  {delta > 0 ? '+' : ''}
                  {formatCurrency(delta, currencySymbol)}
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
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t('common:cancel', { defaultValue: 'Cancel' })}
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
  );
}
