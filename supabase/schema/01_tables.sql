-- ============================================
-- 01_TABLES.SQL
-- Consolidated Table Definitions for AONet
-- ============================================

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

-- ============================================
-- 1. CORE AUTH & USERS
-- ============================================

CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL REFERENCES "auth"."users"("id") ON DELETE CASCADE,
    "full_name" "text",
    "phone" "text",
    "avatar_url" "text",
    "role" "text" DEFAULT 'customer'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['customer'::"text", 'admin'::"text"]))),
    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."user_contact_info" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL PRIMARY KEY,
    "user_id" "uuid" NOT NULL UNIQUE REFERENCES "auth"."users"("id") ON DELETE CASCADE,
    "email" "text" NOT NULL,
    "phone_number" character varying(15),
    "whatsapp_number" character varying(15),
    "email_verified" boolean DEFAULT false NOT NULL,
    "email_verified_at" timestamp with time zone,
    "phone_verified" boolean DEFAULT false NOT NULL,
    "phone_verified_at" timestamp with time zone,
    "whatsapp_verified" boolean DEFAULT false NOT NULL,
    "whatsapp_verified_at" timestamp with time zone,
    "notification_preferences" "jsonb" DEFAULT '{"promotional": ["email"], "cart_addition": ["email"], "cart_reminder": ["email"], "account_signup": ["email"], "order_tracking": ["email", "sms"], "password_reset": ["email"], "profile_update": ["email"], "order_delivered": ["email", "sms"], "error_notification": ["email"], "order_confirmation": ["email", "sms"], "refund_confirmation": ["email"], "payment_confirmation": ["email", "sms", "whatsapp"]}'::"jsonb" NOT NULL,
    "unsubscribed_from" "jsonb" DEFAULT '[]'::"jsonb",
    "unsubscribe_token" "uuid" DEFAULT "gen_random_uuid"() UNIQUE,
    "max_daily_notifications" integer DEFAULT 10 CHECK ("max_daily_notifications" > 0),
    "quiet_hours_start" time without time zone,
    "quiet_hours_end" time without time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."addresses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL PRIMARY KEY,
    "user_id" "uuid" NOT NULL REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
    "type" "text" NOT NULL CHECK (type IN ('billing', 'shipping')),
    "is_default" boolean DEFAULT false,
    "name" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "street" "text" NOT NULL,
    "city" "text" NOT NULL,
    "state" "text" NOT NULL,
    "pincode" "text" NOT NULL,
    "country" "text" DEFAULT 'India'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);

-- ============================================
-- 2. PRODUCTS & CATEGORIES
-- ============================================

CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "text" NOT NULL PRIMARY KEY,
    "name" "text" NOT NULL,
    "description" "text",
    "sort_order" integer DEFAULT 0,
    "parent_id" "text" REFERENCES "public"."categories"("id"),
    "image_url" "text"
);

CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL PRIMARY KEY,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL UNIQUE,
    "description" "text",
    "long_description" "text",
    "price" integer NOT NULL,
    "original_price" integer,
    "category" "text" NOT NULL,
    "product_type" "text",
    "weight_category" "text",
    "tags" "text"[],
    "weight" "text",
    "in_stock" boolean DEFAULT true,
    "is_bestseller" boolean DEFAULT false,
    "is_featured" boolean DEFAULT false,
    "is_new" boolean DEFAULT false,
    "rating" numeric(2,1) DEFAULT 0,
    "reviews_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);

CREATE TABLE IF NOT EXISTS "public"."product_images" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL PRIMARY KEY,
    "product_id" "uuid" REFERENCES "public"."products"("id") ON DELETE CASCADE,
    "url" "text" NOT NULL,
    "is_primary" boolean DEFAULT false,
    "sort_order" integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "public"."product_weight_variants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL PRIMARY KEY,
    "product_id" "uuid" NOT NULL REFERENCES "public"."products"("id") ON DELETE CASCADE,
    "weight" "text" NOT NULL,
    "price" integer NOT NULL,
    "original_price" integer,
    "stock_quantity" integer DEFAULT 0,
    "in_stock" boolean DEFAULT true,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    UNIQUE("product_id", "weight")
);

