import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ChevronRight, Loader2, Package } from "lucide-react";
import { inr } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { BottomNav } from "@/components/BottomNav";
import {
  formatDate,
  listMyOrders,
  orderStatusLabel,
  paymentStatusLabel,
  type OrderItemRow,
  type OrderRow,
} from "@/lib/orders";

export const Route = createFileRoute("/orders/")({
  head: () => ({
    meta: [
      { title: "My Orders — Jamshedpurwala" },
      {
        name: "description",
        content: "Track every Jamshedpurwala order you have placed, with status, payment and delivery details.",
      },
      { property: "og:title", content: "My Orders — Jamshedpurwala" },
      { property: "og:description", content: "All your Jamshedpurwala purchases in one place." },
    ],
  }),
  component: MyOrdersPage,
});

function MyOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<(OrderRow & { order_items: OrderItemRow[] })[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  const load = () => {
    setState("loading");
    listMyOrders()
      .then((rows) => {
        setOrders(rows);
        setState("ready");
      })
      .catch(() => setState("error"));
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setOrders([]);
      setState("ready");
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, authLoading]);

  return (
    <div className="mx-auto max-w-[760px] pb-24">
      <header className="sticky top-0 z-30 flex h-[52px] items-center gap-3 border-b border-border bg-background px-3 md:static md:mt-6 md:h-auto md:border-0 md:px-0 md:pb-2">
        <Link to="/account" aria-label="Back" className="md:hidden">
          <ArrowLeft size={20} className="text-foreground" />
        </Link>
        <h1 className="text-[19px] font-bold tracking-tight text-foreground">My Orders</h1>
      </header>

      {authLoading || state === "loading" ? (
        <div className="flex justify-center pt-20">
          <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      ) : !user ? (
        <Empty
          title="Login to see your orders"
          sub="Your orders are linked to your account."
          action={{ to: "/auth", label: "Login / Create Account" }}
        />
      ) : state === "error" ? (
        <div className="px-6 pt-20 text-center">
          <p className="text-[14px] font-bold text-foreground">Could not load your orders</p>
          <button
            onClick={load}
            className="mt-3 rounded-lg bg-primary-strong px-4 py-2 text-[13px] font-semibold text-primary-foreground"
          >
            Retry
          </button>
        </div>
      ) : orders.length === 0 ? (
        <Empty
          title="No orders yet"
          sub="Once you place an order it will show up here."
          action={{ to: "/", label: "Start Shopping" }}
        />
      ) : (
        <section className="space-y-2 px-3 pt-3 md:px-0">
          {orders.map((o) => (
            <Link
              key={o.id}
              to="/orders/$id"
              params={{ id: o.id }}
              className="card-surface block p-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">{formatDate(o.created_at)}</span>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-primary">
                  {orderStatusLabel(o.order_status)} <ChevronRight size={13} />
                </span>
              </div>
              <p className="mt-0.5 break-all text-[10.5px] text-subtle">#{o.id.slice(0, 8)}</p>
              <div className="mt-1.5 flex gap-2">
                {o.order_items.slice(0, 3).map((it) =>
                  it.product_image ? (
                    <img
                      key={it.id}
                      src={it.product_image}
                      alt={it.product_name}
                      className="h-10 w-10 rounded-lg bg-surface object-contain p-1"
                    />
                  ) : null,
                )}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-[12.5px] font-medium text-foreground">
                    {o.order_items[0]?.product_name ?? "Order"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {o.order_items.reduce((s, i) => s + i.quantity, 0)} item(s) ·{" "}
                    {paymentStatusLabel(o.payment_status)}
                  </p>
                </div>
                <span className="text-[13.5px] font-extrabold text-foreground">
                  {inr(Number(o.total_amount))}
                </span>
              </div>
            </Link>
          ))}
        </section>
      )}

      <BottomNav active="account" />
    </div>
  );
}

function Empty({
  title,
  sub,
  action,
}: {
  title: string;
  sub: string;
  action: { to: string; label: string };
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 pt-24 text-center">
      <Package size={36} className="text-muted-foreground" />
      <p className="text-[15px] font-bold text-foreground">{title}</p>
      <p className="text-[12px] text-muted-foreground">{sub}</p>
      <Link
        to={action.to}
        className="mt-2 rounded-lg bg-primary-strong px-4 py-2 text-[13px] font-semibold text-primary-foreground"
      >
        {action.label}
      </Link>
    </div>
  );
}
