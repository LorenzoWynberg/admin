'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOrderList } from '@/hooks/orders';
import { useNeedsAttention } from '@/hooks/orders/useNeedsAttention';
import { usePendingReconciliation } from '@/hooks/orders/usePendingReconciliation';
import { usePendingRefundRequests } from '@/hooks/refundRequests';
import { useCurrencyList } from '@/hooks/currencies';
import { NeedsAttentionCard } from '@/components/orders/NeedsAttentionCard';
import { PendingReconciliationCard } from '@/components/orders/PendingReconciliationCard';
import { RefundRequestCard } from '@/components/orders/RefundRequestCard';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { PaymentStatusBadge } from '@/components/orders/PaymentStatusBadge';
import { RecordPaymentDialog } from '@/components/payments/RecordPaymentDialog';
import { getPaymentMethodLabel, getOrderDueAmount } from '@/components/payments/PaymentSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useLocalizedRouter } from '@/hooks/useLocalizedRouter';
import { RefreshCw, AlertTriangle, Eye, Clock, User, Building2 } from 'lucide-react';
import { formatDateTime } from '@/utils/format';
import { Enums } from '@/data/app-enums';
import { actionLabel } from '@/utils/lang';

type OrderData = App.Data.Order.OrderData;

const { AttentionUrgency } = Enums;

const URGENCY_LEVELS = Object.values(AttentionUrgency);

const summaryStyles: Record<string, string> = {
  [AttentionUrgency.Critical]: 'bg-red-100 text-red-800',
  [AttentionUrgency.High]: 'bg-orange-100 text-orange-800',
  [AttentionUrgency.Medium]: 'bg-amber-100 text-amber-800',
  [AttentionUrgency.Low]: 'bg-gray-100 text-gray-800',
};

