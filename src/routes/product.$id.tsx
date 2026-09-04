import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Share2,
  Heart,
  Box,
  Flame,
  ShieldCheck,
  Star,
  AudioLines,
  Bluetooth,
  BatteryFull,
  Mic,
  Tag,
  Truck,
  ChevronRight,
  ShoppingCart,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { findProduct, inr, off } from "@/lib/data";
import { useShop } from "@/lib/shop-store";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const product = findProduct(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.product.name ?? "Product";
    return {
      meta: [
        { title: `${name} — Jamshedpurwala` },
        {
          name: "description",
          content: `Buy ${name} at the best price in Jamshedpur with free delivery on orders above ₹299 and easy 7-day returns.`,
        },
        { property: "og:title", content: `${name} — Jamshedpurwala` },
        { property: "og:description", content: `Shop ${name} with bank offers and next-day delivery.` },
      ],
    };
  },
  component: ProductPage,
});

const specs = [
  { icon: AudioLines, title: "50mm Drivers", sub: "Deep Bass" },
  { icon: Bluetooth, title: "Bluetooth 5.3", sub: "Fast Connection" },
  { icon: BatteryFull, title: "Up to 15H Playtime", sub: "Long Battery" },
  { icon: Mic, title: "Built-in Mic", sub: "Clear Calls" },
];

