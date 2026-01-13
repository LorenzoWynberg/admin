'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { Auth } from '@/services/authService';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const token = useAuthStore((state) => state.token);
  const hydrated = useAuthStore((state) => state.hydrated);

  useEffect(() => {
    // Only refresh if we have a token and store is hydrated
    if (hydrated && token) {
      Auth.refresh().catch(() => {
        // Token invalid, will be cleared by refresh()
      });
    }
  }, [hydrated, token]);

  // Don't block render - just render children immediately
  return <>{children}</>;
}
