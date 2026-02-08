-- ============================================
-- 04_POLICIES.SQL
-- Consolidated RLS Policies for AONet
-- ============================================

-- A. ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."product_images" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."product_weight_variants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."carts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."cart_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."offers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."offer_products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."payment_transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."contact_messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."bulk_inquiries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."addresses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."order_counters" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."offer_usage" ENABLE ROW LEVEL SECURITY;

-- Notification System Tables
ALTER TABLE "public"."user_contact_info" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."notification_templates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."notification_template_history" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."notification_queue" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."notification_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."notification_rate_limits" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."notification_analytics" ENABLE ROW LEVEL SECURITY;

-- ============================================
-- B. CORE DOMAIN POLICIES
-- ============================================

-- 1. PROFILES
-- Users can view/update own profile
CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING (auth.uid() = id);
-- Admins can view all profiles (implicit in some queries, explicit policy good)
CREATE POLICY "Admins can view all profiles" ON "public"."profiles" FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 2. PRODUCTS & CATEGORIES
-- Public read access
CREATE POLICY "Products are publicly readable" ON "public"."products" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Categories are publicly readable" ON "public"."categories" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Product images are publicly readable" ON "public"."product_images" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Weight variants are viewable by everyone" ON "public"."product_weight_variants" FOR SELECT USING (true);

-- Admin manage access
CREATE POLICY "Admins can insert products" ON "public"."products" FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update products" ON "public"."products" FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete products" ON "public"."products" FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- (Repeat relevant admin policies for categories, images, variants)
CREATE POLICY "Admins can insert categories" ON "public"."categories" FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update categories" ON "public"."categories" FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete categories" ON "public"."categories" FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 3. CART & CART ITEMS
-- Users manage own cart
CREATE POLICY "Users can manage own cart" ON "public"."carts" USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own cart items" ON "public"."cart_items" USING (
  EXISTS (SELECT 1 FROM public.carts WHERE id = cart_items.cart_id AND user_id = auth.uid())
);

-- 4. ORDERS & ORDER ITEMS
-- Users create/view own
CREATE POLICY "Users can create orders" ON "public"."orders" FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can view own orders" ON "public"."orders" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create order items" ON "public"."order_items" FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND (user_id = auth.uid() OR user_id IS NULL))
);
CREATE POLICY "Users can view own order items" ON "public"."order_items" FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND user_id = auth.uid())
);

-- Admin full access
CREATE POLICY "Admins can view all orders" ON "public"."orders" FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update orders" ON "public"."orders" FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete orders" ON "public"."orders" FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 5. OFFERS
-- Public read active
CREATE POLICY "Active offers are publicly readable" ON "public"."offers" FOR SELECT TO anon, authenticated USING (
  is_active = true AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at >= now())
);
CREATE POLICY "Offer products publicly readable" ON "public"."offer_products" FOR SELECT TO anon, authenticated USING (true);

-- Admin manage
CREATE POLICY "Admins can insert offers" ON "public"."offers" FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update offers" ON "public"."offers" FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete offers" ON "public"."offers" FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 6. ADDRESSES
CREATE POLICY "Users can view their own addresses" ON "public"."addresses" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own addresses" ON "public"."addresses" FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own addresses" ON "public"."addresses" FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own addresses" ON "public"."addresses" FOR DELETE USING (auth.uid() = user_id);

-- 7. COMMUNICATION
CREATE POLICY "Anyone can submit contact message" ON "public"."contact_messages" FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view contact messages" ON "public"."contact_messages" FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Allow public insert on bulk_inquiries" ON "public"."bulk_inquiries" FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin to read all bulk_inquiries" ON "public"."bulk_inquiries" FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================
-- C. NOTIFICATION SYSTEM POLICIES (Comprehensive V2)
-- ============================================

