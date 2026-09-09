'use client';

import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';

import {
  TableHeader,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Table,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PeriodBillStatusBadge } from '@/components/periodBills/PeriodBillStatusBadge';
import { SettlementDestinationSummary } from '@/components/periodBills/SettlementDestinationSummary';
import { VerifyDeclarationDialog } from '@/components/periodBills/VerifyDeclarationDialog';
import { RecordBillPaymentDialog } from '@/components/periodBills/RecordBillPaymentDialog';
import { CopyableReference } from '@/components/periodBills/CopyableReference';
import { ProofViewer } from '@/components/periodBills/ProofViewer';
import { usePeriodBill } from '@/hooks/periodBills';
import { useOrderCurrencySymbol } from '@/hooks/currencies';
import { useLocalizedRouter } from '@/hooks/useLocalizedRouter';
import { formatCurrency, formatDate } from '@/utils/format';
import {
  actionLabel,
  capitalize,
  modelLabel,
  resourceMessage,
  validationAttribute,
} from '@/utils/lang';
import { Enums } from '@/data/app-enums';

export default function PeriodBillDetailPage() {
  const params = useParams();
  const { t, ready } = useTranslation('payments');
  const router = useLocalizedRouter();
  const publicId = params.id as string;

  const { data: bill, isLoading, error } = usePeriodBill(publicId);
  const baseSymbol = useOrderCurrencySymbol(null);

  if (!ready || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="text-muted-foreground py-12 text-center">
        {resourceMessage('not_found', 'period_bill')}
      </div>
    );
  }

  const perCurrency = Object.entries(bill.perCurrencyTotals ?? {});
  const lines = bill.lines ?? [];
  const awaitingVerification = bill.status === Enums.PeriodBillStatus.AwaitingVerification;
  // Only an issued bill that is still owed can be recorded as paid — the api
  // refuses anything else with `errors.period_bill.not_settleable`. The queue
  // never surfaces another status, but this route can be reached directly, and
  // offering an act that is certain to be refused is not an affordance.
  const settleable = bill.status === Enums.PeriodBillStatus.Issued || awaitingVerification;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/needs-attention')}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          {actionLabel('back')}
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">{capitalize(modelLabel('period_bill'))}</h1>
          <span className="font-mono text-sm">#{bill.publicId}</span>
          <PeriodBillStatusBadge status={bill.status} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {awaitingVerification && <VerifyDeclarationDialog bill={bill} />}
          {settleable && <RecordBillPaymentDialog bill={bill} />}
        </div>
      </div>

      {/* The three states an operator has to read differently. `Open` is not a
          bill yet — nothing is owed until the period closes. */}
      {bill.status === Enums.PeriodBillStatus.Open && (
        <p className="text-muted-foreground text-sm">{t('period_bill.open_hint')}</p>
      )}
      {awaitingVerification && (
        <p className="text-muted-foreground text-sm">
          {t('period_bill.awaiting_verification_hint')}
        </p>
      )}
      {bill.isOverdue && (
        <p className="text-muted-foreground text-sm">{t('period_bill.overdue_hint')}</p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('period_bill.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('period_bill.period_total')}</span>
              <span className="font-mono">{formatCurrency(bill.baseAmount, baseSymbol)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('period_bill.credit_applied')}</span>
              <span className="font-mono">{formatCurrency(bill.creditApplied, baseSymbol)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>{t('period_bill.net_due')}</span>
              <span className="font-mono">{formatCurrency(bill.netDue, baseSymbol)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('period_bill.closed_on')}</span>
              <span>{formatDate(bill.cutoffAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('period_bill.due_on')}</span>
              <span>{formatDate(bill.dueAt)}</span>
            </div>
            {/* Per agreed currency, never re-converted: a base line carries one
                colón figure and a non-base line the rate frozen on its quote. */}
            {perCurrency.map(([code, totals]) => (
              <div key={code} className="flex justify-between">
                <span className="text-muted-foreground">{code}</span>
                <span className="font-mono">{totals.amount.toFixed(2)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {(bill.settlementMethod || bill.reference || bill.settlementDestination) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{validationAttribute('method')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {bill.settlementMethod && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{validationAttribute('method')}</span>
                  <span>{t(`settlement_method.${bill.settlementMethod}`)}</span>
                </div>
              )}
              {bill.reference && <CopyableReference reference={bill.reference} />}
              {bill.settlementDestination && (
                <SettlementDestinationSummary destination={bill.settlementDestination} />
              )}
              {bill.proofUrl && <ProofViewer publicId={bill.publicId} />}
              {/* `notes` is stripped for a non-staff reader, so it is absent
                  rather than null on those responses — never assumed present. */}
              {bill.notes && <p className="text-muted-foreground text-xs">{bill.notes}</p>}
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('period_bill.lines_title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {lines.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('period_bill.empty')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{capitalize(modelLabel('order'))}</TableHead>
                  <TableHead>{validationAttribute('currencyCode')}</TableHead>
                  <TableHead className="text-right">{t('period_bill.line_rate')}</TableHead>
                  <TableHead className="text-right">{t('period_bill.period_total')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell className="font-mono text-xs">#{line.orderPublicId}</TableCell>
                    <TableCell>{line.currencyCode}</TableCell>
                    <TableCell className="text-right font-mono">
                      {line.fxRate === null ? '-' : line.fxRate.toFixed(6)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {line.amount.toFixed(2)} / {formatCurrency(line.baseAmount, baseSymbol)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
