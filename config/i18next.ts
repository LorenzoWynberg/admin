'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector, { type DetectorOptions } from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

const defaultLocale = 'en';
const supportedLngs = ['en', 'es', 'fr'] as const;
const namespaces = [
  'addresses',
  'auth',
  'businesses',
  'catalogs',
  'common',
  'drivers',
  'http',
  'languages',
  'models',
  'orders',
  'pagination',
  'passwords',
  'quotes',
  'resource',
  'users',
  'validation',
] as const;
const defaultNS = 'common';

let initialized = false;

function detectLocaleFromPath(pathname: string): string {
  if (!pathname) return defaultLocale;
  const seg = pathname.split('/').filter(Boolean)[0];
  return (supportedLngs as readonly string[]).includes(seg) ? seg : defaultLocale;
}

export async function ensureI18nInitialized(pathname?: string) {
  if (initialized) return i18n;

  const lng =
    typeof window !== 'undefined'
      ? detectLocaleFromPath(window.location.pathname)
      : detectLocaleFromPath(pathname || '/');

  await i18n
    .use(initReactI18next)
    .use(LanguageDetector)
    .use(HttpBackend)
    .init({
      lng,
      fallbackLng: defaultLocale,
      supportedLngs: Array.from(supportedLngs),
      ns: Array.from(namespaces),
      defaultNS: 'common',
      preload: [lng],
      interpolation: { escapeValue: false },
      detection: {
        order: ['path', 'cookie', 'navigator'],
        lookupFromPathIndex: 0,
        cookieName: 'lang',
      } as DetectorOptions,
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },
      react: {
        useSuspense: false,
      },
    });

  initialized = true;
  return i18n;
}

export { i18n };
export default i18n;
