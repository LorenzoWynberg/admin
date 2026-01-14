'use client';

import { useRouter, useParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

/**
 * Hook for language-aware navigation
 * Automatically prefixes all paths with the current language
 */
export function useLocalizedRouter() {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || 'en';

  const withLang = useCallback(
    (href: string) => {
      if (href.startsWith('http')) return href;
      return `/${lang}${href.startsWith('/') ? href : '/' + href}`;
    },
    [lang],
  );

  const push = useCallback((href: string) => router.push(withLang(href)), [router, withLang]);

  const replace = useCallback((href: string) => router.replace(withLang(href)), [router, withLang]);

  return useMemo(
    () => ({
      push,
      replace,
      withLang,
      lang,
      back: router.back,
      forward: router.forward,
      refresh: router.refresh,
    }),
    [push, replace, withLang, lang, router],
  );
}
