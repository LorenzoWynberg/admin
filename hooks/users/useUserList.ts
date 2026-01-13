import { useQuery } from '@tanstack/react-query';
import { UserService } from '@/services/userService';

interface UseUserListParams {
  page?: number;
  perPage?: number;
  role?: string;
  search?: string;
  enabled?: boolean;
}

export function useUserList(params: UseUserListParams = {}) {
  const { enabled = true, ...queryParams } = params;

  return useQuery({
    queryKey: ['users', 'list', queryParams],
    queryFn: () => UserService.list(queryParams),
    enabled,
  });
}
