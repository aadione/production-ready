CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  pin_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
REVOKE UPDATE (pin_hash) ON public.profiles FROM authenticated;
CREATE UNIQUE INDEX profiles_phone_key ON public.profiles (phone) WHERE phone IS NOT NULL;

-- addresses
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.addresses TO authenticated;
GRANT ALL ON public.addresses TO service_role;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own addresses" ON public.addresses FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX addresses_user_idx ON public.addresses(user_id);

-- carts
CREATE TABLE public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.carts TO authenticated;
GRANT ALL ON public.carts TO service_role;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own cart" ON public.carts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  product_name TEXT,
  product_image TEXT,
  product_brand TEXT,
  shop_name TEXT,
  price NUMERIC(10,2),
  mrp NUMERIC(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (cart_id, product_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;
GRANT ALL ON public.cart_items TO service_role;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own cart items" ON public.cart_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX cart_items_cart_idx ON public.cart_items(cart_id);

-- orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  shipping_address JSONB NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'cod',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  order_status TEXT NOT NULL DEFAULT 'placed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT orders_status_valid CHECK (order_status IN ('placed','confirmed','processing','shipped','out_for_delivery','delivered','cancelled')),
  CONSTRAINT orders_payment_status_valid CHECK (payment_status IN ('pending','paid','failed','refunded')),
  CONSTRAINT orders_payment_method_valid CHECK (payment_method IN ('cod','demo'))
);
GRANT SELECT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE INDEX orders_user_created_idx ON public.orders (user_id, created_at DESC);

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  product_brand TEXT,
  shop_name TEXT,
  price NUMERIC(10,2) NOT NULL,
  mrp NUMERIC(10,2),
  quantity INTEGER NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own order items" ON public.order_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid())
);
CREATE INDEX order_items_order_idx ON public.order_items (order_id);

-- products
CREATE TABLE public.products (
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
CREATE POLICY "public can read active products" ON public.products FOR SELECT TO anon, authenticated USING (is_active);

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

-- timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER addresses_updated BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER carts_updated BEFORE UPDATE ON public.carts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER cart_items_updated BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER orders_updated BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- auto profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    NEW.id,
    NULLIF(NEW.email, ''),
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NULLIF(NEW.phone, ''), NEW.raw_user_meta_data->>'phone')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;

-- one default address per user
CREATE OR REPLACE FUNCTION public.enforce_single_default_address() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.is_default THEN
    UPDATE public.addresses SET is_default = false WHERE user_id = NEW.user_id AND id <> NEW.id AND is_default;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER addresses_single_default AFTER INSERT OR UPDATE OF is_default ON public.addresses FOR EACH ROW WHEN (NEW.is_default) EXECUTE FUNCTION public.enforce_single_default_address();
REVOKE EXECUTE ON FUNCTION public.enforce_single_default_address() FROM anon, authenticated, public;

-- secure PIN hash storage (server only)
CREATE OR REPLACE FUNCTION public.set_user_pin(p_user uuid, p_pin text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF p_pin !~ '^[0-9]{4,6}$' THEN
    RAISE EXCEPTION 'PIN_INVALID';
  END IF;
  UPDATE public.profiles SET pin_hash = extensions.crypt(p_pin, extensions.gen_salt('bf', 10)) WHERE id = p_user;
END;
$$;
REVOKE ALL ON FUNCTION public.set_user_pin(uuid, text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_pin(uuid, text) TO service_role;

-- atomic, server-validated order placement
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

REVOKE ALL ON FUNCTION public.place_order(uuid, jsonb, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.place_order(uuid, jsonb, text) TO authenticated;