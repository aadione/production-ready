import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  Loader2,
  LogOut,
  MapPin,
  Package,
  Pencil,
  ShoppingCart,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { BottomNav } from "@/components/BottomNav";
import { AddressManager } from "@/components/AddressManager";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account — Jamshedpurwala" },
      {
        name: "description",
        content: "Manage your Jamshedpurwala profile, saved addresses and orders, or sign in to your account.",
      },
      { property: "og:title", content: "My Account — Jamshedpurwala" },
      { property: "og:description", content: "Profile, addresses and orders in one place." },
    ],
  }),
  component: AccountPage,
});

type Profile = { full_name: string | null; email: string | null; phone: string | null };

function AccountPage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showAddresses, setShowAddresses] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoadingProfile(false);
      return;
    }
    let cancelled = false;
    setLoadingProfile(true);
    supabase
      .from("profiles")
      .select("full_name, email, phone")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        const p = (data as Profile | null) ?? { full_name: null, email: user.email ?? null, phone: null };
        setProfile(p);
        setFullName(p.full_name ?? "");
        setPhone(p.phone ?? "");
        setLoadingProfile(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, full_name: fullName.trim(), phone: phone.trim(), email: user.email ?? null });
    setSaving(false);
    if (error) {
      toast.error("Could not save your profile.");
      return;
    }
    setProfile((p) => ({ ...(p ?? { email: user.email ?? null }), full_name: fullName, phone }) as Profile);
    setEditing(false);
    toast.success("Profile updated");
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-[440px] px-4 pb-24 pt-16 text-center">
        <UserRound size={38} className="mx-auto text-muted-foreground" />
        <h1 className="mt-2 text-[18px] font-extrabold text-foreground">Your account</h1>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Login to see your orders, saved addresses and profile.
        </p>
        <Link
          to="/auth"
          search={{ redirect: "/account" }}
          className="mt-4 inline-block rounded-lg bg-primary-strong px-5 py-2.5 text-[13.5px] font-bold text-primary-foreground"
        >
          Login
        </Link>
        <Link
          to="/auth"
          search={{ redirect: "/account" }}
          className="mt-2 block text-[12.5px] font-semibold text-primary"
        >
          Create Account
        </Link>
        <BottomNav active="account" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[760px] pb-24">
      <header className="px-3 pt-5 md:px-0">
        <h1 className="text-[19px] font-bold tracking-tight text-foreground">My Account</h1>
      </header>

      <section className="px-3 pt-3 md:px-0">
        <div className="card-surface p-3">
          {loadingProfile ? (
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <Loader2 size={14} className="animate-spin" /> Loading profile…
            </div>
          ) : editing ? (
            <form onSubmit={save} className="space-y-2.5">
              <label className="block">
                <span className="text-[11px] font-semibold text-muted-foreground">Full name</span>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-border bg-surface px-3 text-[13.5px] text-foreground outline-none focus:border-primary"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold text-muted-foreground">Phone</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-border bg-surface px-3 text-[13.5px] text-foreground outline-none focus:border-primary"
                />
              </label>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-primary-strong text-[13px] font-bold text-primary-foreground disabled:opacity-60"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />} Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="h-10 flex-1 rounded-lg border border-border text-[13px] font-semibold text-foreground"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[15px] font-extrabold text-primary">
                {(profile?.full_name ?? profile?.phone ?? user.phone ?? "U").charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-bold text-foreground">
                  {profile?.full_name || "Add your name"}
                </p>
                <p className="truncate text-[12px] text-muted-foreground">
                  {profile?.phone ?? user.phone ?? profile?.email ?? user.email}
                </p>

              </div>
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1 text-[12px] font-semibold text-primary"
              >
                <Pencil size={13} /> Edit
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-2 px-3 pt-3 md:px-0">
        <Link to="/orders" className="card-surface flex items-center gap-2.5 p-3">
          <Package size={17} className="text-primary" />
          <span className="flex-1 text-[13px] font-semibold text-foreground">My Orders</span>
          <ChevronRight size={16} className="text-muted-foreground" />
        </Link>
        <Link to="/cart" className="card-surface flex items-center gap-2.5 p-3">
          <ShoppingCart size={17} className="text-primary" />
          <span className="flex-1 text-[13px] font-semibold text-foreground">My Cart</span>
          <ChevronRight size={16} className="text-muted-foreground" />
        </Link>
        <button
          onClick={() => setShowAddresses((s) => !s)}
          className="card-surface flex w-full items-center gap-2.5 p-3"
        >
          <MapPin size={17} className="text-primary" />
          <span className="flex-1 text-left text-[13px] font-semibold text-foreground">Saved Addresses</span>
          <ChevronRight
            size={16}
            className={`text-muted-foreground transition-transform ${showAddresses ? "rotate-90" : ""}`}
          />
        </button>
        {showAddresses && <AddressManager />}
        <button
          onClick={async () => {
            await signOut();
            toast.success("Logged out");
            navigate({ to: "/", replace: true });
          }}
          className="card-surface flex w-full items-center gap-2.5 p-3"
        >
          <LogOut size={17} className="text-destructive" />
          <span className="flex-1 text-left text-[13px] font-semibold text-destructive">Logout</span>
        </button>
      </section>

      <BottomNav active="account" />
    </div>
  );
}
