import { useQuery } from '@tanstack/react-query';
import { AuditLogService } from '@/services/auditLogService';

interface UseAuditLogListParams {
  page?: number;
  perPage?: number;
  modelKey?: string;
  modelId?: number;
  action?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  enabled?: boolean;
}

export function useAuditLogList(params: UseAuditLogListParams = {}) {
  const { enabled = true, ...queryParams } = params;

  return useQuery({
    queryKey: ['audit-logs', 'list', queryParams],
    queryFn: () => AuditLogService.list(queryParams),
    enabled,
  });
}
