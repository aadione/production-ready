import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Search, Heart, ShoppingCart, ArrowRight, MoreHorizontal, Tag } from "lucide-react";
import heroCategory from "@/assets/hero-category.jpg";
import { quickCategories, shopCategories } from "@/lib/data";
import { useShop } from "@/lib/shop-store";
import { BottomNav } from "@/components/BottomNav";
import { SectionHead } from "./index";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "All Categories — Jamshedpurwala" },
      {
        name: "description",
        content:
          "Browse every Jamshedpurwala category: grocery, dairy, snacks, electronics, mobiles, fashion, footwear and more.",
      },
      { property: "og:title", content: "All Categories — Jamshedpurwala" },
      {
        property: "og:description",
        content: "Shop by category with up to 60% off on top categories in Jamshedpur.",
      },
    ],
  }),
  component: Categories,
});

const tones: Record<string, string> = {
  green: "bg-tone-green",
  blue: "bg-tone-blue",
  pink: "bg-tone-pink",
  purple: "bg-tone-purple",
  orange: "bg-tone-orange",
  teal: "bg-tone-teal",
  grey: "bg-tone-grey",
};

const arrowTone: Record<string, string> = {
  green: "text-primary",
  blue: "text-badge-purple",
  pink: "text-destructive",
  purple: "text-badge-purple",
  orange: "text-badge-orange",
  teal: "text-primary",
  grey: "text-muted-foreground",
};

function Categories() {
  const { cartCount } = useShop();
  const router = useRouter();
  const [activeCat, setActiveCat] = useState("All");
  const [slide, setSlide] = useState(0);

  return (
    <div className="pb-[76px] md:pb-8">
      <header className="sticky top-0 z-30 flex h-[52px] items-center gap-3 bg-background px-3 md:hidden">
        <button onClick={() => router.history.back()} aria-label="Back">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <h1 className="flex-1 text-[19px] font-bold tracking-tight text-foreground">Categories</h1>
        <Link to="/search" aria-label="Search">
          <Search size={20} strokeWidth={1.8} className="text-foreground" />
        </Link>
        <Heart size={20} strokeWidth={1.8} className="text-foreground" />
        <Link to="/cart" className="relative" aria-label="Cart">
          <ShoppingCart size={20} strokeWidth={1.8} className="text-foreground" />
          <span className="label-xs absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-destructive-foreground">
            {cartCount}
          </span>
        </Link>
      </header>

      {/* Hero */}
      <section className="px-3 pt-1 md:px-0 md:pt-6">
        <div className="relative overflow-hidden rounded-[18px] bg-tone-purple">
          <img
            src={heroCategory}
            alt="Big deals on top categories up to 60% off"
            width={1280}
            height={720}
            className="h-[164px] w-full object-cover md:h-[340px]"
          />
          <div className="absolute inset-y-0 left-0 flex w-[62%] flex-col justify-center bg-gradient-to-r from-tone-purple via-tone-purple/90 to-transparent pl-3.5">
            <p className="text-[13px] font-medium text-foreground">Super Savings</p>
            <h2 className="text-[26px] font-extrabold leading-none tracking-tight text-ink">Big Deals</h2>
            <p className="mt-1 text-[12px] text-muted-foreground">On Top Categories</p>
            <p className="text-[13px] font-semibold text-foreground">
              Up to <span className="text-primary">60% OFF</span>
            </p>
            <Link
              to="/search"
              className="mt-2 flex w-fit items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[12px] font-semibold text-primary-foreground"
            >
              Shop Now <ArrowRight size={13} />
            </Link>
          </div>
          <span className="absolute right-2.5 top-2.5 flex h-[52px] w-[52px] flex-col items-center justify-center rounded-full bg-badge-purple text-center text-[9px] font-semibold leading-tight text-primary-foreground">
            Limited
            <br />
            Time Offer
          </span>
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full ${slide === i ? "w-4 bg-ink" : "w-1.5 bg-ink/25"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Top categories */}
      <section className="px-3 pt-3 md:px-0 md:pt-7">
        <SectionHead title="Top Categories" to="/search" />
        <div className="rail mt-2 pb-1 md:justify-center md:gap-7">
          {quickCategories.map((cat) => {
            const on = cat.name === activeCat;
            return (
              <button
                key={cat.name}
                onClick={() => setActiveCat(cat.name)}
                className="flex w-[54px] shrink-0 flex-col items-center gap-1"
              >
                <span
                  className={`flex h-[52px] w-[52px] items-center justify-center overflow-hidden rounded-full border ${
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
          <span className="flex w-[54px] shrink-0 flex-col items-center gap-1">
            <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-surface">
              <MoreHorizontal size={20} className="text-muted-foreground" />
            </span>
            <span className="text-[10px] leading-none text-muted-foreground">More</span>
          </span>
        </div>
      </section>

      {/* Shop by category — 3 column grid */}
      <section className="px-3 pt-3 md:px-0 md:pt-7">
        <h2 className="text-[16px] font-bold tracking-tight text-foreground md:text-[22px]">Shop by Category</h2>
        <div className="mt-2 grid grid-cols-3 gap-2 md:grid-cols-5 md:gap-4">
          {shopCategories.slice(0, 15).map((cat) => (
            <Link
              key={cat.name}
              to="/search"
              search={{ q: cat.short }}
              className={`relative flex h-[112px] flex-col overflow-hidden rounded-xl p-2 transition-transform hover:-translate-y-0.5 md:h-[160px] md:p-4 ${tones[cat.tone]}`}
            >
              <p className="text-[11.5px] font-semibold leading-tight text-foreground">{cat.name}</p>
              <p className="mt-0.5 text-[9.5px] text-muted-foreground">{cat.items}</p>
              <ArrowRight size={12} className={`mt-auto ${arrowTone[cat.tone]}`} />
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                width={768}
                height={768}
                className="absolute bottom-1 right-0.5 h-[62px] w-[62px] object-contain"
              />
            </Link>
          ))}
        </div>
      </section>

      {/* Category deal banner */}
      <section className="px-3 pt-3">
        <div className="flex items-center gap-2.5 rounded-xl bg-tone-green p-2.5 md:p-5">
          <Tag size={22} className="shrink-0 text-primary" />
          <span className="h-9 w-px bg-border" />
          <div className="flex-1">
            <p className="text-[12px] font-bold text-foreground">
              Category Deals · Extra <span className="text-primary">10% OFF</span>
            </p>
            <p className="text-[10px] text-muted-foreground">On All Orders Above ₹999</p>
            <Link
              to="/search"
              className="label-xs mt-1.5 flex w-fit items-center gap-1 rounded-md bg-primary px-2 py-1 text-primary-foreground"
            >
              Shop Now <ArrowRight size={9} />
            </Link>
          </div>
        </div>
      </section>

      <BottomNav active="categories" />
    </div>
  );
}
