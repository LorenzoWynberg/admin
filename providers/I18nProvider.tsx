'use client';

import { useEffect, useState, useCallback } from 'react';
import { initI18n, i18n } from '@/config/i18next';

interface I18nProviderProps {
  children: React.ReactNode;
  lang: string;
}

export function I18nProvider({ children, lang }: I18nProviderProps) {
  const [ready, setReady] = useState(false);
  const [currentLang, setCurrentLang] = useState(lang);

  // Initialize i18next
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await initI18n();
        // After init, change to the correct language and wait for it
        if (i18n.language !== lang) {
          await i18n.changeLanguage(lang);
        }
      } catch (err) {
        console.error('Failed to initialize i18n:', err);
      } finally {
        if (alive) {
          setCurrentLang(lang);
          setReady(true);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [lang]);

  // Sync language when URL changes (navigation between /en/ and /es/)
  useEffect(() => {
    if (ready && currentLang !== lang) {
      setReady(false); // Hide content while loading new translations
      i18n.changeLanguage(lang).then(() => {
        setCurrentLang(lang);
        setReady(true);
      });
    }
  }, [ready, lang, currentLang]);

  if (!ready) {
    return null;
  }

  return <>{children}</>;
}
