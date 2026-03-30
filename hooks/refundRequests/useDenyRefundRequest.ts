import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RefundRequestService } from '@/services/refundRequestService';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export function useDenyRefundRequest() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId, adminNotes }: { publicId: string; adminNotes?: string | null }) =>
      RefundRequestService.deny(publicId, adminNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refund-requests'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success(t('payments:refund_request.denied', { defaultValue: 'Refund request denied' }));
    },
    onError: () => {
      toast.error(
        t('resource:error.updating', {
          count: 1,
          resource: t('models:refund_request', { count: 1 }),
          defaultValue: 'Failed to deny refund request',
        })
      );
    },
  });
}
