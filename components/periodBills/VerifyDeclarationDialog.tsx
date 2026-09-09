'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, ShieldCheck } from 'lucide-react';

import {
  DialogDescription,
  DialogTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Dialog,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePeriodBill, useApproveDeclaration, useRejectDeclaration } from '@/hooks/periodBills';
import { useOrderCurrencySymbol } from '@/hooks/currencies';
import { actionLabel, validationAttribute } from '@/utils/lang';
import { formatCurrency } from '@/utils/format';

import { CopyableReference } from './CopyableReference';
import { SettlementDestinationSummary } from './SettlementDestinationSummary';
import { ProofViewer } from './ProofViewer';

type PeriodBillData = App.Data.PeriodBill.PeriodBillData;

interface VerifyDeclarationDialogProps {
  bill: PeriodBillData;
}

function AmountRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-medium">{value}</span>
    </div>
  );
}

/**
 * The verification row, as a dialog: everything an operator needs to find the
 * declared payment in the bank, and the two outcomes.
 *
 * It re-fetches the bill on open because the queue deliberately loads no lines
 * — `getNeedsAttention()` selects `with('owner')` only, so `perCurrencyTotals`
 * is absent from every row. The exact figure in the currency the customer says
 * they sent lives on the detail, and "the exact amount" is the whole reason
 * this row exists.
 */
export function VerifyDeclarationDialog({ bill }: VerifyDeclarationDialogProps) {
  const { t } = useTranslation('payments');
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState('');

  const detail = usePeriodBill(open ? bill.publicId : '');
  const approve = useApproveDeclaration();
  const reject = useRejectDeclaration();

  // The row's own copy until the detail lands, so the dialog is never blank.
  const shown = detail.data ?? bill;
  const baseSymbol = useOrderCurrencySymbol(null);
  const declaredSymbol = useOrderCurrencySymbol(shown.currencyCode);

  const pending = approve.isPending || reject.isPending;
  // `notes` is required on a rejection and optional on an approval, because a
  // rejection is what reaches the customer.
  const canReject = notes.trim().length > 0 && !pending;

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) setNotes('');
    setOpen(isOpen);
  };

  const close = () => setOpen(false);

  const perCurrency = Object.entries(shown.perCurrencyTotals ?? {});

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ShieldCheck className="mr-1 h-4 w-4" />
          {actionLabel('verify')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('period_bill.title')}</DialogTitle>
          <DialogDescription>{t('period_bill.awaiting_verification_hint')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex flex-wrap items-center gap-3">
            {shown.settlementMethod && (
              <span className="text-sm font-medium">
                {t(`settlement_method.${shown.settlementMethod}`)}
              </span>
            )}
            {shown.reference && <CopyableReference reference={shown.reference} />}
          </div>

          <div className="space-y-1">
            <AmountRow
              label={t('period_bill.period_total')}
              value={formatCurrency(shown.baseAmount, baseSymbol)}
            />
            {shown.creditApplied > 0 && (
              <AmountRow
                label={t('period_bill.credit_applied')}
                value={`-${formatCurrency(shown.creditApplied, baseSymbol)}`}
              />
            )}
            <AmountRow
              label={t('period_bill.net_due')}
              value={formatCurrency(shown.netDue, baseSymbol)}
            />
            {/* The figure to look for in the bank when the customer paid in
                their own currency rather than in base. */}
            {perCurrency
              .filter(([code]) => code === shown.currencyCode)
              .map(([code, totals]) => (
                <AmountRow
                  key={code}
                  label={code}
                  value={formatCurrency(totals.amount, declaredSymbol)}
                />
              ))}
          </div>

          {shown.settlementDestination && (
            <SettlementDestinationSummary destination={shown.settlementDestination} />
          )}

          {shown.proofUrl && <ProofViewer publicId={shown.publicId} />}

          {/* Shown rather than pre-filled. The api writes `notes`
              unconditionally on approve and reject, so whatever an earlier act
              recorded is about to be replaced — and an operator cannot weigh
              that without seeing it. Pre-filling would be worse here than in
              the by-hand record: on a rejection this field reaches the
              customer, and re-sending someone else's sentence as your own is
              not a recovery from data loss. */}
          {shown.notes && (
            <p className="text-muted-foreground bg-muted/50 rounded-md p-2 text-xs">
              {shown.notes}
            </p>
          )}

          <div className="grid gap-2">
            <Label htmlFor="verify-notes">{validationAttribute('notes')}</Label>
            <Textarea
              id="verify-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {detail.isLoading && (
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <Loader2 className="h-3 w-3 animate-spin" />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="destructive"
            disabled={!canReject}
            onClick={() =>
              reject.mutate({ publicId: shown.publicId, notes: notes.trim() }, { onSuccess: close })
            }
          >
            {actionLabel('reject')}
          </Button>
          <Button
            disabled={pending}
            onClick={() =>
              approve.mutate(
                { publicId: shown.publicId, notes: notes.trim() || null },
                { onSuccess: close }
              )
            }
          >
            {actionLabel('approve')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
