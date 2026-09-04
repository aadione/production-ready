import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { allProducts } from "./data";

/**
 * The product catalogue lives in the database (prices, MRP and stock).
 * The local `data.ts` catalogue stays as the source of images/copy and as an
 * offline fallback, so the UI renders identically while the real numbers come
 * from Supabase. The server re-validates everything again when an order is placed.
 */

export const MAX_QTY = 20;

const stockMap = new Map<string, number>();

/** Live stock for a product, or `undefined` while the catalogue is loading. */
export const stockOf = (id: string) => stockMap.get(id);

type CatalogState = {
  loading: boolean;
  error: string | null;
  /** Bumped whenever database prices/stock are applied, so prices re-render. */
  version: number;
  reload: () => void;
};

const Ctx = createContext<CatalogState>({
  loading: false,
  error: null,
  version: 0,
  reload: () => {},
});

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ loading: boolean; error: string | null; version: number }>({
    loading: true,
    error: null,
    version: 0,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, brand, name, price, mrp, stock, is_active");
      if (error) throw error;
      for (const row of data ?? []) {
        stockMap.set(row.id, row.is_active ? Number(row.stock) : 0);
        const local = allProducts.find((p) => p.id === row.id);
        if (local) {
          local.price = Number(row.price);
          local.mrp = Number(row.mrp);
        }
      }
      setState((s) => ({ loading: false, error: null, version: s.version + 1 }));
    } catch {
      setState((s) => ({
        ...s,
        loading: false,
        error: "We couldn't refresh live prices and stock. Showing the last known catalogue.",
      }));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const value = useMemo<CatalogState>(() => ({ ...state, reload: load }), [state, load]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCatalog() {
  return useContext(Ctx);
}

/** Subscribes the component to catalogue updates and returns live stock. */
export function useStock(id: string) {
  useCatalog();
  return stockMap.get(id);
}
