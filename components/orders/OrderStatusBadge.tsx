import { Badge } from '@/components/ui/badge';

type OrderStatus = App.Enums.OrderStatus;

const statusConfig: Record<
  OrderStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  pending: { label: 'Pending', variant: 'secondary' },
  estimated: { label: 'Quote Ready', variant: 'default' },
  approved: { label: 'Approved', variant: 'default' },
  denied: { label: 'Denied', variant: 'destructive' },
  canceled: { label: 'Canceled', variant: 'outline' },
  assigned: { label: 'Assigned', variant: 'default' },
  picking_up: { label: 'Picking Up', variant: 'default' },
  arrived_at_pickup: { label: 'At Pickup', variant: 'default' },
  picked_up: { label: 'Picked Up', variant: 'default' },
  in_transit: { label: 'In Transit', variant: 'default' },
  arrived_at_drop_off: { label: 'Arrived', variant: 'default' },
  waiting_confirmation: { label: 'Awaiting Confirm', variant: 'secondary' },
  completed: { label: 'Completed', variant: 'default' },
  delivery_failed: { label: 'Failed', variant: 'destructive' },
  returned_to_sender: { label: 'Returned', variant: 'outline' },
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: 'outline' as const };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
