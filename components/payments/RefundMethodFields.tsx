'use client';

import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Enums } from '@/data/app-enums';

/** Translated label for a RefundMethod value (how the refund is settled). */
export function getRefundMethodLabel(t: TFunction, method?: string | null): string {
  if (!method) return t('payments:unknown_method', { defaultValue: 'Unknown' });
  return t(`payments:refund_method.${method}`);
}

/**
 * Default settlement for a payment.
 *
 * A manually-settled payment can only go to balance. A card payment defaults
 * to reversing the card — turning someone's card payment into account balance
 * is a deliberate choice, not a default.
 */
export function getDefaultRefundMethod(isManual: boolean): string {
  return isManual ? Enums.RefundMethod.Balance : Enums.RefundMethod.Gateway;
}

interface RefundMethodFieldsProps {
  /** Whether the underlying payment was settled manually (provider === Manual). */
  isManual: boolean;
  method: string;
  onMethodChange: (method: string) => void;
}

/**
 * How a refund is settled.
 *
 * A card payment may be reversed to the card or kept on the customer's
 * balance — the admin picks, since they speak to the customer directly. A
 * manually-settled payment can only go to balance: there was no charge to
 * reverse, and money is never sent back out by hand, so the select locks.
 */
export function RefundMethodFields({ isManual, method, onMethodChange }: RefundMethodFieldsProps) {
  const { t } = useTranslation();
  const options = isManual
    ? [Enums.RefundMethod.Balance]
    : [Enums.RefundMethod.Gateway, Enums.RefundMethod.Balance];

  return (
    <div className="grid gap-2">
      <Label htmlFor="refund-method">{t('payments:refund.method_label')} *</Label>
      <Select value={method} onValueChange={onMethodChange} disabled={isManual}>
        <SelectTrigger id="refund-method" className="w-full">
          <SelectValue placeholder={t('payments:refund.method_placeholder')} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {getRefundMethodLabel(t, option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isManual && (
        <p className="text-muted-foreground text-xs">{t('payments:refund.balance_only_hint')}</p>
      )}
    </div>
  );
}
