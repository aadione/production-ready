import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { allProducts, findProduct, type Product } from "./data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";
import { MAX_QTY, stockOf } from "./catalog";

type CartLine = { id: string; qty: number };

type ShopCtx = {
  cart: CartLine[];
  cartCount: number;
  cartSubtotal: number;
  cartTotal: number;
  cartLines: { product: Product; qty: number }[];
  syncing: boolean;
  add: (id: string, qty?: number) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setQty: (id: string, qty: number) => Promise<void>;
  clearCart: (ids?: string[]) => Promise<void>;
  wishlist: string[];
  toggleWish: (id: string) => void;
  notifications: number;
};

const Ctx = createContext<ShopCtx | null>(null);

const LS_CART = "jw-cart";
const LS_WISH = "jw-wish";

async function ensureCartId(userId: string) {
  const { data } = await supabase.from("carts").select("id").eq("user_id", userId).maybeSingle();
  if (data?.id) return data.id;
  const { data: created, error } = await supabase
    .from("carts")
    .insert({ user_id: userId })
    .select("id")
    .single();
  if (error) throw error;
  return created.id;
}

function snapshot(id: string) {
  const p = allProducts.find((x) => x.id === id);
  if (!p) return { product_id: id };
  return {
    product_id: id,
    product_name: p.name,
    product_image: p.image,
    product_brand: p.brand,
    shop_name: p.store ?? p.brand,
    price: p.price,
    mrp: p.mrp,
  };
}

