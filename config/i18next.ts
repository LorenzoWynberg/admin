'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector, { type DetectorOptions } from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

const defaultLocale = 'en';
const supportedLngs = ['en', 'es', 'fr'] as const;

// Locale JSON are static files served by nginx, which emits no CORS headers,
// so we fetch them same-origin (`/locales/...`) and let the Next.js rewrite in
// next.config.ts forward them to the API server-side. See next.config.ts.
const namespaces = [
  'addresses',
  'audit_logs',
  'auth',
  'businesses',
  'catalogs',
  'chat',
  'common',
  'currencies',
  'drivers',
  'errors',
  'http',
  'languages',
  'models',
  'notifications',
  'orders',
  'pagination',
  'passwords',
  'payments',
  'pricing',
  'quotes',
  'resource',
  'routes',
  'statuses',
  'tax',
  'users',
  'validation',
] as const;

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
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['path', 'cookie', 'navigator'],
        lookupFromPathIndex: 0,
        cookieName: 'lang',
      } as DetectorOptions,
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
        requestOptions: {
          cache: 'no-store',
        },
      },
      react: {
        useSuspense: false,
      },
    });

  // i18next 26 removed interpolation.format; register the named formatter via the
  // formatter API instead (matches laravel-to-i18next output, e.g. {{x, capitalize}}).
  i18n.services.formatter?.add('capitalize', (value) =>
    typeof value === 'string' ? value.charAt(0).toUpperCase() + value.slice(1) : String(value),
  );

  initialized = true;
  return i18n;
}

export { i18n };
export default i18n;
