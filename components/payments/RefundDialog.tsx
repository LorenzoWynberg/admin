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
import { RefreshCw, Loader2 } from 'lucide-react';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';
import { useProcessRefund } from '@/hooks/payments';
import { actionLabel, validationAttribute } from '@/utils/lang';
import { formatCurrency } from '@/utils/format';

type PaymentData = App.Data.Payment.PaymentData;

interface RefundDialogProps {
  payment: PaymentData;
  currencySymbol?: string;
}

export function RefundDialog({ payment, currencySymbol = '$' }: RefundDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const processRefund = useProcessRefund();

  const [formData, setFormData] = useState({
    amount: '',
    reason: '',
  });

  const maxAmount = payment.amount || 0;

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setFormData({
        amount: maxAmount.toString(),
        reason: '',
      });
    }
    setOpen(isOpen);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }

    if (amount > maxAmount) {
      return;
    }

    if (!payment.publicId) {
      return;
    }

    processRefund.mutate(
      {
        paymentPublicId: payment.publicId,
        data: {
          amount,
          reason: formData.reason || null,
        },
      },
      {
        onSuccess: () => setOpen(false),
      }
    );
  };

  const parsedAmount = parseFloat(formData.amount);
  const isValidAmount = !isNaN(parsedAmount) && parsedAmount > 0 && parsedAmount <= maxAmount;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          {t('payments:refund.button', { defaultValue: 'Refund' })}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t('payments:refund.title', { defaultValue: 'Process Refund' })}
          </DialogTitle>
          <DialogDescription>
            {t('payments:refund.description', {
              defaultValue: 'Enter the amount to refund to the customer.',
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Payment Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {t('payments:refund.payment_id', { defaultValue: 'Payment ID' })}
              </span>
              <span className="font-medium">{payment.publicId}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-muted-foreground">
                {t('payments:refund.max_refund', { defaultValue: 'Max Refund' })}
              </span>
              <span className="font-medium">{formatCurrency(maxAmount, currencySymbol)}</span>
            </div>
          </div>

          {/* Amount Input */}
          <div className="grid gap-2">
            <Label htmlFor="amount">{validationAttribute('amount', true)} *</Label>
            <div className="relative">
              <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                {currencySymbol}
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={maxAmount}
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                className="pl-8"
                autoFocus
              />
            </div>
            {parsedAmount > maxAmount && (
              <p className="text-destructive text-xs">
                {t('payments:refund.exceeds_max', {
                  max: formatCurrency(maxAmount, currencySymbol),
                  defaultValue: `Amount cannot exceed ${formatCurrency(maxAmount, currencySymbol)}`,
                })}
              </p>
            )}
          </div>

          {/* Reason Input */}
          <div className="grid gap-2">
            <Label htmlFor="reason">{validationAttribute('reason', true)}</Label>
            <Textarea
              id="reason"
              placeholder={t('payments:refund.reason_placeholder', {
                defaultValue: 'Optional reason for the refund...',
              })}
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {actionLabel('cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={processRefund.isPending || !isValidAmount}
          >
            {processRefund.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('payments:refund.process', { defaultValue: 'Process Refund' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
