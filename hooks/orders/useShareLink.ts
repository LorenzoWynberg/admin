import { useQuery } from '@tanstack/react-query';
import { OrderService } from '@/services/orderService';

interface UseShareLinkStatusParams {
  publicId: string;
  enabled?: boolean;
}

/**
 * Reports whether an order currently has an active public tracking link, and
 * when it expires. Never returns the URL itself — see
 * `OrderService.getShareStatus`.
 */
export function useShareLinkStatus({ publicId, enabled = true }: UseShareLinkStatusParams) {
  return useQuery({
    queryKey: ['orders', 'share', publicId],
    queryFn: () => OrderService.getShareStatus(publicId),
    enabled: enabled && !!publicId,
  });
}
