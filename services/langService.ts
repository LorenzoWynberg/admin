'use client';

import { i18n, initI18n } from '@/config/i18next';
import { useLangStore } from '@/stores/useLangStore';

/**
 * LangService - Language management singleton
 */
export const Lang = {
  getActive(): string {
    return useLangStore.getState().lang ?? 'en';
  },

  isActive(lang: string): boolean {
    return useLangStore.getState().lang === lang;
  },

  async setActive(lang: string): Promise<void> {
    await initI18n();
    useLangStore.getState().setLang(lang);
    try {
      await i18n.changeLanguage(lang);
    } catch {
      // ignore
    }
  },

  hydrated(): boolean {
    return useLangStore.getState().hydrated;
  },
};
