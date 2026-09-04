import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Search,
  Share2,
  MoreHorizontal,
  BadgeCheck,
  Star,
  ShieldCheck,
  RefreshCcw,
  Truck,
  ChevronDown,
  SlidersHorizontal,
  ArrowUpDown,
  Leaf,
  ArrowRight,
} from "lucide-react";
import heroStore from "@/assets/hero-store.jpg";
import { storeCategories, storeProducts } from "@/lib/data";
import { BottomNav } from "@/components/BottomNav";
import { ProductCardGrid2 } from "@/components/ProductCard";

export const Route = createFileRoute("/store")({
  head: () => ({
    meta: [
      { title: "Shreeji Aradhya — Personal Care Store on Jamshedpurwala" },
      {
        name: "description",
        content:
          "Shop Shreeji Aradhya personal care and wellness: hair oils, face wash, serums and moisturizers made with natural ingredients.",
      },
      { property: "og:title", content: "Shreeji Aradhya — Personal Care Store" },
      {
        property: "og:description",
        content: "Paraben free, sulfate free, cruelty free and 100% vegan personal care from Jamshedpur.",
      },
    ],
  }),
  component: StorePage,
});

const tabs = ["All Products", "Bestsellers", "New Launches"] as const;
const features = ["PARABEN FREE", "SULFATE FREE", "CRUELTY FREE", "100% VEGAN"];