function OrderSummaryCardHeader({ order }: { order: OrderData }) {
  return (
    <CardHeader className="pb-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-sm font-semibold">#{order.publicId}</span>
        <OrderStatusBadge
          status={(order.status ?? Enums.OrderStatus.PENDING) as App.Enums.OrderStatus}
        />
        <PaymentStatusBadge status={order.paymentStatus} />
      </div>
      <div className="text-muted-foreground mt-1 flex flex-col gap-1 text-sm">
        {order.user && (
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            {order.user.name}
          </span>
        )}
        {order.business && (
          <span className="flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5" />
            {order.business.name}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {formatDateTime(order.createdAt)}
        </span>
      </div>
    </CardHeader>
  );
}

export default function NeedsAttentionPage() {
  const { t } = useTranslation('orders');
  const router = useLocalizedRouter();
  const [activeTab, setActiveTab] = useState<string>('conflicts');
  const { data, isLoading, refetch, isRefetching } = useNeedsAttention();
  const {
    data: unquotedData,
    isLoading: unquotedLoading,
    refetch: refetchUnquoted,
    isRefetching: isRefetchingUnquoted,
  } = useOrderList({
    page: 1,
    perPage: 100,
    hasQuote: false,
    excludeTerminal: true,
  });
  const {
    data: unpaidPrepaymentData,
    isLoading: unpaidPrepaymentLoading,
    refetch: refetchUnpaidPrepayment,
    isRefetching: isRefetchingUnpaidPrepayment,
  } = useOrderList({
    page: 1,
    perPage: 100,
    paymentStatus: Enums.PaymentStatus.UNPAID,
    hasQuote: true,
    excludeTerminal: true,
    collectOnDelivery: false,
  });
  const {
    data: unpaidCollectData,
    isLoading: unpaidCollectLoading,
    refetch: refetchUnpaidCollect,
    isRefetching: isRefetchingUnpaidCollect,
  } = useOrderList({
    page: 1,
    perPage: 100,
    paymentStatus: Enums.PaymentStatus.UNPAID,
    hasQuote: true,
    excludeTerminal: true,
    collectOnDelivery: true,
  });
  const {
    data: reconciliationData,
    isLoading: reconciliationLoading,
    refetch: refetchReconciliation,
    isRefetching: isRefetchingReconciliation,
  } = usePendingReconciliation();
  const {
    data: refundRequestsData,
    isLoading: refundRequestsLoading,
    refetch: refetchRefundRequests,
    isRefetching: isRefetchingRefundRequests,
  } = usePendingRefundRequests();
  const [filter, setFilter] = useState<string>('all');
  const { data: currencyListData } = useCurrencyList();

  const items = data?.data ?? [];
  const summary = (data?.summary ?? {}) as Record<string, number>;

  const filtered = filter === 'all' ? items : items.filter((i) => i.urgency === filter);

  const refundRequests = refundRequestsData?.items ?? [];
  const reconciliationOrders = reconciliationData?.data ?? [];
  const unquotedOrders = unquotedData?.items ?? [];
  const unpaidPrepaymentOrders = unpaidPrepaymentData?.items ?? [];
  const unpaidCollectOrders = unpaidCollectData?.items ?? [];
  const unquotedCount = unquotedData?.meta?.total ?? unquotedOrders.length;
  const unpaidPrepaymentCount = unpaidPrepaymentData?.meta?.total ?? unpaidPrepaymentOrders.length;
  const unpaidCollectCount = unpaidCollectData?.meta?.total ?? unpaidCollectOrders.length;
  const unpaidCount = unpaidPrepaymentCount + unpaidCollectCount;

  const urgentCount = (summary.critical ?? 0) + (summary.high ?? 0);

  const currencySymbolFor = (code?: string | null) =>
    currencyListData?.items?.find((c) => c.code === code)?.symbol || code || '₡';

  const handleRefreshAll = () => {
    refetch();
    refetchUnquoted();
    refetchUnpaidPrepayment();
    refetchUnpaidCollect();
    refetchReconciliation();
    refetchRefundRequests();
  };

  const anyRefetching =
    isRefetching ||
    isRefetchingUnquoted ||
    isRefetchingUnpaidPrepayment ||
    isRefetchingUnpaidCollect ||
    isRefetchingReconciliation ||
    isRefetchingRefundRequests;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
          <h1 className="text-2xl font-bold">
            {t('needs_attention.title', { defaultValue: 'Needs Attention' })}
          </h1>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefreshAll} disabled={anyRefetching}>
          <RefreshCw className={`mr-1 h-4 w-4 ${anyRefetching ? 'animate-spin' : ''}`} />
          {actionLabel('refresh')}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="conflicts">
            {t('needs_attention.conflicts_tab', { defaultValue: 'Conflicts' })}
            {urgentCount > 0 && (
              <Badge variant="destructive" className="ml-1.5 px-1.5 py-0 text-xs">
                {urgentCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reconciliation">
            {t('needs_attention.reconciliation_tab', { defaultValue: 'Reconciliation' })}
            {reconciliationOrders.length > 0 && (
              <Badge
                variant="secondary"
                className="ml-1.5 bg-amber-100 px-1.5 py-0 text-xs text-amber-800"
              >
                {reconciliationOrders.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="not-quoted">
            {t('needs_attention.not_quoted_tab', { defaultValue: 'Not Yet Quoted' })}
            {unquotedCount > 0 && (
              <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-xs">
                {unquotedCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="not-paid">
            {t('needs_attention.not_paid_tab', { defaultValue: 'Not Yet Paid' })}
            {unpaidCount > 0 && (
              <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-xs">
                {unpaidCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="refund-requests">
            {t('needs_attention.refund_requests_tab', { defaultValue: 'Refund Requests' })}
            {refundRequests.length > 0 && (
              <Badge
                variant="secondary"
                className="ml-1.5 bg-orange-100 px-1.5 py-0 text-xs text-orange-800"
              >
                {refundRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conflicts" className="space-y-6">
          <div className="flex flex-wrap gap-3">
            {URGENCY_LEVELS.map((level) => (
              <Badge key={level} className={summaryStyles[level]} variant="secondary">
                {summary[level]} {t(`needs_attention.urgency.${level}`, { defaultValue: level })}
              </Badge>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              {t('common:all', { defaultValue: 'All' })}
            </Button>
            {URGENCY_LEVELS.map((level) => (
              <Button
                key={level}
                variant={filter === level ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(level)}
              >
                {t(`needs_attention.urgency.${level}`, { defaultValue: level })}
              </Button>
            ))}
          </div>

          {isLoading ? (
            <div className="text-muted-foreground py-12 text-center">
              {t('common:loading', { defaultValue: 'Loading...' })}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center">
              {t('needs_attention.no_orders', {
                defaultValue: 'All orders are dispatched — nothing needs attention',
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((item) => (
                <NeedsAttentionCard key={item.order.publicId} item={item} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reconciliation" className="space-y-4">
          {reconciliationLoading ? (
            <div className="text-muted-foreground py-12 text-center">
              {t('common:loading', { defaultValue: 'Loading...' })}
            </div>
          ) : reconciliationOrders.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center">
              {t('needs_attention.no_reconciliation', {
                defaultValue: 'No orders pending reconciliation',
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {reconciliationOrders.map((order) => (
                <PendingReconciliationCard key={order.publicId} order={order} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="not-quoted" className="space-y-4">
          {unquotedLoading ? (
            <div className="text-muted-foreground py-12 text-center">
              {t('common:loading', { defaultValue: 'Loading...' })}
            </div>
          ) : unquotedOrders.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center">
              {t('needs_attention.no_unquoted', {
                defaultValue: 'No orders pending quote',
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {unquotedOrders.map((order) => (
                <Card key={order.publicId}>
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-semibold">#{order.publicId}</span>
                      <OrderStatusBadge
                        status={
                          (order.status ?? Enums.OrderStatus.PENDING) as App.Enums.OrderStatus
                        }
                      />
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </div>
                    <div className="text-muted-foreground mt-1 flex flex-col gap-1 text-sm">
                      {order.user && (
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {order.user.name}
                        </span>
                      )}
                      {order.business && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" />
                          {order.business.name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDateTime(order.createdAt)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/orders/${order.publicId}`)}
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        {actionLabel('view')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="not-paid" className="space-y-8">
          {/* Awaiting prepayment */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">
              {t('needs_attention.awaiting_prepayment_heading', {
                defaultValue: 'Awaiting Prepayment',
              })}
            </h3>
            {unpaidPrepaymentLoading ? (
              <div className="text-muted-foreground py-12 text-center">
                {t('common:loading', { defaultValue: 'Loading...' })}
              </div>
            ) : unpaidPrepaymentOrders.length === 0 ? (
              <div className="text-muted-foreground py-12 text-center">
                {t('needs_attention.no_unpaid', {
                  defaultValue: 'No unpaid orders pending payment',
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {unpaidPrepaymentOrders.map((order) => (
                  <Card key={order.publicId}>
                    <OrderSummaryCardHeader order={order} />
                    <CardContent>
                      <div className="flex flex-wrap items-center gap-2">
                        {order.publicId && (
                          <RecordPaymentDialog
                            orderPublicId={order.publicId}
                            currencySymbol={currencySymbolFor(order.currencyCode)}
                            defaultAmount={getOrderDueAmount(order)}
                            onSuccess={refetchUnpaidPrepayment}
                          />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/orders/${order.publicId}`)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          {actionLabel('view')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Collect on delivery, in progress */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">
              {t('needs_attention.collect_on_delivery_heading', {
                defaultValue: 'Collect on Delivery — In Progress',
              })}
            </h3>
            {unpaidCollectLoading ? (
              <div className="text-muted-foreground py-12 text-center">
                {t('common:loading', { defaultValue: 'Loading...' })}
              </div>
            ) : unpaidCollectOrders.length === 0 ? (
              <div className="text-muted-foreground py-12 text-center">
                {t('needs_attention.no_collect_on_delivery', {
                  defaultValue: 'No orders currently collecting payment on delivery',
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {unpaidCollectOrders.map((order) => (
                  <Card key={order.publicId}>
                    <OrderSummaryCardHeader order={order} />
                    <CardContent className="space-y-3">
                      <p className="text-muted-foreground text-sm">
                        {t('needs_attention.collect_method_label', {
                          method: getPaymentMethodLabel(t, order.collectOnDeliveryMethod),
                          defaultValue: 'Collecting via {{method}}',
                        })}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/orders/${order.publicId}`)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          {actionLabel('view')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="refund-requests" className="space-y-4">
          {refundRequestsLoading ? (
            <div className="text-muted-foreground py-12 text-center">
              {t('common:loading', { defaultValue: 'Loading...' })}
            </div>
          ) : refundRequests.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center">
              {t('needs_attention.no_refund_requests', {
                defaultValue: 'No pending refund requests',
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {refundRequests.map((request) => (
                <RefundRequestCard key={request.publicId} refundRequest={request} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
