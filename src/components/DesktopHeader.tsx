import { Link } from "@tanstack/react-router";
import { MapPin, Search, ShoppingCart, Bell, Heart, Store, LayoutGrid, Home } from "lucide-react";
import { useShop } from "@/lib/shop-store";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/categories", label: "Categories", icon: LayoutGrid },
  { to: "/search", label: "Search", icon: Search },
  { to: "/store", label: "Stores", icon: Store },
] as const;

/** Desktop-only top bar. Hidden on mobile, where BottomNav takes over. */
export function DesktopHeader() {
  const { cartCount, notifications } = useShop();

  return (
    <header className="sticky top-0 z-50 hidden border-b border-border bg-card/85 backdrop-blur md:block">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center gap-6 px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-[15px] font-extrabold text-primary-foreground">
            J
          </span>
          <span className="text-[17px] font-extrabold tracking-tight text-foreground">
            Jamshedpur<span className="text-primary">wala</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-surface hover:text-primary"
              activeProps={{ className: "text-primary bg-primary-soft" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              <l.icon size={15} /> {l.label}
            </Link>
          ))}
        </nav>

        <Link
          to="/search"
          className="ml-auto flex h-10 max-w-[420px] flex-1 items-center gap-2 rounded-xl border border-border bg-surface px-3 transition-shadow hover:shadow-[var(--shadow-card)]"
        >
          <Search size={16} className="text-muted-foreground" />
          <span className="truncate text-[13px] text-subtle">
            Search products, brands or stores…
          </span>
        </Link>

        <span className="hidden items-center gap-1.5 text-[12px] text-muted-foreground lg:flex">
          <MapPin size={14} className="text-primary" /> Bistupur, 831001
        </span>

        <div className="flex items-center gap-4">
          <span className="relative">
            <Bell size={19} strokeWidth={1.8} className="text-foreground" />
            {notifications > 0 && (
              <span className="label-xs absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-destructive-foreground">
                {notifications}
              </span>
            )}
          </span>
          <Heart size={19} strokeWidth={1.8} className="text-foreground" />
          <Link to="/cart" className="relative" aria-label="Cart">
            <ShoppingCart size={19} strokeWidth={1.8} className="text-foreground" />
            {cartCount > 0 && (
              <span className="label-xs absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-destructive-foreground">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
