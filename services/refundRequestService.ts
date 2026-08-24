import { api } from '@/lib/api/client';
import { appendRefundEvidence, type RefundEvidenceParams } from './refundEvidence';

type RefundRequestData = App.Data.RefundRequest.RefundRequestData;
type Single<T> = Api.Response.Single<T>;
type Multiple<T> = Api.Response.Multiple<T>;

export type ApproveRefundRequestParams = RefundEvidenceParams;

export const RefundRequestService = {
  async list(): Promise<Multiple<RefundRequestData>> {
    return api.get<Multiple<RefundRequestData>>('/refund-requests');
  },

  /**
   * Approve a refund request (admin only). Multipart because of the
   * optional proof / signed-handover-slip evidence images.
   */
  async approve(
    publicId: string,
    data: ApproveRefundRequestParams
  ): Promise<Single<RefundRequestData>> {
    const formData = new FormData();
    appendRefundEvidence(formData, data);

    return api.postMultipart<Single<RefundRequestData>>(
      `/refund-requests/${publicId}/approve`,
      formData
    );
  },

  async deny(publicId: string, adminNotes?: string | null): Promise<Single<RefundRequestData>> {
    return api.post<Single<RefundRequestData>>(`/refund-requests/${publicId}/deny`, {
      admin_notes: adminNotes || null,
    });
  },
};
