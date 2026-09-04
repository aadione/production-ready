import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, PackageX } from "lucide-react";
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

export const Route = createFileRoute("/order-success/$orderId")({
  head: () => ({
    meta: [
      { title: "Order Confirmed — Jamshedpurwala" },
      {
        name: "description",
        content: "Your Jamshedpurwala order is confirmed. See your order id, items, delivery address and total.",
      },
      { property: "og:title", content: "Order Confirmed — Jamshedpurwala" },
      { property: "og:description", content: "Thanks for shopping with Jamshedpurwala." },
    ],
  }),
  component: OrderSuccessPage,
});

function OrderSuccessPage() {
  const { orderId } = Route.useParams();
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
    getMyOrder(orderId)
      .then((row) => {
        if (cancelled) return;
        setOrder(row);
        setState(row ? "ready" : "missing");
      })
      .catch(() => !cancelled && setState("error"));
    return () => {
      cancelled = true;
    };
  }, [orderId, user, authLoading]);

  if (state === "loading" || authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (state !== "ready" || !order) {
    return (
      <div className="mx-auto max-w-[560px] px-4 pb-24 pt-16 text-center">
        <PackageX size={34} className="mx-auto text-muted-foreground" />
        <p className="mt-2 text-[15px] font-bold text-foreground">
          {state === "error" ? "We couldn't load this order" : "Order not found"}
        </p>
        <p className="mt-1 text-[12px] text-muted-foreground">
          {state === "error"
            ? "Please check your connection and try again."
            : "This order does not exist, or it belongs to another account."}
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Link
            to="/orders"
            className="rounded-lg border border-border px-4 py-2 text-[13px] font-semibold text-foreground"
          >
            My Orders
          </Link>
          <Link
            to="/"
            className="rounded-lg bg-primary-strong px-4 py-2 text-[13px] font-semibold text-primary-foreground"
          >
            Continue Shopping
          </Link>
        </div>
        <BottomNav active="account" />
      </div>
    );
  }

  const a = order.shipping_address;
  const eta = new Date(new Date(order.created_at).getTime() + 3 * 86400000);

  return (
    <div className="mx-auto max-w-[680px] px-3 pb-24 pt-6 md:px-0">
      <div className="card-surface p-4 text-center">
        <CheckCircle2 size={40} className="mx-auto text-primary" />
        <h1 className="mt-2 text-[20px] font-extrabold tracking-tight text-foreground">Congratulations!</h1>
        <p className="mt-1 text-[12.5px] text-muted-foreground">
          Your order is confirmed and is being prepared.
        </p>
        <p className="mt-3 text-[11.5px] text-muted-foreground">Order ID</p>
        <p className="break-all text-[13px] font-bold text-foreground">{order.id}</p>
        <p className="mt-1 text-[11.5px] text-muted-foreground">{formatDate(order.created_at)}</p>
        <div className="mt-3 flex justify-center gap-2">
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
                <img src={orderItemImage(it)!} alt={it.product_name} className="h-[46px] w-[46px] object-contain" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium text-primary">{it.shop_name}</p>
              <p className="line-clamp-2 text-[12.5px] font-medium leading-snug text-foreground">
                {it.product_name}
              </p>
              <p className="mt-0.5 text-[11.5px] text-muted-foreground">Qty {it.quantity}</p>
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
          <span className="text-[13px] font-bold text-foreground">Total paid</span>
          <span className="text-[15px] font-extrabold text-foreground">{inr(Number(order.total_amount))}</span>
        </div>
      </section>

      <section className="card-surface mt-3 p-2.5">
        <p className="text-[13px] font-bold text-foreground">Delivery address</p>
        <p className="mt-1 text-[12px] text-foreground">
          {a.full_name} · {a.phone}
        </p>
        <p className="text-[11.5px] text-muted-foreground">
          {a.line1}
          {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} — {a.pincode}
        </p>
        <p className="mt-1.5 text-[11.5px] text-primary">
          Expected delivery by {eta.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </p>
      </section>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          to="/orders/$id"
          params={{ id: order.id }}
          className="flex-1 rounded-lg bg-primary-strong px-4 py-2.5 text-center text-[13px] font-bold text-primary-foreground"
        >
          View Order Details
        </Link>
        <Link
          to="/orders"
          className="flex-1 rounded-lg border border-border px-4 py-2.5 text-center text-[13px] font-semibold text-foreground"
        >
          Go to My Orders
        </Link>
        <Link
          to="/"
          className="w-full rounded-lg border border-border px-4 py-2.5 text-center text-[13px] font-semibold text-foreground"
        >
          Continue Shopping
        </Link>
      </div>

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
