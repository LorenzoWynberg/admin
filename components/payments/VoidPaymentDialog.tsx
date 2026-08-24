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
import { Button } from '@/components/ui/button';
import { useVoidPayment } from '@/hooks/payments';
import { Ban } from 'lucide-react';
import { actionLabel } from '@/utils/lang';

interface VoidPaymentDialogProps {
  paymentPublicId: string;
  onSuccess?: () => void;
}

export function VoidPaymentDialog({ paymentPublicId, onSuccess }: VoidPaymentDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const voidPayment = useVoidPayment();

  const handleConfirm = () => {
    voidPayment.mutate(paymentPublicId, {
      onSuccess: () => {
        setOpen(false);
        onSuccess?.();
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Ban className="mr-2 h-4 w-4" />
          {t('payments:void.button', { defaultValue: 'Void' })}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('payments:void.confirm_title', { defaultValue: 'Void this payment?' })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('payments:void.confirm_description', {
              defaultValue:
                'This will reverse the manual payment and mark the order as unpaid again. This cannot be undone.',
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={voidPayment.isPending}>
            {actionLabel('cancel')}
          </AlertDialogCancel>
          <Button variant="destructive" onClick={handleConfirm} disabled={voidPayment.isPending}>
            {voidPayment.isPending
              ? t('common:loading', { defaultValue: 'Loading...' })
              : t('payments:void.button', { defaultValue: 'Void' })}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
