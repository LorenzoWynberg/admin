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
import { Textarea } from '@/components/ui/textarea';
import { useCancelOrder } from '@/hooks/orders/useNeedsAttention';
import { X } from 'lucide-react';

interface CancelOrderDialogProps {
  publicId: string;
}

export function CancelOrderDialog({ publicId }: CancelOrderDialogProps) {
  const { t } = useTranslation('orders');
  const [reason, setReason] = useState('');
  const [open, setOpen] = useState(false);
  const cancelMutation = useCancelOrder();

  const handleConfirm = () => {
    if (!reason.trim()) return;
    cancelMutation.mutate(
      { publicId, reason: reason.trim() },
      {
        onSuccess: () => {
          setOpen(false);
          setReason('');
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
        <AlertDialogFooter>
          <AlertDialogCancel disabled={cancelMutation.isPending}>
            {t('common:cancel', { defaultValue: 'Cancel' })}
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
