import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi, { HttpBackendOptions } from 'i18next-http-backend';

const fallbackLng = 'en';
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

const getStoredLang = (): string => {
  if (typeof window === 'undefined') return fallbackLng;
  try {
    const stored = localStorage.getItem('lang-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state?.lang || fallbackLng;
    }
  } catch {
    // ignore
  }
  return fallbackLng;
};

const getStoredVersion = (lang: string): string => {
  if (typeof window === 'undefined') return 'latest';
  try {
    const stored = localStorage.getItem('lang-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state?.versions?.[lang]?.hash || 'latest';
    }
  } catch {
    // ignore
  }
  return 'latest';
};

export const initI18n = async () => {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || '';

  return i18next
    .use(HttpApi)
    .use(initReactI18next)
    .init<HttpBackendOptions>({
      lng: getStoredLang(),
      fallbackLng,
      ns: namespaces,
      defaultNS: 'common',
      backend: {
        loadPath: (lngs: string[], namespaces: string[]): string => {
          const lng = lngs[0];
          const ns = namespaces[0];
          const version = getStoredVersion(lng);
          return `${backendUrl}/locales/${lng}/${ns}.json?v=${version}`;
        },
      },
      interpolation: {
        escapeValue: false,
        format: (value, format) => {
          if (typeof value !== 'string') {
            return value;
          }
          if (format === 'capitalize') {
            return value.charAt(0).toUpperCase() + value.slice(1);
          }
          if (format === 'uppercase') {
            return value.toUpperCase();
          }
          return value;
        },
      },
      react: {
        useSuspense: false,
      },
    });
};

export default i18next;
