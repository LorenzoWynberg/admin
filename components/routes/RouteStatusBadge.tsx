'use client';

import { Badge } from '@/components/ui/badge';
import { statusLabel } from '@/utils/lang';

type RouteStatus = App.Enums.RouteStatus;

const statusStyles: Record<RouteStatus, string> = {
  draft: 'bg-gray-100 text-gray-700 border-gray-200',
  scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-orange-100 text-orange-800 border-orange-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

interface RouteStatusBadgeProps {
  status: RouteStatus;
}

export function RouteStatusBadge({ status }: RouteStatusBadgeProps) {
  return (
    <Badge variant="outline" className={statusStyles[status]}>
      {statusLabel(status)}
    </Badge>
  );
}
