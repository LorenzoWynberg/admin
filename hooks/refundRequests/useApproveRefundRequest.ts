import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  RefundRequestService,
  type ApproveRefundRequestParams,
} from '@/services/refundRequestService';
import { toast } from 'sonner';
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
    onError: () => {
      toast.error(crudErrorMessage('approving', 'refund_request'));
    },
  });
}
