import { api } from '@/lib/api/client';

type FeasibilityResult = App.Data.Feasibility.FeasibilityResult;
type Single<T> = Api.Response.Single<T>;

export const FeasibilityService = {
  async check(orderPublicId: string): Promise<FeasibilityResult> {
    const response = await api.get<Single<FeasibilityResult>>(
      `/orders/${orderPublicId}/feasibility`
    );
    return response.item;
  },
};
