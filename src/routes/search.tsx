import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { ArrowLeft, Search as SearchIcon, X, Mic, ShoppingCart, SlidersHorizontal, ChevronDown, Tag } from "lucide-react";
import { allProducts, products, stores } from "@/lib/data";
import { useShop } from "@/lib/shop-store";
import { BottomNav } from "@/components/BottomNav";
import { ProductCardRail } from "@/components/ProductCard";
import { StoreCard } from "@/components/StoreCard";

export const Route = createFileRoute("/search")({
  validateSearch: z.object({ q: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Search Products — Jamshedpurwala" },
      {
        name: "description",
        content:
          "Search wireless earbuds, headphones, grocery and beauty products across Jamshedpurwala stores and filter by brand, price and rating.",
      },
      { property: "og:title", content: "Search Products — Jamshedpurwala" },
      {
        property: "og:description",
        content: "Filter by brand, price, discount and rating to find the best deals in Jamshedpur.",
      },
    ],
  }),
  component: SearchPage,
});

const brands = ["boAt", "Noise", "realme", "OnePlus"];
const chips = ["Brands", "Price", "Discount", "Ratings", "Delivery"];

function SearchPage() {
  const router = useRouter();
  const { q } = Route.useSearch();
  const { cartCount } = useShop();
  const [query, setQuery] = useState(q ?? "");
  const [brandFilter, setBrandFilter] = useState<string[]>([]);
  const [sort, setSort] = useState<"Relevance" | "Price: Low to High" | "Discount">("Relevance");
  const [tab, setTab] = useState<"Products" | "Shops">("Products");

  const term = query.trim().toLowerCase();
  const hasQuery = term.length > 0;

  const results = useMemo(() => {
    let list = term
      ? allProducts.filter((p) =>
          `${p.brand} ${p.name} ${p.category}`.toLowerCase().includes(term.replace("wireless earbuds", "earbuds")),
        )
      : products;
    if (brandFilter.length) list = list.filter((p) => brandFilter.includes(p.brand));
    if (sort === "Price: Low to High") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "Discount")
      list = [...list].sort((a, b) => (b.mrp - b.price) / b.mrp - (a.mrp - a.price) / a.mrp);
    return list;
  }, [term, brandFilter, sort]);

  const shopResults = useMemo(
    () =>
      term ? stores.filter((s) => `${s.name} ${s.category}`.toLowerCase().includes(term)) : stores,
    [term],
  );




  const toggleBrand = (b: string) =>
    setBrandFilter((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]));

  return (
    <div className="pb-[76px] md:pb-8">
      {/* Search header */}
      <header className="sticky top-0 z-30 bg-background px-3 pb-2 pt-2.5 md:hidden">
        <div className="flex items-center gap-2.5">
          <button onClick={() => router.history.back()} aria-label="Back">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <div className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-border bg-surface px-2.5">
            <SearchIcon size={16} className="text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, brands or stores"
              className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-subtle"
            />
            {query && (
              <button onClick={() => setQuery("")} aria-label="Clear search">
                <X size={15} className="text-muted-foreground" />
              </button>
            )}
            <span className="h-4 w-px bg-border" />
            <Mic size={16} className="text-muted-foreground" />
          </div>
          <Link to="/cart" className="relative" aria-label="Cart">
            <ShoppingCart size={20} strokeWidth={1.8} className="text-foreground" />
            <span className="label-xs absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-destructive-foreground">
              {cartCount}
            </span>
          </Link>
        </div>
      </header>

      {/* Products / Shops tabs */}
      <div className="mt-1 flex gap-4 border-b border-border px-3 md:mt-6 md:px-0">
        {(["Products", "Shops"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 pb-2 pt-1 text-[13px] font-semibold ${
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground"
            }`}
          >
            {t}{" "}
            <span className="text-[10px] font-normal">
              ({t === "Products" ? results.length : shopResults.length})
            </span>
          </button>
        ))}
      </div>

      {/* Results head */}
      <div className="flex items-baseline justify-between px-3 pt-2 md:px-0 md:pt-4">
        <p className="text-[14px] font-bold text-foreground">
          {hasQuery ? (
            <>Results for “{query}”</>
          ) : tab === "Shops" ? (
            <>Popular shops</>
          ) : (
            <>Popular products</>
          )}{" "}
          <span className="text-[11px] font-normal text-muted-foreground">
            ({tab === "Products" ? results.length : shopResults.length} results)
          </span>
        </p>

        {tab === "Products" && (
          <button
            onClick={() =>
              setSort((s) =>
                s === "Relevance" ? "Price: Low to High" : s === "Price: Low to High" ? "Discount" : "Relevance",
              )
            }
            className="flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground"
          >
            Sort by <span className="font-semibold text-foreground">{sort}</span>
            <ChevronDown size={12} />
          </button>
        )}
      </div>
      {tab === "Products" ? (
      <>
      {/* Filter chips */}
      <div className="rail mt-2 px-3 md:px-0">
        <button className="flex shrink-0 items-center gap-1.5 rounded-lg border border-primary px-2.5 py-1.5 text-[12px] font-semibold text-primary">
          <SlidersHorizontal size={13} /> Filter
        </button>
        {chips.map((c) => (
          <button
            key={c}
            className="flex shrink-0 items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[12px] text-foreground"
          >
            {c} <ChevronDown size={12} className="text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Brand chips */}
      <div className="rail mt-2 px-3 md:px-0">
        <button
          onClick={() => setBrandFilter([])}
          className={`shrink-0 rounded-full border px-3 py-1 text-[12px] ${
            brandFilter.length === 0 ? "border-primary text-primary" : "border-border text-foreground"
          }`}
        >
          All
        </button>
        {brands.map((b) => {
          const on = brandFilter.includes(b);
          return (
            <button
              key={b}
              onClick={() => toggleBrand(b)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] ${
                on ? "border-primary bg-primary-soft text-primary" : "border-border text-foreground"
              }`}
            >
              {b} <X size={11} className="text-muted-foreground" />
            </button>
          );
        })}
        <button
          onClick={() => setBrandFilter([])}
          className="shrink-0 px-1 text-[12px] font-semibold text-primary"
        >
          Clear all
        </button>
      </div>

      {/* Promo banner */}
      <section className="px-3 pt-2.5 md:px-0 md:pt-5">
        <div className="relative flex items-center gap-2 overflow-hidden rounded-xl bg-tone-green p-2.5 md:p-5">
          <Tag size={20} className="shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-bold text-foreground">Best Deals on</p>
            <p className="text-[13px] font-bold text-primary">Wireless Earbuds</p>
            <p className="text-[9.5px] text-muted-foreground">Grab now before the offer ends!</p>
          </div>
          <span className="flex h-[54px] w-[54px] shrink-0 flex-col items-center justify-center rounded-full bg-primary text-center text-primary-foreground">
            <span className="text-[8px] leading-none">UP TO</span>
            <span className="text-[15px] font-extrabold leading-none">60%</span>
            <span className="text-[8px] leading-none">OFF</span>
          </span>
        </div>
      </section>

      {/* Results grid — home-style cards */}
      <section className="grid grid-cols-2 gap-2 px-3 pt-2.5 md:grid-cols-5 md:gap-4 md:px-0 md:pt-5">
        {results.map((p) => (
          <ProductCardRail key={p.id} product={p} fluid />
        ))}
      </section>
      {hasQuery && results.length === 0 && (
        <p className="px-3 pt-6 text-center text-[12px] text-muted-foreground">
          No products found for “{query}”.
        </p>
      )}

      {/* Shops matching the query */}
      {shopResults.length > 0 && (
        <section className="px-3 pt-3 md:px-0 md:pt-7">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[14px] font-bold text-foreground">Shops you may like</h2>
            <button onClick={() => setTab("Shops")} className="text-[11px] font-semibold text-primary">
              View all
            </button>
          </div>
          <div className="mt-2 grid gap-2 md:grid-cols-2 md:gap-4">
            {shopResults.slice(0, 2).map((s) => (
              <StoreCard key={s.id} store={s} />
            ))}
          </div>
        </section>
      )}
      </>
      ) : (
        <section className="grid gap-2 px-3 pt-2.5 md:grid-cols-2 md:gap-4 md:px-0 md:pt-5">
          {shopResults.map((s) => (
            <StoreCard key={s.id} store={s} />
          ))}
          {shopResults.length === 0 && (
            <p className="pt-6 text-center text-[12px] text-muted-foreground">
              No shops found for “{query}”.
            </p>
          )}
        </section>
      )}




      {/* Request product */}
      <section className="px-3 pt-3 md:px-0 md:pt-7">
        <div className="flex items-center gap-2 rounded-xl bg-tone-green p-2.5 md:p-5">
          <Tag size={18} className="shrink-0 text-primary" />
          <div className="flex-1">
            <p className="text-[11.5px] font-bold text-foreground">Can’t find what you’re looking for?</p>
            <p className="text-[10px] text-muted-foreground">Tell us and we’ll help you find it!</p>
          </div>
          <button className="shrink-0 rounded-lg border border-primary px-2.5 py-1.5 text-[11px] font-semibold text-primary">
            Request Product
          </button>
        </div>
      </section>

      <BottomNav active="search" />
    </div>
  );
}
