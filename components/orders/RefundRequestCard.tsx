'use client';

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DenyRefundRequestDialog } from './DenyRefundRequestDialog';
import { useApproveRefundRequest } from '@/hooks/refundRequests';
import { useLocalizedRouter } from '@/hooks/useLocalizedRouter';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { getDateLocale } from '@/utils/format';
import { actionLabel } from '@/utils/lang';
import { formatCurrency } from '@/utils/format';
import { useCurrencyList } from '@/hooks/currencies/useCurrencyList';
import { Eye, Clock, Check, Building2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type RefundRequestData = App.Data.RefundRequest.RefundRequestData;

interface RefundRequestCardProps {
  refundRequest: RefundRequestData;
}

export function RefundRequestCard({ refundRequest }: RefundRequestCardProps) {
  const { t, i18n } = useTranslation('orders');
  const router = useLocalizedRouter();
  const approveMutation = useApproveRefundRequest();

  const order = refundRequest.order;
  const user = refundRequest.user;
  const business = order?.business;
  const orderPublicId = order?.publicId ?? '';
  const reason = refundRequest.reason ?? '';
  const { data: currencyListData } = useCurrencyList();
  const currencySymbol =
    currencyListData?.items?.find((c) => c.code === order?.currencyCode)?.symbol ||
    currencyListData?.items?.find((c) => c.isBase)?.symbol ||
    '₡';
  const totalPaid = order?.totalPaid;

  const createdAgo = refundRequest.createdAt
    ? formatDistanceToNow(new Date(refundRequest.createdAt as string), {
        addSuffix: true,
        locale: getDateLocale(i18n.language),
      })
    : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-semibold">#{orderPublicId}</span>
          <Badge variant="outline" className="bg-orange-50 text-orange-700">
            {t('payments:refund_request.refund_requested', { defaultValue: 'Refund Requested' })}
          </Badge>
          {order?.paymentStatus && <PaymentStatusBadge status={order.paymentStatus} />}
          {createdAgo && (
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3" />
              {createdAgo}
            </span>
          )}
        </div>
        <div className="text-muted-foreground flex flex-wrap gap-x-3 text-sm">
          {user && <span>{user.name}</span>}
          {business && (
            <span className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {business.name}
            </span>
          )}
          {totalPaid != null && totalPaid > 0 && (
            <span className="font-medium text-red-600">
              {formatCurrency(totalPaid, currencySymbol)}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-sm">
            <span className="text-muted-foreground font-medium">
              {t('notifications:email.labels.reason', { defaultValue: 'Reason' })}:
            </span>{' '}
            {reason.length > 200 ? reason.slice(0, 200) + '...' : reason}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (refundRequest.publicId) {
                approveMutation.mutate(refundRequest.publicId as string);
              }
            }}
            disabled={approveMutation.isPending}
          >
            <Check className="mr-1 h-4 w-4" />
            {actionLabel('approve')}
          </Button>

          <DenyRefundRequestDialog publicId={refundRequest.publicId as string} />

          <Button variant="ghost" size="sm" onClick={() => router.push(`/orders/${orderPublicId}`)}>
            <Eye className="mr-1 h-4 w-4" />
            {actionLabel('view')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
