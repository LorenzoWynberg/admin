'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector, { type DetectorOptions } from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';

const defaultLocale = 'en';
const supportedLngs = ['en', 'es', 'fr'] as const;
const namespaces = [
  'addresses',
  'auth',
  'cache',
  'common',
  'http',
  'models',
  'orders',
  'pagination',
  'languages',
  'passwords',
  'resource',
  'validation',
];

let initialized = false;

function detectLocaleFromPath(pathname: string): string {
  if (!pathname) return defaultLocale;
  const seg = pathname.split('/').filter(Boolean)[0];
  return (supportedLngs as readonly string[]).includes(seg) ? seg : defaultLocale;
}

export async function initI18n(pathname?: string) {
  if (initialized) return i18n;

  const lng =
    typeof window !== 'undefined'
      ? detectLocaleFromPath(window.location.pathname)
      : detectLocaleFromPath(pathname || '/');

  await i18n
    .use(initReactI18next)
    .use(LanguageDetector)
    .use(
      resourcesToBackend((language: string, namespace: string) =>
        fetch(`/locales/${language}/${namespace}.json`).then((res) => res.json())
      )
    )
    .init({
      lng,
      fallbackLng: defaultLocale,
      supportedLngs: Array.from(supportedLngs),
      ns: namespaces,
      defaultNS: 'common',
      interpolation: { escapeValue: false },
      detection: {
        order: ['path', 'cookie', 'navigator'],
        lookupFromPathIndex: 0,
        cookieName: 'lang',
      } as DetectorOptions,
      react: {
        useSuspense: false,
      },
    });

  initialized = true;
  return i18n;
}

export { i18n };
export default i18n;
