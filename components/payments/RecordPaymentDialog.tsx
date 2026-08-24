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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { HandCoins, Loader2 } from 'lucide-react';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';
import { useRecordPayment } from '@/hooks/payments';
import { actionLabel, validationAttribute } from '@/utils/lang';
import { Enums } from '@/data/app-enums';
import { getPaymentMethodLabel } from './PaymentSection';

interface RecordPaymentDialogProps {
  orderPublicId: string;
  currencySymbol: string;
  defaultAmount?: number | null;
  onSuccess?: () => void;
}

const METHOD_OPTIONS = [Enums.PaymentMethodType.Cash, Enums.PaymentMethodType.SinpeMobile];

export function RecordPaymentDialog({
  orderPublicId,
  currencySymbol,
  defaultAmount,
  onSuccess,
}: RecordPaymentDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const recordPayment = useRecordPayment();

  const [formData, setFormData] = useState({
    method: Enums.PaymentMethodType.Cash as string,
    amount: '',
    reference: '',
    notes: '',
  });
  const [proof, setProof] = useState<File | null>(null);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setFormData({
        method: Enums.PaymentMethodType.Cash,
        amount: defaultAmount != null ? String(defaultAmount) : '',
        reference: '',
        notes: '',
      });
      setProof(null);
    }
    setOpen(isOpen);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const parsedAmount = parseFloat(formData.amount);
  const isValidAmount = !isNaN(parsedAmount) && parsedAmount > 0;

  const handleSubmit = () => {
    if (!isValidAmount) return;

    recordPayment.mutate(
      {
        orderPublicId,
        data: {
          method: formData.method,
          amount: parsedAmount,
          reference: formData.reference || null,
          notes: formData.notes || null,
          proof,
        },
      },
      {
        onSuccess: () => {
          setOpen(false);
          onSuccess?.();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <HandCoins className="mr-2 h-4 w-4" />
          {t('payments:record.button', { defaultValue: 'Record Payment' })}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t('payments:record.title', { defaultValue: 'Record Manual Payment' })}
          </DialogTitle>
          <DialogDescription>
            {t('payments:record.description', {
              defaultValue: 'Record a cash or SINPE Móvil payment collected for this order.',
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Method */}
          <div className="grid gap-2">
            <Label htmlFor="method">{validationAttribute('method', true)} *</Label>
            <Select
              value={formData.method}
              onValueChange={(value) => handleChange('method', value)}
            >
              <SelectTrigger id="method" className="w-full">
                <SelectValue
                  placeholder={t('payments:record.method_placeholder', {
                    defaultValue: 'Select a method',
                  })}
                />
              </SelectTrigger>
              <SelectContent>
                {METHOD_OPTIONS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {getPaymentMethodLabel(t, method)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
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
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                className="pl-8"
                autoFocus
              />
            </div>
          </div>

          {/* Reference */}
          <div className="grid gap-2">
            <Label htmlFor="reference">{validationAttribute('reference', true)}</Label>
            <Input
              id="reference"
              value={formData.reference}
              onChange={(e) => handleChange('reference', e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="grid gap-2">
            <Label htmlFor="notes">{validationAttribute('notes', true)}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
            />
          </div>

          {/* Proof */}
          <div className="grid gap-2">
            <Label htmlFor="proof">
              {t('payments:record.proof_label', { defaultValue: 'Proof of payment (optional)' })}
            </Label>
            <Input
              id="proof"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setProof(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {actionLabel('cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={recordPayment.isPending || !isValidAmount}>
            {recordPayment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('payments:record.submit', { defaultValue: 'Record Payment' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
