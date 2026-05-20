'use client';

import { createContext, useState, useContext, type ReactNode } from 'react';
import { useStore } from 'zustand';
import { createCartStore, type CartStore } from '@/stores/cart-store';
import { createFiltersStore, type FiltersStore } from '@/stores/filters-store';

// =====================
// Cart Store Provider
// =====================

type CartStoreApi = ReturnType<typeof createCartStore>;

const CartStoreContext = createContext<CartStoreApi | undefined>(undefined);

export function CartStoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => createCartStore());
  return (
    <CartStoreContext.Provider value={store}>
      {children}
    </CartStoreContext.Provider>
  );
}

export function useCartStore<T>(selector: (state: CartStore) => T): T {
  const store = useContext(CartStoreContext);
  if (!store) throw new Error('Missing CartStoreProvider');
  return useStore(store, selector);
}

// =====================
// Filters Store Provider
// =====================

type FiltersStoreApi = ReturnType<typeof createFiltersStore>;

const FiltersStoreContext = createContext<FiltersStoreApi | undefined>(undefined);

export function FiltersStoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => createFiltersStore());
  return (
    <FiltersStoreContext.Provider value={store}>
      {children}
    </FiltersStoreContext.Provider>
  );
}

export function useFiltersStore<T>(selector: (state: FiltersStore) => T): T {
  const store = useContext(FiltersStoreContext);
  if (!store) throw new Error('Missing FiltersStoreProvider');
  return useStore(store, selector);
}
