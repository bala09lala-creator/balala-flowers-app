import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import type { Product } from '../data/catalog';
import { useCatalog } from './CatalogContext';

const STORAGE_KEY = 'cart:v2';

export type CartLine = { product: Product; quantity: number };

type CartContextValue = {
  lines: CartLine[];
  count: number;
  total: number;
  quantityOf: (productId: string) => number;
  add: (product: Product) => void;
  decrement: (productId: string) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  // Храним копию товара, чтобы корзина показывалась до загрузки каталога.
  const [items, setItems] = useState<Record<string, CartLine>>({});
  const [loaded, setLoaded] = useState(false);
  const { byId } = useCatalog();

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
    // Актуальные цена и фото — из свежего каталога, если товар в нём есть.
    const lines = Object.values(items).map((l) => ({ ...l, product: byId.get(l.product.id) ?? l.product }));
    return {
      lines,
      count: lines.reduce((sum, l) => sum + l.quantity, 0),
      total: lines.reduce((sum, l) => sum + l.quantity * l.product.price, 0),
      quantityOf: (id) => items[id]?.quantity ?? 0,
      add: (product) =>
        setItems((prev) => ({ ...prev, [product.id]: { product, quantity: (prev[product.id]?.quantity ?? 0) + 1 } })),
      decrement: (id) =>
        setItems((prev) => {
          const line = prev[id];
          if (!line) return prev;
          const next = { ...prev };
          if (line.quantity <= 1) delete next[id];
          else next[id] = { ...line, quantity: line.quantity - 1 };
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
  }, [items, byId]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
