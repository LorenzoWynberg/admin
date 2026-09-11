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
 * Default settlement for a refund.
 *
 * `balanceOnly` means there is no gateway charge behind this money, so there
 * is nothing a provider could send back — the refund can only become credit.
 * Anything else defaults to reversing the card: turning someone's card payment
 * into account balance is a deliberate choice, not a default.
 */
export function getDefaultRefundMethod(balanceOnly: boolean): string {
  return balanceOnly ? Enums.RefundMethod.Balance : Enums.RefundMethod.Gateway;
}

interface RefundMethodFieldsProps {
  /**
   * Whether credit is the only settlement the API will accept — no gateway
   * charge stands behind the money. True for a manually-settled payment
   * (provider === Manual) and for a delivery billed to an account, which has
   * no payment row at all.
   */
  balanceOnly: boolean;
  method: string;
  onMethodChange: (method: string) => void;
}

/**
 * How a refund is settled.
 *
 * A card payment may be reversed to the card or kept on the customer's
 * balance — the admin picks, since they speak to the customer directly. When
 * no card was ever charged the select locks to balance: there is nothing to
 * reverse, and money is never sent back out by hand.
 */
export function RefundMethodFields({
  balanceOnly,
  method,
  onMethodChange,
}: RefundMethodFieldsProps) {
  const { t } = useTranslation();
  const options = balanceOnly
    ? [Enums.RefundMethod.Balance]
    : [Enums.RefundMethod.Gateway, Enums.RefundMethod.Balance];

  return (
    <div className="grid gap-2">
      <Label htmlFor="refund-method">{t('payments:refund.method_label')} *</Label>
      <Select value={method} onValueChange={onMethodChange} disabled={balanceOnly}>
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
      {balanceOnly && (
        <p className="text-muted-foreground text-xs">{t('payments:refund.balance_only_hint')}</p>
      )}
    </div>
  );
}