-- ============================================
-- 3. ORDERS & CART
-- ============================================

CREATE TABLE IF NOT EXISTS "public"."carts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL PRIMARY KEY,
    "user_id" "uuid" UNIQUE REFERENCES "auth"."users"("id") ON DELETE CASCADE,
    "created_at" timestamp with time zone DEFAULT "now"()
);

CREATE TABLE IF NOT EXISTS "public"."cart_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL PRIMARY KEY,
    "cart_id" "uuid" REFERENCES "public"."carts"("id") ON DELETE CASCADE,
    "product_id" "uuid" REFERENCES "public"."products"("id") ON DELETE CASCADE,
    "quantity" integer DEFAULT 1 NOT NULL CHECK (quantity > 0),
    "weight_variant_id" "uuid" REFERENCES "public"."product_weight_variants"("id") ON DELETE SET NULL,
    UNIQUE("cart_id", "product_id")
);

CREATE TABLE IF NOT EXISTS "public"."offers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL PRIMARY KEY,
    "name" "text" NOT NULL,
    "code" "text" UNIQUE,
    "type" "text" NOT NULL CHECK (type IN ('percentage', 'fixed', 'bogo', 'free_shipping')),
    "value" integer,
    "min_order_value" integer,
    "max_discount" integer,
    "applies_to" "text" DEFAULT 'all'::"text" CHECK (applies_to IN ('all', 'category', 'products')),
    "is_active" boolean DEFAULT true,
    "starts_at" timestamp with time zone,
    "ends_at" timestamp with time zone,
    "usage_limit" integer,
    "used_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "per_user_limit" integer
);

CREATE TABLE IF NOT EXISTS "public"."offer_products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL PRIMARY KEY,
    "offer_id" "uuid" REFERENCES "public"."offers"("id") ON DELETE CASCADE,
    "product_id" "uuid" REFERENCES "public"."products"("id") ON DELETE CASCADE,
    "category" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    UNIQUE("offer_id", "product_id")
);

CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL PRIMARY KEY,
    "user_id" "uuid" REFERENCES "auth"."users"("id"),
    "order_number" "text" UNIQUE,
    "status" "text" DEFAULT 'pending'::"text" CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')),
    "subtotal" integer NOT NULL,
    "shipping_cost" integer DEFAULT 0,
    "total" integer NOT NULL,
    "payment_method" "text" DEFAULT 'cod'::"text",
    "shipping_name" "text",
    "shipping_email" "text",
    "shipping_phone" "text",
    "shipping_address" "text",
    "shipping_city" "text",
    "shipping_state" "text",
    "shipping_pincode" "text",
    "notes" "text",
    "offer_id" "uuid" REFERENCES "public"."offers"("id"),
    "discount_amount" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "razorpay_order_id" "text",
    "razorpay_payment_id" "text",
    "razorpay_signature" "text",
    "payment_status" "text" DEFAULT 'pending'::"text" CHECK (payment_status IN ('pending', 'initiated', 'processing', 'completed', 'failed', 'refunded')),
    "payment_gateway" "text" DEFAULT 'cod'::"text",
    "paid_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL PRIMARY KEY,
    "order_id" "uuid" REFERENCES "public"."orders"("id") ON DELETE CASCADE,
    "product_id" "uuid" REFERENCES "public"."products"("id"),
    "product_name" "text" NOT NULL,
    "product_image" "text",
    "quantity" integer NOT NULL CHECK (quantity > 0),
    "price" integer NOT NULL,
    "weight_variant_id" "uuid" REFERENCES "public"."product_weight_variants"("id") ON DELETE SET NULL,
    "weight_value" "text"
);

CREATE TABLE IF NOT EXISTS "public"."offer_usage" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL PRIMARY KEY,
    "offer_id" "uuid" NOT NULL REFERENCES "public"."offers"("id") ON DELETE CASCADE,
    "user_id" "uuid" NOT NULL REFERENCES "auth"."users"("id") ON DELETE CASCADE,
    "order_id" "uuid" REFERENCES "public"."orders"("id") ON DELETE SET NULL,
    "used_at" timestamp with time zone DEFAULT "now"(),
    UNIQUE("offer_id", "user_id", "order_id")
);

