drop extension if exists "pg_net";

drop policy "Admins can update bulk inquiries" on "public"."bulk_inquiries";

drop policy "Admins can view bulk inquiries" on "public"."bulk_inquiries";

drop policy "Anyone can submit bulk inquiry" on "public"."bulk_inquiries";

drop policy "Admins can view all profiles" on "public"."profiles";


  create table "public"."order_counters" (
    "year" integer not null,
    "counter" integer default 0
      );


alter table "public"."order_counters" enable row level security;


  create table "public"."payment_transactions" (
    "id" uuid not null default gen_random_uuid(),
    "order_id" uuid,
    "payment_gateway" text not null default 'razorpay'::text,
    "gateway_order_id" text,
    "gateway_payment_id" text,
    "amount" integer not null,
    "currency" text default 'INR'::text,
    "status" text not null,
    "method" text,
    "bank" text,
    "wallet" text,
    "vpa" text,
    "card_last4" text,
    "card_network" text,
    "error_code" text,
    "error_description" text,
    "raw_response" jsonb,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."payment_transactions" enable row level security;


  create table "public"."product_weight_variants" (
    "id" uuid not null default gen_random_uuid(),
    "product_id" uuid not null,
    "weight" text not null,
    "price" integer not null,
    "original_price" integer,
    "stock_quantity" integer default 0,
    "in_stock" boolean default true,
    "sort_order" integer default 0,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."product_weight_variants" enable row level security;

alter table "public"."bulk_inquiries" add column "address" text;

alter table "public"."bulk_inquiries" add column "pincode" text not null;

alter table "public"."cart_items" add column "weight_variant_id" uuid;

alter table "public"."categories" add column "image_url" text;

alter table "public"."categories" add column "parent_id" text;

alter table "public"."order_items" add column "weight_value" text;

alter table "public"."order_items" add column "weight_variant_id" uuid;

alter table "public"."orders" add column "paid_at" timestamp with time zone;

alter table "public"."orders" add column "payment_gateway" text default 'cod'::text;

alter table "public"."orders" add column "payment_status" text default 'pending'::text;

alter table "public"."orders" add column "razorpay_order_id" text;

alter table "public"."orders" add column "razorpay_payment_id" text;

alter table "public"."orders" add column "razorpay_signature" text;

alter table "public"."products" drop column "brewing_amount";

alter table "public"."products" drop column "brewing_temp";

alter table "public"."products" drop column "brewing_time";

alter table "public"."products" drop column "origin";

CREATE INDEX idx_categories_parent ON public.categories USING btree (parent_id);

CREATE INDEX idx_orders_payment_gateway ON public.orders USING btree (payment_gateway);

CREATE INDEX idx_orders_payment_status ON public.orders USING btree (payment_status);

CREATE INDEX idx_orders_razorpay_order ON public.orders USING btree (razorpay_order_id) WHERE (razorpay_order_id IS NOT NULL);

CREATE INDEX idx_payment_transactions_gateway_payment ON public.payment_transactions USING btree (gateway_payment_id) WHERE (gateway_payment_id IS NOT NULL);

CREATE INDEX idx_payment_transactions_order ON public.payment_transactions USING btree (order_id);

CREATE INDEX idx_payment_transactions_status ON public.payment_transactions USING btree (status);

CREATE INDEX idx_weight_variants_in_stock ON public.product_weight_variants USING btree (in_stock) WHERE (in_stock = true);

CREATE INDEX idx_weight_variants_product ON public.product_weight_variants USING btree (product_id);

CREATE UNIQUE INDEX order_counters_pkey ON public.order_counters USING btree (year);

CREATE UNIQUE INDEX orders_order_number_unique ON public.orders USING btree (order_number);

CREATE UNIQUE INDEX payment_transactions_pkey ON public.payment_transactions USING btree (id);

CREATE UNIQUE INDEX product_weight_variants_pkey ON public.product_weight_variants USING btree (id);

CREATE UNIQUE INDEX product_weight_variants_product_id_weight_key ON public.product_weight_variants USING btree (product_id, weight);

alter table "public"."order_counters" add constraint "order_counters_pkey" PRIMARY KEY using index "order_counters_pkey";

alter table "public"."payment_transactions" add constraint "payment_transactions_pkey" PRIMARY KEY using index "payment_transactions_pkey";

alter table "public"."product_weight_variants" add constraint "product_weight_variants_pkey" PRIMARY KEY using index "product_weight_variants_pkey";

alter table "public"."cart_items" add constraint "cart_items_weight_variant_id_fkey" FOREIGN KEY (weight_variant_id) REFERENCES public.product_weight_variants(id) ON DELETE SET NULL not valid;

alter table "public"."cart_items" validate constraint "cart_items_weight_variant_id_fkey";

alter table "public"."categories" add constraint "categories_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES public.categories(id) not valid;

alter table "public"."categories" validate constraint "categories_parent_id_fkey";

alter table "public"."order_items" add constraint "order_items_weight_variant_id_fkey" FOREIGN KEY (weight_variant_id) REFERENCES public.product_weight_variants(id) ON DELETE SET NULL not valid;

alter table "public"."order_items" validate constraint "order_items_weight_variant_id_fkey";

alter table "public"."orders" add constraint "orders_order_number_unique" UNIQUE using index "orders_order_number_unique";

alter table "public"."orders" add constraint "orders_payment_status_check" CHECK ((payment_status = ANY (ARRAY['pending'::text, 'initiated'::text, 'processing'::text, 'completed'::text, 'failed'::text, 'refunded'::text]))) not valid;

alter table "public"."orders" validate constraint "orders_payment_status_check";

alter table "public"."payment_transactions" add constraint "payment_transactions_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE not valid;

alter table "public"."payment_transactions" validate constraint "payment_transactions_order_id_fkey";

alter table "public"."payment_transactions" add constraint "payment_transactions_status_check" CHECK ((status = ANY (ARRAY['created'::text, 'authorized'::text, 'captured'::text, 'failed'::text, 'refunded'::text]))) not valid;

alter table "public"."payment_transactions" validate constraint "payment_transactions_status_check";

alter table "public"."product_weight_variants" add constraint "product_weight_variants_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE not valid;

alter table "public"."product_weight_variants" validate constraint "product_weight_variants_product_id_fkey";

alter table "public"."product_weight_variants" add constraint "product_weight_variants_product_id_weight_key" UNIQUE using index "product_weight_variants_product_id_weight_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_product_min_price(p_product_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
  min_variant_price INTEGER;
  product_price INTEGER;
BEGIN
  -- Get minimum price from variants
  SELECT MIN(price) INTO min_variant_price
  FROM product_weight_variants
  WHERE product_id = p_product_id AND in_stock = true;
  
  -- If no variants, get product base price
  IF min_variant_price IS NULL THEN
    SELECT price INTO product_price
    FROM products
    WHERE id = p_product_id;
    RETURN product_price;
  END IF;
  
  RETURN min_variant_price;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_order_payment_status(p_order_id uuid, p_payment_id text, p_signature text, p_status text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE orders
  SET 
    razorpay_payment_id = p_payment_id,
    razorpay_signature = p_signature,
    payment_status = p_status,
    paid_at = CASE WHEN p_status = 'completed' THEN NOW() ELSE paid_at END,
    status = CASE WHEN p_status = 'completed' THEN 'confirmed' ELSE status END,
    updated_at = NOW()
  WHERE id = p_order_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_order_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  year_part INTEGER;
  seq_num INTEGER;
BEGIN
  year_part := EXTRACT(YEAR FROM NOW())::INTEGER;
  
  -- Upsert and increment counter atomically
  -- This uses PostgreSQL's INSERT ... ON CONFLICT with RETURNING for atomic increment
  INSERT INTO order_counters (year, counter)
  VALUES (year_part, 1)
  ON CONFLICT (year) DO UPDATE
  SET counter = order_counters.counter + 1
  RETURNING counter INTO seq_num;
  
  NEW.order_number := 'ORD-' || year_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."order_counters" to "anon";

grant insert on table "public"."order_counters" to "anon";

grant references on table "public"."order_counters" to "anon";

grant select on table "public"."order_counters" to "anon";

grant trigger on table "public"."order_counters" to "anon";

grant truncate on table "public"."order_counters" to "anon";

grant update on table "public"."order_counters" to "anon";

grant delete on table "public"."order_counters" to "authenticated";

grant insert on table "public"."order_counters" to "authenticated";

grant references on table "public"."order_counters" to "authenticated";

grant select on table "public"."order_counters" to "authenticated";

grant trigger on table "public"."order_counters" to "authenticated";

grant truncate on table "public"."order_counters" to "authenticated";

grant update on table "public"."order_counters" to "authenticated";

grant delete on table "public"."order_counters" to "service_role";

grant insert on table "public"."order_counters" to "service_role";

grant references on table "public"."order_counters" to "service_role";

grant select on table "public"."order_counters" to "service_role";

grant trigger on table "public"."order_counters" to "service_role";

grant truncate on table "public"."order_counters" to "service_role";

grant update on table "public"."order_counters" to "service_role";

grant delete on table "public"."payment_transactions" to "anon";

grant insert on table "public"."payment_transactions" to "anon";

grant references on table "public"."payment_transactions" to "anon";

grant select on table "public"."payment_transactions" to "anon";

grant trigger on table "public"."payment_transactions" to "anon";

grant truncate on table "public"."payment_transactions" to "anon";

grant update on table "public"."payment_transactions" to "anon";

grant delete on table "public"."payment_transactions" to "authenticated";

grant insert on table "public"."payment_transactions" to "authenticated";

grant references on table "public"."payment_transactions" to "authenticated";

grant select on table "public"."payment_transactions" to "authenticated";

grant trigger on table "public"."payment_transactions" to "authenticated";

grant truncate on table "public"."payment_transactions" to "authenticated";

grant update on table "public"."payment_transactions" to "authenticated";

grant delete on table "public"."payment_transactions" to "service_role";

grant insert on table "public"."payment_transactions" to "service_role";

grant references on table "public"."payment_transactions" to "service_role";

grant select on table "public"."payment_transactions" to "service_role";

grant trigger on table "public"."payment_transactions" to "service_role";

grant truncate on table "public"."payment_transactions" to "service_role";

grant update on table "public"."payment_transactions" to "service_role";

grant delete on table "public"."product_weight_variants" to "anon";

grant insert on table "public"."product_weight_variants" to "anon";

grant references on table "public"."product_weight_variants" to "anon";

grant select on table "public"."product_weight_variants" to "anon";

grant trigger on table "public"."product_weight_variants" to "anon";

grant truncate on table "public"."product_weight_variants" to "anon";

grant update on table "public"."product_weight_variants" to "anon";

grant delete on table "public"."product_weight_variants" to "authenticated";

grant insert on table "public"."product_weight_variants" to "authenticated";

grant references on table "public"."product_weight_variants" to "authenticated";

grant select on table "public"."product_weight_variants" to "authenticated";

grant trigger on table "public"."product_weight_variants" to "authenticated";

grant truncate on table "public"."product_weight_variants" to "authenticated";

grant update on table "public"."product_weight_variants" to "authenticated";

grant delete on table "public"."product_weight_variants" to "service_role";

grant insert on table "public"."product_weight_variants" to "service_role";

grant references on table "public"."product_weight_variants" to "service_role";

grant select on table "public"."product_weight_variants" to "service_role";

grant trigger on table "public"."product_weight_variants" to "service_role";

grant truncate on table "public"."product_weight_variants" to "service_role";

grant update on table "public"."product_weight_variants" to "service_role";


  create policy "Allow admin to delete bulk_inquiries"
  on "public"."bulk_inquiries"
  as permissive
  for delete
  to authenticated
using (true);



  create policy "Allow admin to read all bulk_inquiries"
  on "public"."bulk_inquiries"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Allow admin to update bulk_inquiries"
  on "public"."bulk_inquiries"
  as permissive
  for update
  to authenticated
using (true)
with check (true);



  create policy "Allow public insert on bulk_inquiries"
  on "public"."bulk_inquiries"
  as permissive
  for insert
  to public
with check (true);



  create policy "Allow authenticated users to insert order counters"
  on "public"."order_counters"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Allow authenticated users to read order counters"
  on "public"."order_counters"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Allow authenticated users to update order counters"
  on "public"."order_counters"
  as permissive
  for update
  to authenticated
using (true)
with check (true);



  create policy "Allow service role full access to order counters"
  on "public"."order_counters"
  as permissive
  for all
  to service_role
using (true)
with check (true);



  create policy "Admins can view all payment transactions"
  on "public"."payment_transactions"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "Service role can insert payment transactions"
  on "public"."payment_transactions"
  as permissive
  for insert
  to public
with check (true);



  create policy "Service role can update payment transactions"
  on "public"."payment_transactions"
  as permissive
  for update
  to public
using (true);



  create policy "Users can view own payment transactions"
  on "public"."payment_transactions"
  as permissive
  for select
  to public
using ((order_id IN ( SELECT orders.id
   FROM public.orders
  WHERE (orders.user_id = auth.uid()))));



  create policy "Admins can manage weight variants"
  on "public"."product_weight_variants"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "Weight variants are viewable by everyone"
  on "public"."product_weight_variants"
  as permissive
  for select
  to public
using (true);



  create policy "Allow authenticated deletes"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'product-images'::text));



  create policy "Allow authenticated uploads"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'product-images'::text));



  create policy "Public read access"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'product-images'::text));