-- Notification Logs
CREATE POLICY "notification_logs_users_select" ON "public"."notification_logs" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notification_logs_admins_select" ON "public"."notification_logs" FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
-- Service role only writes
CREATE POLICY "notification_logs_service_insert" ON "public"."notification_logs" FOR INSERT WITH CHECK (false);
CREATE POLICY "notification_logs_service_update" ON "public"."notification_logs" FOR UPDATE USING (false) WITH CHECK (false);
CREATE POLICY "notification_logs_service_delete" ON "public"."notification_logs" FOR DELETE USING (false);

-- User Contact Info
CREATE POLICY "user_contact_info_users_select" ON "public"."user_contact_info" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_contact_info_admins_select" ON "public"."user_contact_info" FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "user_contact_info_users_update" ON "public"."user_contact_info" FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_contact_info_service_insert" ON "public"."user_contact_info" FOR INSERT WITH CHECK (false);

-- Notification Templates
CREATE POLICY "notification_templates_select" ON "public"."notification_templates" FOR SELECT USING (status = 'active');
CREATE POLICY "notification_templates_admins_insert" ON "public"."notification_templates" FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "notification_templates_admins_update" ON "public"."notification_templates" FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "notification_templates_admins_delete" ON "public"."notification_templates" FOR DELETE USING (
  is_system_template = false AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Notification Template History
CREATE POLICY "notification_template_history_select" ON "public"."notification_template_history" FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "notification_template_history_insert" ON "public"."notification_template_history" FOR INSERT WITH CHECK (false);

-- Notification Queue (Service Role Only)
CREATE POLICY "notification_queue_select" ON "public"."notification_queue" FOR SELECT USING (false);
CREATE POLICY "notification_queue_insert" ON "public"."notification_queue" FOR INSERT WITH CHECK (false);
CREATE POLICY "notification_queue_update" ON "public"."notification_queue" FOR UPDATE USING (false) WITH CHECK (false);

-- Notification Rate Limits
CREATE POLICY "notification_rate_limits_users_select" ON "public"."notification_rate_limits" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notification_rate_limits_admins_select" ON "public"."notification_rate_limits" FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "notification_rate_limits_insert" ON "public"."notification_rate_limits" FOR INSERT WITH CHECK (false);

-- Notification Analytics
CREATE POLICY "notification_analytics_select" ON "public"."notification_analytics" FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "notification_analytics_insert" ON "public"."notification_analytics" FOR INSERT WITH CHECK (false);

-- ============================================
-- D. STORAGE POLICIES
-- ============================================

-- Allow Public Read Access
CREATE POLICY "Public Access" ON storage.objects FOR SELECT
USING ( bucket_id = 'content-images' );

CREATE POLICY "Public read access" ON storage.objects FOR SELECT
USING ( bucket_id = 'product-images' );

-- Allow Authenticated Uploads
CREATE POLICY "Auth Upload content" ON storage.objects FOR INSERT TO authenticated
WITH CHECK ( bucket_id = 'content-images' );

CREATE POLICY "Allow authenticated uploads products" ON storage.objects FOR INSERT TO authenticated
WITH CHECK ( bucket_id = 'product-images' );

-- Allow Authenticated Updates
CREATE POLICY "Auth Update content" ON storage.objects FOR UPDATE TO authenticated
USING ( bucket_id = 'content-images' );

-- Allow Authenticated Deletes
CREATE POLICY "Auth Delete content" ON storage.objects FOR DELETE TO authenticated
USING ( bucket_id = 'content-images' );

CREATE POLICY "Allow authenticated deletes products" ON storage.objects FOR DELETE TO authenticated
USING ( bucket_id = 'product-images' );

-- ============================================
-- E. GRANTS
-- ============================================

GRANT USAGE ON SCHEMA "public" TO "anon", "authenticated", "service_role";
GRANT ALL ON ALL TABLES IN SCHEMA "public" TO "service_role";
GRANT ALL ON ALL SEQUENCES IN SCHEMA "public" TO "service_role";
GRANT ALL ON ALL FUNCTIONS IN SCHEMA "public" TO "service_role";