CREATE TABLE IF NOT EXISTS "public"."payment_transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL PRIMARY KEY,
    "order_id" "uuid" REFERENCES "public"."orders"("id") ON DELETE CASCADE,
    "payment_gateway" "text" DEFAULT 'razorpay'::"text" NOT NULL,
    "gateway_order_id" "text",
    "gateway_payment_id" "text",
    "amount" integer NOT NULL,
    "currency" "text" DEFAULT 'INR'::"text",
    "status" "text" NOT NULL CHECK (status IN ('created', 'authorized', 'captured', 'failed', 'refunded')),
    "method" "text",
    "bank" "text",
    "wallet" "text",
    "vpa" "text",
    "card_last4" "text",
    "card_network" "text",
    "error_code" "text",
    "error_description" "text",
    "raw_response" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);

CREATE TABLE IF NOT EXISTS "public"."order_counters" (
    "year" integer NOT NULL PRIMARY KEY,
    "counter" integer DEFAULT 0
);

-- ============================================
-- 4. COMMUNICATION & INQUIRIES
-- ============================================

CREATE TABLE IF NOT EXISTS "public"."contact_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL PRIMARY KEY,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "subject" "text",
    "message" "text" NOT NULL,
    "is_read" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);

CREATE TABLE IF NOT EXISTS "public"."bulk_inquiries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL PRIMARY KEY,
    "company_name" "text" NOT NULL,
    "contact_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "business_type" "text",
    "estimated_volume" "text",
    "products_interested" "text",
    "message" "text",
    "status" "text" DEFAULT 'new'::"text" CHECK (status IN ('new', 'contacted', 'quoted', 'closed')),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "address" "text",
    "pincode" "text" NOT NULL
);

-- ============================================
-- 5. NOTIFICATION SYSTEM (V2)
-- ============================================

CREATE TABLE IF NOT EXISTS "public"."notification_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL PRIMARY KEY,
    "name" "text" NOT NULL,
    "display_name" "text",
    "notification_type" "text" NOT NULL,
    "channel" "text" NOT NULL CHECK (channel IN ('email', 'sms', 'whatsapp')),
    "subject" "text",
    "body" "text" NOT NULL,
    "variables" "jsonb" DEFAULT '[]'::"jsonb",
    "status" "text" DEFAULT 'active'::"text" NOT NULL CHECK (status IN ('draft', 'active', 'inactive', 'archived')),
    "version" integer DEFAULT 1 NOT NULL,
    "is_system_template" boolean DEFAULT false,
    "created_by" "uuid" REFERENCES "auth"."users"("id") ON DELETE SET NULL,
    "updated_by" "uuid" REFERENCES "auth"."users"("id") ON DELETE SET NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "unique_active_template" UNIQUE ("notification_type", "channel", "name")
);

