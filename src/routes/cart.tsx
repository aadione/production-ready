import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, Truck } from "lucide-react";
import { inr, off } from "@/lib/data";
import { useShop } from "@/lib/shop-store";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Jamshedpurwala" },
      {
        name: "description",
        content: "Review items in your Jamshedpurwala cart, update quantities and checkout with free delivery above ₹299.",
      },
      { property: "og:title", content: "Your Cart — Jamshedpurwala" },
      { property: "og:description", content: "Fast checkout with free delivery on orders above ₹299." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const router = useRouter();
  const { cartLines, cartTotal, setQty, remove } = useShop();
  const mrpTotal = cartLines.reduce((s, l) => s + l.product.mrp * l.qty, 0);
  const delivery = cartTotal >= 299 || cartTotal === 0 ? 0 : 40;

  return (
    <div className="mx-auto max-w-[760px] pb-[76px] md:pb-8">
      <header className="sticky top-0 z-30 flex h-[52px] items-center gap-3 border-b border-border bg-background px-3 md:static md:mt-6 md:h-auto md:border-0 md:px-0 md:pb-2">
        <button onClick={() => router.history.back()} aria-label="Back" className="md:hidden">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <h1 className="text-[19px] font-bold tracking-tight text-foreground">Cart</h1>
        <span className="text-[11px] text-muted-foreground">{cartLines.length} items</span>
      </header>

      {cartLines.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 pt-24 text-center">
          <ShoppingBag size={38} className="text-muted-foreground" />
          <p className="text-[15px] font-bold text-foreground">Your cart is empty</p>
          <p className="text-[12px] text-muted-foreground">
            Add products from the home page or search to get started.
          </p>
          <Link
            to="/"
            className="mt-2 rounded-lg bg-primary-strong px-4 py-2 text-[13px] font-semibold text-primary-foreground"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <>
          <section className="space-y-2 px-3 pt-2.5 md:px-0">
            {cartLines.map(({ product, qty }) => (
              <div key={product.id} className="card-surface flex gap-2.5 p-2.5">
                <Link
                  to="/product/$id"
                  params={{ id: product.id }}
                  className="flex h-[74px] w-[74px] shrink-0 items-center justify-center rounded-lg bg-surface"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    width={768}
                    height={768}
                    className="h-[58px] w-[58px] object-contain"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium text-primary">{product.brand}</p>
                  <p className="line-clamp-2 text-[12.5px] font-medium leading-snug text-foreground">
                    {product.name}
                  </p>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-[14px] font-bold text-foreground">{inr(product.price)}</span>
                    <span className="text-[10px] text-subtle line-through">{inr(product.mrp)}</span>
                    <span className="text-[10px] font-semibold text-primary">{off(product)}% OFF</span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2 rounded-lg border border-border px-1.5 py-1">
                      <button onClick={() => setQty(product.id, qty - 1)} aria-label="Decrease quantity">
                        <Minus size={12} className="text-foreground" />
                      </button>
                      <span className="min-w-4 text-center text-[12px] font-semibold text-foreground">
                        {qty}
                      </span>
                      <button onClick={() => setQty(product.id, qty + 1)} aria-label="Increase quantity">
                        <Plus size={12} className="text-foreground" />
                      </button>
                    </div>
                    <button
                      onClick={() => remove(product.id)}
                      className="flex items-center gap-1 text-[11px] text-muted-foreground"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </section>

          <section className="px-3 pt-2.5 md:px-0">
            <div className="card-surface p-2.5">
              <p className="text-[13px] font-bold text-foreground">Price Details</p>
              <Row label={`Item total (${cartLines.length} items)`} value={inr(mrpTotal)} />
              <Row label="Discount" value={`- ${inr(mrpTotal - cartTotal)}`} accent />
              <Row label="Delivery" value={delivery === 0 ? "FREE" : inr(delivery)} accent={delivery === 0} />
              <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
                <span className="text-[13px] font-bold text-foreground">To Pay</span>
                <span className="text-[15px] font-extrabold text-foreground">{inr(cartTotal + delivery)}</span>
              </div>
              <p className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                <Truck size={11} className="text-primary" /> Free delivery on orders above ₹299
              </p>
            </div>
          </section>

          <div className="fixed inset-x-0 bottom-[60px] z-40 mx-auto flex max-w-[430px] items-center gap-3 border-t border-border bg-card px-3 py-2 md:static md:mt-5 md:max-w-none md:rounded-xl md:border md:px-4 md:py-3 md:shadow-[var(--shadow-float)]">
            <div className="flex-1">
              <p className="text-[15px] font-extrabold text-foreground">{inr(cartTotal + delivery)}</p>
              <p className="text-[10px] text-muted-foreground">Incl. all taxes</p>
            </div>
            <Link
              to="/checkout"
              className="flex h-10 flex-1 items-center justify-center rounded-lg bg-primary-strong text-[13.5px] font-bold text-primary-foreground"
            >
              Proceed to Checkout
            </Link>
          </div>
        </>
      )}

      <BottomNav active="cart" cartSlot />
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="mt-1.5 flex items-center justify-between text-[11.5px]">
      <span className="text-muted-foreground">{label}</span>
      <span className={accent ? "font-semibold text-primary" : "text-foreground"}>{value}</span>
    </div>
  );
}
