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
  in_transit: { label: 'In Transit', variant: 'default' },
  arrived_at_drop_off: { label: 'Arrived', variant: 'default' },
  completed: { label: 'Completed', variant: 'default' },
  delivery_failed: { label: 'Failed', variant: 'destructive' },
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: 'outline' as const };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