CREATE TABLE IF NOT EXISTS "public"."notification_template_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL PRIMARY KEY,
    "template_id" "uuid" NOT NULL REFERENCES "public"."notification_templates"("id") ON DELETE CASCADE,
    "version" integer NOT NULL,
    "subject" "text",
    "body" "text" NOT NULL,
    "variables" "jsonb",
    "changed_by" "uuid" REFERENCES "auth"."users"("id") ON DELETE SET NULL,
    "change_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."notification_queue" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL PRIMARY KEY,
    "user_id" "uuid" NOT NULL REFERENCES "auth"."users"("id") ON DELETE CASCADE,
    "notification_type" "text" NOT NULL,
    "channels" "text"[] NOT NULL CHECK (array_length(channels, 1) > 0),
    "template_id" "uuid" NOT NULL REFERENCES "public"."notification_templates"("id"),
    "template_variables" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    "error_message" "text",
    "retry_count" integer DEFAULT 0 NOT NULL CHECK (retry_count >= 0),
    "max_retries" integer DEFAULT 3 NOT NULL,
    "next_retry_at" timestamp with time zone,
    "scheduled_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "sent_at" timestamp with time zone,
    "priority" integer DEFAULT 0 CHECK (priority >= 0 AND priority <= 10),
    "processing_started_at" timestamp with time zone,
    "execution_time_ms" integer,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."notification_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL PRIMARY KEY,
    "user_id" "uuid" NOT NULL REFERENCES "auth"."users"("id") ON DELETE CASCADE,
    "notification_type" "text" NOT NULL,
    "channel" "text" NOT NULL,
    "recipient" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'bounced', 'clicked', 'unsubscribed')),
    "error_message" "text",
    "retry_count" integer DEFAULT 0 NOT NULL CHECK (retry_count >= 0),
    "max_retries" integer DEFAULT 3 NOT NULL,
    "subject" "text",
    "body" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "sent_at" timestamp with time zone,
    "last_retry_at" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "is_deleted" boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS "public"."notification_rate_limits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL PRIMARY KEY,
    "user_id" "uuid" NOT NULL REFERENCES "auth"."users"("id") ON DELETE CASCADE,
    "notification_type" "text" NOT NULL,
    "count_in_period" integer DEFAULT 0 NOT NULL CHECK (count_in_period >= 0),
    "period_start" timestamp with time zone DEFAULT "now"() NOT NULL,
    "max_count" integer DEFAULT 10 NOT NULL CHECK (max_count > 0),
    "period_hours" integer DEFAULT 24 NOT NULL CHECK (period_hours > 0),
    "last_notification_at" timestamp with time zone,
    "blocked_until" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "unique_user_notification_rate_limit" UNIQUE ("user_id", "notification_type")
);

CREATE TABLE IF NOT EXISTS "public"."notification_analytics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL PRIMARY KEY,
    "metric_date" "date" NOT NULL,
    "notification_type" "text" NOT NULL,
    "channel" "text" NOT NULL,
    "sent_count" integer DEFAULT 0 NOT NULL CHECK (sent_count >= 0),
    "delivered_count" integer DEFAULT 0 NOT NULL CHECK (delivered_count >= 0),
    "failed_count" integer DEFAULT 0 NOT NULL CHECK (failed_count >= 0),
    "bounced_count" integer DEFAULT 0 NOT NULL CHECK (bounced_count >= 0),
    "clicked_count" integer DEFAULT 0 NOT NULL CHECK (clicked_count >= 0),
    "unsubscribed_count" integer DEFAULT 0 NOT NULL CHECK (unsubscribed_count >= 0),
    "avg_delivery_time_ms" integer,
    "min_delivery_time_ms" integer,
    "max_delivery_time_ms" integer,
    "delivery_rate" numeric(5,2) CHECK (delivery_rate >= 0 AND delivery_rate <= 100),
    "bounce_rate" numeric(5,2) CHECK (bounce_rate >= 0 AND bounce_rate <= 100),
    "unsubscribe_rate" numeric(5,2),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "unique_daily_metrics" UNIQUE ("metric_date", "notification_type", "channel")
);

-- ============================================
-- 6. INDEXES
-- ============================================

-- Products & Categories
CREATE INDEX IF NOT EXISTS "idx_products_category" ON "public"."products" ("category");
CREATE INDEX IF NOT EXISTS "idx_products_slug" ON "public"."products" ("slug");
CREATE INDEX IF NOT EXISTS "idx_products_featured" ON "public"."products" ("is_featured") WHERE ("is_featured" = true);
CREATE INDEX IF NOT EXISTS "idx_product_images_product" ON "public"."product_images" ("product_id");
CREATE INDEX IF NOT EXISTS "idx_weight_variants_in_stock" ON "public"."product_weight_variants" ("in_stock") WHERE ("in_stock" = true);
CREATE INDEX IF NOT EXISTS "idx_weight_variants_product" ON "public"."product_weight_variants" ("product_id");
CREATE INDEX IF NOT EXISTS "idx_categories_parent" ON "public"."categories" ("parent_id");

