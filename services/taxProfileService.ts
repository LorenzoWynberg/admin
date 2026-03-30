import { api } from '@/lib/api/client';

type Single<T> = Api.Response.Single<T>;
type TaxProfileData = App.Data.TaxProfile.TaxProfileData;

export const TaxProfileService = {
  async getForBusiness(businessPid: string): Promise<TaxProfileData | null> {
    const res = await api.get<Single<TaxProfileData | null>>(
      `/businesses/${businessPid}/tax-profile`
    );
    return res.item;
  },
};
