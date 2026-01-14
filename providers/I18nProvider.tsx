'use client';

import { useEffect, useState } from 'react';
import { initI18n, i18n } from '@/config/i18next';

interface I18nProviderProps {
  children: React.ReactNode;
  lang: string;
}

export function I18nProvider({ children, lang }: I18nProviderProps) {
  const [ready, setReady] = useState(false);

  // Initialize i18next
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

  // Sync language when it changes (e.g., navigating from /en/ to /es/)
  useEffect(() => {
    if (ready && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [ready, lang]);

  if (!ready) {
    return null;
  }

  return <>{children}</>;
}
