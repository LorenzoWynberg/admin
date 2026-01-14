import { create, StateCreator } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';

type LangStore = {
  hydrated: boolean;
  lang: string;
  setLang: (lang: string) => void;
};

type MW = [['zustand/immer', never], ['zustand/persist', unknown]];

const creator: StateCreator<LangStore, MW> = (set) => ({
  hydrated: false,
  lang: 'en',
  setLang: (lang) =>
    set((s) => {
      s.lang = lang;
    }),
});

export const useLangStore = create<LangStore>()(
  immer(
    persist(creator, {
      name: 'lang-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state): Pick<LangStore, 'lang'> => ({
        lang: state.lang,
      }),
      onRehydrateStorage: () => () => {
        useLangStore.setState({ hydrated: true });
      },
    })
  )
);
