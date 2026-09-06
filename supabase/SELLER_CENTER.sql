-- =====================================================================
-- SELLER CENTER — additive, idempotent setup for the EXISTING project.
-- Safe to run multiple times. Does NOT drop or modify existing customer
-- tables, data, policies or the place_order() RPC.
--
-- Run this once in Supabase → SQL Editor (project prulydvoiijjojojzmrg).
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. SELLERS ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sellers (
  id           UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  owner_name   TEXT NOT NULL,
  phone        TEXT NOT NULL UNIQUE,
  shop_name    TEXT NOT NULL,
  shop_address TEXT NOT NULL,
  postal_pin   TEXT NOT NULL,
  logo_url     TEXT,
  pin_hash     TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.sellers TO authenticated;
GRANT ALL ON public.sellers TO service_role;
-- pin_hash must never be readable/writable from the browser.
REVOKE ALL (pin_hash) ON public.sellers FROM authenticated, anon;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "seller reads own shop" ON public.sellers;
CREATE POLICY "seller reads own shop" ON public.sellers
  FOR SELECT TO authenticated USING (id = auth.uid());

DROP POLICY IF EXISTS "seller updates own shop" ON public.sellers;
CREATE POLICY "seller updates own shop" ON public.sellers
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Helper used by product policies (SECURITY DEFINER avoids recursive RLS).
CREATE OR REPLACE FUNCTION public.is_seller(_user UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.sellers s WHERE s.id = _user AND s.is_active);
$$;
GRANT EXECUTE ON FUNCTION public.is_seller(UUID) TO authenticated, service_role;

-- Server-only: stores a bcrypt hash of the seller login PIN.
CREATE OR REPLACE FUNCTION public.set_seller_pin(p_user UUID, p_pin TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
BEGIN
  UPDATE public.sellers SET pin_hash = crypt(p_pin, gen_salt('bf', 10)) WHERE id = p_user;
END;
$$;
REVOKE ALL ON FUNCTION public.set_seller_pin(UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_seller_pin(UUID, TEXT) TO service_role;

-- 2. PRODUCT OWNERSHIP ------------------------------------------------------
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES public.sellers(id) ON DELETE CASCADE;

-- Seller-created products get an id automatically; existing TEXT ids stay valid.
ALTER TABLE public.products ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE public.products ALTER COLUMN brand SET DEFAULT '';
CREATE INDEX IF NOT EXISTS products_seller_idx ON public.products(seller_id);

-- Customers keep read-only access. Sellers may write ONLY their own rows.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT ON public.products TO anon;
GRANT ALL ON public.products TO service_role;

DROP POLICY IF EXISTS "seller reads own products" ON public.products;
CREATE POLICY "seller reads own products" ON public.products
  FOR SELECT TO authenticated USING (seller_id = auth.uid());

DROP POLICY IF EXISTS "seller inserts own products" ON public.products;
CREATE POLICY "seller inserts own products" ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (seller_id = auth.uid() AND public.is_seller(auth.uid()));

DROP POLICY IF EXISTS "seller updates own products" ON public.products;
CREATE POLICY "seller updates own products" ON public.products
  FOR UPDATE TO authenticated
  USING (seller_id = auth.uid() AND public.is_seller(auth.uid()))
  WITH CHECK (seller_id = auth.uid());

DROP POLICY IF EXISTS "seller deletes own products" ON public.products;
CREATE POLICY "seller deletes own products" ON public.products
  FOR DELETE TO authenticated
  USING (seller_id = auth.uid() AND public.is_seller(auth.uid()));

-- 3. PRODUCT IMAGES (1–5 per product) --------------------------------------
CREATE TABLE IF NOT EXISTS public.product_images (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  seller_id  UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS product_images_product_idx ON public.product_images(product_id);

GRANT SELECT ON public.product_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT ALL ON public.product_images TO service_role;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone reads product images" ON public.product_images;
CREATE POLICY "anyone reads product images" ON public.product_images
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "seller writes own product images" ON public.product_images;
CREATE POLICY "seller writes own product images" ON public.product_images
  FOR INSERT TO authenticated
  WITH CHECK (seller_id = auth.uid() AND public.is_seller(auth.uid()));

DROP POLICY IF EXISTS "seller updates own product images" ON public.product_images;
CREATE POLICY "seller updates own product images" ON public.product_images
  FOR UPDATE TO authenticated USING (seller_id = auth.uid()) WITH CHECK (seller_id = auth.uid());

DROP POLICY IF EXISTS "seller deletes own product images" ON public.product_images;
CREATE POLICY "seller deletes own product images" ON public.product_images
  FOR DELETE TO authenticated USING (seller_id = auth.uid());

-- Hard cap of 5 images per product, enforced in the database.
CREATE OR REPLACE FUNCTION public.enforce_image_limit() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (SELECT count(*) FROM public.product_images WHERE product_id = NEW.product_id) >= 5 THEN
    RAISE EXCEPTION 'A product can have at most 5 images';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS product_images_limit ON public.product_images;
CREATE TRIGGER product_images_limit BEFORE INSERT ON public.product_images
  FOR EACH ROW EXECUTE FUNCTION public.enforce_image_limit();

-- 4. UPDATED_AT TRIGGER FOR SELLERS ----------------------------------------
DROP TRIGGER IF EXISTS sellers_updated ON public.sellers;
CREATE TRIGGER sellers_updated BEFORE UPDATE ON public.sellers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. STORAGE ---------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('shop-logos', 'shop-logos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "public reads seller media" ON storage.objects;
CREATE POLICY "public reads seller media" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id IN ('product-images', 'shop-logos'));

-- Sellers may only write inside a folder named after their own user id.
DROP POLICY IF EXISTS "seller uploads own media" ON storage.objects;
CREATE POLICY "seller uploads own media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id IN ('product-images', 'shop-logos')
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND public.is_seller(auth.uid())
  );

DROP POLICY IF EXISTS "seller updates own media" ON storage.objects;
CREATE POLICY "seller updates own media" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id IN ('product-images', 'shop-logos')
         AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "seller deletes own media" ON storage.objects;
CREATE POLICY "seller deletes own media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id IN ('product-images', 'shop-logos')
         AND (storage.foldername(name))[1] = auth.uid()::text);
