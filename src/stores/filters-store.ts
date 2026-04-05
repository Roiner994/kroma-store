'use client';

import { createStore } from 'zustand/vanilla';

export type FiltersState = {
  categories: string[];
  sizes: string[];
  colors: string[];
};

export type FiltersActions = {
  toggleCategory: (category: string) => void;
  toggleSize: (size: string) => void;
  toggleColor: (color: string) => void;
  clearAll: () => void;
  hasActiveFilters: () => boolean;
};

export type FiltersStore = FiltersState & FiltersActions;

const defaultInitState: FiltersState = {
  categories: [],
  sizes: [],
  colors: [],
};

export const createFiltersStore = (initState: FiltersState = defaultInitState) => {
  return createStore<FiltersStore>()((set, get) => ({
    ...initState,
    toggleCategory: (category) => {
      const current = get().categories;
      set({
        categories: current.includes(category)
          ? current.filter((c) => c !== category)
          : [...current, category],
      });
    },
    toggleSize: (size) => {
      const current = get().sizes;
      set({
        sizes: current.includes(size)
          ? current.filter((s) => s !== size)
          : [...current, size],
      });
    },
    toggleColor: (color) => {
      const current = get().colors;
      set({
        colors: current.includes(color)
          ? current.filter((c) => c !== color)
          : [...current, color],
      });
    },
    clearAll: () => set({ categories: [], sizes: [], colors: [] }),
    hasActiveFilters: () => {
      const state = get();
      return state.categories.length > 0 || state.sizes.length > 0 || state.colors.length > 0;
    },
  }));
};
