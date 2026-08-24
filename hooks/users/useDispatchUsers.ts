import { useUserList } from './useUserList';
import { Enums } from '@/data/app-enums';

interface UseDispatchUsersParams {
  enabled?: boolean;
}

/**
 * Lists every dispatch-role user (`filter[role]=dispatch`), for the
 * admin-only dispatcher pickers on the user/business detail cards and the
 * order reassignment dialog. Callers gate rendering behind `useRole().isAdmin`
 * — the underlying list endpoint is available to any staff user, but only an
 * admin can act on the result.
 */
export function useDispatchUsers(params: UseDispatchUsersParams = {}) {
  const { enabled = true } = params;

  return useUserList({
    role: Enums.Role.DISPATCH,
    perPage: 200,
    enabled,
  });
}
