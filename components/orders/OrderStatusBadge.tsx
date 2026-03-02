'use client';

import { Badge } from '@/components/ui/badge';
import { statusLabel } from '@/utils/lang';

type OrderStatus = App.Enums.OrderStatus;

const statusStyles: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  estimated: 'bg-blue-100 text-blue-800 border-blue-200',
  approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  denied: 'bg-red-100 text-red-800 border-red-200',
  canceled: 'bg-gray-100 text-gray-600 border-gray-200',
  assigned: 'bg-violet-100 text-violet-800 border-violet-200',
  picking_up: 'bg-orange-100 text-orange-800 border-orange-200',
  arrived_at_pickup: 'bg-orange-100 text-orange-800 border-orange-200',
  picked_up: 'bg-amber-100 text-amber-800 border-amber-200',
  in_transit: 'bg-sky-100 text-sky-800 border-sky-200',
  arrived_at_drop_off: 'bg-sky-100 text-sky-800 border-sky-200',
  waiting_confirmation: 'bg-purple-100 text-purple-800 border-purple-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  delivery_failed: 'bg-red-100 text-red-800 border-red-200',
  returned_to_sender: 'bg-gray-100 text-gray-600 border-gray-200',
  pending_owner_approval: 'bg-amber-100 text-amber-800 border-amber-200',
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <Badge variant="outline" className={statusStyles[status]}>
      {statusLabel(status)}
    </Badge>
  );
}
