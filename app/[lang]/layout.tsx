'use client';

import { ReactNode, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { I18nProvider } from '@/providers/I18nProvider';
import { AuthProvider } from '@/providers/AuthProvider';

const supportedLangs = ['en', 'es', 'fr'];

export default function LangLayout({ children }: Readonly<{ children: ReactNode }>) {
  const params = useParams();
  const lang = (params?.lang as string) || 'en';
  const validLang = supportedLangs.includes(lang) ? lang : 'en';

  // Update html lang attribute
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = validLang;
    }
  }, [validLang]);

  return (
    <I18nProvider>
      <AuthProvider>{children}</AuthProvider>
    </I18nProvider>
  );
}
