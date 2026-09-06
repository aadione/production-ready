import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Loader2, LayoutDashboard, Package, Store, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useSeller } from "@/lib/seller";
import type { Seller } from "@/lib/seller-db";

const tabs = [
  { to: "/seller/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/seller/products", label: "Products", icon: Package },
  { to: "/seller/shop", label: "Shop", icon: Store },
] as const;

/**
 * Guard + chrome for every Seller Center screen. Customers without a seller
 * shop are sent to the seller login page; the customer UI is untouched.
 */
export function SellerShell({
  active,
  title,
  children,
}: {
  active: "dashboard" | "products" | "shop";
  title: string;
  children: (ctx: { seller: Seller; refresh: () => Promise<void> }) => ReactNode;
}) {
  const { seller, loading, refresh, signOut } = useSeller();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !seller) navigate({ to: "/seller/login", replace: true });
  }, [loading, seller, navigate]);

  if (loading || !seller) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[860px] px-3 pb-16 pt-5 md:px-0">
      <header className="flex items-center gap-3">
        {seller.logo_url ? (
          <img
            src={seller.logo_url}
            alt={`${seller.shop_name} logo`}
            className="h-11 w-11 rounded-full border border-border object-cover"
          />
        ) : (
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-[15px] font-extrabold text-primary">
            {seller.shop_name.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-bold leading-tight text-foreground">
            {seller.shop_name}
          </p>
          <p className="truncate text-[11.5px] text-muted-foreground">Seller Center · {title}</p>
        </div>
        <button
          onClick={async () => {
            await signOut();
            toast.success("Logged out");
            navigate({ to: "/seller/login", replace: true });
          }}
          className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[12px] font-semibold text-destructive"
        >
          <LogOut size={13} /> Logout
        </button>
      </header>

      <nav className="mt-3 flex gap-1.5 overflow-x-auto">
        {tabs.map((t) => {
          const on = t.to.endsWith(active);
          const Icon = t.icon;
          return (
            <Link
              key={t.to}
              to={t.to}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-semibold ${
                on
                  ? "bg-primary-strong text-primary-foreground"
                  : "border border-border text-foreground"
              }`}
            >
              <Icon size={14} /> {t.label}
            </Link>
          );
        })}
      </nav>

      <div className="pt-3">{children({ seller, refresh })}</div>
    </div>
  );
}
