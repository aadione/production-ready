import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  MapPin,
  ChevronDown,
  Bell,
  ShoppingCart,
  Search,
  ScanLine,
  Mic,
  ArrowRight,
  Bike,
  Timer,
  RefreshCcw,
  ShieldCheck,
  MoreHorizontal,
  Zap,
} from "lucide-react";
import heroMonsoon from "@/assets/hero-monsoon.jpg";
import { img, products, quickCategories, shopCategories } from "@/lib/data";
import { useShop } from "@/lib/shop-store";
import { BottomNav } from "@/components/BottomNav";
import { ProductCardMini, ProductCardRail } from "@/components/ProductCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jamshedpurwala — Grocery, Electronics & Fashion Delivery" },
      {
        name: "description",
        content:
          "Shop Monsoon Mega Sale deals on grocery, electronics, beauty and fashion in Jamshedpur with 10-30 min delivery.",
      },
      { property: "og:title", content: "Jamshedpurwala — Grocery, Electronics & Fashion Delivery" },
      {
        property: "og:description",
        content: "Monsoon Mega Sale: up to 60% off on top brands, delivered across Jamshedpur.",
      },
    ],
  }),
  component: Home,
});

function useCountdown(initial = { h: 2, m: 18, s: 47 }) {
  const [t, setT] = useState(initial);
  useEffect(() => {
    const id = setInterval(() => {
      setT((p) => {
        let { h, m, s } = p;
        s -= 1;
        if (s < 0) {
          s = 59;
          m -= 1;
        }
        if (m < 0) {
          m = 59;
          h -= 1;
        }
        if (h < 0) return { h: 0, m: 0, s: 0 };
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);
  const p = (n: number) => String(n).padStart(2, "0");
  return { h: p(t.h), m: p(t.m), s: p(t.s) };
}

const trust = [
  { icon: Bike, title: "Free Delivery", sub: "On orders above ₹299" },
  { icon: Timer, title: "Quick Delivery", sub: "10–30 mins" },
  { icon: RefreshCcw, title: "Easy Returns", sub: "7 days return" },
  { icon: ShieldCheck, title: "Secure Payment", sub: "100% safe" },
];

const promos = [
  {
    kicker: "GROCERY SAVER",
    off: "Up to 50% OFF",
    sub: "On Daily Essentials",
    tone: "bg-tone-green",
    image: img.veggies,
    cat: "Grocery",
  },
  {
    kicker: "BEAUTY FEST",
    off: "Up to 40% OFF",
    sub: "Glow Up This Season",
    tone: "bg-tone-pink",
    image: img.aloe,
    cat: "Beauty",
  },
  {
    kicker: "ELECTRONICS DEALS",
    off: "Up to 70% OFF",
    sub: "Latest & Bestsellers",
    tone: "bg-tone-blue",
    image: img.earbudsBlack,
    cat: "Electronics",
  },
];

function Home() {
  const { cartCount, notifications } = useShop();
  const navigate = useNavigate();
  const c = useCountdown();
  const [activeCat, setActiveCat] = useState("All");
  const [slide, setSlide] = useState(0);
  const flash = products.filter((p) =>
    ["boat-rockerz-450-pro", "titan-classic-watch", "puma-smashic", "engage-perfume"].includes(p.id),
  );
  const deals = products.filter((p) =>
    ["mamaearth-aloe-gel", "boat-airdopes-161-pro", "minimalist-niacinamide", "puma-smashic"].includes(p.id),
  );

  return (
    <div className="pb-[76px] md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background px-3 pb-2 pt-3 md:hidden">
        <div className="flex items-center justify-between">
          <button
            className="flex items-start gap-1.5 text-left"
            onClick={() => navigate({ to: "/categories" })}
          >
            <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-border">
              <MapPin size={14} className="text-primary" />
            </span>
            <span>
              <span className="flex items-center gap-1 text-[15px] font-bold leading-tight text-foreground">
                Jamshedpur <ChevronDown size={14} className="text-muted-foreground" />
              </span>
              <span className="block text-[11px] leading-tight text-muted-foreground">
                Bistupur, 831001
              </span>
            </span>
          </button>
          <div className="flex items-center gap-3.5">
            <span className="relative">
              <Bell size={21} strokeWidth={1.8} className="text-foreground" />
              <span className="label-xs absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-destructive-foreground">
                {notifications}
              </span>
            </span>
            <Link to="/cart" className="relative" aria-label="Cart">
              <ShoppingCart size={21} strokeWidth={1.8} className="text-foreground" />
              <span className="label-xs absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-destructive-foreground">
                {cartCount}
              </span>
            </Link>
          </div>
        </div>

        {/* Search bar */}
        <Link
          to="/search"
          className="mt-3 flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-3 shadow-[var(--shadow-card)]"
        >
          <Search size={17} className="text-muted-foreground" />
          <span className="flex-1 truncate text-[13px] text-subtle">
            Search for products, brands or stores...
          </span>
          <ScanLine size={17} className="text-muted-foreground" />
          <span className="h-4 w-px bg-border" />
          <Mic size={17} className="text-muted-foreground" />
        </Link>
      </header>

      {/* Hero banner */}
      <section className="px-3 pt-1 md:px-0 md:pt-6">
        <div className="relative overflow-hidden rounded-[18px]">
          <img
            src={heroMonsoon}
            alt="Monsoon Mega Sale up to 60% off on top brands"
            width={1280}
            height={720}
            className="h-[186px] w-full object-cover md:h-[380px]"
          />
          <div className="absolute inset-0 flex flex-col justify-center pl-3.5">
            <span className="label-xs w-fit rounded-md bg-primary px-1.5 py-0.5 text-primary-foreground">
              BIG SAVINGS
            </span>
            <h2 className="mt-1.5 text-[27px] font-extrabold leading-[1.05] tracking-tight text-ink">
              Monsoon
              <br />
              Mega Sale
            </h2>
            <p className="mt-1 text-[13px] font-semibold text-ink">
              Up to <span className="text-primary">60% OFF</span>
            </p>
            <p className="text-[12px] text-ink/80">on Top Brands</p>
            <Link
              to="/search"
              className="mt-2 flex w-fit items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[12px] font-semibold text-primary-foreground"
            >
              Shop Now <ArrowRight size={13} />
            </Link>
          </div>
          <div className="absolute right-3 top-3 flex h-[54px] w-[54px] flex-col items-center justify-center rounded-full bg-primary text-primary-foreground">
            <span className="text-[11px] font-bold leading-none">
              {c.h} : {c.m}
            </span>
            <span className="mt-0.5 text-[8px] leading-none opacity-90">{c.s} SEC</span>
            <span className="mt-0.5 text-[8px] leading-none opacity-90">HRS</span>
          </div>
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  slide === i ? "w-4 bg-ink" : "w-1.5 bg-ink/25"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="px-3 pt-2.5 md:px-0 md:pt-4">
        <div className="card-surface flex items-stretch px-1 py-2 md:px-4 md:py-4">
          {trust.map((t, i) => (
            <div key={t.title} className="flex flex-1 items-center gap-1.5 px-1.5">
              {i > 0 && <span className="-ml-1.5 mr-0.5 h-7 w-px bg-border" />}
              <t.icon size={16} className="shrink-0 text-primary" />
              <span className="min-w-0">
                <span className="block truncate text-[10px] font-bold text-foreground">{t.title}</span>
                <span className="block truncate text-[9px] text-muted-foreground">{t.sub}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Quick category rail */}
      <section className="px-3 pt-3 md:px-0">
        <div className="rail pb-1 md:justify-center md:gap-6">
          {quickCategories.map((cat) => {
            const on = cat.name === activeCat;
            return (
              <button
                key={cat.name}
                onClick={() => setActiveCat(cat.name)}
                className="flex w-[54px] shrink-0 flex-col items-center gap-1"
              >
                <span
                  className={`flex h-[52px] w-[52px] items-center justify-center overflow-hidden rounded-2xl border ${
                    on ? "border-primary bg-primary-soft" : "border-border bg-surface"
                  }`}
                >
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      loading="lazy"
                      width={768}
                      height={768}
                      className="h-9 w-9 object-contain"
                    />
                  ) : (
                    <span className="grid grid-cols-2 gap-0.5">
                      {[0, 1, 2, 3].map((i) => (
                        <span key={i} className="h-2.5 w-2.5 rounded-[3px] bg-primary" />
                      ))}
                    </span>
                  )}
                </span>
                <span
                  className={`text-[10px] leading-none ${on ? "font-semibold text-primary" : "text-muted-foreground"}`}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
          <Link to="/categories" className="flex w-[54px] shrink-0 flex-col items-center gap-1">
            <span className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-surface">
              <MoreHorizontal size={20} className="text-muted-foreground" />
            </span>
            <span className="text-[10px] leading-none text-muted-foreground">More</span>
          </Link>
        </div>
      </section>

      {/* Promo cards */}
      <section className="px-3 pt-2 md:px-0 md:pt-5">
        <div className="grid grid-cols-3 gap-2 md:gap-5">
          {promos.map((p) => (
            <Link
              key={p.kicker}
              to="/categories"
              className={`relative overflow-hidden rounded-xl ${p.tone} p-2 pb-8`}
            >
              <p className="label-xs text-accent-foreground">{p.kicker}</p>
              <p className="mt-1 text-[12px] font-bold leading-tight text-foreground">{p.off}</p>
              <p className="mt-0.5 text-[9px] leading-tight text-muted-foreground">{p.sub}</p>
              <span className="label-xs absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-primary px-1.5 py-0.5 text-primary-foreground">
                Shop Now <ArrowRight size={9} />
              </span>
              <img
                src={p.image}
                alt=""
                loading="lazy"
                width={768}
                height={768}
                className="absolute -bottom-1 right-0 h-[52px] w-[52px] object-contain"
              />
            </Link>
          ))}
        </div>
      </section>

      {/* Flash sale */}
      <section className="px-3 pt-2.5 md:px-0 md:pt-5">
        <div className="flex items-stretch gap-2 rounded-xl bg-ink p-2.5 md:gap-6 md:p-5">
          <div className="w-[92px] shrink-0">
            <p className="flex items-center gap-1 text-[12px] font-extrabold text-primary-foreground">
              <Zap size={13} className="fill-amber-300 text-amber-300" /> FLASH SALE
            </p>
            <p className="mt-0.5 text-[9px] text-primary-foreground/70">Limited Time Offer</p>
            <div className="mt-2 flex items-start gap-1">
              {[
                { v: c.h, l: "HRS" },
                { v: c.m, l: "MINS" },
                { v: c.s, l: "SECS" },
              ].map((u, i) => (
                <div key={u.l} className="flex items-start gap-1">
                  {i > 0 && <span className="pt-1 text-[11px] font-bold text-primary-foreground">:</span>}
                  <span className="text-center">
                    <span className="block rounded bg-destructive px-1.5 py-0.5 text-[12px] font-bold text-destructive-foreground">
                      {u.v}
                    </span>
                    <span className="mt-0.5 block text-[7px] text-primary-foreground/70">{u.l}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="rail flex-1 md:grid md:grid-cols-6 md:gap-4">
            {flash.map((p) => (
              <ProductCardMini key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Shop by category */}
      <section className="px-3 pt-3.5 md:px-0 md:pt-8">
        <SectionHead title="Shop by Category" to="/categories" />
        <div className="mt-2 grid grid-cols-6 gap-x-2 gap-y-2.5 md:grid-cols-12 md:gap-4">
          {shopCategories.slice(0, 11).map((cat) => (
            <Link key={cat.name} to="/categories" className="flex flex-col items-center gap-1">
              <span className="flex h-[52px] w-full items-center justify-center overflow-hidden rounded-xl bg-surface md:h-[92px]">
                <img
                  src={cat.image}
                  alt={cat.short}
                  loading="lazy"
                  width={768}
                  height={768}
                  className="h-10 w-10 object-contain"
                />
              </span>
              <span className="line-clamp-2 text-center text-[9px] leading-tight text-foreground">
                {cat.short}
              </span>
            </Link>
          ))}
          <Link to="/categories" className="flex flex-col items-center gap-1">
            <span className="flex h-[52px] w-full items-center justify-center rounded-xl bg-surface">
              <MoreHorizontal size={18} className="text-muted-foreground" />
            </span>
            <span className="text-[9px] text-foreground">More</span>
          </Link>
        </div>
      </section>

      {/* Best deals */}
      <section className="pt-3.5 md:pt-8">
        <div className="px-3 md:px-0">
          <SectionHead title="Best Deals for You" to="/search" />
        </div>
        <div className="rail mt-2 px-3 pb-1 md:grid md:grid-cols-5 md:gap-4 md:px-0">
          {deals.map((p) => (
            <ProductCardRail key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Bottom offers */}
      <section className="grid grid-cols-2 gap-2 px-3 pt-3 md:gap-5 md:px-0 md:pt-6">
        <div className="rounded-xl bg-badge-purple p-2.5">
          <p className="text-[13px] font-bold leading-tight text-primary-foreground">Extra 10% OFF</p>
          <p className="text-[10px] text-primary-foreground/80">On ICICI Cards</p>
          <p className="mt-2 w-fit rounded bg-card px-1.5 py-1 text-[9px] font-bold text-badge-purple">
            ICICI Bank
          </p>
          <p className="mt-1 text-[8px] text-primary-foreground/70">*T&C Apply</p>
        </div>
        <div className="rounded-xl bg-tone-orange p-2.5">
          <p className="text-[13px] font-bold leading-tight text-foreground">Refer &amp; Earn</p>
          <p className="text-[10px] text-muted-foreground">Get ₹100 Cashback</p>
          <button className="label-xs mt-2 flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-primary-foreground">
            Refer Now <ArrowRight size={9} />
          </button>
        </div>
      </section>

      <BottomNav active="home" />
    </div>
  );
}

export function SectionHead({ title, to }: { title: string; to: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[16px] font-bold tracking-tight text-foreground md:text-[22px]">{title}</h2>
      <Link to={to} className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
        View all <ArrowRight size={12} />
      </Link>
    </div>
  );
}
