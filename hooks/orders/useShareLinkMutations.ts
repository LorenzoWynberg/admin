import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import i18next from '@/config/i18next';
import { OrderService } from '@/services/orderService';
import { isApiError } from '@/lib/api/error';
import { crudErrorMessage } from '@/utils/lang';

/**
 * Mints (or rotates) an order's public tracking link. On success the share
 * status query is seeded directly from the mint response rather than
 * invalidated — a refetch would only re-confirm the same expiry the mint
 * response already carries, and `GET` can never return the URL, so nothing
 * is gained by round-tripping.
 */
export function useMintShareLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (publicId: string) => OrderService.mintShareLink(publicId),
    onSuccess: (data, publicId) => {
      queryClient.setQueryData(['orders', 'share', publicId], {
        shareExpiresAt: data.shareExpiresAt,
      });
      toast.success(
        i18next.t('orders:share.toast_minted', { defaultValue: 'Tracking link ready to share.' })
      );
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error(crudErrorMessage('updating', 'order'));
      }
    },
  });
}

/**
 * Revokes an order's active public tracking link, if any.
 */
export function useRevokeShareLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (publicId: string) => OrderService.revokeShareLink(publicId),
    onSuccess: (_data, publicId) => {
      queryClient.setQueryData(['orders', 'share', publicId], null);
      toast.success(
        i18next.t('orders:share.toast_revoked', { defaultValue: 'Tracking link revoked.' })
      );
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error(crudErrorMessage('updating', 'order'));
      }
    },
  });
}
