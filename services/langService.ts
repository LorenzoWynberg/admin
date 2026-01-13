import i18n from '@/config/i18next';
import { useLangStore } from '@/stores/useLangStore';

/**
 * LangService
 *
 * Provides a safe, non-reactive interface for managing language state globally.
 * Use this in services, utilities, or any non-React context where hooks are not allowed.
 */
export const Lang = {
  isActive: (lang: string) => useLangStore.getState().lang === lang,

  getActive: () => useLangStore.getState().lang ?? 'en',

  setActive: async (lang: string): Promise<void> => {
    if (Lang.isActive(lang)) {
      return;
    }

    useLangStore.getState().setLoading(true);

    try {
      useLangStore.getState().setLang(lang);
      await i18n.changeLanguage(lang);
    } finally {
      useLangStore.getState().setLoading(false);
    }
  },

  getVersion: (lang?: string) =>
    useLangStore.getState().getVersion(lang ?? useLangStore.getState().lang),

  getVersions: () => useLangStore.getState().versions,

  setVersions: (versions: Record<string, { hash: string; last_updated: string }>) =>
    useLangStore.getState().setVersions(versions),

  loading: () => useLangStore.getState().loading,
  setLoading: (loading: boolean) => useLangStore.getState().setLoading(loading),

  hydrated: () => useLangStore.getState().hydrated,
};
