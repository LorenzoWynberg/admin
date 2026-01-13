import { create, StateCreator } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';

type VersionsMap = Record<string, { hash: string; last_updated: string }>;

type LangStore = {
  hydrated: boolean;
  lang: string;
  setLang: (lang: string) => void;
  versions: VersionsMap;
  getVersion: (lang: string) => string;
  setVersions: (versions: VersionsMap) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
};

type MW = [['zustand/immer', never], ['zustand/persist', unknown]];

const creator: StateCreator<LangStore, MW> = (set, get) => ({
  hydrated: false,
  lang: 'en',
  setLang: (lang) =>
    set((s) => {
      s.lang = lang;
    }),
  versions: {},
  getVersion: (lang) => get().versions[lang]?.hash ?? 'latest',
  setVersions: (versions) =>
    set((s) => {
      s.versions = { ...versions };
    }),
  loading: false,
  setLoading: (loading) =>
    set((s) => {
      s.loading = loading;
    }),
});

export const useLangStore = create<LangStore>()(
  immer(
    persist(creator, {
      name: 'lang-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state): Pick<LangStore, 'lang' | 'versions'> => ({
        lang: state.lang,
        versions: state.versions,
      }),
      onRehydrateStorage: () => () => {
        useLangStore.setState({ hydrated: true });
      },
    })
  )
);
