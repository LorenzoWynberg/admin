'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { Auth } from '@/services/authService';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const hydrated = useAuthStore((state) => state.hydrated);
  const token = useAuthStore((state) => state.token);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hydrated) return;

    // If we have a token, refresh user data
    if (token) {
      Auth.refresh().finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, [hydrated, token]);

  // Wait for hydration and initial auth check
  if (!hydrated || !ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
