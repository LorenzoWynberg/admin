'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { useApproveRefundRequest } from '@/hooks/refundRequests';
import { useOrderPayments } from '@/hooks/payments';
import {
  RefundMethodFields,
  getDefaultRefundMethod,
} from '@/components/payments/RefundMethodFields';
import { actionLabel } from '@/utils/lang';
import { Enums } from '@/data/app-enums';

interface ApproveRefundRequestDialogProps {
  publicId: string;
  orderPublicId: string;
}

export function ApproveRefundRequestDialog({
  publicId,
  orderPublicId,
}: ApproveRefundRequestDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const approveMutation = useApproveRefundRequest();
  const { data: payments, isLoading: paymentsLoading } = useOrderPayments({
    orderPublicId,
    enabled: open,
  });

  // Mirror the server's target-payment resolution (order's most recently
  // created succeeded payment) so the method defaults/locking shown here
  // matches what the API will actually validate against.
  const settledPayment = payments
    ?.filter((p) => p.status === Enums.TransactionStatus.Succeeded)
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))[0];
  const isManual = settledPayment?.provider === Enums.PaymentProvider.Manual;

  // The method the admin hasn't explicitly overridden — recomputed from the
  // loaded payment each render rather than synced via an effect.
  const defaultMethod = getDefaultRefundMethod(isManual);

  const [formData, setFormData] = useState({
    method: null as string | null,
  });

  const method = formData.method ?? defaultMethod;

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setFormData({ method: null });
    }
    setOpen(isOpen);
  };

  const handleConfirm = () => {
    approveMutation.mutate(
      {
        publicId,
        data: { method },
      },
      {
        onSuccess: () => {
          setOpen(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Check className="mr-1 h-4 w-4" />
          {actionLabel('approve')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {actionLabel('approve')}{' '}
            {t('models:refund_request', { count: 1, defaultValue: 'Refund Request' })}
          </DialogTitle>
          <DialogDescription>
            {t('payments:refund_request.approve_description', {
              defaultValue: 'Choose how the refund will be settled. This cannot be undone.',
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <RefundMethodFields
            isManual={isManual}
            method={method}
            onMethodChange={(value) => setFormData((prev) => ({ ...prev, method: value }))}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {actionLabel('cancel')}
          </Button>
          <Button onClick={handleConfirm} disabled={approveMutation.isPending || paymentsLoading}>
            {(approveMutation.isPending || paymentsLoading) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {actionLabel('approve')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
