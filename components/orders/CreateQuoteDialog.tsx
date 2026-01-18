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
import { FileText, Send, Loader2 } from 'lucide-react';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';
import { useCurrencyList } from '@/hooks/currencies';
import { useCalculatePricing } from '@/hooks/pricing';
import { useCreateQuote, useSendQuote } from '@/hooks/quotes';
import { validationAttribute } from '@/utils/lang';
import { formatCurrency, applyRounding, toDateTimeLocal, dateTimeLocalToISO } from '@/utils/format';
import { formatRateDisplay } from '@/utils/currency';

interface CreateQuoteDialogProps {
  orderId: number;
  orderDistanceKm?: number | null;
  orderEstimatedMinutes?: number | null;
  customerCurrencyCode?: string | null;
  customerDesiredDelivery?: string | null;
}

export function CreateQuoteDialog({
  orderId,
  orderDistanceKm,
  orderEstimatedMinutes,
  customerCurrencyCode,
  customerDesiredDelivery,
}: CreateQuoteDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const createQuote = useCreateQuote();
  const sendQuote = useSendQuote();

  const getDefaultFormData = () => {
    const now = new Date();
    const pickup = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const delivery = new Date(now.getTime() + 4 * 60 * 60 * 1000);

    return {
      distanceKm: orderDistanceKm?.toString() || '',
      timeFee: '',
      surcharge: '',
      discountRate: '',
      notes: '',
      pickupProposedFor: toDateTimeLocal(pickup),
      deliveryProposedFor: toDateTimeLocal(delivery),
    };
  };

  const [formData, setFormData] = useState(getDefaultFormData);

  // Reset form with fresh defaults when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setFormData(getDefaultFormData());
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

  // Calculate totals with adjustments
  const calculation = useMemo(() => {
    if (!pricing) return null;

    const timeFee = parseFloat(formData.timeFee) || 0;
    const surcharge = parseFloat(formData.surcharge) || 0;
    const discountRate = (parseFloat(formData.discountRate) || 0) / 100;

    const subtotalBeforeAdjustments = pricing.subtotal;
    const subtotalWithAdjustments = subtotalBeforeAdjustments + timeFee + surcharge;
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
  }, [pricing, formData.timeFee, formData.surcharge, formData.discountRate]);

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

    const data = {
      orderId,
      distanceKm,
      timeFee: formData.timeFee ? parseFloat(formData.timeFee) : null,
      surcharge: formData.surcharge ? parseFloat(formData.surcharge) : null,
      discountRate: formData.discountRate ? parseFloat(formData.discountRate) / 100 : null,
      notes: formData.notes || undefined,
      pickupProposedFor: dateTimeLocalToISO(formData.pickupProposedFor),
      deliveryProposedFor: dateTimeLocalToISO(formData.deliveryProposedFor),
    };

    createQuote.mutate(data, {
      onSuccess: (quote) => {
        if (andSend && quote.id) {
          sendQuote.mutate(quote.id, {
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
      <DialogContent className="max-w-lg">
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

          {/* Customer Requested Delivery */}
          {customerDesiredDelivery && (
            <div className="bg-muted/50 flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  {t('quotes:create.customer_requested_delivery', {
                    defaultValue: 'Customer Requested Delivery',
                  })}
                </p>
                <p className="text-muted-foreground text-xs">
                  {t('quotes:create.from_order_request', { defaultValue: 'From order request' })}
                </p>
              </div>
              <p className="text-lg font-semibold">
                {new Date(customerDesiredDelivery).toLocaleString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}

          {/* Proposed Pickup/Delivery */}
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
              <p className="text-muted-foreground text-xs">
                {t('quotes:create.default_pickup_hint', { defaultValue: 'Default: +2 hours' })}
              </p>
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
              <p className="text-muted-foreground text-xs">
                {t('quotes:create.default_delivery_hint', { defaultValue: 'Default: +4 hours' })}
              </p>
            </div>
          </div>
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
