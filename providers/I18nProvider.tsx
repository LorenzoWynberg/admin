'use client';

import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18next, { initI18n } from '@/config/i18next';
import { useFetchVersions } from '@/hooks/useFetchVersions';

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [ready, setReady] = useState(false);

  // Fetch translation versions
  useFetchVersions();

  // Initialize i18next on mount
  useEffect(() => {
    if (!i18next.isInitialized) {
      initI18n()
        .then(() => setReady(true))
        .catch((err) => {
          console.error('Failed to initialize i18n:', err);
          setReady(true); // Continue anyway with fallbacks
        });
    } else {
      setReady(true);
    }
  }, []);

  // Show loading state while initializing
  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <I18nextProvider i18n={i18next}>{children}</I18nextProvider>;
}
