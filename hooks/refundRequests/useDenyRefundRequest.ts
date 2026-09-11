import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RefundRequestService } from '@/services/refundRequestService';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { isApiError } from '@/lib/api/error';

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
    // A denial can be refused for reasons the admin can act on — a request
    // another admin already resolved, most of all — and the message arrives
    // already translated. The generic fallback stays for a transport failure,
    // which carries nothing worth showing.
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
        return;
      }

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
