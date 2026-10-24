import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { getProduct, Product } from '../data/products';

const STORAGE_KEY = 'cart:v1';

export type CartLine = { product: Product; quantity: number };

type CartContextValue = {
  lines: CartLine[];
  count: number;
  total: number;
  add: (productId: string) => void;
  decrement: (productId: string) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  // productId -> quantity
  const [items, setItems] = useState<Record<string, number>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setItems(JSON.parse(raw));
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items)).catch(() => {});
  }, [items, loaded]);

  const value = useMemo<CartContextValue>(() => {
    const lines = Object.entries(items).flatMap(([id, quantity]) => {
      const product = getProduct(id);
      return product && quantity > 0 ? [{ product, quantity }] : [];
    });
    return {
      lines,
      count: lines.reduce((sum, l) => sum + l.quantity, 0),
      total: lines.reduce((sum, l) => sum + l.quantity * l.product.price, 0),
      add: (id) => setItems((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 })),
      decrement: (id) =>
        setItems((prev) => {
          const next = { ...prev };
          if ((next[id] ?? 0) <= 1) delete next[id];
          else next[id] -= 1;
          return next;
        }),
      remove: (id) =>
        setItems((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        }),
      clear: () => setItems({}),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
