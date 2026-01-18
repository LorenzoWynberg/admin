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
  status?: App.Enums.PricingRuleStatus;
}

interface CalculateParams {
  distanceKm: number;
}

interface CalculateResult {
  pricingRuleId: number;
  baseFare: number;
  distanceFee: number;
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
}

function buildQueryString(params: ListParams): string {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.perPage) query.set('per_page', String(params.perPage));
  if (params.status) query.set('status', params.status);
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
   * Clone a pricing rule to create a new draft
   */
  async clone(id: number, name?: string): Promise<PricingRuleData> {
    const response = await api.post<Single<PricingRuleData>>(`/pricing-rules/${id}/clone`, {
      name,
    });
    return response.item;
  },

  /**
   * Calculate fare for a given distance using the active pricing rule
   */
  async calculate(params: CalculateParams): Promise<CalculateResult> {
    const query = new URLSearchParams();
    query.set('distance_km', String(params.distanceKm));
    const response = await api.get<Single<CalculateResult>>(
      `/pricing-rules/calculate?${query.toString()}`
    );
    return response.item;
  },
};
