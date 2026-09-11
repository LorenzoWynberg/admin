import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  RefundRequestService,
  type ApproveRefundRequestParams,
} from '@/services/refundRequestService';
import { toast } from 'sonner';
import { isApiError } from '@/lib/api/error';
import { crudErrorMessage, crudSuccessMessage } from '@/utils/lang';

interface ApproveRefundRequestArgs {
  publicId: string;
  data: ApproveRefundRequestParams;
}

export function useApproveRefundRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId, data }: ApproveRefundRequestArgs) =>
      RefundRequestService.approve(publicId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refund-requests'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success(crudSuccessMessage('approved', 'refund_request'));
    },
    // The API refuses an approval for reasons the admin can act on — a
    // gateway refund on an account-billed delivery, a charge already given
    // back — and each one arrives already translated. A generic "error
    // approving" in its place tells them nothing about what to change.
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error(crudErrorMessage('approving', 'refund_request'));
      }
    },
  });
}
