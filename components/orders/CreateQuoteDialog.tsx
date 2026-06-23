'use client';

import {
  DialogDescription,
  DialogTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Dialog,
} from '@/components/ui/dialog';
import { FileText, Send, Loader2, Pencil, Clock, AlertTriangle } from 'lucide-react';

import { FeasibilityBadge } from './FeasibilityBadge';
import { useEffect, useMemo, useState } from 'react';
import { QuoteLineItemsEditor, type QuoteLineItem } from '@/components/quotes/QuoteLineItemsEditor';
import { QuoteStopDurationsEditor } from '@/components/quotes/QuoteStopDurationsEditor';
import { useFeasibilityCheck } from '@/hooks/feasibility';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';
import { useCurrencyList } from '@/hooks/currencies';
import { useCalculatePricing } from '@/hooks/pricing';
import { useCreateQuote, useSendQuote } from '@/hooks/quotes';
import { useCalculateDistance, useChangeTier } from '@/hooks/orders';
import { actionLabel, validationAttribute } from '@/utils/lang';
import {
  formatCurrency,
  applyRounding,
  toDateTimeLocal,
  dateTimeLocalToISO,
  formatDateTime,
} from '@/utils/format';
import { formatRateDisplay } from '@/utils/currency';
import { Enums } from '@/data/app-enums';

interface CreateQuoteDialogProps {
  orderId: number;
  orderPublicId: string;
  orderDistanceKm?: number | null;
  orderEstimatedMinutes?: number | null;
  customerCurrencyCode?: string | null;
  customerDesiredDelivery?: string | null;
  customerDesiredPickup?: string | null;
  windowStart?: string | null;
  windowEnd?: string | null;
  timeSensitive?: boolean;
  deliveryTier?: string;
  orderStops?: App.Data.Order.OrderStopData[];
}