/** Clamps a requested quantity to what is actually purchasable. */
function clampQty(id: string, qty: number) {
  const stock = stockOf(id);
  const ceiling = Math.min(MAX_QTY, stock ?? MAX_QTY);
  if (qty <= 0) return 0;
  return Math.min(Math.floor(qty), Math.max(ceiling, 0));
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [syncing, setSyncing] = useState(false);
  const cartIdRef = useRef<string | null>(null);
  const hydrated = useRef(false);
  // Serialises writes per product so rapid +/- clicks cannot race each other.
  const queues = useRef(new Map<string, Promise<unknown>>());
  const failedRef = useRef(false);

  // hydrate guest cart from localStorage
  useEffect(() => {
    try {
      const c = localStorage.getItem(LS_CART);
      const w = localStorage.getItem(LS_WISH);
      if (c) setCart(JSON.parse(c));
      if (w) setWishlist(JSON.parse(w));
    } catch {
      /* ignore */
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (hydrated.current) localStorage.setItem(LS_CART, JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    if (hydrated.current) localStorage.setItem(LS_WISH, JSON.stringify(wishlist));
  }, [wishlist]);

  // On login: merge guest cart into the user's saved cart, then use the server copy.
  useEffect(() => {
    if (!user) {
      cartIdRef.current = null;
      return;
    }
    let cancelled = false;
    (async () => {
      setSyncing(true);
      try {
        const cartId = await ensureCartId(user.id);
        cartIdRef.current = cartId;
        const { data: rows, error } = await supabase
          .from("cart_items")
          .select("product_id, quantity")
          .eq("cart_id", cartId);
        if (error) throw error;

        const server = new Map((rows ?? []).map((r) => [r.product_id, r.quantity]));
        let guest: CartLine[] = [];
        try {
          guest = JSON.parse(localStorage.getItem(LS_CART) || "[]") as CartLine[];
        } catch {
          guest = [];
        }

        for (const line of guest) {
          if (!findProduct(line.id)) continue;
          const merged = clampQty(line.id, (server.get(line.id) ?? 0) + line.qty);
          if (merged <= 0) continue;
          if (merged === server.get(line.id)) continue;
          server.set(line.id, merged);
          const { error: upErr } = await supabase
            .from("cart_items")
            .upsert(
              { cart_id: cartId, user_id: user.id, quantity: merged, ...snapshot(line.id) },
              { onConflict: "cart_id,product_id" },
            );
          if (upErr) throw upErr;
        }
        if (cancelled) return;
        setCart([...server.entries()].map(([id, qty]) => ({ id, qty })));
      } catch (e) {
        console.error("cart sync failed", e);
        if (!cancelled) toast.error("We couldn't load your saved cart. Please check your connection.");
      } finally {
        if (!cancelled) setSyncing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const persistQty = useCallback(
    async (id: string, qty: number) => {
      if (!user) return;
      const run = async () => {
        const cartId = cartIdRef.current ?? (await ensureCartId(user.id));
        cartIdRef.current = cartId;
        if (qty <= 0) {
          const { error } = await supabase
            .from("cart_items")
            .delete()
            .eq("cart_id", cartId)
            .eq("product_id", id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("cart_items")
            .upsert(
              { cart_id: cartId, user_id: user.id, quantity: qty, ...snapshot(id) },
              { onConflict: "cart_id,product_id" },
            );
          if (error) throw error;
        }
      };

      const previous = queues.current.get(id) ?? Promise.resolve();
      const next = previous
        .catch(() => undefined)
        .then(run)
        .then(() => {
          failedRef.current = false;
        })
        .catch((e) => {
          console.error("cart update failed", e);
          if (!failedRef.current) {
            failedRef.current = true;
            toast.error("Your cart couldn't be saved to your account. It's kept on this device for now.");
          }
          throw e;
        });
      queues.current.set(id, next);
      await next.catch(() => undefined);
    },
    [user],
  );

  const setLine = useCallback(
    async (id: string, requested: number) => {
      if (!findProduct(id)) {
        toast.error("This product is no longer available.");
        return;
      }
      const qty = clampQty(id, requested);
      if (requested > 0 && qty === 0) {
        toast.error("This product is out of stock right now.");
        return;
      }
      if (requested > qty && qty > 0) {
        toast.warning(`Only ${qty} left — we've set the quantity to ${qty}.`);
      }
      setCart((prev) =>
        qty <= 0
          ? prev.filter((l) => l.id !== id)
          : prev.some((l) => l.id === id)
            ? prev.map((l) => (l.id === id ? { ...l, qty } : l))
            : [...prev, { id, qty }],
      );
      await persistQty(id, qty);
    },
    [persistQty],
  );

  const cartRef = useRef(cart);
  cartRef.current = cart;

  const value = useMemo<ShopCtx>(() => {
    const lines = cart
      .map((l) => {
        const product = allProducts.find((p) => p.id === l.id);
        return product ? { product, qty: l.qty } : null;
      })
      .filter(Boolean) as { product: Product; qty: number }[];

    const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);

    return {
      cart,
      cartCount: cart.reduce((s, l) => s + l.qty, 0),
      cartSubtotal: subtotal,
      cartTotal: subtotal,
      cartLines: lines,
      syncing,
      add: async (id, qty = 1) => {
        const current = cartRef.current.find((l) => l.id === id)?.qty ?? 0;
        await setLine(id, current + qty);
      },
      remove: (id) => setLine(id, 0),
      setQty: (id, qty) => setLine(id, qty),
      clearCart: async (ids) => {
        setCart((prev) => (ids ? prev.filter((l) => !ids.includes(l.id)) : []));
        if (!user) return;
        const cartId = cartIdRef.current;
        if (!cartId) return;
        try {
          const q = supabase.from("cart_items").delete().eq("cart_id", cartId);
          if (ids) await q.in("product_id", ids);
          else await q.neq("product_id", "__none__");
        } catch (e) {
          console.error("cart clear failed", e);
        }
      },
      wishlist,
      toggleWish: (id) =>
        setWishlist((prev) => (prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id])),
      notifications: 3,
    };
  }, [cart, wishlist, syncing, user, setLine]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useShop() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}

export const deliveryFeeFor = (subtotal: number) => (subtotal >= 299 || subtotal === 0 ? 0 : 40);
