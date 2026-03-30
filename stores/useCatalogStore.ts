import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';

type CatalogData = App.Data.Catalog.CatalogData;
type CatalogElementData = App.Data.CatalogElement.CatalogElementData;

interface CatalogState {
  catalogs: CatalogData[];
  elements: CatalogElementData[];
}

interface CatalogActions {
  setCatalogs: (catalogs: CatalogData[]) => void;
  setElements: (elements: CatalogElementData[]) => void;
  reset: () => void;

  // Helpers
  getCatalogByCode: (code: string) => CatalogData | undefined;
  getCatalogById: (id: number) => CatalogData | undefined;
  getElementById: (id: number) => CatalogElementData | undefined;
  getElementByCode: (catalogCode: string, elementCode: string) => CatalogElementData | undefined;
  getElementsByCatalogCode: (catalogCode: string) => CatalogElementData[];
  getElementsByCatalogId: (catalogId: number) => CatalogElementData[];
}

type CatalogStore = CatalogState & CatalogActions;

export const useCatalogStore = create<CatalogStore>()(
  immer(
    persist(
      (set, get) => ({
        catalogs: [],
        elements: [],

        setCatalogs: (catalogs) =>
          set((state) => {
            state.catalogs = catalogs;
          }),

        setElements: (elements) =>
          set((state) => {
            state.elements = elements;
          }),

        reset: () =>
          set((state) => {
            state.catalogs = [];
            state.elements = [];
          }),

        // Helpers
        getCatalogByCode: (code) => {
          return get().catalogs.find((c) => c.code === code);
        },

        getCatalogById: (id) => {
          return get().catalogs.find((c) => c.id === id);
        },

        getElementById: (id) => {
          return get().elements.find((e) => e.id === id);
        },

        getElementByCode: (catalogCode, elementCode) => {
          const catalog = get().getCatalogByCode(catalogCode);
          if (!catalog) return undefined;
          return get().elements.find((e) => e.catalogId === catalog.id && e.code === elementCode);
        },

        getElementsByCatalogCode: (catalogCode) => {
          const catalog = get().getCatalogByCode(catalogCode);
          if (!catalog) return [];
          return get().elements.filter((e) => e.catalogId === catalog.id);
        },

        getElementsByCatalogId: (catalogId) => {
          return get().elements.filter((e) => e.catalogId === catalogId);
        },
      }),
      {
        name: 'admin-catalog-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          catalogs: state.catalogs,
          elements: state.elements,
        }),
      }
    )
  )
);
