import { supabase } from "@/integrations/supabase/client";

export type OrderRow = {
  id: string;
  created_at: string;
  subtotal: number;
  discount: number;
  delivery_fee: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  shipping_address: ShippingSnapshot;
};

export type ShippingSnapshot = {
  full_name: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
};

export type OrderItemRow = {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  product_brand: string | null;
  shop_name: string | null;
  price: number;
  mrp: number | null;
  quantity: number;
  subtotal: number;
};

const ORDER_COLUMNS =
  "id, created_at, subtotal, discount, delivery_fee, total_amount, payment_method, payment_status, order_status, shipping_address";
const ITEM_COLUMNS =
  "id, product_id, product_name, product_image, product_brand, shop_name, price, mrp, quantity, subtotal";

/** All orders for the signed-in user (RLS scopes the rows). */
export async function listMyOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select(`${ORDER_COLUMNS}, order_items(${ITEM_COLUMNS})`)
    .order("created_at", { ascending: false });
  if (error) throw new Error("Could not load your orders.");
  return (data ?? []) as unknown as (OrderRow & { order_items: OrderItemRow[] })[];
}

/** A single order with its items, or null when it does not exist / is not yours. */
export async function getMyOrder(orderId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select(`${ORDER_COLUMNS}, order_items(${ITEM_COLUMNS})`)
    .eq("id", orderId)
    .maybeSingle();
  if (error) throw new Error("Could not load this order.");
  return (data as unknown as (OrderRow & { order_items: OrderItemRow[] }) | null) ?? null;
}

export type NewOrderInput = {
  userId: string;
  shipping: ShippingSnapshot;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  items: Omit<OrderItemRow, "id">[];
};

/** Creates the order + its item snapshots. Returns the new order id. */
export async function placeOrder(input: NewOrderInput) {
  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      user_id: input.userId,
      shipping_address: input.shipping,
      subtotal: input.subtotal,
      discount: input.discount,
      delivery_fee: input.deliveryFee,
      total_amount: input.total,
      payment_method: input.paymentMethod,
      payment_status: "pending",
      order_status: "confirmed",
    })
    .select("id")
    .single();
  if (error || !order) throw new Error("We could not place your order. Please try again.");

  const { error: itemsError } = await supabase.from("order_items").insert(
    input.items.map((it) => ({
      order_id: order.id,
      user_id: input.userId,
      product_id: it.product_id,
      product_name: it.product_name,
      product_image: it.product_image,
      product_brand: it.product_brand,
      shop_name: it.shop_name,
      price: it.price,
      mrp: it.mrp,
      quantity: it.quantity,
      subtotal: it.subtotal,
    })),
  );
  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    throw new Error("We could not save your order items. Please try again.");
  }
  return order.id as string;
}

export const orderStatusLabel = (s: string) =>
  ({
    pending: "Pending",
    confirmed: "Confirmed",
    processing: "Processing",
    shipped: "Shipped",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
  })[s] ?? s;

export const paymentStatusLabel = (s: string) =>
  ({ pending: "Pay on Delivery", paid: "Paid", failed: "Failed" })[s] ?? s;


export const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
