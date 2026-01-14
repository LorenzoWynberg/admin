'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export type LangCode = 'en' | 'es' | 'fr';

export type LangState = {
  hydrated: boolean;
  lang: LangCode;
  setLang: (lang: LangCode) => void;
};

const initialState: Omit<LangState, 'setLang'> = {
  hydrated: false,
  lang: 'en',
};

export const useLangStore = create<LangState>()(
  persist(
    immer((set) => ({
      ...initialState,
      setLang: (lang: LangCode) =>
        set((s) => {
          s.lang = lang;
        }),
    })),
    {
      name: 'lang-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ lang: state.lang }),
      onRehydrateStorage: () => () => {
        setTimeout(() => {
          useLangStore.setState({ hydrated: true } as Partial<LangState>);
        }, 0);
      },
    },
  ),
);
