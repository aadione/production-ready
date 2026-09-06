import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * The generated `Database` types predate the Seller Center tables
 * (`sellers`, `product_images`, `products.seller_id`). Rather than editing the
 * generated file, seller screens talk to Supabase through this loosely typed
 * view of the same browser client — RLS still enforces every rule.
 */
const sdb = supabase as unknown as SupabaseClient;

export type Seller = {
  id: string;
  owner_name: string;
  phone: string;
  shop_name: string;
  shop_address: string;
  postal_pin: string;
  logo_url: string | null;
  is_active: boolean;
};

export type SellerProduct = {
  id: string;
  brand: string;
  name: string;
  price: number;
  mrp: number;
  stock: number;
  category: string;
  store_name: string | null;
  is_active: boolean;
  created_at: string;
  images?: string[];
};

export const MAX_IMAGES = 5;

export const discountPct = (mrp: number, price: number) =>
  mrp > 0 && price < mrp ? Math.round(((mrp - price) / mrp) * 100) : 0;

export const PRODUCT_CATEGORIES = [
  "Grocery",
  "Electronics",
  "Fashion",
  "Beauty",
  "Home",
  "Kitchen",
  "Toys",
  "Books",
  "Fitness",
  "General",
];

export async function fetchSeller(userId: string): Promise<Seller | null> {
  const { data, error } = await sdb
    .from("sellers")
    .select("id, owner_name, phone, shop_name, shop_address, postal_pin, logo_url, is_active")
    .eq("id", userId)
    .maybeSingle();
  if (error) return null;
  return (data as Seller | null) ?? null;
}

export async function updateShop(
  userId: string,
  patch: Partial<Pick<Seller, "owner_name" | "shop_name" | "shop_address" | "postal_pin" | "logo_url">>,
) {
  const { error } = await sdb.from("sellers").update(patch).eq("id", userId);
  if (error) throw new Error("Could not save your shop details.");
}

export async function fetchSellerProducts(userId: string): Promise<SellerProduct[]> {
  const { data, error } = await sdb
    .from("products")
    .select("id, brand, name, price, mrp, stock, category, store_name, is_active, created_at")
    .eq("seller_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error("Could not load your products.");
  const rows = (data ?? []) as SellerProduct[];
  if (rows.length === 0) return rows;

  const { data: imgs } = await sdb
    .from("product_images")
    .select("product_id, url, sort_order")
    .in(
      "product_id",
      rows.map((r) => r.id),
    )
    .order("sort_order", { ascending: true });
  const byProduct = new Map<string, string[]>();
  for (const row of (imgs ?? []) as { product_id: string; url: string }[]) {
    const list = byProduct.get(row.product_id) ?? [];
    list.push(row.url);
    byProduct.set(row.product_id, list);
  }
  return rows.map((r) => ({ ...r, images: byProduct.get(r.id) ?? [] }));
}

export async function fetchSellerProduct(userId: string, id: string): Promise<SellerProduct | null> {
  const { data, error } = await sdb
    .from("products")
    .select("id, brand, name, price, mrp, stock, category, store_name, is_active, created_at")
    .eq("seller_id", userId)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  const { data: imgs } = await sdb
    .from("product_images")
    .select("url, sort_order")
    .eq("product_id", id)
    .order("sort_order", { ascending: true });
  return {
    ...(data as SellerProduct),
    images: ((imgs ?? []) as { url: string }[]).map((i) => i.url),
  };
}

export type ProductInput = {
  name: string;
  brand: string;
  price: number;
  mrp: number;
  stock: number;
  category: string;
  store_name: string;
};

export async function createProduct(userId: string, input: ProductInput): Promise<string> {
  const { data, error } = await sdb
    .from("products")
    .insert({ ...input, seller_id: userId, is_active: true })
    .select("id")
    .single();
  if (error || !data) throw new Error("Could not save this product.");
  return (data as { id: string }).id;
}

export async function updateProduct(userId: string, id: string, input: Partial<ProductInput>) {
  const { error } = await sdb.from("products").update(input).eq("id", id).eq("seller_id", userId);
  if (error) throw new Error("Could not update this product.");
}

export async function setProductActive(userId: string, id: string, isActive: boolean) {
  const { error } = await sdb
    .from("products")
    .update({ is_active: isActive })
    .eq("id", id)
    .eq("seller_id", userId);
  if (error) throw new Error("Could not change the product status.");
}

export async function deleteProduct(userId: string, id: string) {
  const { error } = await sdb.from("products").delete().eq("id", id).eq("seller_id", userId);
  if (error) throw new Error("Could not delete this product.");
}

function safeName(file: File) {
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext || "jpg"}`;
}

/** Uploads to a folder named after the seller's user id (required by storage RLS). */
async function uploadTo(bucket: string, userId: string, file: File) {
  const path = `${userId}/${safeName(file)}`;
  const { error } = await sdb.storage.from(bucket).upload(path, file, { upsert: false });
  if (error) throw new Error("Image upload failed. Please try a smaller image.");
  return sdb.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export async function uploadShopLogo(userId: string, file: File) {
  return uploadTo("shop-logos", userId, file);
}

export async function uploadProductImages(userId: string, productId: string, files: File[], startAt = 0) {
  let order = startAt;
  for (const file of files) {
    const url = await uploadTo("product-images", userId, file);
    const { error } = await sdb
      .from("product_images")
      .insert({ product_id: productId, seller_id: userId, url, sort_order: order });
    if (error) throw new Error("Could not attach this image to the product.");
    order += 1;
  }
}

export async function deleteProductImage(userId: string, url: string) {
  const { error } = await sdb.from("product_images").delete().eq("url", url).eq("seller_id", userId);
  if (error) throw new Error("Could not remove this image.");
}
