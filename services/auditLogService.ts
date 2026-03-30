import { api } from '@/lib/api/client';

type AuditLogData = App.Data.AuditLog.AuditLogData;
type Paginated<T> = Api.Response.Paginated<T>;

interface ListParams {
  page?: number;
  perPage?: number;
  modelKey?: string;
  action?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
}

function buildQueryString(params: ListParams): string {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.perPage) query.set('perPage', String(params.perPage));
  if (params.modelKey) query.set('model_key', params.modelKey);
  if (params.action) query.set('action', params.action);
  if (params.search) query.set('search', params.search);
  if (params.fromDate) query.set('from_date', params.fromDate);
  if (params.toDate) query.set('to_date', params.toDate);
  return query.toString();
}

export const AuditLogService = {
  async list(params: ListParams = {}): Promise<Paginated<AuditLogData>> {
    const query = buildQueryString(params);
    const url = `/audit-logs${query ? `?${query}` : ''}`;
    return api.get<Paginated<AuditLogData>>(url);
  },
};
