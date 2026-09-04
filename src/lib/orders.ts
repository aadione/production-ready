import { supabase } from "@/integrations/supabase/client";
import { findProduct } from "@/lib/data";

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
  addressId: string;
  paymentMethod: "cod";
  items: { product_id: string; quantity: number }[];
};

/** Maps a raw database error onto a sentence a customer can act on. */
function friendlyOrderError(raw: string) {
  const m = raw.toUpperCase();
  if (m.includes("AUTH_REQUIRED")) return "Your session expired. Please log in again.";
  if (m.includes("ADDRESS_INVALID")) return "Please select a valid delivery address.";
  if (m.includes("CART_EMPTY")) return "There is nothing to order.";
  if (m.includes("QUANTITY_INVALID")) return "Please check the quantities in your order.";
  if (m.includes("PAYMENT_UNSUPPORTED")) return "Only Cash on Delivery is available right now.";
  if (m.includes("OUT_OF_STOCK")) {
    const name = raw.split("OUT_OF_STOCK:")[1]?.trim();
    return name ? `“${name}” doesn't have enough stock left.` : "This product is out of stock.";
  }
  if (m.includes("PRODUCT_UNAVAILABLE")) return "Some items are no longer available.";
  return "We couldn't place your order. Please try again.";
}

/**
 * Places the order through the atomic `public.place_order` database function.
 *
 * The browser only sends the address id and product ids + quantities. Prices,
 * MRP, discount, delivery fee, the final total and stock checks are all read
 * and calculated server-side inside a single transaction, so nothing about the
 * money can be tampered with from the client. Returns the new order id.
 */
export async function placeOrder(input: NewOrderInput) {
  const { data, error } = await supabase.rpc("place_order", {
    p_address_id: input.addressId,
    p_items: input.items as unknown as never,
    p_payment_method: input.paymentMethod,
  });
  if (error || !data) {
    console.error("place_order failed", error);
    throw new Error(friendlyOrderError(error?.message ?? ""));
  }
  return data as string;
}

/**
 * Image for an order line. The database snapshot stores names and prices, while
 * artwork ships with the app bundle, so fall back to the local catalogue entry.
 */
export const orderItemImage = (item: { product_id: string; product_image?: string | null }) =>
  item.product_image || findProduct(item.product_id)?.image || null;

export const orderStatusLabel = (s: string) =>
  ({
    placed: "Placed",

    pending: "Pending",
    confirmed: "Confirmed",
    processing: "Processing",
    shipped: "Shipped",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
  })[s] ?? s;

export const paymentStatusLabel = (s: string) =>
  ({ pending: "Pay on Delivery", paid: "Paid", failed: "Failed", refunded: "Refunded" })[s] ?? s;


export const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
