'use client';

import { useEffect, useState } from 'react';
import { ensureI18nInitialized } from '@/config/i18next';

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await ensureI18nInitialized();
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (!ready) {
    return null;
  }

  return <>{children}</>;
}
