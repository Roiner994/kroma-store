'use client';

import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types';

export type CartState = {
  items: CartItem[];
  isOpen: boolean;
};

export type CartActions = {
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
};

export type CartStore = CartState & CartActions;

const defaultInitState: CartState = {
  items: [],
  isOpen: false,
};

export const createCartStore = (initState: CartState = defaultInitState) => {
  return createStore<CartStore>()(
    persist(
      (set, get) => ({
        ...initState,
        addItem: (item) => {
          const existingKey = `${item.productId}-${item.variationId}-${item.size}`;
          const existing = get().items.find((i) => i.id === existingKey);

          if (existing) {
            set({
              items: get().items.map((i) =>
                i.id === existingKey
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            });
          } else {
            set({
              items: [...get().items, { ...item, id: existingKey }],
            });
          }
          set({ isOpen: true });
        },
        removeItem: (id) => {
          set({ items: get().items.filter((i) => i.id !== id) });
        },
        updateQuantity: (id, quantity) => {
          if (quantity <= 0) {
            set({ items: get().items.filter((i) => i.id !== id) });
          } else {
            set({
              items: get().items.map((i) =>
                i.id === id ? { ...i, quantity } : i
              ),
            });
          }
        },
        clearCart: () => set({ items: [] }),
        openCart: () => set({ isOpen: true }),
        closeCart: () => set({ isOpen: false }),
        toggleCart: () => set({ isOpen: !get().isOpen }),
        getTotal: () =>
          get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        getItemCount: () =>
          get().items.reduce((sum, item) => sum + item.quantity, 0),
      }),
      {
        name: 'kroma-cart',
        partialize: (state) => ({ items: state.items }),
      }
    )
  );
};
