import { api } from '@/lib/api/client';

type PricingRuleData = App.Data.Pricing.PricingRuleData;
type StorePricingRuleData = App.Data.Pricing.StorePricingRuleData;
type UpdatePricingRuleData = App.Data.Pricing.UpdatePricingRuleData;
type Single<T> = Api.Response.Single<T>;
type Paginated<T> = Api.Response.Paginated<T>;
type SuccessBasic = Api.Response.SuccessBasic;

interface ListParams {
  page?: number;
  perPage?: number;
  currency?: string;
}

interface CalculateParams {
  currency: string;
  distanceKm: number;
}

interface CalculateResult {
  baseFare: number;
  distanceFee: number;
  subtotal: number;
  tax: number;
  total: number;
}

function buildQueryString(params: ListParams): string {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.perPage) query.set('per_page', String(params.perPage));
  if (params.currency) query.set('currency', params.currency);
  return query.toString();
}

export const PricingService = {
  /**
   * List pricing rules with pagination and filters
   */
  async list(params: ListParams = {}): Promise<Paginated<PricingRuleData>> {
    const query = buildQueryString(params);
    const url = `/pricing-rules${query ? `?${query}` : ''}`;
    return api.get<Paginated<PricingRuleData>>(url);
  },

  /**
   * Get a single pricing rule by ID
   */
  async getById(id: number): Promise<PricingRuleData> {
    const response = await api.get<Single<PricingRuleData>>(`/pricing-rules/${id}`);
    return response.item;
  },

  /**
   * Create a new pricing rule
   */
  async create(data: StorePricingRuleData): Promise<PricingRuleData> {
    const response = await api.post<Single<PricingRuleData>>('/pricing-rules', data);
    return response.item;
  },

  /**
   * Update an existing pricing rule
   */
  async update(id: number, data: UpdatePricingRuleData): Promise<PricingRuleData> {
    const response = await api.patch<Single<PricingRuleData>>(`/pricing-rules/${id}`, data);
    return response.item;
  },

  /**
   * Delete a pricing rule
   */
  async destroy(id: number): Promise<SuccessBasic> {
    return api.destroy<SuccessBasic>(`/pricing-rules/${id}`);
  },

  /**
   * Activate a pricing rule
   */
  async activate(id: number): Promise<PricingRuleData> {
    const response = await api.post<Single<PricingRuleData>>(`/pricing-rules/${id}/activate`);
    return response.item;
  },

  /**
   * Deactivate a pricing rule
   */
  async deactivate(id: number): Promise<PricingRuleData> {
    const response = await api.post<Single<PricingRuleData>>(`/pricing-rules/${id}/deactivate`);
    return response.item;
  },

  /**
   * Duplicate a pricing rule
   */
  async duplicate(id: number, name?: string): Promise<PricingRuleData> {
    const response = await api.post<Single<PricingRuleData>>(`/pricing-rules/${id}/duplicate`, {
      name,
    });
    return response.item;
  },

  /**
   * Calculate fare for a given distance and currency
   */
  async calculate(params: CalculateParams): Promise<CalculateResult> {
    const response = await api.post<Single<CalculateResult>>('/pricing-rules/calculate', {
      currency: params.currency,
      distance_km: params.distanceKm,
    });
    return response.item;
  },
};