function ProductPage() {
  const { product } = Route.useLoaderData();
  const router = useRouter();
  const { add, wishlist, toggleWish } = useShop();
  const [slide, setSlide] = useState(0);
  const [thumb, setThumb] = useState(0);
  const wished = wishlist.includes(product.id);

  return (
    <div className="mx-auto max-w-[900px] pb-[130px] md:pb-8">
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-primary-soft to-surface pb-3 pt-3 md:mt-6 md:rounded-2xl">
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-3 pt-3">
          <button
            onClick={() => router.history.back()}
            aria-label="Back"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-[var(--shadow-float)]"
          >
            <ArrowLeft size={17} className="text-foreground" />
          </button>
          <div className="flex gap-2">
            <button
              aria-label="Share"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-[var(--shadow-float)]"
            >
              <Share2 size={16} className="text-foreground" />
            </button>
            <button
              onClick={() => toggleWish(product.id)}
              aria-label="Wishlist"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-[var(--shadow-float)]"
            >
              <Heart size={16} className={wished ? "fill-destructive text-destructive" : "text-foreground"} />
            </button>
          </div>
        </div>

        <img
          src={product.image}
          alt={product.name}
          width={768}
          height={768}
          className="mx-auto h-[236px] w-[80%] object-contain md:h-[380px] md:w-[52%]"
        />

        <div className="absolute bottom-10 left-0 space-y-1.5">
          <span className="label-xs block w-fit rounded-r-full bg-destructive px-2.5 py-1 text-destructive-foreground">
            -{off(product)}%
          </span>
          <span className="flex w-fit items-center gap-1 rounded-r-full bg-card px-2.5 py-1 text-[10.5px] font-semibold text-foreground shadow-[var(--shadow-card)]">
            <Flame size={12} className="text-badge-orange" /> Bestseller
          </span>
          <span className="flex w-fit items-center gap-1 rounded-r-full bg-card px-2.5 py-1 text-[10.5px] text-muted-foreground shadow-[var(--shadow-card)]">
            <ShieldCheck size={12} className="text-primary" /> 1 Year Warranty
          </span>
        </div>

        <button className="absolute bottom-10 right-3 flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-[11.5px] font-semibold text-foreground shadow-[var(--shadow-float)]">
          <Box size={13} className="text-primary" /> View in 3D
        </button>

        <div className="mt-1 flex justify-center gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              aria-label={`Image ${i + 1}`}
              className={`h-1.5 rounded-full ${slide === i ? "w-4 bg-ink" : "w-1.5 bg-ink/25"}`}
            />
          ))}
        </div>
      </section>

      {/* Thumbnails */}
      <section className="rail px-3 pt-2.5 md:px-0">
        {[0, 1, 2, 3, 4].map((i) => (
          <button
            key={i}
            onClick={() => setThumb(i)}
            aria-label={`Thumbnail ${i + 1}`}
            className={`flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-xl border bg-surface ${
              thumb === i ? "border-primary" : "border-border"
            }`}
          >
            <img
              src={product.image}
              alt=""
              loading="lazy"
              width={768}
              height={768}
              className="h-10 w-10 object-contain"
            />
          </button>
        ))}
        <span className="flex h-[56px] w-[56px] shrink-0 flex-col items-center justify-center rounded-xl bg-primary-soft text-[10px] font-semibold text-accent-foreground">
          +3
          <span className="text-[9px] font-normal">More</span>
        </span>
      </section>

      {/* Info */}
      <section className="px-3 pt-3 md:px-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-primary">{product.brand}</p>
            <h1 className="mt-0.5 text-[16px] font-bold leading-snug text-foreground">{product.name}</h1>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-md bg-primary-soft px-1.5 py-0.5 text-[11px] font-semibold text-accent-foreground">
                <Star size={11} className="fill-amber-400 text-amber-400" /> {product.rating}
              </span>
              <span className="text-[11px] text-muted-foreground">({product.reviews} reviews)</span>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <span className="label-xs block rounded-md bg-primary-soft px-1.5 py-1 text-accent-foreground">
              #1 Best Seller
            </span>
            <span className="mt-0.5 block text-[10px] text-muted-foreground">in Headphones</span>
          </div>
        </div>

        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-[24px] font-extrabold tracking-tight text-foreground">
            {inr(product.price)}
          </span>
          <span className="text-[13px] text-subtle line-through">{inr(product.mrp)}</span>
          <span className="text-[13px] font-semibold text-destructive">{off(product)}% OFF</span>
        </div>
        <p className="text-[11px] text-muted-foreground">Inclusive of all taxes</p>
      </section>

      {/* Features */}
      <section className="px-3 pt-2.5 md:px-0">
        <div className="card-surface grid grid-cols-4 py-2.5">
          {specs.map((s) => (
            <span key={s.title} className="px-1 text-center">
              <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft">
                <s.icon size={15} className="text-primary" />
              </span>
              <span className="mt-1 block text-[9.5px] font-semibold leading-tight text-foreground">
                {s.title}
              </span>
              <span className="block text-[8.5px] text-muted-foreground">{s.sub}</span>
            </span>
          ))}
        </div>
      </section>

      {/* Offers */}
      <section className="px-3 pt-2 md:px-0">
        <div className="card-surface p-2.5">
          <p className="flex items-center gap-1.5 text-[12.5px] font-bold text-foreground">
            <Tag size={14} className="text-primary" /> Offers &amp; Discounts
          </p>
          <div className="mt-1.5 flex items-start justify-between gap-2">
            <p className="text-[11.5px] text-foreground">
              • <span className="font-semibold">Bank Offer:</span> 10% Instant Discount on ICICI Cards
            </p>
            <span className="flex shrink-0 items-center gap-0.5 text-[10.5px] font-semibold text-primary">
              T&amp;C <ChevronRight size={12} />
            </span>
          </div>
        </div>
      </section>

      {/* Delivery */}
      <section className="px-3 pt-2 md:px-0">
        <div className="card-surface flex items-start gap-2 p-2.5">
          <Truck size={16} className="mt-0.5 shrink-0 text-foreground" />
          <div className="flex-1">
            <p className="text-[12.5px] font-bold text-foreground">Delivery</p>
            <p className="text-[11.5px] text-foreground">
              Get it by <span className="font-semibold text-primary">Tomorrow, 31 May</span>
            </p>
            <p className="text-[10.5px] text-muted-foreground">Free Delivery on orders above ₹299</p>
          </div>
          <ChevronRight size={15} className="mt-1 text-muted-foreground" />
        </div>
      </section>

      <section className="px-3 pt-2 md:px-0">
        <Link
          to="/store"
          className="card-surface flex items-center justify-between p-2.5 text-[12px] font-semibold text-foreground"
        >
          Visit store: Shreeji Aradhya <ChevronRight size={15} className="text-muted-foreground" />
        </Link>
      </section>

      {/* Sticky purchase bar */}
      <div className="fixed inset-x-0 bottom-[60px] z-40 mx-auto flex max-w-[430px] items-center gap-2 border-t border-border bg-card px-3 py-2 md:static md:mt-5 md:max-w-none md:rounded-xl md:border md:px-4 md:py-3 md:shadow-[var(--shadow-float)]">
        <Link
          to="/cart"
          aria-label="Cart"
          className="flex h-10 w-11 shrink-0 items-center justify-center rounded-lg border border-primary"
        >
          <ShoppingCart size={17} className="text-primary" />
        </Link>
        <button
          onClick={() => {
            add(product.id);
            toast.success("Added to cart");
          }}
          className="h-10 flex-1 rounded-lg border border-border text-[13.5px] font-bold text-foreground"
        >
          Add to Cart
        </button>
        <button
          onClick={() => {
            router.navigate({ to: "/checkout", search: { buy: product.id } });
          }}
          className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary-strong text-[13.5px] font-bold text-primary-foreground"
        >
          <Zap size={14} /> Buy Now
        </button>
      </div>

      <BottomNav active="home" />
    </div>
  );
}
