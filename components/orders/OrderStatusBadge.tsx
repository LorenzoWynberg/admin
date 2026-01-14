'use client';

import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';

type OrderStatus = App.Enums.OrderStatus;

const statusVariants: Record<OrderStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  estimated: 'default',
  approved: 'default',
  denied: 'destructive',
  canceled: 'outline',
  assigned: 'default',
  picking_up: 'default',
  arrived_at_pickup: 'default',
  picked_up: 'default',
  in_transit: 'default',
  arrived_at_drop_off: 'default',
  waiting_confirmation: 'secondary',
  completed: 'default',
  delivery_failed: 'destructive',
  returned_to_sender: 'outline',
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const { t } = useTranslation();

  const variant = statusVariants[status] || 'outline';
  const label = t(`orders:status.${status}`, { defaultValue: status });

  return <Badge variant={variant}>{label}</Badge>;
}
