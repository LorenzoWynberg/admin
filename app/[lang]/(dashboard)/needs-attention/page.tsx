'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNeedsAttention } from '@/hooks/orders/useNeedsAttention';
import { NeedsAttentionCard } from '@/components/orders/NeedsAttentionCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, AlertTriangle } from 'lucide-react';

type Urgency = 'critical' | 'high' | 'medium' | 'low';

const URGENCY_LEVELS: Urgency[] = ['critical', 'high', 'medium', 'low'];

const summaryStyles: Record<Urgency, string> = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-gray-100 text-gray-800',
};

export default function NeedsAttentionPage() {
  const { t } = useTranslation('orders');
  const { data, isLoading, refetch, isRefetching } = useNeedsAttention();
  const [filter, setFilter] = useState<Urgency | 'all'>('all');

  const items = data?.data ?? [];
  const summary = data?.summary ?? { critical: 0, high: 0, medium: 0, low: 0 };

  const filtered = filter === 'all' ? items : items.filter((i) => i.urgency === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
          <h1 className="text-2xl font-bold">
            {t('needs_attention.title', { defaultValue: 'Needs Attention' })}
          </h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
          <RefreshCw className={`mr-1 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
          {t('common:refresh', { defaultValue: 'Refresh' })}
        </Button>
      </div>

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
    </div>
  );
}
