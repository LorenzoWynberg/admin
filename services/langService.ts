'use client';

import { useLangStore, type LangCode } from '@/stores/useLangStore';
import { ensureI18nInitialized, i18n } from '@/config/i18next';

function setLangCookie(lang: LangCode) {
  try {
    document.cookie = `lang=${lang}; Path=/; Max-Age=31536000; SameSite=Lax`;
  } catch {}
}

export const Lang = {
  getActive(): LangCode {
    return useLangStore.getState().lang ?? 'en';
  },

  async setActive(lang: LangCode): Promise<void> {
    await ensureI18nInitialized();
    useLangStore.getState().setLang(lang);
    setLangCookie(lang);
    try {
      await i18n.changeLanguage(lang);
    } catch {}
  },

  hydrated(): boolean {
    return useLangStore.getState().hydrated;
  },
};
