import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Loader2, ShieldCheck, Truck } from "lucide-react";
import { toast } from "sonner";
import { findProduct, inr } from "@/lib/data";
import { useShop, deliveryFeeFor } from "@/lib/shop-store";
import { useAuth } from "@/lib/auth";
import { AddressManager, useAddresses } from "@/components/AddressManager";
import { placeOrder } from "@/lib/orders";
import { BottomNav } from "@/components/BottomNav";

type Search = { buy?: string | undefined };

export const Route = createFileRoute("/checkout")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    buy: typeof s['buy'] === "string" ? (s['buy'] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Checkout — Jamshedpurwala" },
      {
        name: "description",
        content: "Confirm your delivery address, review your order summary and place your Jamshedpurwala order.",
      },
      { property: "og:title", content: "Checkout — Jamshedpurwala" },
      { property: "og:description", content: "Simple checkout with Cash on Delivery." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { buy } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { cartLines, clearCart } = useShop();
  const { addresses, loading: addrLoading } = useAddresses();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [payment, setPayment] = useState<"cod">("cod");
  const [placing, setPlacing] = useState(false);

  const buyProduct = buy ? findProduct(buy) : undefined;
  const lines = buyProduct ? [{ product: buyProduct, qty: 1 }] : cartLines;

  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const mrpTotal = lines.reduce((s, l) => s + l.product.mrp * l.qty, 0);
  const discount = mrpTotal - subtotal;
  const delivery = deliveryFeeFor(subtotal);
  const total = subtotal + delivery;

  const chosen = addresses.find((a) => a.id === (selectedId ?? addresses.find((x) => x.is_default)?.id));

  const submit = async () => {
    if (placing) return;
    if (!user) return;
    if (lines.length === 0) {
      toast.error("There is nothing to order.");
      return;
    }
    if (!chosen) {
      toast.error("Please add and select a delivery address.");
      return;
    }
    setPlacing(true);
    try {
      const orderId = await placeOrder({
        userId: user.id,
        shipping: {
          full_name: chosen.full_name,
          phone: chosen.phone,
          line1: chosen.line1,
          line2: chosen.line2,
          city: chosen.city,
          state: chosen.state,
          pincode: chosen.pincode,
        },
        subtotal,
        discount,
        deliveryFee: delivery,
        total,
        paymentMethod: payment,
        items: lines.map((l) => ({
          product_id: l.product.id,
          product_name: l.product.name,
          product_image: l.product.image,
          product_brand: l.product.brand,
          shop_name: l.product.store ?? l.product.brand,
          price: l.product.price,
          mrp: l.product.mrp,
          quantity: l.qty,
          subtotal: l.product.price * l.qty,
        })),
      });
      await clearCart(lines.map((l) => l.product.id));
      navigate({ to: "/order-success/$orderId", params: { orderId }, replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not place your order.");
      setPlacing(false);
    }
  };

  return (
    <div className="mx-auto max-w-[760px] pb-[120px] md:pb-10">
      <header className="sticky top-0 z-30 flex h-[52px] items-center gap-3 border-b border-border bg-background px-3 md:static md:mt-6 md:h-auto md:border-0 md:px-0 md:pb-2">
        <Link to="/cart" aria-label="Back to cart" className="md:hidden">
          <ArrowLeft size={20} className="text-foreground" />
        </Link>
        <h1 className="text-[19px] font-bold tracking-tight text-foreground">Checkout</h1>
      </header>

      {authLoading ? (
        <div className="flex justify-center pt-20">
          <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      ) : !user ? (
        <div className="px-3 pt-10 text-center md:px-0">
          <p className="text-[15px] font-bold text-foreground">Login to continue</p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            You need an account to save addresses and place orders. Your cart is kept safe.
          </p>
          <Link
            to="/auth"
            search={{ redirect: buy ? `/checkout?buy=${buy}` : "/checkout" }}
            className="mt-4 inline-block rounded-lg bg-primary-strong px-5 py-2.5 text-[13.5px] font-bold text-primary-foreground"
          >
            Login / Create Account
          </Link>
        </div>
      ) : lines.length === 0 ? (
        <div className="px-3 pt-16 text-center md:px-0">
          <p className="text-[15px] font-bold text-foreground">Nothing to check out</p>
          <Link to="/" className="mt-3 inline-block text-[13px] font-semibold text-primary">
            Continue shopping
          </Link>
        </div>
      ) : (
        <>
          <section className="px-3 pt-3 md:px-0">
            <h2 className="mb-2 text-[13px] font-bold text-foreground">Delivery address</h2>
            {addrLoading ? (
              <div className="card-surface flex items-center gap-2 p-3 text-[12px] text-muted-foreground">
                <Loader2 size={14} className="animate-spin" /> Loading addresses…
              </div>
            ) : (
              <AddressManager selectedId={chosen?.id ?? null} onSelect={setSelectedId} />
            )}
          </section>

          <section className="px-3 pt-4 md:px-0">
            <h2 className="mb-2 text-[13px] font-bold text-foreground">Order summary</h2>
            <div className="card-surface divide-y divide-border">
              {lines.map(({ product, qty }) => (
                <div key={product.id} className="flex gap-2.5 p-2.5">
                  <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-lg bg-surface">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="h-[46px] w-[46px] object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium text-primary">{product.store ?? product.brand}</p>
                    <p className="line-clamp-2 text-[12.5px] font-medium leading-snug text-foreground">
                      {product.name}
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                      Qty {qty} · {inr(product.price)} each
                    </p>
                  </div>
                  <span className="text-[13px] font-bold text-foreground">{inr(product.price * qty)}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="px-3 pt-4 md:px-0">
            <h2 className="mb-2 text-[13px] font-bold text-foreground">Payment method</h2>
            <div className="card-surface space-y-2 p-2.5">
              <PayOption
                checked
                onSelect={() => setPayment("cod")}
                title="Cash on Delivery"
                sub="Pay in cash when your order arrives."
              />
              <p className="px-1 text-[11px] text-muted-foreground">
                Online payment is coming soon. For now every order is placed as Cash on Delivery.
              </p>
            </div>
          </section>


          <section className="px-3 pt-4 md:px-0">
            <div className="card-surface p-2.5">
              <p className="text-[13px] font-bold text-foreground">Price details</p>
              <Row label={`Item total (${lines.length} items)`} value={inr(mrpTotal)} />
              <Row label="Discount" value={`- ${inr(discount)}`} accent />
              <Row label="Delivery" value={delivery === 0 ? "FREE" : inr(delivery)} accent={delivery === 0} />
              <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
                <span className="text-[13px] font-bold text-foreground">To Pay</span>
                <span className="text-[15px] font-extrabold text-foreground">{inr(total)}</span>
              </div>
              <p className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                <Truck size={11} className="text-primary" /> Free delivery on orders above ₹299
              </p>
            </div>
          </section>

          <div className="fixed inset-x-0 bottom-[60px] z-40 mx-auto flex max-w-[430px] items-center gap-3 border-t border-border bg-card px-3 py-2 md:static md:mt-5 md:max-w-none md:rounded-xl md:border md:px-4 md:py-3 md:shadow-[var(--shadow-float)]">
            <div className="flex-1">
              <p className="text-[15px] font-extrabold text-foreground">{inr(total)}</p>
              <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <ShieldCheck size={11} className="text-primary" /> Cash on Delivery
              </p>

            </div>
            <button
              onClick={submit}
              disabled={placing || !chosen}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-primary-strong text-[13.5px] font-bold text-primary-foreground disabled:opacity-60"
            >
              {placing && <Loader2 size={15} className="animate-spin" />}
              {placing ? "Placing…" : "Place Order"}
            </button>
          </div>
        </>
      )}

      <BottomNav active="cart" cartSlot />
    </div>
  );
}

function PayOption({
  checked,
  onSelect,
  title,
  sub,
}: {
  checked: boolean;
  onSelect: () => void;
  title: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-start gap-2.5 rounded-lg border p-2.5 text-left ${
        checked ? "border-primary bg-primary-soft" : "border-border"
      }`}
    >
      <span
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
          checked ? "border-primary" : "border-border"
        }`}
      >
        {checked && <span className="h-2 w-2 rounded-full bg-primary" />}
      </span>
      <span className="min-w-0">
        <span className="block text-[12.5px] font-semibold text-foreground">{title}</span>
        <span className="block text-[11px] text-muted-foreground">{sub}</span>
      </span>
    </button>
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
