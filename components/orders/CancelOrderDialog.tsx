'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCancelOrder } from '@/hooks/orders/useNeedsAttention';
import { formatCurrency } from '@/utils/format';
import { X } from 'lucide-react';
import { actionLabel } from '@/utils/lang';

interface CancelOrderDialogProps {
  publicId: string;
  cancellationFee?: number | null;
  currencySymbol?: string;
}

export function CancelOrderDialog({
  publicId,
  cancellationFee,
  currencySymbol = '₡',
}: CancelOrderDialogProps) {
  const { t } = useTranslation('orders');
  const [reason, setReason] = useState('');
  const [chargeFee, setChargeFee] = useState(false);
  const [open, setOpen] = useState(false);
  const cancelMutation = useCancelOrder();

  const handleConfirm = () => {
    if (!reason.trim()) return;
    cancelMutation.mutate(
      { publicId, reason: reason.trim(), chargeCancellationFee: chargeFee },
      {
        onSuccess: () => {
          setOpen(false);
          setReason('');
          setChargeFee(false);
        },
      }
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <X className="mr-1 h-4 w-4" />
          {t('detail.cancel_order', { defaultValue: 'Cancel Order' })}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('detail.cancel_order', { defaultValue: 'Cancel Order' })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('detail.confirmCancel', {
              defaultValue: 'Are you sure you want to cancel this order?',
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Textarea
          placeholder={t('needs_attention.cancel_reason_placeholder', {
            defaultValue: 'Reason for cancellation (required)',
          })}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={500}
        />
        {cancellationFee != null && cancellationFee > 0 && (
          <div className="flex items-start gap-2">
            <Checkbox
              id="chargeFee"
              checked={chargeFee}
              onCheckedChange={(checked) => setChargeFee(checked === true)}
            />
            <label htmlFor="chargeFee" className="text-sm leading-tight">
              {t('detail.charge_cancellation_fee', {
                fee: formatCurrency(cancellationFee, currencySymbol),
                defaultValue: `Charge cancellation fee (${formatCurrency(cancellationFee, currencySymbol)})`,
              })}
            </label>
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={cancelMutation.isPending}>
            {actionLabel('cancel')}
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!reason.trim() || cancelMutation.isPending}
          >
            {cancelMutation.isPending
              ? t('common:loading', { defaultValue: 'Loading...' })
              : t('detail.cancel_order', { defaultValue: 'Cancel Order' })}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
