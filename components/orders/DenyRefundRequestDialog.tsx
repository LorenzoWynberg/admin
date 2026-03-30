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
import { useDenyRefundRequest } from '@/hooks/refundRequests';
import { X } from 'lucide-react';
import { actionLabel } from '@/utils/lang';

interface DenyRefundRequestDialogProps {
  publicId: string;
}

export function DenyRefundRequestDialog({ publicId }: DenyRefundRequestDialogProps) {
  const { t } = useTranslation();
  const [adminNotes, setAdminNotes] = useState('');
  const [open, setOpen] = useState(false);
  const denyMutation = useDenyRefundRequest();

  const handleConfirm = () => {
    denyMutation.mutate(
      { publicId, adminNotes: adminNotes.trim() || null },
      {
        onSuccess: () => {
          setOpen(false);
          setAdminNotes('');
        },
      }
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <X className="mr-1 h-4 w-4" />
          {actionLabel('deny')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {actionLabel('deny')}{' '}
            {t('models:refund_request', { count: 1, defaultValue: 'Refund Request' })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('payments:refund_request.deny_notes_placeholder', {
              defaultValue: 'Optionally provide a reason for denying this refund request.',
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Textarea
          placeholder={t('payments:refund_request.deny_notes_placeholder', {
            defaultValue: 'Reason for denial (optional)',
          })}
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          maxLength={500}
        />
        <AlertDialogFooter>
          <AlertDialogCancel disabled={denyMutation.isPending}>
            {actionLabel('cancel')}
          </AlertDialogCancel>
          <Button variant="destructive" onClick={handleConfirm} disabled={denyMutation.isPending}>
            {denyMutation.isPending
              ? t('common:loading', { defaultValue: 'Loading...' })
              : actionLabel('deny')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
