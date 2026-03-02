'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNeedsAttention } from '@/hooks/orders/useNeedsAttention';
import { usePendingReconciliation } from '@/hooks/orders/usePendingReconciliation';
import { NeedsAttentionCard } from '@/components/orders/NeedsAttentionCard';
import { PendingReconciliationCard } from '@/components/orders/PendingReconciliationCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, AlertTriangle } from 'lucide-react';
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
  const { data, isLoading, refetch, isRefetching } = useNeedsAttention();
  const {
    data: reconciliationData,
    isLoading: reconciliationLoading,
    refetch: refetchReconciliation,
    isRefetching: isRefetchingReconciliation,
  } = usePendingReconciliation();
  const [filter, setFilter] = useState<string>('all');

  const items = data?.data ?? [];
  const summary = (data?.summary ?? {}) as Record<string, number>;

  const filtered = filter === 'all' ? items : items.filter((i) => i.urgency === filter);

  const reconciliationOrders = reconciliationData?.data ?? [];

  const urgentCount = (summary.critical ?? 0) + (summary.high ?? 0);

  const handleRefreshAll = () => {
    refetch();
    refetchReconciliation();
  };

  const anyRefetching = isRefetching || isRefetchingReconciliation;

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

      <Tabs defaultValue="conflicts">
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
      </Tabs>
    </div>
  );
}
