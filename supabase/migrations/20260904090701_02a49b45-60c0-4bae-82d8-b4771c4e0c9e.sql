-- 1. Product catalogue -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY,
  brand text NOT NULL,
  name text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  mrp numeric NOT NULL CHECK (mrp >= 0),
  stock integer NOT NULL DEFAULT 50 CHECK (stock >= 0),
  category text NOT NULL DEFAULT 'General',
  store_name text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public can read active products" ON public.products;
CREATE POLICY "public can read active products" ON public.products
  FOR SELECT TO anon, authenticated USING (is_active);

DROP TRIGGER IF EXISTS products_updated ON public.products;
CREATE TRIGGER products_updated BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.products (id, brand, name, price, mrp, stock, category, store_name) VALUES
  ('boat-rockerz-450-pro','boAt','boAt Rockerz 450 Pro Bluetooth Wireless Over Ear Headphones',1699,2999,40,'Electronics','Sound Hub Electronics'),
  ('boat-airdopes-161-pro','boAt','Airdopes 161 Pro Wireless Earbuds',1499,2599,60,'Electronics','Sound Hub Electronics'),
  ('noise-buds-vs104-pro','Noise','Buds VS104 Pro True Wireless Earbuds',1299,1999,45,'Electronics','Sound Hub Electronics'),
  ('realme-buds-t300','realme','Buds T300 True Wireless Earbuds',1399,1999,35,'Electronics','Sound Hub Electronics'),
  ('oneplus-buds-z2','OnePlus','Buds Z2 Wireless Earbuds',1999,3499,30,'Electronics','Sound Hub Electronics'),
  ('jbl-wave-200tws','JBL','Wave 200TWS Wireless Earbuds',1799,2499,25,'Electronics','Sound Hub Electronics'),
  ('ptron-bassbuds-pro','pTron','Bassbuds Pro Wireless Earbuds',999,1449,80,'Electronics','Sound Hub Electronics'),
  ('mamaearth-aloe-gel','Mamaearth','Aloe Vera Gel 150 ml',229,299,120,'Beauty','Glow House Beauty'),
  ('minimalist-niacinamide','Minimalist','Niacinamide 10% Face Serum',382,449,90,'Beauty','Glow House Beauty'),
  ('puma-smashic','Puma','Smashic Sneakers',2099,2999,20,'Footwear','Daily Bazaar Kirana'),
  ('titan-classic-watch','Titan','Classic Analog Watch',1299,2999,18,'Watches','Sound Hub Electronics'),
  ('engage-perfume','Engage','Signature Eau De Parfum 100ml',699,1499,55,'Beauty','Glow House Beauty'),
  ('sa-hair-oil','Shreeji Aradhya','Hair Maintenance Oil (100ml)',349,499,100,'Hair Care','Shreeji Aradhya'),
  ('sa-charcoal-facewash','Shreeji Aradhya','Charcoal Face Wash (100ml)',249,349,100,'Face Wash','Shreeji Aradhya'),
  ('sa-anti-dandruff','Shreeji Aradhya','Anti Dandruff Shampoo (200ml)',299,449,100,'Hair Care','Shreeji Aradhya'),
  ('sa-vitc-serum','Shreeji Aradhya','Vitamin C Face Serum (30ml)',399,599,100,'Serums','Shreeji Aradhya'),
  ('sa-acne-facewash','Shreeji Aradhya','Acne Control Face Wash (100ml)',269,359,100,'Face Wash','Shreeji Aradhya'),
  ('sa-moisturizer','Shreeji Aradhya','Hydrating Moisturizer (50ml)',329,449,100,'Moisturizers','Shreeji Aradhya'),
  ('sa-body-lotion','Shreeji Aradhya','Body Lotion (250ml)',299,399,100,'Moisturizers','Shreeji Aradhya'),
  ('sa-hair-growth','Shreeji Aradhya','Hair Growth Serum (30ml)',449,649,100,'Serums','Shreeji Aradhya')
ON CONFLICT (id) DO NOTHING;

-- 2. Order status normalisation ----------------------------------------------
ALTER TABLE public.orders ALTER COLUMN order_status SET DEFAULT 'placed';
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_valid;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_valid
  CHECK (order_status IN ('placed','confirmed','processing','shipped','out_for_delivery','delivered','cancelled'));
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_status_valid;
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_status_valid
  CHECK (payment_status IN ('pending','paid','failed','refunded'));
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_method_valid;
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_method_valid
  CHECK (payment_method IN ('cod','demo'));

