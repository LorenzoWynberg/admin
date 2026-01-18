'use client';

import { Badge } from '@/components/ui/badge';
import { orderStatusLabel } from '@/utils/lang';

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
  const variant = statusVariants[status] || 'outline';

  return <Badge variant={variant}>{orderStatusLabel(status)}</Badge>;
}
