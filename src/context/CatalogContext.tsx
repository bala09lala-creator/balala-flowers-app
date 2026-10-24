import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { fetchCatalog } from '../api/client';
import type { Product } from '../data/catalog';

const STORAGE_KEY = 'catalog:v1';

type CatalogContextValue = {
  products: Product[];
  byId: Map<string, Product>;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // setState вызывается только в колбэках промиса — после ответа сервера.
  const load = useCallback(
    () =>
      fetchCatalog()
        .then((data) => {
          setProducts(data.products);
          setError(null);
          AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data.products)).catch(() => {});
        })
        .catch((e) => setError(e instanceof Error ? e.message : 'Не удалось загрузить каталог'))
        .finally(() => setLoading(false)),
    [],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    await load();
  }, [load]);

  useEffect(() => {
    // Сначала показываем сохранённый каталог, затем обновляем его с сервера.
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setProducts((current) => (current.length ? current : JSON.parse(raw)));
      })
      .catch(() => {});
    load();
  }, [load]);

  const value = useMemo(
    () => ({ products, byId: new Map(products.map((p) => [p.id, p])), loading, error, refresh }),
    [products, loading, error, refresh],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogContextValue {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used inside CatalogProvider');
  return ctx;
}