function StorePage() {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof tabs)[number]>("All Products");
  const [following, setFollowing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [sort, setSort] = useState<"Popular" | "Price">("Popular");

  let list = storeProducts;
  if (tab === "Bestsellers") list = storeProducts.filter((p) => p.tab === "bestsellers");
  if (tab === "New Launches") list = storeProducts.filter((p) => p.tab === "new");
  if (sort === "Price") list = [...list].sort((a, b) => a.price - b.price);

  return (
    <div className="pb-[76px] md:pb-8">
      {/* Hero */}
      <section className="relative">
        <img
          src={heroStore}
          alt="Shreeji Aradhya personal care products"
          width={1280}
          height={720}
          className="h-[196px] w-full object-cover md:h-[360px] md:rounded-b-[28px]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />
        <div className="absolute inset-x-0 top-0 flex items-center gap-2 px-3 pt-3">
          <button
            onClick={() => router.history.back()}
            aria-label="Back"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-card"
          >
            <ArrowLeft size={17} className="text-foreground" />
          </button>
          <div className="flex h-9 flex-1 items-center gap-2 rounded-full bg-white/12 px-3 backdrop-blur">
            <Search size={15} className="text-white/80" />
            <span className="text-[12px] text-white/80">Search in this store</span>
          </div>
          <button
            aria-label="Share"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/12 backdrop-blur"
          >
            <Share2 size={16} className="text-white" />
          </button>
          <button
            aria-label="More"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-card"
          >
            <MoreHorizontal size={16} className="text-foreground" />
          </button>
        </div>
        <div className="absolute bottom-3 left-3.5">
          <h1 className="text-[22px] font-extrabold leading-none tracking-tight text-white">
            SHREEJI <span className="block text-primary-strong">ARADHYA</span>
          </h1>
          <p className="mt-0.5 text-[12px] font-semibold tracking-wide text-white/90">PERSONAL CARE</p>
          <p className="text-[10px] text-white/70">Pure Ingredients. Powerful Results.</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {features.map((f) => (
              <span key={f} className="flex items-center gap-1 text-[7.5px] font-semibold text-white/85">
                <Leaf size={9} className="text-primary-strong" /> {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Profile card */}
      <section className="-mt-3 px-2.5 md:mt-4 md:px-0">
        <div className="card-surface p-3">
          <div className="flex items-start gap-2.5">
            <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-ink text-center text-[8px] font-bold leading-tight text-amber-200">
              SHREEJI
              <br />
              ARADHYA
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 text-[15px] font-bold text-foreground">
                Shreeji Aradhya <BadgeCheck size={14} className="fill-primary text-primary-foreground" />
              </p>
              <p className="text-[11px] text-muted-foreground">Personal Care &amp; Wellness</p>
              <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Star size={11} className="fill-amber-400 text-amber-400" />
                <span className="font-semibold text-foreground">4.7</span> (12.6K reviews)
                <span className="h-3 w-px bg-border" /> 25K+ orders
              </p>
            </div>
            <button
              onClick={() => setFollowing((f) => !f)}
              className={`shrink-0 rounded-lg px-3.5 py-1.5 text-[12px] font-semibold ${
                following
                  ? "border border-primary text-primary"
                  : "bg-primary-strong text-primary-foreground"
              }`}
            >
              {following ? "Following" : "Follow"}
            </button>
          </div>

          <div className="mt-2.5 flex items-center justify-between border-t border-border pt-2.5">
            {[
              { icon: ShieldCheck, label: "100% Original Products" },
              { icon: RefreshCcw, label: "Easy Returns" },
              { icon: Truck, label: "On-time Delivery" },
            ].map((t) => (
              <span key={t.label} className="flex items-center gap-1 text-[9.5px] text-muted-foreground">
                <t.icon size={12} className="text-primary" /> {t.label}
              </span>
            ))}
          </div>

          <p className="mt-2.5 text-[11.5px] leading-snug text-muted-foreground">
            Shreeji Aradhya is all about purity and care. Our products are made with natural ingredients for a
            healthy you.
            {expanded &&
              " Every formulation is dermatologically tested, free from harsh chemicals and crafted in small batches in Jamshedpur."}
            <button
              onClick={() => setExpanded((e) => !e)}
              className="ml-1 inline-flex items-center gap-0.5 font-semibold text-primary"
            >
              {expanded ? "Read less" : "Read more"} <ChevronDown size={11} />
            </button>
          </p>

          <div className="mt-2.5 grid grid-cols-4 rounded-xl bg-primary-soft py-2">
            {[
              { v: "3+", l: "Years on platform" },
              { v: "25K+", l: "Happy customers" },
              { v: "4.7 ★", l: "Store rating" },
              { v: "24 hrs", l: "Avg. response time" },
            ].map((s) => (
              <span key={s.l} className="px-1 text-center">
                <span className="block text-[13px] font-bold text-foreground">{s.v}</span>
                <span className="block text-[8px] leading-tight text-muted-foreground">{s.l}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Store categories */}
      <section className="px-3 pt-3 md:px-0 md:pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-foreground">Top Categories</h2>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
            View all <ArrowRight size={12} />
          </span>
        </div>
        <div className="rail mt-2 pb-1">
          {storeCategories.map((c) => (
            <span key={c.name} className="flex w-[62px] shrink-0 flex-col items-center gap-1">
              <span className="flex h-[62px] w-[62px] items-center justify-center overflow-hidden rounded-xl bg-surface">
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  width={768}
                  height={768}
                  className="h-11 w-11 object-contain"
                />
              </span>
              <span className="text-[9.5px] text-foreground">{c.name}</span>
            </span>
          ))}
          <span className="flex w-[62px] shrink-0 flex-col items-center gap-1">
            <span className="flex h-[62px] w-[62px] items-center justify-center rounded-full bg-surface">
              <MoreHorizontal size={20} className="text-muted-foreground" />
            </span>
            <span className="text-[9.5px] text-foreground">More</span>
          </span>
        </div>
      </section>

      {/* Tabs */}
      <div className="mt-1 flex border-b border-border px-3">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-3 pb-2 pt-1.5 text-[12.5px] ${
              tab === t
                ? "border-primary font-semibold text-primary"
                : "border-transparent text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Filter + sort */}
      <div className="flex items-center justify-between px-3 py-2">
        <button className="flex items-center gap-1.5 text-[12px] text-foreground">
          <SlidersHorizontal size={13} className="text-muted-foreground" /> Filter
        </button>
        <button
          onClick={() => setSort((s) => (s === "Popular" ? "Price" : "Popular"))}
          className="flex items-center gap-1.5 text-[12px] text-muted-foreground"
        >
          <ArrowUpDown size={13} /> Sort by: <span className="font-semibold text-foreground">{sort}</span>
        </button>
      </div>

      {/* 2-column product grid */}
      <section className="grid grid-cols-2 gap-2 px-3 md:grid-cols-4 md:gap-4 md:px-0">
        {list.map((p) => (
          <ProductCardGrid2 key={p.id} product={p} />
        ))}
      </section>

      <BottomNav active="cart" cartSlot />
    </div>
  );
}
