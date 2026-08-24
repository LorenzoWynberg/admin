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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validationAttribute } from '@/utils/lang';
import { Enums } from '@/data/app-enums';

const MANUAL_METHOD_OPTIONS = [
  Enums.RefundMethod.SinpeTransfer,
  Enums.RefundMethod.Cash,
  Enums.RefundMethod.Credit,
];

/** Accepted evidence image types for the proof / signed-slip uploads. */
export const REFUND_EVIDENCE_ACCEPT = 'image/jpeg,image/png,image/webp';

/** Translated label for a RefundMethod value (how the refund was settled). */
export function getRefundMethodLabel(t: TFunction, method?: string | null): string {
  if (!method) return t('payments:unknown_method', { defaultValue: 'Unknown' });
  return t(`payments:refund_method.${method}`, { defaultValue: method });
}

/**
 * Sensible default refund method for a manually-settled payment: mirror the
 * channel the customer originally paid through, falling back to cash.
 */
export function getDefaultManualRefundMethod(paymentMethod?: string | null): string {
  if (paymentMethod === Enums.PaymentMethodType.SinpeMobile) {
    return Enums.RefundMethod.SinpeTransfer;
  }
  return Enums.RefundMethod.Cash;
}

/**
 * Default refund method for a payment: the manual channel matching how the
 * customer paid, or Gateway for gateway-settled payments (the only method
 * the server accepts for those).
 */
export function getDefaultRefundMethod(isManual: boolean, paymentMethod?: string | null): string {
  return isManual ? getDefaultManualRefundMethod(paymentMethod) : Enums.RefundMethod.Gateway;
}

interface RefundMethodFieldsProps {
  /** Whether the underlying payment was settled manually (provider === Manual). */
  isManual: boolean;
  method: string;
  onMethodChange: (method: string) => void;
  reference: string;
  onReferenceChange: (value: string) => void;
  onProofChange: (file: File | null) => void;
  onSignatureChange: (file: File | null) => void;
}

/**
 * RefundMethod select + evidence fields, shared by RefundDialog (processing a
 * payment refund) and ApproveRefundRequestDialog (approving a refund
 * request). Gateway payments can only be reversed through the gateway, so
 * the select locks to Gateway and evidence fields are hidden; manually
 * settled payments pick among SINPE transfer / cash / credit and can attach
 * a reference plus proof/signature evidence.
 */
export function RefundMethodFields({
  isManual,
  method,
  onMethodChange,
  reference,
  onReferenceChange,
  onProofChange,
  onSignatureChange,
}: RefundMethodFieldsProps) {
  const { t } = useTranslation();
  const options = isManual ? MANUAL_METHOD_OPTIONS : [Enums.RefundMethod.Gateway];

  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="refund-method">
          {t('payments:refund.method_label', { defaultValue: 'Refund method' })} *
        </Label>
        <Select value={method} onValueChange={onMethodChange} disabled={!isManual}>
          <SelectTrigger id="refund-method" className="w-full">
            <SelectValue
              placeholder={t('payments:refund.method_placeholder', {
                defaultValue: 'How was this refunded?',
              })}
            />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {getRefundMethodLabel(t, option)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isManual && (
        <>
          <div className="grid gap-2">
            <Label htmlFor="refund-reference">{validationAttribute('reference', true)}</Label>
            <Input
              id="refund-reference"
              placeholder={t('payments:refund.reference_placeholder', {
                defaultValue: 'Transfer or SINPE reference (optional)',
              })}
              value={reference}
              onChange={(e) => onReferenceChange(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="refund-proof">
              {t('payments:refund.proof_label', { defaultValue: 'Proof of refund' })}
            </Label>
            <Input
              id="refund-proof"
              type="file"
              accept={REFUND_EVIDENCE_ACCEPT}
              onChange={(e) => onProofChange(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="refund-signature">
              {t('payments:refund.signature_label', { defaultValue: 'Signed handover slip' })}
            </Label>
            <Input
              id="refund-signature"
              type="file"
              accept={REFUND_EVIDENCE_ACCEPT}
              onChange={(e) => onSignatureChange(e.target.files?.[0] ?? null)}
            />
          </div>
        </>
      )}
    </>
  );
}
