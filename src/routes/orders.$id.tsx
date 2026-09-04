import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, PackageX } from "lucide-react";
import { inr } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { BottomNav } from "@/components/BottomNav";
import {
  formatDate,
  getMyOrder,
  orderItemImage,
  orderStatusLabel,
  paymentStatusLabel,
  type OrderItemRow,
  type OrderRow,
} from "@/lib/orders";

export const Route = createFileRoute("/orders/$id")({
  head: () => ({
    meta: [
      { title: "Order Details — Jamshedpurwala" },
      {
        name: "description",
        content: "See the items, payment status, totals and delivery address for your Jamshedpurwala order.",
      },
      { property: "og:title", content: "Order Details — Jamshedpurwala" },
      { property: "og:description", content: "Full details for your Jamshedpurwala order." },
    ],
  }),
  component: OrderDetailsPage,
});

function OrderDetailsPage() {
  const { id } = Route.useParams();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<(OrderRow & { order_items: OrderItemRow[] }) | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">("loading");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setState("missing");
      return;
    }
    let cancelled = false;
    setState("loading");
    getMyOrder(id)
      .then((row) => {
        if (cancelled) return;
        setOrder(row);
        setState(row ? "ready" : "missing");
      })
      .catch(() => !cancelled && setState("error"));
    return () => {
      cancelled = true;
    };
  }, [id, user, authLoading]);

  return (
    <div className="mx-auto max-w-[760px] pb-24">
      <header className="sticky top-0 z-30 flex h-[52px] items-center gap-3 border-b border-border bg-background px-3 md:static md:mt-6 md:h-auto md:border-0 md:px-0 md:pb-2">
        <Link to="/orders" aria-label="Back" className="md:hidden">
          <ArrowLeft size={20} className="text-foreground" />
        </Link>
        <h1 className="text-[19px] font-bold tracking-tight text-foreground">Order Details</h1>
      </header>

      {authLoading || state === "loading" ? (
        <div className="flex justify-center pt-20">
          <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      ) : state !== "ready" || !order ? (
        <div className="px-6 pt-20 text-center">
          <PackageX size={34} className="mx-auto text-muted-foreground" />
          <p className="mt-2 text-[15px] font-bold text-foreground">
            {state === "error" ? "Could not load this order" : "Order not found"}
          </p>
          <Link to="/orders" className="mt-3 inline-block text-[13px] font-semibold text-primary">
            Back to My Orders
          </Link>
        </div>
      ) : (
        <div className="px-3 pt-3 md:px-0">
          <div className="card-surface p-2.5">
            <p className="break-all text-[12px] font-bold text-foreground">#{order.id}</p>
            <p className="text-[11px] text-muted-foreground">{formatDate(order.created_at)}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-primary-soft px-3 py-1 text-[11px] font-semibold text-primary">
                {orderStatusLabel(order.order_status)}
              </span>
              <span className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold text-foreground">
                {paymentStatusLabel(order.payment_status)}
              </span>
            </div>
          </div>

          <section className="card-surface mt-3 divide-y divide-border">
            {order.order_items.map((it) => (
              <div key={it.id} className="flex gap-2.5 p-2.5">
                {orderItemImage(it) && (
                  <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-lg bg-surface">
                    <img
                      src={orderItemImage(it)!}
                      alt={it.product_name}
                      className="h-[46px] w-[46px] object-contain"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium text-primary">{it.shop_name}</p>
                  <p className="line-clamp-2 text-[12.5px] font-medium leading-snug text-foreground">
                    {it.product_name}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                    Qty {it.quantity} · {inr(Number(it.price))} each
                  </p>
                </div>
                <span className="text-[13px] font-bold text-foreground">{inr(Number(it.subtotal))}</span>
              </div>
            ))}
          </section>

          <section className="card-surface mt-3 p-2.5">
            <p className="text-[13px] font-bold text-foreground">Price details</p>
            <Row label="Subtotal" value={inr(Number(order.subtotal))} />
            <Row label="Discount" value={`- ${inr(Number(order.discount))}`} accent />
            <Row
              label="Delivery"
              value={Number(order.delivery_fee) === 0 ? "FREE" : inr(Number(order.delivery_fee))}
              accent={Number(order.delivery_fee) === 0}
            />
            <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
              <span className="text-[13px] font-bold text-foreground">Total</span>
              <span className="text-[15px] font-extrabold text-foreground">
                {inr(Number(order.total_amount))}
              </span>
            </div>
          </section>

          <section className="card-surface mt-3 p-2.5">
            <p className="text-[13px] font-bold text-foreground">Delivery address</p>
            <p className="mt-1 text-[12px] text-foreground">
              {order.shipping_address.full_name} · {order.shipping_address.phone}
            </p>
            <p className="text-[11.5px] text-muted-foreground">
              {order.shipping_address.line1}
              {order.shipping_address.line2 ? `, ${order.shipping_address.line2}` : ""},{" "}
              {order.shipping_address.city}, {order.shipping_address.state} —{" "}
              {order.shipping_address.pincode}
            </p>
          </section>
        </div>
      )}

      <BottomNav active="account" />
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
