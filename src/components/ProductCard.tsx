import { Link } from "@tanstack/react-router";
import { Heart, ShoppingCart, Plus, Star, Truck } from "lucide-react";
import { inr, off, type Product } from "@/lib/data";
import { useShop } from "@/lib/shop-store";

const badgeTone = (pct: number) =>
  pct >= 40 ? "bg-badge-red" : pct >= 30 ? "bg-badge-orange" : pct >= 20 ? "bg-badge-pink" : "bg-badge-purple";

export function DiscountBadge({ pct }: { pct: number }) {
  return (
    <span
      className={`label-xs absolute left-0 top-0 z-10 rounded-br-lg rounded-tl-xl px-1.5 py-0.5 text-white ${badgeTone(pct)}`}
    >
      -{pct}%
    </span>
  );
}

export function Rating({ value, reviews }: { value: number; reviews?: string }) {
  return (
    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
      <Star size={10} className="fill-amber-400 text-amber-400" />
      <span className="font-semibold text-foreground">{value}</span>
      {reviews && <span>({reviews})</span>}
    </div>
  );
}

/** 3-column compact card used on the search results grid. */
export function ProductCardGrid3({ product }: { product: Product }) {
  const { add, wishlist, toggleWish } = useShop();
  const wished = wishlist.includes(product.id);
  return (
    <div className="relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 md:hover:-translate-y-1 md:hover:shadow-[var(--shadow-float)]">
      <DiscountBadge pct={off(product)} />
      <button
        onClick={() => toggleWish(product.id)}
        aria-label="Wishlist"
        className="absolute right-1.5 top-1.5 z-10"
      >
        <Heart size={14} className={wished ? "fill-destructive text-destructive" : "text-subtle"} />
      </button>
      <Link to="/product/$id" params={{ id: product.id }} className="block bg-surface px-2 pb-1 pt-6">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={768}
          height={768}
          className="mx-auto h-[86px] w-full object-contain md:h-[150px]"
        />
      </Link>
      <div className="flex flex-1 flex-col px-2 pb-1.5 pt-1.5">
        <p className="text-[10px] font-medium text-primary">{product.brand}</p>
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="mt-0.5 line-clamp-2 text-[11px] font-medium leading-snug text-foreground md:text-[14px]"
        >
          {product.name}
        </Link>
        <div className="mt-1">
          <Rating value={product.rating} reviews={product.reviews} />
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-[13px] font-bold text-foreground md:text-[17px]">{inr(product.price)}</span>
          <span className="text-[10px] text-subtle line-through">{inr(product.mrp)}</span>
        </div>
        {product.tag === "Bestseller" && (
          <span className="label-xs mt-1 w-fit rounded bg-primary-soft px-1 py-0.5 text-accent-foreground">
            Bestseller
          </span>
        )}
        <div className="mt-1.5 flex items-end justify-between">
          <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
            <Truck size={10} className="text-primary" /> Free delivery
          </span>
          <button
            onClick={() => add(product.id)}
            aria-label={`Add ${product.name} to cart`}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-strong text-primary-foreground shadow-[var(--shadow-card)]"
          >
            <ShoppingCart size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

/** 2-column card used on the store profile grid. */
export function ProductCardGrid2({ product }: { product: Product }) {
  const { add } = useShop();
  return (
    <div className="relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 md:hover:-translate-y-1 md:hover:shadow-[var(--shadow-float)]">
      {product.tag ? (
        <span
          className={`label-xs absolute left-0 top-0 z-10 rounded-br-lg rounded-tl-xl px-1.5 py-0.5 text-white ${
            product.tag === "New" ? "bg-badge-pink" : "bg-badge-orange"
          }`}
        >
          {product.tag}
        </span>
      ) : (
        <DiscountBadge pct={off(product)} />
      )}
      <Link to="/product/$id" params={{ id: product.id }} className="block bg-surface px-3 pb-2 pt-7">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={768}
          height={768}
          className="mx-auto h-[110px] w-full object-contain md:h-[190px]"
        />
      </Link>
      <div className="px-2 pb-2 pt-1.5">
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="line-clamp-2 text-[12px] font-medium leading-snug text-foreground md:text-[14px]"
        >
          {product.name}
        </Link>
        <div className="mt-1">
          <Rating value={product.rating} reviews={product.reviews} />
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-[14px] font-bold text-foreground md:text-[18px]">{inr(product.price)}</span>
          <span className="text-[10px] text-subtle line-through">{inr(product.mrp)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-primary">{off(product)}% OFF</span>
          <button
            onClick={() => add(product.id)}
            aria-label={`Add ${product.name} to cart`}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-strong text-primary-foreground"
          >
            <ShoppingCart size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

/** Horizontal rail card used for "Best Deals for You". */
export function ProductCardRail({ product, fluid = false }: { product: Product; fluid?: boolean }) {
  const { add } = useShop();
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 md:hover:-translate-y-1 md:hover:shadow-[var(--shadow-float)] ${
        fluid ? "w-full" : "w-[150px] shrink-0"
      }`}
    >

      <DiscountBadge pct={off(product)} />
      <Link to="/product/$id" params={{ id: product.id }} className="block bg-surface px-3 pb-1 pt-6">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={768}
          height={768}
          className="mx-auto h-[88px] w-full object-contain md:h-[170px]"
        />
      </Link>
      <div className="px-2 pb-2 pt-1.5">
        <p className="text-[10px] font-medium text-muted-foreground">{product.brand}</p>
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="line-clamp-2 text-[11px] font-medium leading-snug text-foreground md:text-[14px]"
        >
          {product.name}
        </Link>
        <div className="mt-1 flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-[13px] font-bold text-foreground md:text-[17px]">{inr(product.price)}</span>
              <span className="text-[10px] text-subtle line-through">{inr(product.mrp)}</span>
            </div>
            <div className="mt-0.5">
              <Rating value={product.rating} reviews={product.reviews} />
            </div>
          </div>
          <button
            onClick={() => add(product.id)}
            aria-label={`Add ${product.name} to cart`}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-strong text-primary-foreground"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/** Tiny flash-sale card on the dark strip. */
export function ProductCardMini({ product }: { product: Product }) {
  return (
    <Link
      to="/product/$id"
      params={{ id: product.id }}
      className="w-[74px] shrink-0 rounded-lg bg-card md:w-[96px] px-1.5 pb-1.5 pt-1.5 text-center"
    >
      <img
        src={product.image}
        alt={product.name}
        loading="lazy"
        width={768}
        height={768}
        className="mx-auto h-[46px] w-full object-contain md:h-[64px]"
      />
      <p className="mt-1 text-[11px] font-bold text-foreground">{inr(product.price)}</p>
      <p className="text-[9px] text-subtle line-through">{inr(product.mrp)}</p>
      <p className="text-[9px] font-semibold text-destructive">-{off(product)}%</p>
    </Link>
  );
}
