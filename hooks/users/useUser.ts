import { useQuery } from '@tanstack/react-query';
import { UserService } from '@/services/userService';

interface UseUserParams {
  enabled?: boolean;
}

export function useUser(id: number, params: UseUserParams = {}) {
  const { enabled = true } = params;

  return useQuery({
    queryKey: ['users', 'detail', id],
    queryFn: () => UserService.getById(id),
    enabled: enabled && id > 0,
  });
}
