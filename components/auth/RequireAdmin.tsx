'use client';

import { useEffect } from 'react';
import { useLocalizedRouter } from '@/hooks/useLocalizedRouter';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRole } from '@/hooks/auth';

interface RequireAdminProps {
  children: React.ReactNode;
}

/**
 * Gates an admin-only route segment (settings, pricing, audit logs, driver
 * creation) from the `dispatch` staff role. Mirrors the API's authorization
 * split so a dispatch user never lands on a page whose requests the API
 * would 403 — once the auth store has hydrated, a non-admin user is bounced
 * to the dashboard.
 */
export function RequireAdmin({ children }: RequireAdminProps) {
  const router = useLocalizedRouter();
  const hydrated = useAuthStore((state) => state.hydrated);
  const user = useAuthStore((state) => state.user);
  const { isAdmin } = useRole();

  const blocked = hydrated && !!user && !isAdmin;

  useEffect(() => {
    if (blocked) {
      router.replace('/');
    }
  }, [blocked, router]);

  if (!hydrated || blocked) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
