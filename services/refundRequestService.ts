import { api } from '@/lib/api/client';

type RefundRequestData = App.Data.RefundRequest.RefundRequestData;
type Single<T> = Api.Response.Single<T>;
type Multiple<T> = Api.Response.Multiple<T>;

export const RefundRequestService = {
  async list(): Promise<Multiple<RefundRequestData>> {
    return api.get<Multiple<RefundRequestData>>('/refund-requests');
  },

  async approve(publicId: string): Promise<Single<RefundRequestData>> {
    return api.post<Single<RefundRequestData>>(`/refund-requests/${publicId}/approve`);
  },

  async deny(publicId: string, adminNotes?: string | null): Promise<Single<RefundRequestData>> {
    return api.post<Single<RefundRequestData>>(`/refund-requests/${publicId}/deny`, {
      admin_notes: adminNotes || null,
    });
  },
};
