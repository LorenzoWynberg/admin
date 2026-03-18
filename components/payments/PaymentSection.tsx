'use client';

import { CreditCard, ExternalLink, Loader2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrderPayments } from '@/hooks/payments';
import { RefundDialog } from './RefundDialog';
import { formatDate, formatCurrency } from '@/utils/format';
import { capitalize, statusLabel } from '@/utils/lang';
import { Enums } from '@/data/app-enums';
import type { TFunction } from 'i18next';

type PaymentData = App.Data.Payment.PaymentData;

interface PaymentSectionProps {
  orderPublicId: string;
  currencySymbol?: string;
}

function getStatusBadgeVariant(
  status?: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case Enums.TransactionStatus.Succeeded:
      return 'default';
    case Enums.TransactionStatus.Pending:
    case Enums.TransactionStatus.Authorized:
      return 'secondary';
    case Enums.TransactionStatus.Failed:
    case Enums.TransactionStatus.Voided:
      return 'destructive';
    default:
      return 'outline';
  }
}

function getPaymentMethodLabel(
  t: TFunction,
  method?: string | null,
  brand?: string | null
): string {
  if (!method) return t('payments:unknown_method', { defaultValue: 'Unknown' });

  switch (method) {
    case Enums.PaymentMethodType.Card:
      return brand ? capitalize(brand) : t('payments:card', { defaultValue: 'Card' });
    case Enums.PaymentMethodType.ApplePay:
      return 'Apple Pay';
    case Enums.PaymentMethodType.SinpeMobile:
      return 'SINPE Movil';
    case Enums.PaymentMethodType.Cash:
      return t('payments:cash', { defaultValue: 'Cash' });
    default:
      return capitalize(method);
  }
}

function PaymentCard({
  payment,
  currencySymbol,
}: {
  payment: PaymentData;
  currencySymbol: string;
}) {
  const { t } = useTranslation();
  const canRefund = payment.status === Enums.TransactionStatus.Succeeded;
  const isAuthorized = payment.status === Enums.TransactionStatus.Authorized;

  return (
    <div className="bg-muted/30 rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm">{payment.publicId}</span>
            <Badge variant={getStatusBadgeVariant(payment.status)}>
              {statusLabel(payment.status || Enums.TransactionStatus.Pending)}
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">
            {getPaymentMethodLabel(t, payment.method, null)}
            {payment.provider &&
              ` ${t('payments:via_provider', { defaultValue: 'via' })} ${capitalize(payment.provider)}`}
          </p>
        </div>
        <div className="text-right">
          {isAuthorized ? (
            <>
              <p className="text-lg font-semibold">
                {t('payments:authorized_amount')}:{' '}
                {formatCurrency(payment.amount || 0, currencySymbol)}
              </p>
              {payment.authExpiresAt && (
                <p className="text-muted-foreground text-xs">
                  {t('payments:auth_expires')}{' '}
                  {formatDate(payment.authExpiresAt)}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-lg font-semibold">
                {payment.capturedAmount != null ? (
                  <>
                    {t('payments:captured_amount')}:{' '}
                    {formatCurrency(payment.capturedAmount, currencySymbol)}
                  </>
                ) : (
                  formatCurrency(payment.amount || 0, currencySymbol)
                )}
              </p>
              {payment.paidAt && (
                <p className="text-muted-foreground text-xs">
                  {t('payments:paid_at', { defaultValue: 'Paid' })} {formatDate(payment.paidAt)}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-muted-foreground flex items-center gap-4 text-xs">
          {payment.providerChargeId && (
            <span>
              {t('payments:charge_id', { defaultValue: 'Charge' })}: {payment.providerChargeId}
            </span>
          )}
          {payment.fxRate && payment.fxRate !== 1 && (
            <span>
              {t('payments:fx_rate', { defaultValue: 'FX Rate' })}: {payment.fxRate.toFixed(4)}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {payment.receiptUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={payment.receiptUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                {t('payments:receipt', { defaultValue: 'Receipt' })}
              </a>
            </Button>
          )}
          {canRefund && <RefundDialog payment={payment} currencySymbol={currencySymbol} />}
        </div>
      </div>
    </div>
  );
}

export function PaymentSection({ orderPublicId, currencySymbol = '₡' }: PaymentSectionProps) {
  const { t } = useTranslation();
  const { data: payments, isLoading, error } = useOrderPayments({ orderPublicId });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {t('payments:section_title', { defaultValue: 'Payments' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
          </div>
        ) : error ? (
          <p className="text-destructive text-center text-sm">
            {t('payments:error_loading', { defaultValue: 'Failed to load payments' })}
          </p>
        ) : !payments || payments.length === 0 ? (
          <div className="py-6 text-center">
            <CreditCard className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
            <p className="text-muted-foreground text-sm">
              {t('payments:no_payments', { defaultValue: 'No payments recorded for this order' })}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <PaymentCard
                key={payment.publicId || payment.id}
                payment={payment}
                currencySymbol={currencySymbol}
              />
            ))}

            {/* Summary */}
            {payments.length > 1 && (
              <div className="border-t pt-4">
                <div className="flex justify-between font-medium">
                  <span>{t('payments:total_paid', { defaultValue: 'Total Paid' })}</span>
                  <span>
                    {formatCurrency(
                      payments
                        .filter((p) => p.status === Enums.TransactionStatus.Succeeded)
                        .reduce((sum, p) => sum + (p.amount || 0), 0),
                      currencySymbol
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
