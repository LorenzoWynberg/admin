'use client';

import { useEffect, useState } from 'react';
import { initI18n } from '@/config/i18next';

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await initI18n();
      } catch (err) {
        console.error('Failed to initialize i18n:', err);
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
