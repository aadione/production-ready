import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { fetchSeller, type Seller } from "@/lib/seller-db";

/** Loads the seller shop that belongs to the signed-in user (RLS scoped). */
export function useSeller() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setSeller(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setSeller(await fetchSeller(user.id));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    void refresh();
  }, [authLoading, refresh]);

  return { user, seller, loading: authLoading || loading, refresh, signOut };
}
