'use client';

import { useTranslation } from 'react-i18next';
import { Building2, Clock, Eye, User } from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UrgencyBadge } from '@/components/orders/UrgencyBadge';
import { useLocalizedRouter } from '@/hooks/useLocalizedRouter';
import { useOrderCurrencySymbol } from '@/hooks/currencies';
import { formatCurrency, formatDate } from '@/utils/format';
import { actionLabel } from '@/utils/lang';
import { Enums } from '@/data/app-enums';

import { PeriodBillStatusBadge } from './PeriodBillStatusBadge';
import { BillAttentionReasonBadge } from './BillAttentionReasonBadge';
import { VerifyDeclarationDialog } from './VerifyDeclarationDialog';
import { RecordBillPaymentDialog } from './RecordBillPaymentDialog';

type BillNeedsAttentionData = App.Data.PeriodBill.BillNeedsAttentionData;

interface BillAttentionCardProps {
  item: BillNeedsAttentionData;
}

export function BillAttentionCard({ item }: BillAttentionCardProps) {
  const { t } = useTranslation('payments');
  const router = useLocalizedRouter();
  const baseSymbol = useOrderCurrencySymbol(null);

  const { bill, urgency, reason, ownerType, ownerName } = item;

  const OwnerIcon = ownerType === 'business' ? Building2 : User;
  const awaitingVerification = bill.status === Enums.PeriodBillStatus.AwaitingVerification;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-semibold">#{bill.publicId}</span>
          <UrgencyBadge urgency={urgency} />
          <BillAttentionReasonBadge reason={reason} />
          <PeriodBillStatusBadge status={bill.status} />
        </div>
        <div className="text-muted-foreground mt-1 flex flex-wrap gap-x-3 text-sm">
          <span className="flex items-center gap-1">
            <OwnerIcon className="h-3.5 w-3.5" />
            {ownerName ?? '-'}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {t('period_bill.due_on')} {formatDate(bill.dueAt)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-baseline gap-x-4 text-sm">
          <span>
            <span className="text-muted-foreground">{t('period_bill.net_due')} </span>
            <span className="font-mono font-medium">{formatCurrency(bill.netDue, baseSymbol)}</span>
          </span>
          {bill.creditApplied > 0 && (
            <span className="text-muted-foreground text-xs">
              {t('period_bill.credit_applied')} {formatCurrency(bill.creditApplied, baseSymbol)}
            </span>
          )}
        </div>

        {/* The state most likely to be misread: a declared transfer is not a
            payment, and the clock has not stopped. */}
        {awaitingVerification && (
          <p className="text-muted-foreground text-xs">
            {t('period_bill.awaiting_verification_hint')}
          </p>
        )}
        {bill.isOverdue && (
          <p className="text-muted-foreground text-xs">{t('period_bill.overdue_hint')}</p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {awaitingVerification && <VerifyDeclarationDialog bill={bill} />}
          <RecordBillPaymentDialog bill={bill} />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/period-bills/${bill.publicId}`)}
          >
            <Eye className="mr-1 h-4 w-4" />
            {actionLabel('view')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