-- Orders
CREATE INDEX IF NOT EXISTS "idx_orders_user" ON "public"."orders" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_orders_status" ON "public"."orders" ("status");
CREATE INDEX IF NOT EXISTS "idx_orders_number" ON "public"."orders" ("order_number");
CREATE INDEX IF NOT EXISTS "idx_order_items_order" ON "public"."order_items" ("order_id");
CREATE INDEX IF NOT EXISTS "idx_orders_payment_status" ON "public"."orders" ("payment_status");
CREATE INDEX IF NOT EXISTS "idx_orders_payment_gateway" ON "public"."orders" ("payment_gateway");
CREATE INDEX IF NOT EXISTS "idx_orders_razorpay_order" ON "public"."orders" ("razorpay_order_id") WHERE ("razorpay_order_id" IS NOT NULL);

-- Offers
CREATE INDEX IF NOT EXISTS "idx_offers_active" ON "public"."offers" ("is_active") WHERE ("is_active" = true);
CREATE INDEX IF NOT EXISTS "idx_offers_code" ON "public"."offers" ("code") WHERE ("code" IS NOT NULL);
CREATE INDEX IF NOT EXISTS "idx_offer_usage_offer" ON "public"."offer_usage" ("offer_id");
CREATE INDEX IF NOT EXISTS "idx_offer_usage_user" ON "public"."offer_usage" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_offer_usage_offer_user" ON "public"."offer_usage" ("offer_id", "user_id");

-- Communication
CREATE INDEX IF NOT EXISTS "idx_contact_messages_read" ON "public"."contact_messages" ("is_read") WHERE ("is_read" = false);
CREATE INDEX IF NOT EXISTS "idx_bulk_inquiries_status" ON "public"."bulk_inquiries" ("status");

-- Payment
CREATE INDEX IF NOT EXISTS "idx_payment_transactions_order" ON "public"."payment_transactions" ("order_id");
CREATE INDEX IF NOT EXISTS "idx_payment_transactions_status" ON "public"."payment_transactions" ("status");
CREATE INDEX IF NOT EXISTS "idx_payment_transactions_gateway_payment" ON "public"."payment_transactions" ("gateway_payment_id") WHERE ("gateway_payment_id" IS NOT NULL);

-- Notification System
CREATE INDEX IF NOT EXISTS "idx_user_contact_info_user_id" ON "public"."user_contact_info" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_user_contact_info_email" ON "public"."user_contact_info" ("email");
CREATE INDEX IF NOT EXISTS "idx_user_contact_info_phone" ON "public"."user_contact_info" ("phone_number");
CREATE INDEX IF NOT EXISTS "idx_notification_templates_name" ON "public"."notification_templates" ("name") WHERE ("status" IN ('active', 'draft'));
CREATE INDEX IF NOT EXISTS "idx_notification_templates_type_channel" ON "public"."notification_templates" ("notification_type", "channel") WHERE ("status" = 'active');
CREATE INDEX IF NOT EXISTS "idx_notification_queue_status_priority" ON "public"."notification_queue" ("status", "priority" DESC, "scheduled_at") WHERE ("status" = 'pending');
CREATE INDEX IF NOT EXISTS "idx_notification_queue_user_id" ON "public"."notification_queue" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_notification_queue_retry" ON "public"."notification_queue" ("id", "next_retry_at") WHERE ("status" IN ('failed', 'pending') AND "retry_count" < "max_retries");
CREATE INDEX IF NOT EXISTS "idx_notification_logs_user_id" ON "public"."notification_logs" ("user_id") WHERE ("deleted_at" IS NULL);
CREATE INDEX IF NOT EXISTS "idx_notification_logs_status" ON "public"."notification_logs" ("status") WHERE ("deleted_at" IS NULL);
CREATE INDEX IF NOT EXISTS "idx_notification_logs_failed_retry" ON "public"."notification_logs" ("id", "last_retry_at") WHERE ("status" IN ('failed', 'pending') AND "retry_count" < "max_retries" AND "deleted_at" IS NULL);
