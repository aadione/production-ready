import { Link } from "@tanstack/react-router";
import { BadgeCheck, Star, ChevronRight } from "lucide-react";
import type { Store } from "@/lib/data";

export function StoreCard({ store }: { store: Store }) {
  return (
    <Link
      to="/store"
      className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-2.5"
    >
      <span className="flex h-[46px] w-[46px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface">
        <img
          src={store.image}
          alt={store.name}
          loading="lazy"
          width={768}
          height={768}
          className="h-[34px] w-[34px] object-contain"
        />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 text-[13px] font-bold text-foreground">
          <span className="truncate">{store.name}</span>
          {store.verified && <BadgeCheck size={13} className="shrink-0 fill-primary text-primary-foreground" />}
        </p>
        <p className="truncate text-[10.5px] text-muted-foreground">{store.category}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Star size={10} className="fill-amber-400 text-amber-400" />
          <span className="font-semibold text-foreground">{store.rating}</span> ({store.reviews})
          <span className="h-2.5 w-px bg-border" /> {store.products} products
          <span className="h-2.5 w-px bg-border" /> {store.orders} orders
        </p>
      </div>
      <span className="label-xs flex shrink-0 items-center gap-0.5 rounded-lg border border-primary px-2 py-1 text-primary">
        Visit <ChevronRight size={11} />
      </span>
    </Link>
  );
}
