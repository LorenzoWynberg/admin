import { useAuthStore } from '@/stores/useAuthStore';
import { Enums } from '@/data/app-enums';

/**
 * Role-derived flags for the current admin-panel user.
 *
 * Mirrors the API's authorization split between the two roles allowed into
 * the admin panel: `admin` (full access) and `dispatch` (operational
 * access only — the API 403s dispatch on settings, pricing rules,
 * currencies/exchange-rate management, audit logs, driver mutations +
 * schedule editing, and user create/delete/role changes). UI gating
 * should key off `isAdmin`; `isStaff` is true for either role.
 */
export function useRole() {
  const role = useAuthStore((state) => state.user?.role);
  const isAdmin = useAuthStore((state) => state.isAdmin());
  const isDispatch = role === Enums.Role.DISPATCH;
  const isStaff = isAdmin || isDispatch;

  return { role, isAdmin, isDispatch, isStaff };
}
