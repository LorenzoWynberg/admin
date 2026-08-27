import { api } from '@/lib/api/client';

type RefundRequestData = App.Data.RefundRequest.RefundRequestData;
type Single<T> = Api.Response.Single<T>;
type Multiple<T> = Api.Response.Multiple<T>;

export interface ApproveRefundRequestParams {
  /** How the refund is settled: a card reversal, or credit on the account. */
  method: string;
}

export const RefundRequestService = {
  async list(): Promise<Multiple<RefundRequestData>> {
    return api.get<Multiple<RefundRequestData>>('/refund-requests');
  },

  /** Approve a refund request (admin only), settling it card or credit. */
  async approve(
    publicId: string,
    data: ApproveRefundRequestParams
  ): Promise<Single<RefundRequestData>> {
    return api.post<Single<RefundRequestData>>(`/refund-requests/${publicId}/approve`, {
      method: data.method,
    });
  },

  async deny(publicId: string, adminNotes?: string | null): Promise<Single<RefundRequestData>> {
    return api.post<Single<RefundRequestData>>(`/refund-requests/${publicId}/deny`, {
      admin_notes: adminNotes || null,
    });
  },
};
