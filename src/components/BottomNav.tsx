import { Link } from "@tanstack/react-router";
import { Home, LayoutGrid, Search, Package, CircleUser, ShoppingCart } from "lucide-react";
import { useShop } from "@/lib/shop-store";

type Item = "home" | "categories" | "search" | "orders" | "account" | "cart";

export function BottomNav({ active, cartSlot = false }: { active: Item; cartSlot?: boolean }) {
  const { cartCount } = useShop();

  const items = [
    { key: "home" as Item, label: "Home", icon: Home, to: "/" },
    { key: "categories" as Item, label: "Categories", icon: LayoutGrid, to: "/categories" },
    { key: "search" as Item, label: "Search", icon: Search, to: "/search" },
    cartSlot
      ? { key: "cart" as Item, label: "Cart", icon: ShoppingCart, to: "/cart" }
      : { key: "orders" as Item, label: "Orders", icon: Package, to: "/orders" },
    { key: "account" as Item, label: "Account", icon: CircleUser, to: "/account" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex h-[60px] md:hidden max-w-[430px] items-stretch border-t border-border bg-card pb-[env(safe-area-inset-bottom)]">
      {items.map((it) => {
        const on = it.key === active;
        const Icon = it.icon;
        return (
          <Link
            key={it.key}
            to={it.to}
            className="flex flex-1 flex-col items-center justify-center gap-1"
            aria-label={it.label}
          >
            <span className="relative">
              <Icon
                size={21}
                strokeWidth={on ? 2.4 : 1.8}
                className={on ? "text-primary" : "text-muted-foreground"}
              />
              {(it.key === "cart" || it.key === "orders") && it.to === "/cart" && cartCount > 0 && (
                <span className="label-xs absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-destructive-foreground">
                  {cartCount}
                </span>
              )}
            </span>
            <span
              className={`text-[10px] leading-none ${on ? "font-semibold text-primary" : "text-muted-foreground"}`}
            >
              {it.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
