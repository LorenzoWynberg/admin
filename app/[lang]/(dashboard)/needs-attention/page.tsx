'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOrderList } from '@/hooks/orders';
import { useNeedsAttention } from '@/hooks/orders/useNeedsAttention';
import { usePendingReconciliation } from '@/hooks/orders/usePendingReconciliation';
import { usePendingRefundRequests } from '@/hooks/refundRequests';
import { NeedsAttentionCard } from '@/components/orders/NeedsAttentionCard';
import { PendingReconciliationCard } from '@/components/orders/PendingReconciliationCard';
import { RefundRequestCard } from '@/components/orders/RefundRequestCard';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { PaymentStatusBadge } from '@/components/orders/PaymentStatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useLocalizedRouter } from '@/hooks/useLocalizedRouter';
import { RefreshCw, AlertTriangle, Eye } from 'lucide-react';
import { Enums } from '@/data/app-enums';
import { actionLabel } from '@/utils/lang';

const { AttentionUrgency } = Enums;

const URGENCY_LEVELS = Object.values(AttentionUrgency);

const summaryStyles: Record<string, string> = {
  [AttentionUrgency.Critical]: 'bg-red-100 text-red-800',
  [AttentionUrgency.High]: 'bg-orange-100 text-orange-800',
  [AttentionUrgency.Medium]: 'bg-amber-100 text-amber-800',
  [AttentionUrgency.Low]: 'bg-gray-100 text-gray-800',
};

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
    data: unpaidData,
    isLoading: unpaidLoading,
    refetch: refetchUnpaid,
    isRefetching: isRefetchingUnpaid,
  } = useOrderList({
    page: 1,
    perPage: 100,
    paymentStatus: Enums.PaymentStatus.UNPAID,
    excludeTerminal: true,
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

  const items = data?.data ?? [];
  const summary = (data?.summary ?? {}) as Record<string, number>;

  const filtered = filter === 'all' ? items : items.filter((i) => i.urgency === filter);

  const refundRequests = refundRequestsData?.items ?? [];
  const reconciliationOrders = reconciliationData?.data ?? [];
  const unquotedOrders = unquotedData?.items ?? [];
  const unpaidOrders = unpaidData?.items ?? [];
  const unquotedCount = unquotedData?.meta?.total ?? unquotedOrders.length;
  const unpaidCount = unpaidData?.meta?.total ?? unpaidOrders.length;

  const urgentCount = (summary.critical ?? 0) + (summary.high ?? 0);

  const handleRefreshAll = () => {
    refetch();
    refetchUnquoted();
    refetchUnpaid();
    refetchReconciliation();
    refetchRefundRequests();
  };

  const anyRefetching =
    isRefetching ||
    isRefetchingUnquoted ||
    isRefetchingUnpaid ||
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
                    <div className="text-muted-foreground flex flex-wrap gap-x-3 text-sm">
                      {order.user && <span>{order.user.name}</span>}
                      {order.business && <span>{order.business.name}</span>}
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

        <TabsContent value="not-paid" className="space-y-4">
          {unpaidLoading ? (
            <div className="text-muted-foreground py-12 text-center">
              {t('common:loading', { defaultValue: 'Loading...' })}
            </div>
          ) : unpaidOrders.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center">
              {t('needs_attention.no_unpaid', {
                defaultValue: 'No unpaid orders pending payment',
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {unpaidOrders.map((order) => (
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
                    <div className="text-muted-foreground flex flex-wrap gap-x-3 text-sm">
                      {order.user && <span>{order.user.name}</span>}
                      {order.business && <span>{order.business.name}</span>}
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