export function CreateQuoteDialog({
  orderId,
  orderPublicId,
  orderDistanceKm,
  orderEstimatedMinutes,
  customerCurrencyCode,
  customerDesiredDelivery,
  customerDesiredPickup,
  windowStart,
  windowEnd,
  timeSensitive = false,
  deliveryTier,
  orderStops = [],
}: CreateQuoteDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [editingTimes, setEditingTimes] = useState(false);
  const createQuote = useCreateQuote();
  const sendQuote = useSendQuote();
  const calculateDistance = useCalculateDistance();

  // Fetch feasibility when dialog is open
  const { data: feasibility, isLoading: feasibilityLoading } = useFeasibilityCheck({
    orderPublicId,
    enabled: open,
  });

  const getDefaultFormData = () => {
    const now = new Date();
    const pickup = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const delivery = new Date(now.getTime() + 4 * 60 * 60 * 1000);

    return {
      distanceKm: orderDistanceKm?.toString() || '',
      timeFee: '',
      surcharge: '',
      discountRate: '',
      cancellationFee: '',
      notes: '',
      pickupProposedFor: toDateTimeLocal(pickup),
      deliveryProposedFor: toDateTimeLocal(delivery),
    };
  };

  const [formData, setFormData] = useState(getDefaultFormData);
  const [items, setItems] = useState<QuoteLineItem[]>([]);
  // stopPublicId → minutes the driver is occupied at that stop. Only holds
  // admin overrides; the editor falls back to the default for absent stops.
  const [stopDurations, setStopDurations] = useState<Record<string, number>>({});

  // Compute effective proposed times: feasibility suggestions override defaults when not editing
  const effectivePickup =
    !editingTimes && feasibility?.suggestedPickup
      ? toDateTimeLocal(new Date(feasibility.suggestedPickup))
      : formData.pickupProposedFor;

  const effectiveDelivery =
    !editingTimes && feasibility?.suggestedDelivery
      ? toDateTimeLocal(new Date(feasibility.suggestedDelivery))
      : formData.deliveryProposedFor;

  // Auto-calculate distance when dialog opens if not yet calculated
  useEffect(() => {
    if (open && !orderDistanceKm && !calculateDistance.isPending) {
      calculateDistance.mutate(orderPublicId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Update form distance when calculation completes
  useEffect(() => {
    if (calculateDistance.data?.totalDistanceKm) {
      setFormData((prev) => ({
        ...prev,
        distanceKm: calculateDistance.data!.totalDistanceKm!.toString(),
      }));
    }
  }, [calculateDistance.data]);

  // Reset form with fresh defaults when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setFormData(getDefaultFormData());
      setEditingTimes(false);
      setItems([]);
      setStopDurations({});
    }
    setOpen(isOpen);
  };

  // Parse distance for calculation
  const distanceKm = useMemo(() => {
    const parsed = parseFloat(formData.distanceKm);
    return !isNaN(parsed) && parsed > 0 ? parsed : null;
  }, [formData.distanceKm]);

  // Fetch pricing calculation
  const { data: pricing, isLoading: pricingLoading } = useCalculatePricing(distanceKm);

  // Fetch currencies for base currency info and customer conversion
  const { data: currencyData } = useCurrencyList();
  const currencies = currencyData?.items || [];
  const baseCurrency = currencies.find((c) => c.isBase);
  const customerCurrency = customerCurrencyCode
    ? currencies.find((c) => c.code === customerCurrencyCode)
    : null;

  // Calculate line items total
  const itemsTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [items]
  );

  // Calculate totals with adjustments (includes line items)
  const calculation = useMemo(() => {
    if (!pricing) return null;

    const timeFee = parseFloat(formData.timeFee) || 0;
    const surcharge = parseFloat(formData.surcharge) || 0;
    const discountRate = (parseFloat(formData.discountRate) || 0) / 100;

    const subtotalBeforeAdjustments = pricing.subtotal;
    const subtotalWithAdjustments = subtotalBeforeAdjustments + timeFee + surcharge + itemsTotal;
    const discountAmount = subtotalWithAdjustments * discountRate;
    const afterDiscount = subtotalWithAdjustments - discountAmount;
    const tax = afterDiscount * pricing.taxRate;
    const total = afterDiscount + tax;

    return {
      serviceFee: pricing.serviceFee,
      distanceFee: pricing.distanceFee,
      subtotal: subtotalBeforeAdjustments,
      timeFee,
      surcharge,
      subtotalWithAdjustments,
      discountRate,
      discountAmount,
      afterDiscount,
      taxRate: pricing.taxRate,
      tax,
      total,
    };
  }, [pricing, formData.timeFee, formData.surcharge, formData.discountRate, itemsTotal]);

  // Calculate customer currency conversion
  const customerConversion = (() => {
    if (!calculation) return null;
    if (!customerCurrency) return null;
    if (customerCurrency.isBase) return null;

    const rate = customerCurrency.currentRate;
    if (!rate || rate <= 0) return null;

    const convertedTotal = calculation.total * rate;
    const roundedTotal = applyRounding(
      convertedTotal,
      customerCurrency.roundingMode || 'nearest',
      customerCurrency.roundingIncrement || 0.01
    );

    return {
      rate,
      convertedTotal,
      roundedTotal,
      symbol: customerCurrency.symbol || customerCurrency.code || '',
      code: customerCurrency.code || '',
    };
  })();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (andSend: boolean) => {
    if (!distanceKm || distanceKm <= 0) {
      return;
    }

    // Map stopPublicId to orderStopId (numeric)
    const stopIdMap = new Map(
      orderStops.filter((s) => s.publicId && s.id).map((s) => [s.publicId!, s.id!])
    );

    const mappedItems = items
      .filter((item) => item.label.trim())
      .map((item) => ({
        orderStopId: item.stopPublicId ? (stopIdMap.get(item.stopPublicId) ?? null) : null,
        label: item.label.trim(),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));

    const mappedStopDurations = Object.entries(stopDurations)
      .map(([publicId, minutes]) => ({
        orderStopId: stopIdMap.get(publicId) ?? null,
        serviceDurationMinutes: minutes,
      }))
      .filter(
        (d): d is { orderStopId: number; serviceDurationMinutes: number } => d.orderStopId !== null
      );

    const data: App.Data.Quote.StoreQuoteData = {
      orderId,
      distanceKm,
      timeFee: formData.timeFee ? parseFloat(formData.timeFee) : null,
      surcharge: formData.surcharge ? parseFloat(formData.surcharge) : null,
      discountRate: formData.discountRate ? parseFloat(formData.discountRate) / 100 : null,
      cancellationFee: formData.cancellationFee ? parseFloat(formData.cancellationFee) : null,
      notes: formData.notes || undefined,
      pickupProposedFor: dateTimeLocalToISO(effectivePickup),
      deliveryProposedFor: dateTimeLocalToISO(effectiveDelivery),
      ...(mappedItems.length > 0 && {
        items: Object.fromEntries(mappedItems.map((item, idx) => [idx, item])),
      }),
      ...(mappedStopDurations.length > 0 && {
        stopDurations: Object.fromEntries(mappedStopDurations.map((d, idx) => [idx, d])),
      }),
    };

    createQuote.mutate(data, {
      onSuccess: (quote) => {
        if (andSend && quote.publicId) {
          sendQuote.mutate(quote.publicId, {
            onSuccess: () => setOpen(false),
          });
        } else {
          setOpen(false);
        }
      },
    });
  };

  const isPending = createQuote.isPending || sendQuote.isPending;
  const baseSymbol = baseCurrency?.symbol || '₡';
  const baseCurrencyCode = baseCurrency?.code || 'CRC';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          {t('quotes:create.button', { defaultValue: 'Create Quote' })}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {t('quotes:create.title', {
              orderId,
              defaultValue: `Create Quote for Order #${orderId}`,
            })}
          </DialogTitle>
          <DialogDescription>
            {t('quotes:create.description', {
              defaultValue: 'Enter distance to calculate pricing from the active pricing rule.',
            })}
          </DialogDescription>
          {feasibilityLoading ? (
            <div className="flex items-center gap-2 pt-2">
              <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
              <span className="text-muted-foreground text-sm">
                {t('quotes:feasibility.checking', {
                  defaultValue: 'Checking driver availability...',
                })}
              </span>
            </div>
          ) : feasibility ? (
            <div className="pt-2">
              <FeasibilityBadge
                level={feasibility.level}
                candidateCount={feasibility.candidates?.length || 0}
              />
              {feasibility.level === Enums.FeasibilityLevel.Red &&
                deliveryTier &&
                deliveryTier !== Enums.DeliveryTier.Cheapest && (
                  <TierAdjustmentCallout currentTier={deliveryTier} orderPublicId={orderPublicId} />
                )}
            </div>
          ) : null}
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Distance Input */}
          <div className="grid gap-2">
            <Label htmlFor="distanceKm">{validationAttribute('distance', true)} (km) *</Label>
            <Input
              id="distanceKm"
              type="number"
              step="0.1"
              placeholder="0.0"
              value={formData.distanceKm}
              onChange={(e) => handleChange('distanceKm', e.target.value)}
              readOnly={!!orderDistanceKm}
              autoFocus={!orderDistanceKm}
              className={orderDistanceKm ? 'bg-muted cursor-not-allowed' : ''}
            />
            {orderEstimatedMinutes && (
              <p className="text-muted-foreground text-xs">
                {t('quotes:create.estimated_time', {
                  minutes: orderEstimatedMinutes,
                  defaultValue: `Estimated driving time: ${orderEstimatedMinutes} min`,
                })}
              </p>
            )}
          </div>

          {/* Pricing Calculation Preview */}
          {distanceKm && distanceKm > 0 && (
            <div className="bg-muted/50 rounded-lg p-4">
              {pricingLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
                  <span className="text-muted-foreground ml-2 text-sm">
                    {t('common:calculating', { defaultValue: 'Calculating...' })}
                  </span>
                </div>
              ) : calculation ? (
                <div className="space-y-3">
                  <div className="text-sm font-medium">
                    {t('quotes:create.calculated_pricing', {
                      currency: baseCurrencyCode,
                      defaultValue: `Calculated Pricing (${baseCurrencyCode})`,
                    })}
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-sm">
                    {calculation.serviceFee > 0 && (
                      <>
                        <span className="text-muted-foreground">
                          {validationAttribute('serviceFee', true)}:
                        </span>
                        <span className="text-right">
                          {formatCurrency(calculation.serviceFee, baseSymbol)}
                        </span>
                      </>
                    )}
                    <span className="text-muted-foreground">
                      {validationAttribute('distanceFee', true)}:
                    </span>
                    <span className="text-right">
                      {formatCurrency(calculation.distanceFee, baseSymbol)}
                    </span>
                    <span className="text-muted-foreground">
                      {validationAttribute('subtotal', true)}:
                    </span>
                    <span className="text-right font-medium">
                      {formatCurrency(calculation.subtotal, baseSymbol)}
                    </span>
                  </div>

                  {/* Adjustments section */}
                  {(calculation.timeFee > 0 ||
                    calculation.surcharge > 0 ||
                    itemsTotal > 0 ||
                    calculation.discountAmount > 0) && (
                    <>
                      <div className="border-border border-t" />
                      <div className="grid grid-cols-2 gap-1 text-sm">
                        {calculation.timeFee > 0 && (
                          <>
                            <span className="text-muted-foreground">
                              + {validationAttribute('timeFee', true)}:
                            </span>
                            <span className="text-right">
                              {formatCurrency(calculation.timeFee, baseSymbol)}
                            </span>
                          </>
                        )}
                        {calculation.surcharge > 0 && (
                          <>
                            <span className="text-muted-foreground">
                              + {validationAttribute('surcharge', true)}:
                            </span>
                            <span className="text-right">
                              {formatCurrency(calculation.surcharge, baseSymbol)}
                            </span>
                          </>
                        )}
                        {itemsTotal > 0 && (
                          <>
                            <span className="text-muted-foreground">
                              + {t('quotes:items.items_total', { defaultValue: 'Items Total' })}:
                            </span>
                            <span className="text-right">
                              {formatCurrency(itemsTotal, baseSymbol)}
                            </span>
                          </>
                        )}
                        {calculation.discountAmount > 0 && (
                          <>
                            <span className="text-muted-foreground">
                              - {validationAttribute('discount', true)} (
                              {(calculation.discountRate * 100).toFixed(0)}%):
                            </span>
                            <span className="text-right text-red-600">
                              -{formatCurrency(calculation.discountAmount, baseSymbol)}
                            </span>
                          </>
                        )}
                      </div>
                    </>
                  )}

                  <div className="border-border border-t" />
                  <div className="grid grid-cols-2 gap-1 text-sm">
                    <span className="text-muted-foreground">
                      {validationAttribute('tax', true)} ({(calculation.taxRate * 100).toFixed(0)}
                      %):
                    </span>
                    <span className="text-right">
                      {formatCurrency(calculation.tax, baseSymbol)}
                    </span>
                    <span className="font-semibold">{validationAttribute('total', true)}:</span>
                    <span className="text-right font-semibold">
                      {formatCurrency(calculation.total, baseSymbol)}
                    </span>
                  </div>

                  {/* Cancellation Fee Info */}
                  {parseFloat(formData.cancellationFee || '0') > 0 && (
                    <div className="grid grid-cols-2 gap-1 text-sm text-amber-700 dark:text-amber-400">
                      <span>
                        {t('quotes:cancellation_fee', { defaultValue: 'Cancellation Fee' })}:
                      </span>
                      <span className="text-right">
                        {formatCurrency(parseFloat(formData.cancellationFee), baseSymbol)}
                      </span>
                    </div>
                  )}

                  {/* Customer Currency Conversion */}
                  {customerConversion && (
                    <>
                      <div className="border-border border-t" />
                      <div className="rounded bg-blue-50 p-2 dark:bg-blue-950">
                        <div className="text-xs font-medium text-blue-700 dark:text-blue-300">
                          {t('quotes:create.customer_will_see', {
                            currency: customerConversion.code,
                            rate: formatRateDisplay(
                              customerConversion.rate,
                              customerConversion.code,
                              baseCurrencyCode
                            ),
                            defaultValue: `Customer Will See (${customerConversion.code}):`,
                          })}
                        </div>
                        <div className="mt-1 text-lg font-bold text-blue-900 dark:text-blue-100">
                          {formatCurrency(
                            customerConversion.roundedTotal,
                            customerConversion.symbol
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-center text-sm">
                  {t('quotes:create.no_pricing_rule', {
                    defaultValue: 'No active pricing rule found',
                  })}
                </p>
              )}
            </div>
          )}

          {/* Adjustment Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="timeFee">
                {validationAttribute('timeFee', true)} ({baseSymbol})
              </Label>
              <Input
                id="timeFee"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.timeFee}
                onChange={(e) => handleChange('timeFee', e.target.value)}
                autoFocus={!!orderDistanceKm}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="surcharge">
                {validationAttribute('surcharge', true)} ({baseSymbol})
              </Label>
              <Input
                id="surcharge"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.surcharge}
                onChange={(e) => handleChange('surcharge', e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="discountRate">{validationAttribute('discount', true)} (%)</Label>
            <Input
              id="discountRate"
              type="number"
              step="1"
              min="0"
              max="100"
              placeholder="0"
              value={formData.discountRate}
              onChange={(e) => handleChange('discountRate', e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cancellationFee">
              {t('quotes:cancellation_fee', { defaultValue: 'Cancellation Fee' })} ({baseSymbol})
            </Label>
            <Input
              id="cancellationFee"
              type="number"
              step="0.01"
              min="0"
              placeholder={calculation ? (calculation.total * 0.2).toFixed(2) : '0.00'}
              value={formData.cancellationFee}
              onChange={(e) => handleChange('cancellationFee', e.target.value)}
            />
            {calculation && parseFloat(formData.cancellationFee || '0') > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                {t('quotes:cancellation_fee_info', {
                  defaultValue:
                    'This fee will be charged to the customer if they cancel after payment.',
                })}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">{validationAttribute('notes', true)}</Label>
            <Textarea
              id="notes"
              placeholder={t('quotes:create.notes_placeholder', {
                defaultValue: 'Optional notes for the customer...',
              })}
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
            />
          </div>

          {/* Line Items Editor */}
          <QuoteLineItemsEditor
            stops={orderStops}
            items={items}
            onItemsChange={setItems}
            currencySymbol={baseSymbol}
          />

          {/* Per-stop service (dwell) time */}
          <QuoteStopDurationsEditor
            stops={orderStops}
            durations={stopDurations}
            onChange={setStopDurations}
          />

          {/* Items Total Preview */}
          {itemsTotal > 0 && (
            <div className="flex justify-between rounded-lg border px-3 py-2 text-sm">
              <span className="text-muted-foreground">
                {t('quotes:items.items_total', { defaultValue: 'Items Total' })}
              </span>
              <span className="font-medium">{formatCurrency(itemsTotal, baseSymbol)}</span>
            </div>
          )}

          {/* Delivery Window or Time-Sensitive Constraints */}
          {timeSensitive && customerDesiredPickup ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  {t('quotes:detail.time_sensitive_label', {
                    defaultValue: 'Time-Sensitive Constraints',
                  })}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-4">
                {customerDesiredPickup && (
                  <div>
                    <p className="text-muted-foreground text-xs">
                      {t('quotes:create.proposed_pickup', { defaultValue: 'Proposed Pickup' })} ±15
                      min
                    </p>
                    <p className="text-sm font-semibold">{formatDateTime(customerDesiredPickup)}</p>
                  </div>
                )}
                {customerDesiredDelivery && (
                  <div>
                    <p className="text-muted-foreground text-xs">
                      {t('quotes:create.proposed_delivery', { defaultValue: 'Proposed Delivery' })}{' '}
                      ±15 min
                    </p>
                    <p className="text-sm font-semibold">
                      {formatDateTime(customerDesiredDelivery)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : windowStart && windowEnd ? (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {t('quotes:detail.window_label', { defaultValue: 'Delivery Window' })}
                </span>
              </div>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                {formatDateTime(windowStart)} — {formatDateTime(windowEnd)}
              </p>
            </div>
          ) : (
            <>
              {/* Fallback: show individual requested times */}
              {customerDesiredPickup && (
                <div className="bg-muted/50 flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">
                      {t('quotes:create.customer_requested_pickup', {
                        defaultValue: 'Customer Requested Pickup',
                      })}
                    </p>
                  </div>
                  <p className="text-lg font-semibold">{formatDateTime(customerDesiredPickup)}</p>
                </div>
              )}
              {customerDesiredDelivery && (
                <div className="bg-muted/50 flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">
                      {t('quotes:create.customer_requested_delivery', {
                        defaultValue: 'Customer Requested Delivery',
                      })}
                    </p>
                  </div>
                  <p className="text-lg font-semibold">{formatDateTime(customerDesiredDelivery)}</p>
                </div>
              )}
            </>
          )}

          {/* Proposed Pickup/Delivery — smart display with edit */}
          {editingTimes ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="pickupProposedFor">
                  {t('quotes:create.proposed_pickup', { defaultValue: 'Proposed Pickup' })}
                </Label>
                <Input
                  id="pickupProposedFor"
                  type="datetime-local"
                  value={formData.pickupProposedFor}
                  onChange={(e) => handleChange('pickupProposedFor', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deliveryProposedFor">
                  {t('quotes:create.proposed_delivery', { defaultValue: 'Proposed Delivery' })}
                </Label>
                <Input
                  id="deliveryProposedFor"
                  type="datetime-local"
                  value={formData.deliveryProposedFor}
                  onChange={(e) => handleChange('deliveryProposedFor', e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="bg-muted/50 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {t('quotes:create.proposed_times', { defaultValue: 'Proposed Times' })}
                  {!timeSensitive && (
                    <span className="text-muted-foreground ml-2 text-xs font-normal">
                      {t('quotes:detail.approximate_times', {
                        defaultValue: 'Approximate (system-optimized)',
                      })}
                    </span>
                  )}
                  {feasibility && !feasibility.outsourceRequired && timeSensitive && (
                    <span className="text-muted-foreground ml-2 text-xs font-normal">
                      {t('quotes:feasibility.suggested', { defaultValue: '(suggested by system)' })}
                    </span>
                  )}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      pickupProposedFor: effectivePickup,
                      deliveryProposedFor: effectiveDelivery,
                    }));
                    setEditingTimes(true);
                  }}
                >
                  <Pencil className="mr-1 h-3 w-3" />
                  {actionLabel('edit')}
                </Button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-xs">
                    {t('quotes:create.proposed_pickup', { defaultValue: 'Proposed Pickup' })}
                  </p>
                  <p className="text-sm font-semibold">
                    {effectivePickup
                      ? formatDateTime(new Date(effectivePickup).toISOString())
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">
                    {t('quotes:create.proposed_delivery', { defaultValue: 'Proposed Delivery' })}
                  </p>
                  <p className="text-sm font-semibold">
                    {effectiveDelivery
                      ? formatDateTime(new Date(effectiveDelivery).toISOString())
                      : '—'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit(false)}
            disabled={isPending || !distanceKm}
          >
            {t('quotes:create.save_draft', { defaultValue: 'Save as Draft' })}
          </Button>
          <Button onClick={() => handleSubmit(true)} disabled={isPending || !distanceKm}>
            <Send className="mr-2 h-4 w-4" />
            {t('quotes:create.create_send', { defaultValue: 'Create & Send' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TierAdjustmentCallout({
  currentTier,
  orderPublicId,
}: {
  currentTier: string;
  orderPublicId: string;
}) {
  const { t } = useTranslation();
  const changeTier = useChangeTier();

  const tierLabel = (tier: string) => t(`orders:tiers.${tier}`, { defaultValue: tier });

  const tierOptions: { value: string; hours: number }[] = [];
  if (currentTier === Enums.DeliveryTier.Expedited) {
    tierOptions.push(
      { value: Enums.DeliveryTier.Regular, hours: 24 },
      { value: Enums.DeliveryTier.Cheapest, hours: 72 }
    );
  } else if (currentTier === Enums.DeliveryTier.Regular) {
    tierOptions.push({ value: Enums.DeliveryTier.Cheapest, hours: 72 });
  }

  if (tierOptions.length === 0) return null;

  return (
    <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <div className="space-y-2">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            {t('quotes:feasibility.no_drivers_for_tier', {
              tier: tierLabel(currentTier),
              defaultValue: `No drivers available for ${tierLabel(currentTier)}`,
            })}
          </p>
          <p className="text-muted-foreground text-xs">
            {t('quotes:feasibility.try_longer_window', {
              defaultValue: 'Try a longer window:',
            })}
          </p>
          <div className="flex flex-wrap gap-2">
            {tierOptions.map((opt) => (
              <Button
                key={opt.value}
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={changeTier.isPending}
                onClick={() =>
                  changeTier.mutate({ publicId: orderPublicId, deliveryTier: opt.value })
                }
              >
                {t('quotes:feasibility.change_to_tier', {
                  tier: tierLabel(opt.value),
                  hours: `${opt.hours}h`,
                  defaultValue: `Change to ${tierLabel(opt.value)} (${opt.hours}h)`,
                })}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