CREATE INDEX IF NOT EXISTS orders_user_created_idx ON public.orders (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS order_items_order_idx ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS cart_items_cart_idx ON public.cart_items (cart_id);

-- 3. Least-privilege RLS for orders / order_items -----------------------------
DROP POLICY IF EXISTS "own orders" ON public.orders;
CREATE POLICY "read own orders" ON public.orders
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own order items" ON public.order_items;
CREATE POLICY "read own order items" ON public.order_items
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid())
  );

REVOKE INSERT, UPDATE, DELETE ON public.orders FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.order_items FROM authenticated;
GRANT SELECT ON public.orders TO authenticated;
GRANT SELECT ON public.order_items TO authenticated;
GRANT ALL ON public.orders TO service_role;
GRANT ALL ON public.order_items TO service_role;

-- 4. Atomic, server-validated order placement ---------------------------------
CREATE OR REPLACE FUNCTION public.place_order(
  p_address_id uuid,
  p_items jsonb,
  p_payment_method text DEFAULT 'cod'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_addr public.addresses%ROWTYPE;
  v_item jsonb;
  v_pid text;
  v_qty integer;
  v_prod public.products%ROWTYPE;
  v_subtotal numeric := 0;
  v_mrp_total numeric := 0;
  v_delivery numeric := 0;
  v_order_id uuid;
  v_ids text[] := ARRAY[]::text[];
  v_count integer := 0;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED';
  END IF;

  IF p_payment_method IS DISTINCT FROM 'cod' THEN
    RAISE EXCEPTION 'PAYMENT_UNSUPPORTED';
  END IF;

  SELECT * INTO v_addr FROM public.addresses WHERE id = p_address_id AND user_id = v_user;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'ADDRESS_INVALID';
  END IF;

  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'CART_EMPTY';
  END IF;

  INSERT INTO public.orders (user_id, shipping_address, subtotal, discount, delivery_fee, total_amount,
                             payment_method, payment_status, order_status)
  VALUES (v_user, jsonb_build_object(
            'full_name', v_addr.full_name, 'phone', v_addr.phone, 'line1', v_addr.line1,
            'line2', v_addr.line2, 'city', v_addr.city, 'state', v_addr.state, 'pincode', v_addr.pincode),
          0, 0, 0, 0, 'cod', 'pending', 'placed')
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_pid := v_item->>'product_id';
    v_qty := COALESCE((v_item->>'quantity')::integer, 0);

    IF v_pid IS NULL OR v_qty <= 0 OR v_qty > 20 THEN
      RAISE EXCEPTION 'QUANTITY_INVALID';
    END IF;
    IF v_pid = ANY(v_ids) THEN
      RAISE EXCEPTION 'QUANTITY_INVALID';
    END IF;

    SELECT * INTO v_prod FROM public.products WHERE id = v_pid AND is_active FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'PRODUCT_UNAVAILABLE:%', v_pid;
    END IF;
    IF v_prod.stock < v_qty THEN
      RAISE EXCEPTION 'OUT_OF_STOCK:%', v_prod.name;
    END IF;

    UPDATE public.products SET stock = stock - v_qty WHERE id = v_prod.id;

    INSERT INTO public.order_items (order_id, user_id, product_id, product_name, product_brand,
                                    shop_name, price, mrp, quantity, subtotal)
    VALUES (v_order_id, v_user, v_prod.id, v_prod.name, v_prod.brand, COALESCE(v_prod.store_name, v_prod.brand),
            v_prod.price, v_prod.mrp, v_qty, v_prod.price * v_qty);

    v_subtotal := v_subtotal + v_prod.price * v_qty;
    v_mrp_total := v_mrp_total + v_prod.mrp * v_qty;
    v_ids := array_append(v_ids, v_prod.id);
    v_count := v_count + 1;
  END LOOP;

  v_delivery := CASE WHEN v_subtotal >= 299 THEN 0 ELSE 40 END;

  UPDATE public.orders
     SET subtotal = v_subtotal,
         discount = GREATEST(v_mrp_total - v_subtotal, 0),
         delivery_fee = v_delivery,
         total_amount = v_subtotal + v_delivery
   WHERE id = v_order_id;

  DELETE FROM public.cart_items WHERE user_id = v_user AND product_id = ANY(v_ids);

  RETURN v_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.place_order(uuid, jsonb, text) FROM public;
GRANT EXECUTE ON FUNCTION public.place_order(uuid, jsonb, text) TO authenticated;