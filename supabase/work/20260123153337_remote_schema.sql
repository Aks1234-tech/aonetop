SET statement_timeout = 0
SET lock_timeout = 0
SET idle_in_transaction_session_timeout = 0
SET client_encoding = 'UTF8'
SET standard_conforming_strings = on
SELECT pg_catalog.set_config('search_path', '', false)
SET check_function_bodies = false
SET xmloption = content
SET client_min_messages = warning
SET row_security = off
COMMENT ON SCHEMA "public" IS 'standard public schema'
CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql"
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions"
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions"
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault"
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions"
CREATE OR REPLACE FUNCTION "public"."generate_order_number"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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
$$
ALTER FUNCTION "public"."generate_order_number"() OWNER TO "postgres"
COMMENT ON FUNCTION "public"."generate_order_number"() IS 'Generates unique order numbers in format ORD-YYYY-NNNN using atomic counter increment'
CREATE OR REPLACE FUNCTION "public"."get_product_min_price"("p_product_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
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
$$
ALTER FUNCTION "public"."get_product_min_price"("p_product_id" "uuid") OWNER TO "postgres"
CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$
ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres"
CREATE OR REPLACE FUNCTION "public"."track_template_version_history"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.body != OLD.body OR NEW.subject != OLD.subject THEN
    INSERT INTO public.notification_template_history (
      template_id, version, subject, body, variables, changed_by, change_reason, created_at
    ) VALUES (
      NEW.id, OLD.version, OLD.subject, OLD.body, OLD.variables, 
      auth.uid(), 'Template updated', NOW()
    );
  END IF;
  RETURN NEW;
END;
$$
ALTER FUNCTION "public"."track_template_version_history"() OWNER TO "postgres"
CREATE OR REPLACE FUNCTION "public"."update_notification_analytics_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$
ALTER FUNCTION "public"."update_notification_analytics_updated_at"() OWNER TO "postgres"
CREATE OR REPLACE FUNCTION "public"."update_notification_logs_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$
ALTER FUNCTION "public"."update_notification_logs_updated_at"() OWNER TO "postgres"
CREATE OR REPLACE FUNCTION "public"."update_notification_queue_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$
ALTER FUNCTION "public"."update_notification_queue_updated_at"() OWNER TO "postgres"
CREATE OR REPLACE FUNCTION "public"."update_notification_rate_limits_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$
ALTER FUNCTION "public"."update_notification_rate_limits_updated_at"() OWNER TO "postgres"
CREATE OR REPLACE FUNCTION "public"."update_notification_templates_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$
ALTER FUNCTION "public"."update_notification_templates_updated_at"() OWNER TO "postgres"
CREATE OR REPLACE FUNCTION "public"."update_order_payment_status"("p_order_id" "uuid", "p_payment_id" "text", "p_signature" "text", "p_status" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$
ALTER FUNCTION "public"."update_order_payment_status"("p_order_id" "uuid", "p_payment_id" "text", "p_signature" "text", "p_status" "text") OWNER TO "postgres"
CREATE OR REPLACE FUNCTION "public"."update_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$
ALTER FUNCTION "public"."update_updated_at"() OWNER TO "postgres"
CREATE OR REPLACE FUNCTION "public"."update_user_contact_info_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$
ALTER FUNCTION "public"."update_user_contact_info_updated_at"() OWNER TO "postgres"
SET default_tablespace = ''
SET default_table_access_method = "heap"
CREATE TABLE IF NOT EXISTS "public"."addresses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "is_default" boolean DEFAULT false,
    "name" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "street" "text" NOT NULL,
    "city" "text" NOT NULL,
    "state" "text" NOT NULL,
    "pincode" "text" NOT NULL,
    "country" "text" DEFAULT 'India'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "addresses_type_check" CHECK (("type" = ANY (ARRAY['billing'::"text", 'shipping'::"text"])))
)
ALTER TABLE "public"."addresses" OWNER TO "postgres"
CREATE TABLE IF NOT EXISTS "public"."bulk_inquiries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_name" "text" NOT NULL,
    "contact_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "business_type" "text",
    "estimated_volume" "text",
    "products_interested" "text",
    "message" "text",
    "status" "text" DEFAULT 'new'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "address" "text",
    "pincode" "text" NOT NULL,
    CONSTRAINT "bulk_inquiries_status_check" CHECK (("status" = ANY (ARRAY['new'::"text", 'contacted'::"text", 'quoted'::"text", 'closed'::"text"])))
)
ALTER TABLE "public"."bulk_inquiries" OWNER TO "postgres"
CREATE TABLE IF NOT EXISTS "public"."cart_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "cart_id" "uuid",
    "product_id" "uuid",
    "quantity" integer DEFAULT 1 NOT NULL,
    "weight_variant_id" "uuid",
    CONSTRAINT "cart_items_quantity_check" CHECK (("quantity" > 0))
)
ALTER TABLE "public"."cart_items" OWNER TO "postgres"
CREATE TABLE IF NOT EXISTS "public"."carts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
)
ALTER TABLE "public"."carts" OWNER TO "postgres"
CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "sort_order" integer DEFAULT 0,
    "parent_id" "text",
    "image_url" "text"
)
ALTER TABLE "public"."categories" OWNER TO "postgres"
CREATE TABLE IF NOT EXISTS "public"."contact_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "subject" "text",
    "message" "text" NOT NULL,
    "is_read" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
)
ALTER TABLE "public"."contact_messages" OWNER TO "postgres"
CREATE TABLE IF NOT EXISTS "public"."notification_analytics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "metric_date" "date" NOT NULL,
    "notification_type" character varying(50) NOT NULL,
    "channel" character varying(20) NOT NULL,
    "sent_count" integer DEFAULT 0 NOT NULL,
    "delivered_count" integer DEFAULT 0 NOT NULL,
    "failed_count" integer DEFAULT 0 NOT NULL,
    "bounced_count" integer DEFAULT 0 NOT NULL,
    "clicked_count" integer DEFAULT 0 NOT NULL,
    "unsubscribed_count" integer DEFAULT 0 NOT NULL,
    "avg_delivery_time_ms" integer,
    "min_delivery_time_ms" integer,
    "max_delivery_time_ms" integer,
    "delivery_rate" numeric(5,2),
    "bounce_rate" numeric(5,2),
    "unsubscribe_rate" numeric(5,2),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "notification_analytics_bounced_count_check" CHECK (("bounced_count" >= 0)),
    CONSTRAINT "notification_analytics_clicked_count_check" CHECK (("clicked_count" >= 0)),
    CONSTRAINT "notification_analytics_delivered_count_check" CHECK (("delivered_count" >= 0)),
    CONSTRAINT "notification_analytics_failed_count_check" CHECK (("failed_count" >= 0)),
    CONSTRAINT "notification_analytics_sent_count_check" CHECK (("sent_count" >= 0)),
    CONSTRAINT "notification_analytics_unsubscribed_count_check" CHECK (("unsubscribed_count" >= 0)),
    CONSTRAINT "valid_bounce_rate" CHECK ((("bounce_rate" >= (0)::numeric) AND ("bounce_rate" <= (100)::numeric))),
    CONSTRAINT "valid_delivery_rate" CHECK ((("delivery_rate" >= (0)::numeric) AND ("delivery_rate" <= (100)::numeric)))
)
ALTER TABLE "public"."notification_analytics" OWNER TO "postgres"
COMMENT ON TABLE "public"."notification_analytics" IS 'Daily aggregated notification metrics for monitoring and analysis'
COMMENT ON COLUMN "public"."notification_analytics"."delivery_rate" IS 'Percentage of sent notifications that were delivered'
COMMENT ON COLUMN "public"."notification_analytics"."bounce_rate" IS 'Percentage of emails that bounced'
CREATE TABLE IF NOT EXISTS "public"."notification_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "notification_type" character varying(50) NOT NULL,
    "channel" character varying(20) NOT NULL,
    "recipient" "text" NOT NULL,
    "status" character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    "error_message" "text",
    "retry_count" integer DEFAULT 0 NOT NULL,
    "max_retries" integer DEFAULT 3 NOT NULL,
    "subject" "text",
    "body" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "sent_at" timestamp with time zone,
    "last_retry_at" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "is_deleted" boolean DEFAULT false,
    CONSTRAINT "notification_logs_retry_count_check" CHECK (("retry_count" >= 0)),
    CONSTRAINT "notification_logs_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'sent'::character varying, 'failed'::character varying, 'bounced'::character varying, 'clicked'::character varying, 'unsubscribed'::character varying])::"text"[])))
)
ALTER TABLE "public"."notification_logs" OWNER TO "postgres"
COMMENT ON TABLE "public"."notification_logs" IS 'Audit log for all notifications sent across all channels (email, SMS, WhatsApp)'
COMMENT ON COLUMN "public"."notification_logs"."notification_type" IS 'Type: account_signup, password_reset, order_confirmation, payment_confirmation, order_tracking, error_notification, etc.'
COMMENT ON COLUMN "public"."notification_logs"."channel" IS 'Channel: email, sms, whatsapp'
COMMENT ON COLUMN "public"."notification_logs"."status" IS 'Status: pending, sent, failed, bounced, clicked, unsubscribed'
COMMENT ON COLUMN "public"."notification_logs"."metadata" IS 'Additional context: {order_id: uuid, product_ids: [uuid], tracking_url: string, etc.}'
COMMENT ON COLUMN "public"."notification_logs"."deleted_at" IS 'Soft delete timestamp for audit trail'
CREATE TABLE IF NOT EXISTS "public"."notification_queue" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "notification_type" character varying(50) NOT NULL,
    "channels" "text"[] NOT NULL,
    "template_id" "uuid" NOT NULL,
    "template_variables" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "status" character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    "error_message" "text",
    "retry_count" integer DEFAULT 0 NOT NULL,
    "max_retries" integer DEFAULT 3 NOT NULL,
    "next_retry_at" timestamp with time zone,
    "scheduled_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "sent_at" timestamp with time zone,
    "priority" integer DEFAULT 0,
    "processing_started_at" timestamp with time zone,
    "execution_time_ms" integer,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "notification_queue_channels_check" CHECK (("array_length"("channels", 1) > 0)),
    CONSTRAINT "notification_queue_priority_check" CHECK ((("priority" >= 0) AND ("priority" <= 10))),
    CONSTRAINT "notification_queue_retry_count_check" CHECK (("retry_count" >= 0)),
    CONSTRAINT "notification_queue_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying, 'cancelled'::character varying])::"text"[])))
)
ALTER TABLE "public"."notification_queue" OWNER TO "postgres"
COMMENT ON TABLE "public"."notification_queue" IS 'Queue of pending notifications for async background processing'
COMMENT ON COLUMN "public"."notification_queue"."channels" IS 'Array of channels: ARRAY[''email'', ''sms'']'
COMMENT ON COLUMN "public"."notification_queue"."priority" IS 'Priority level: 0-10 (higher = process first)'
COMMENT ON COLUMN "public"."notification_queue"."execution_time_ms" IS 'Time taken to process this notification in milliseconds'
CREATE TABLE IF NOT EXISTS "public"."notification_rate_limits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "notification_type" character varying(50) NOT NULL,
    "count_in_period" integer DEFAULT 0 NOT NULL,
    "period_start" timestamp with time zone DEFAULT "now"() NOT NULL,
    "max_count" integer DEFAULT 10 NOT NULL,
    "period_hours" integer DEFAULT 24 NOT NULL,
    "last_notification_at" timestamp with time zone,
    "blocked_until" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "notification_rate_limits_count_in_period_check" CHECK (("count_in_period" >= 0)),
    CONSTRAINT "notification_rate_limits_max_count_check" CHECK (("max_count" > 0)),
    CONSTRAINT "notification_rate_limits_period_hours_check" CHECK (("period_hours" > 0))
)
ALTER TABLE "public"."notification_rate_limits" OWNER TO "postgres"
COMMENT ON TABLE "public"."notification_rate_limits" IS 'Rate limiting per user per notification type to prevent spam'
COMMENT ON COLUMN "public"."notification_rate_limits"."blocked_until" IS 'Timestamp until which this notification type is blocked for user'
CREATE TABLE IF NOT EXISTS "public"."notification_template_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "template_id" "uuid" NOT NULL,
    "version" integer NOT NULL,
    "subject" character varying(255),
    "body" "text" NOT NULL,
    "variables" "jsonb",
    "changed_by" "uuid",
    "change_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
)
ALTER TABLE "public"."notification_template_history" OWNER TO "postgres"
COMMENT ON TABLE "public"."notification_template_history" IS 'Historical versions of notification templates for audit trail and rollback'
CREATE TABLE IF NOT EXISTS "public"."notification_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "display_name" character varying(150),
    "notification_type" character varying(50) NOT NULL,
    "channel" character varying(20) NOT NULL,
    "subject" character varying(255),
    "body" "text" NOT NULL,
    "variables" "jsonb" DEFAULT '[]'::"jsonb",
    "status" character varying(20) DEFAULT 'active'::character varying NOT NULL,
    "version" integer DEFAULT 1 NOT NULL,
    "is_system_template" boolean DEFAULT false,
    "created_by" "uuid",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "notification_templates_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['draft'::character varying, 'active'::character varying, 'inactive'::character varying, 'archived'::character varying])::"text"[]))),
    CONSTRAINT "valid_channel" CHECK ((("channel")::"text" = ANY ((ARRAY['email'::character varying, 'sms'::character varying, 'whatsapp'::character varying])::"text"[])))
)
ALTER TABLE "public"."notification_templates" OWNER TO "postgres"
COMMENT ON TABLE "public"."notification_templates" IS 'Reusable notification templates with variable substitution support'
COMMENT ON COLUMN "public"."notification_templates"."variables" IS 'JSONB array of variable names expected in body: ["user_name", "order_id", etc]'
COMMENT ON COLUMN "public"."notification_templates"."is_system_template" IS 'System templates are protected from deletion'
CREATE TABLE IF NOT EXISTS "public"."offer_products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "offer_id" "uuid",
    "product_id" "uuid",
    "category" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
)
ALTER TABLE "public"."offer_products" OWNER TO "postgres"
CREATE TABLE IF NOT EXISTS "public"."offer_usage" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "offer_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "order_id" "uuid",
    "used_at" timestamp with time zone DEFAULT "now"()
)
ALTER TABLE "public"."offer_usage" OWNER TO "postgres"
CREATE TABLE IF NOT EXISTS "public"."offers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "code" "text",
    "type" "text" NOT NULL,
    "value" integer,
    "min_order_value" integer,
    "max_discount" integer,
    "applies_to" "text" DEFAULT 'all'::"text",
    "is_active" boolean DEFAULT true,
    "starts_at" timestamp with time zone,
    "ends_at" timestamp with time zone,
    "usage_limit" integer,
    "used_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "per_user_limit" integer,
    CONSTRAINT "offers_applies_to_check" CHECK (("applies_to" = ANY (ARRAY['all'::"text", 'category'::"text", 'products'::"text"]))),
    CONSTRAINT "offers_type_check" CHECK (("type" = ANY (ARRAY['percentage'::"text", 'fixed'::"text", 'bogo'::"text", 'free_shipping'::"text"])))
)
ALTER TABLE "public"."offers" OWNER TO "postgres"
CREATE TABLE IF NOT EXISTS "public"."order_counters" (
    "year" integer NOT NULL,
    "counter" integer DEFAULT 0
)
ALTER TABLE "public"."order_counters" OWNER TO "postgres"
COMMENT ON TABLE "public"."order_counters" IS 'Stores yearly order counters for thread-safe order number generation'
CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid",
    "product_id" "uuid",
    "product_name" "text" NOT NULL,
    "product_image" "text",
    "quantity" integer NOT NULL,
    "price" integer NOT NULL,
    "weight_variant_id" "uuid",
    "weight_value" "text",
    CONSTRAINT "order_items_quantity_check" CHECK (("quantity" > 0))
)
ALTER TABLE "public"."order_items" OWNER TO "postgres"
CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "order_number" "text",
    "status" "text" DEFAULT 'pending'::"text",
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
    "offer_id" "uuid",
    "discount_amount" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "razorpay_order_id" "text",
    "razorpay_payment_id" "text",
    "razorpay_signature" "text",
    "payment_status" "text" DEFAULT 'pending'::"text",
    "payment_gateway" "text" DEFAULT 'cod'::"text",
    "paid_at" timestamp with time zone,
    CONSTRAINT "orders_payment_status_check" CHECK (("payment_status" = ANY (ARRAY['pending'::"text", 'initiated'::"text", 'processing'::"text", 'completed'::"text", 'failed'::"text", 'refunded'::"text"]))),
    CONSTRAINT "orders_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'confirmed'::"text", 'processing'::"text", 'shipped'::"text", 'delivered'::"text", 'cancelled'::"text", 'returned'::"text"])))
)
ALTER TABLE "public"."orders" OWNER TO "postgres"
CREATE TABLE IF NOT EXISTS "public"."payment_transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid",
    "payment_gateway" "text" DEFAULT 'razorpay'::"text" NOT NULL,
    "gateway_order_id" "text",
    "gateway_payment_id" "text",
    "amount" integer NOT NULL,
    "currency" "text" DEFAULT 'INR'::"text",
    "status" "text" NOT NULL,
    "method" "text",
    "bank" "text",
    "wallet" "text",
    "vpa" "text",
    "card_last4" "text",
    "card_network" "text",
    "error_code" "text",
    "error_description" "text",
    "raw_response" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "payment_transactions_status_check" CHECK (("status" = ANY (ARRAY['created'::"text", 'authorized'::"text", 'captured'::"text", 'failed'::"text", 'refunded'::"text"])))
)
ALTER TABLE "public"."payment_transactions" OWNER TO "postgres"
CREATE TABLE IF NOT EXISTS "public"."product_images" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid",
    "url" "text" NOT NULL,
    "is_primary" boolean DEFAULT false,
    "sort_order" integer DEFAULT 0
)
ALTER TABLE "public"."product_images" OWNER TO "postgres"
CREATE TABLE IF NOT EXISTS "public"."product_weight_variants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "weight" "text" NOT NULL,
    "price" integer NOT NULL,
    "original_price" integer,
    "stock_quantity" integer DEFAULT 0,
    "in_stock" boolean DEFAULT true,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
)
ALTER TABLE "public"."product_weight_variants" OWNER TO "postgres"
CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
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
)
ALTER TABLE "public"."products" OWNER TO "postgres"
CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text",
    "phone" "text",
    "avatar_url" "text",
    "role" "text" DEFAULT 'customer'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['customer'::"text", 'admin'::"text"])))
)
ALTER TABLE "public"."profiles" OWNER TO "postgres"
CREATE TABLE IF NOT EXISTS "public"."user_contact_info" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
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
    "unsubscribe_token" "uuid" DEFAULT "gen_random_uuid"(),
    "max_daily_notifications" integer DEFAULT 10,
    "quiet_hours_start" time without time zone,
    "quiet_hours_end" time without time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "user_contact_info_max_daily_notifications_check" CHECK (("max_daily_notifications" > 0))
)
ALTER TABLE "public"."user_contact_info" OWNER TO "postgres"
COMMENT ON TABLE "public"."user_contact_info" IS 'User contact information and granular notification preferences'
COMMENT ON COLUMN "public"."user_contact_info"."notification_preferences" IS 'JSONB mapping notification_type -> array of channels'
COMMENT ON COLUMN "public"."user_contact_info"."unsubscribed_from" IS 'Array of notification types user has unsubscribed from'
COMMENT ON COLUMN "public"."user_contact_info"."quiet_hours_start" IS 'Start of quiet hours (e.g., 22:00) - no notifications sent during this period'
COMMENT ON COLUMN "public"."user_contact_info"."quiet_hours_end" IS 'End of quiet hours (e.g., 08:00) - resume notifications after this time'
ALTER TABLE ONLY "public"."addresses"
    ADD CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
ALTER TABLE ONLY "public"."bulk_inquiries"
    ADD CONSTRAINT "bulk_inquiries_pkey" PRIMARY KEY ("id")
ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_cart_id_product_id_key" UNIQUE ("cart_id", "product_id")
ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
ALTER TABLE ONLY "public"."carts"
    ADD CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
ALTER TABLE ONLY "public"."carts"
    ADD CONSTRAINT "carts_user_id_key" UNIQUE ("user_id")
ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
ALTER TABLE ONLY "public"."contact_messages"
    ADD CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
ALTER TABLE ONLY "public"."notification_analytics"
    ADD CONSTRAINT "notification_analytics_pkey" PRIMARY KEY ("id")
ALTER TABLE ONLY "public"."notification_logs"
    ADD CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
ALTER TABLE ONLY "public"."notification_queue"
    ADD CONSTRAINT "notification_queue_pkey" PRIMARY KEY ("id")
ALTER TABLE ONLY "public"."notification_rate_limits"
    ADD CONSTRAINT "notification_rate_limits_pkey" PRIMARY KEY ("id")
ALTER TABLE ONLY "public"."notification_template_history"
    ADD CONSTRAINT "notification_template_history_pkey" PRIMARY KEY ("id")
ALTER TABLE ONLY "public"."notification_templates"
    ADD CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
ALTER TABLE ONLY "public"."offer_products"
    ADD CONSTRAINT "offer_products_offer_id_product_id_key" UNIQUE ("offer_id", "product_id")
ALTER TABLE ONLY "public"."offer_products"
    ADD CONSTRAINT "offer_products_pkey" PRIMARY KEY ("id")
ALTER TABLE ONLY "public"."offer_usage"
    ADD CONSTRAINT "offer_usage_offer_id_user_id_order_id_key" UNIQUE ("offer_id", "user_id", "order_id")
ALTER TABLE ONLY "public"."offer_usage"
    ADD CONSTRAINT "offer_usage_pkey" PRIMARY KEY ("id")
ALTER TABLE ONLY "public"."offers"
    ADD CONSTRAINT "offers_code_key" UNIQUE ("code")
ALTER TABLE ONLY "public"."offers"
    ADD CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
ALTER TABLE ONLY "public"."order_counters"
    ADD CONSTRAINT "order_counters_pkey" PRIMARY KEY ("year")
ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_order_number_key" UNIQUE ("order_number")
ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_order_number_unique" UNIQUE ("order_number")
ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
ALTER TABLE ONLY "public"."payment_transactions"
    ADD CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
ALTER TABLE ONLY "public"."product_images"
    ADD CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
ALTER TABLE ONLY "public"."product_weight_variants"
    ADD CONSTRAINT "product_weight_variants_pkey" PRIMARY KEY ("id")
ALTER TABLE ONLY "public"."product_weight_variants"
    ADD CONSTRAINT "product_weight_variants_product_id_weight_key" UNIQUE ("product_id", "weight")
ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id")
ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_slug_key" UNIQUE ("slug")
ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
ALTER TABLE ONLY "public"."notification_templates"
    ADD CONSTRAINT "unique_active_template" UNIQUE ("notification_type", "channel", "name")
ALTER TABLE ONLY "public"."notification_analytics"
    ADD CONSTRAINT "unique_daily_metrics" UNIQUE ("metric_date", "notification_type", "channel")
ALTER TABLE ONLY "public"."notification_rate_limits"
    ADD CONSTRAINT "unique_user_notification_rate_limit" UNIQUE ("user_id", "notification_type")
ALTER TABLE ONLY "public"."user_contact_info"
    ADD CONSTRAINT "user_contact_info_pkey" PRIMARY KEY ("id")
ALTER TABLE ONLY "public"."user_contact_info"
    ADD CONSTRAINT "user_contact_info_unsubscribe_token_key" UNIQUE ("unsubscribe_token")
ALTER TABLE ONLY "public"."user_contact_info"
    ADD CONSTRAINT "user_contact_info_user_id_key" UNIQUE ("user_id")
CREATE INDEX "idx_bulk_inquiries_status" ON "public"."bulk_inquiries" USING "btree" ("status")
CREATE INDEX "idx_cart_items_cart" ON "public"."cart_items" USING "btree" ("cart_id")
CREATE INDEX "idx_categories_parent" ON "public"."categories" USING "btree" ("parent_id")
CREATE INDEX "idx_contact_messages_read" ON "public"."contact_messages" USING "btree" ("is_read") WHERE ("is_read" = false)
CREATE INDEX "idx_notification_analytics_date" ON "public"."notification_analytics" USING "btree" ("metric_date" DESC)
CREATE INDEX "idx_notification_analytics_type_channel" ON "public"."notification_analytics" USING "btree" ("notification_type", "channel")
CREATE INDEX "idx_notification_analytics_type_date" ON "public"."notification_analytics" USING "btree" ("notification_type", "metric_date" DESC)
CREATE INDEX "idx_notification_logs_channel" ON "public"."notification_logs" USING "btree" ("channel") WHERE ("deleted_at" IS NULL)
CREATE INDEX "idx_notification_logs_created_at" ON "public"."notification_logs" USING "btree" ("created_at" DESC) WHERE ("deleted_at" IS NULL)
CREATE INDEX "idx_notification_logs_failed_retry" ON "public"."notification_logs" USING "btree" ("id", "last_retry_at") WHERE ((("status")::"text" = ANY ((ARRAY['failed'::character varying, 'pending'::character varying])::"text"[])) AND ("retry_count" < "max_retries") AND ("deleted_at" IS NULL))
CREATE INDEX "idx_notification_logs_recipient" ON "public"."notification_logs" USING "btree" ("recipient") WHERE ("deleted_at" IS NULL)
CREATE INDEX "idx_notification_logs_status" ON "public"."notification_logs" USING "btree" ("status") WHERE ("deleted_at" IS NULL)
CREATE INDEX "idx_notification_logs_user_id" ON "public"."notification_logs" USING "btree" ("user_id") WHERE ("deleted_at" IS NULL)
CREATE INDEX "idx_notification_logs_user_status" ON "public"."notification_logs" USING "btree" ("user_id", "status") WHERE ("deleted_at" IS NULL)
CREATE INDEX "idx_notification_logs_user_type" ON "public"."notification_logs" USING "btree" ("user_id", "notification_type") WHERE ("deleted_at" IS NULL)
CREATE INDEX "idx_notification_queue_processing" ON "public"."notification_queue" USING "btree" ("status", "processing_started_at") WHERE (("status")::"text" = 'processing'::"text")
CREATE INDEX "idx_notification_queue_retry" ON "public"."notification_queue" USING "btree" ("id", "next_retry_at") WHERE ((("status")::"text" = ANY ((ARRAY['failed'::character varying, 'pending'::character varying])::"text"[])) AND ("retry_count" < "max_retries"))
CREATE INDEX "idx_notification_queue_scheduled_at" ON "public"."notification_queue" USING "btree" ("scheduled_at")
CREATE INDEX "idx_notification_queue_status_priority" ON "public"."notification_queue" USING "btree" ("status", "priority" DESC, "scheduled_at") WHERE (("status")::"text" = 'pending'::"text")
CREATE INDEX "idx_notification_queue_user_id" ON "public"."notification_queue" USING "btree" ("user_id")
CREATE INDEX "idx_notification_rate_limits_blocked" ON "public"."notification_rate_limits" USING "btree" ("user_id") WHERE ("blocked_until" IS NOT NULL)
CREATE INDEX "idx_notification_rate_limits_period_start" ON "public"."notification_rate_limits" USING "btree" ("period_start" DESC)
CREATE INDEX "idx_notification_rate_limits_user_type" ON "public"."notification_rate_limits" USING "btree" ("user_id", "notification_type")
CREATE INDEX "idx_notification_template_history_template_id" ON "public"."notification_template_history" USING "btree" ("template_id")
CREATE INDEX "idx_notification_template_history_version" ON "public"."notification_template_history" USING "btree" ("template_id", "version")
CREATE INDEX "idx_notification_templates_created_by" ON "public"."notification_templates" USING "btree" ("created_by")
CREATE INDEX "idx_notification_templates_name" ON "public"."notification_templates" USING "btree" ("name") WHERE (("status")::"text" = ANY ((ARRAY['active'::character varying, 'draft'::character varying])::"text"[]))
CREATE INDEX "idx_notification_templates_status" ON "public"."notification_templates" USING "btree" ("status")
CREATE INDEX "idx_notification_templates_type_channel" ON "public"."notification_templates" USING "btree" ("notification_type", "channel") WHERE (("status")::"text" = 'active'::"text")
CREATE INDEX "idx_offer_usage_offer" ON "public"."offer_usage" USING "btree" ("offer_id")
CREATE INDEX "idx_offer_usage_offer_user" ON "public"."offer_usage" USING "btree" ("offer_id", "user_id")
CREATE INDEX "idx_offer_usage_user" ON "public"."offer_usage" USING "btree" ("user_id")
CREATE INDEX "idx_offers_active" ON "public"."offers" USING "btree" ("is_active") WHERE ("is_active" = true)
CREATE INDEX "idx_offers_code" ON "public"."offers" USING "btree" ("code") WHERE ("code" IS NOT NULL)
CREATE INDEX "idx_order_items_order" ON "public"."order_items" USING "btree" ("order_id")
CREATE INDEX "idx_orders_number" ON "public"."orders" USING "btree" ("order_number")
CREATE INDEX "idx_orders_payment_gateway" ON "public"."orders" USING "btree" ("payment_gateway")
CREATE INDEX "idx_orders_payment_status" ON "public"."orders" USING "btree" ("payment_status")
CREATE INDEX "idx_orders_razorpay_order" ON "public"."orders" USING "btree" ("razorpay_order_id") WHERE ("razorpay_order_id" IS NOT NULL)
CREATE INDEX "idx_orders_status" ON "public"."orders" USING "btree" ("status")
CREATE INDEX "idx_orders_user" ON "public"."orders" USING "btree" ("user_id")
CREATE INDEX "idx_payment_transactions_gateway_payment" ON "public"."payment_transactions" USING "btree" ("gateway_payment_id") WHERE ("gateway_payment_id" IS NOT NULL)
CREATE INDEX "idx_payment_transactions_order" ON "public"."payment_transactions" USING "btree" ("order_id")
CREATE INDEX "idx_payment_transactions_status" ON "public"."payment_transactions" USING "btree" ("status")
CREATE INDEX "idx_product_images_product" ON "public"."product_images" USING "btree" ("product_id")
CREATE INDEX "idx_products_category" ON "public"."products" USING "btree" ("category")
CREATE INDEX "idx_products_featured" ON "public"."products" USING "btree" ("is_featured") WHERE ("is_featured" = true)
CREATE INDEX "idx_products_slug" ON "public"."products" USING "btree" ("slug")
CREATE INDEX "idx_user_contact_info_email" ON "public"."user_contact_info" USING "btree" ("email")
CREATE INDEX "idx_user_contact_info_email_verified" ON "public"."user_contact_info" USING "btree" ("user_id") WHERE ("email_verified" = true)
CREATE INDEX "idx_user_contact_info_phone" ON "public"."user_contact_info" USING "btree" ("phone_number")
CREATE INDEX "idx_user_contact_info_phone_verified" ON "public"."user_contact_info" USING "btree" ("user_id") WHERE ("phone_verified" = true)
CREATE INDEX "idx_user_contact_info_unsubscribe_token" ON "public"."user_contact_info" USING "btree" ("unsubscribe_token")
CREATE INDEX "idx_user_contact_info_user_id" ON "public"."user_contact_info" USING "btree" ("user_id")
CREATE INDEX "idx_user_contact_info_whatsapp" ON "public"."user_contact_info" USING "btree" ("whatsapp_number")
CREATE INDEX "idx_weight_variants_in_stock" ON "public"."product_weight_variants" USING "btree" ("in_stock") WHERE ("in_stock" = true)
CREATE INDEX "idx_weight_variants_product" ON "public"."product_weight_variants" USING "btree" ("product_id")
CREATE OR REPLACE TRIGGER "notification_analytics_updated_at_trigger" BEFORE UPDATE ON "public"."notification_analytics" FOR EACH ROW EXECUTE FUNCTION "public"."update_notification_analytics_updated_at"()
CREATE OR REPLACE TRIGGER "notification_logs_updated_at_trigger" BEFORE UPDATE ON "public"."notification_logs" FOR EACH ROW EXECUTE FUNCTION "public"."update_notification_logs_updated_at"()
CREATE OR REPLACE TRIGGER "notification_queue_updated_at_trigger" BEFORE UPDATE ON "public"."notification_queue" FOR EACH ROW EXECUTE FUNCTION "public"."update_notification_queue_updated_at"()
CREATE OR REPLACE TRIGGER "notification_rate_limits_updated_at_trigger" BEFORE UPDATE ON "public"."notification_rate_limits" FOR EACH ROW EXECUTE FUNCTION "public"."update_notification_rate_limits_updated_at"()
CREATE OR REPLACE TRIGGER "notification_templates_updated_at_trigger" BEFORE UPDATE ON "public"."notification_templates" FOR EACH ROW EXECUTE FUNCTION "public"."update_notification_templates_updated_at"()
CREATE OR REPLACE TRIGGER "orders_updated_at" BEFORE UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"()
CREATE OR REPLACE TRIGGER "set_order_number" BEFORE INSERT ON "public"."orders" FOR EACH ROW WHEN (("new"."order_number" IS NULL)) EXECUTE FUNCTION "public"."generate_order_number"()
CREATE OR REPLACE TRIGGER "track_template_history_trigger" BEFORE UPDATE ON "public"."notification_templates" FOR EACH ROW EXECUTE FUNCTION "public"."track_template_version_history"()
CREATE OR REPLACE TRIGGER "user_contact_info_updated_at_trigger" BEFORE UPDATE ON "public"."user_contact_info" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_contact_info_updated_at"()
ALTER TABLE ONLY "public"."addresses"
    ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE
ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE CASCADE
ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE
ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_weight_variant_id_fkey" FOREIGN KEY ("weight_variant_id") REFERENCES "public"."product_weight_variants"("id") ON DELETE SET NULL
ALTER TABLE ONLY "public"."carts"
    ADD CONSTRAINT "carts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE
ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id")
ALTER TABLE ONLY "public"."notification_logs"
    ADD CONSTRAINT "notification_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE
ALTER TABLE ONLY "public"."notification_queue"
    ADD CONSTRAINT "notification_queue_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."notification_templates"("id")
ALTER TABLE ONLY "public"."notification_queue"
    ADD CONSTRAINT "notification_queue_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE
ALTER TABLE ONLY "public"."notification_rate_limits"
    ADD CONSTRAINT "notification_rate_limits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE
ALTER TABLE ONLY "public"."notification_template_history"
    ADD CONSTRAINT "notification_template_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL
ALTER TABLE ONLY "public"."notification_template_history"
    ADD CONSTRAINT "notification_template_history_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."notification_templates"("id") ON DELETE CASCADE
ALTER TABLE ONLY "public"."notification_templates"
    ADD CONSTRAINT "notification_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL
ALTER TABLE ONLY "public"."notification_templates"
    ADD CONSTRAINT "notification_templates_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL
ALTER TABLE ONLY "public"."offer_products"
    ADD CONSTRAINT "offer_products_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE CASCADE
ALTER TABLE ONLY "public"."offer_products"
    ADD CONSTRAINT "offer_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE
ALTER TABLE ONLY "public"."offer_usage"
    ADD CONSTRAINT "offer_usage_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE CASCADE
ALTER TABLE ONLY "public"."offer_usage"
    ADD CONSTRAINT "offer_usage_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE SET NULL
ALTER TABLE ONLY "public"."offer_usage"
    ADD CONSTRAINT "offer_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE
ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE
ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id")
ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_weight_variant_id_fkey" FOREIGN KEY ("weight_variant_id") REFERENCES "public"."product_weight_variants"("id") ON DELETE SET NULL
ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id")
ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id")
ALTER TABLE ONLY "public"."payment_transactions"
    ADD CONSTRAINT "payment_transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE
ALTER TABLE ONLY "public"."product_images"
    ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE
ALTER TABLE ONLY "public"."product_weight_variants"
    ADD CONSTRAINT "product_weight_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE
ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE
ALTER TABLE ONLY "public"."user_contact_info"
    ADD CONSTRAINT "user_contact_info_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE
CREATE POLICY "Active offers are publicly readable" ON "public"."offers" FOR SELECT TO "authenticated", "anon" USING ((("is_active" = true) AND (("starts_at" IS NULL) OR ("starts_at" <= "now"())) AND (("ends_at" IS NULL) OR ("ends_at" >= "now"()))))
CREATE POLICY "Admins can delete categories" ON "public"."categories" FOR DELETE TO "authenticated" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))))
CREATE POLICY "Admins can delete offer products" ON "public"."offer_products" FOR DELETE TO "authenticated" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))))
CREATE POLICY "Admins can delete offers" ON "public"."offers" FOR DELETE TO "authenticated" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))))
CREATE POLICY "Admins can delete orders" ON "public"."orders" FOR DELETE TO "authenticated" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))))
CREATE POLICY "Admins can delete product images" ON "public"."product_images" FOR DELETE TO "authenticated" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))))
CREATE POLICY "Admins can delete products" ON "public"."products" FOR DELETE TO "authenticated" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))))
CREATE POLICY "Admins can insert categories" ON "public"."categories" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))))
CREATE POLICY "Admins can insert offer products" ON "public"."offer_products" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))))
CREATE POLICY "Admins can insert offers" ON "public"."offers" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))))
CREATE POLICY "Admins can insert orders" ON "public"."orders" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))))
CREATE POLICY "Admins can insert product images" ON "public"."product_images" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))))
CREATE POLICY "Admins can insert products" ON "public"."products" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))))
CREATE POLICY "Admins can manage weight variants" ON "public"."product_weight_variants" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))))
CREATE POLICY "Admins can update categories" ON "public"."categories" FOR UPDATE TO "authenticated" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))))
CREATE POLICY "Admins can update contact messages" ON "public"."contact_messages" FOR UPDATE TO "authenticated" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))))
CREATE POLICY "Admins can update offer products" ON "public"."offer_products" FOR UPDATE TO "authenticated" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))))
CREATE POLICY "Admins can update offers" ON "public"."offers" FOR UPDATE TO "authenticated" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))))
CREATE POLICY "Admins can update orders" ON "public"."orders" FOR UPDATE TO "authenticated" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))))
CREATE POLICY "Admins can update product images" ON "public"."product_images" FOR UPDATE TO "authenticated" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))))
CREATE POLICY "Admins can update products" ON "public"."products" FOR UPDATE TO "authenticated" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))))
CREATE POLICY "Admins can view all order items" ON "public"."order_items" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))))
CREATE POLICY "Admins can view all orders" ON "public"."orders" FOR SELECT TO "authenticated" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))))
CREATE POLICY "Admins can view all payment transactions" ON "public"."payment_transactions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))))
CREATE POLICY "Admins can view contact messages" ON "public"."contact_messages" FOR SELECT TO "authenticated" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))))
CREATE POLICY "Allow admin to delete bulk_inquiries" ON "public"."bulk_inquiries" FOR DELETE TO "authenticated" USING (true)
CREATE POLICY "Allow admin to read all bulk_inquiries" ON "public"."bulk_inquiries" FOR SELECT TO "authenticated" USING (true)
CREATE POLICY "Allow admin to update bulk_inquiries" ON "public"."bulk_inquiries" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true)
CREATE POLICY "Allow authenticated users to insert order counters" ON "public"."order_counters" FOR INSERT TO "authenticated" WITH CHECK (true)
CREATE POLICY "Allow authenticated users to read order counters" ON "public"."order_counters" FOR SELECT TO "authenticated" USING (true)
CREATE POLICY "Allow authenticated users to update order counters" ON "public"."order_counters" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true)
CREATE POLICY "Allow public insert on bulk_inquiries" ON "public"."bulk_inquiries" FOR INSERT WITH CHECK (true)
CREATE POLICY "Allow service role full access to order counters" ON "public"."order_counters" TO "service_role" USING (true) WITH CHECK (true)
CREATE POLICY "Anyone can submit contact message" ON "public"."contact_messages" FOR INSERT TO "authenticated", "anon" WITH CHECK (true)
CREATE POLICY "Categories are publicly readable" ON "public"."categories" FOR SELECT TO "authenticated", "anon" USING (true)
CREATE POLICY "Offer products publicly readable" ON "public"."offer_products" FOR SELECT TO "authenticated", "anon" USING (true)
CREATE POLICY "Product images are publicly readable" ON "public"."product_images" FOR SELECT TO "authenticated", "anon" USING (true)
CREATE POLICY "Products are publicly readable" ON "public"."products" FOR SELECT TO "authenticated", "anon" USING (true)
CREATE POLICY "Service role can insert payment transactions" ON "public"."payment_transactions" FOR INSERT WITH CHECK (true)
CREATE POLICY "Service role can update payment transactions" ON "public"."payment_transactions" FOR UPDATE USING (true)
CREATE POLICY "Users can create order items" ON "public"."order_items" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "order_items"."order_id") AND (("orders"."user_id" = "auth"."uid"()) OR ("orders"."user_id" IS NULL))))))
CREATE POLICY "Users can create orders" ON "public"."orders" FOR INSERT WITH CHECK ((("auth"."uid"() = "user_id") OR ("user_id" IS NULL)))
CREATE POLICY "Users can delete their own addresses" ON "public"."addresses" FOR DELETE USING (("auth"."uid"() = "user_id"))
CREATE POLICY "Users can insert their own addresses" ON "public"."addresses" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"))
CREATE POLICY "Users can manage own cart" ON "public"."carts" USING (("auth"."uid"() = "user_id"))
CREATE POLICY "Users can manage own cart items" ON "public"."cart_items" USING ((EXISTS ( SELECT 1
   FROM "public"."carts"
  WHERE (("carts"."id" = "cart_items"."cart_id") AND ("carts"."user_id" = "auth"."uid"())))))
CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"))
CREATE POLICY "Users can update their own addresses" ON "public"."addresses" FOR UPDATE USING (("auth"."uid"() = "user_id"))
CREATE POLICY "Users can view own order items" ON "public"."order_items" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "order_items"."order_id") AND ("orders"."user_id" = "auth"."uid"())))))
CREATE POLICY "Users can view own orders" ON "public"."orders" FOR SELECT USING (("auth"."uid"() = "user_id"))
CREATE POLICY "Users can view own payment transactions" ON "public"."payment_transactions" FOR SELECT USING (("order_id" IN ( SELECT "orders"."id"
   FROM "public"."orders"
  WHERE ("orders"."user_id" = "auth"."uid"()))))
CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"))
CREATE POLICY "Users can view their own addresses" ON "public"."addresses" FOR SELECT USING (("auth"."uid"() = "user_id"))
CREATE POLICY "Weight variants are viewable by everyone" ON "public"."product_weight_variants" FOR SELECT USING (true)
ALTER TABLE "public"."addresses" ENABLE ROW LEVEL SECURITY
ALTER TABLE "public"."bulk_inquiries" ENABLE ROW LEVEL SECURITY
ALTER TABLE "public"."cart_items" ENABLE ROW LEVEL SECURITY
ALTER TABLE "public"."carts" ENABLE ROW LEVEL SECURITY
ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY
ALTER TABLE "public"."contact_messages" ENABLE ROW LEVEL SECURITY
ALTER TABLE "public"."notification_analytics" ENABLE ROW LEVEL SECURITY
CREATE POLICY "notification_analytics_delete" ON "public"."notification_analytics" FOR DELETE USING (false)
CREATE POLICY "notification_analytics_insert" ON "public"."notification_analytics" FOR INSERT WITH CHECK (false)
CREATE POLICY "notification_analytics_select" ON "public"."notification_analytics" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))))
CREATE POLICY "notification_analytics_update" ON "public"."notification_analytics" FOR UPDATE USING (false) WITH CHECK (false)
ALTER TABLE "public"."notification_logs" ENABLE ROW LEVEL SECURITY
CREATE POLICY "notification_logs_admins_select" ON "public"."notification_logs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))))
CREATE POLICY "notification_logs_service_delete" ON "public"."notification_logs" FOR DELETE USING (false)
CREATE POLICY "notification_logs_service_insert" ON "public"."notification_logs" FOR INSERT WITH CHECK (false)
CREATE POLICY "notification_logs_service_update" ON "public"."notification_logs" FOR UPDATE USING (false) WITH CHECK (false)
CREATE POLICY "notification_logs_users_select" ON "public"."notification_logs" FOR SELECT USING (("auth"."uid"() = "user_id"))
ALTER TABLE "public"."notification_queue" ENABLE ROW LEVEL SECURITY
CREATE POLICY "notification_queue_delete" ON "public"."notification_queue" FOR DELETE USING (false)
CREATE POLICY "notification_queue_insert" ON "public"."notification_queue" FOR INSERT WITH CHECK (false)
CREATE POLICY "notification_queue_select" ON "public"."notification_queue" FOR SELECT USING (false)
CREATE POLICY "notification_queue_update" ON "public"."notification_queue" FOR UPDATE USING (false) WITH CHECK (false)
ALTER TABLE "public"."notification_rate_limits" ENABLE ROW LEVEL SECURITY
CREATE POLICY "notification_rate_limits_admins_select" ON "public"."notification_rate_limits" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))))
CREATE POLICY "notification_rate_limits_delete" ON "public"."notification_rate_limits" FOR DELETE USING (false)
CREATE POLICY "notification_rate_limits_insert" ON "public"."notification_rate_limits" FOR INSERT WITH CHECK (false)
CREATE POLICY "notification_rate_limits_update" ON "public"."notification_rate_limits" FOR UPDATE USING (false) WITH CHECK (false)
CREATE POLICY "notification_rate_limits_users_select" ON "public"."notification_rate_limits" FOR SELECT USING (("auth"."uid"() = "user_id"))
ALTER TABLE "public"."notification_template_history" ENABLE ROW LEVEL SECURITY
CREATE POLICY "notification_template_history_delete" ON "public"."notification_template_history" FOR DELETE USING (false)
CREATE POLICY "notification_template_history_insert" ON "public"."notification_template_history" FOR INSERT WITH CHECK (false)
CREATE POLICY "notification_template_history_select" ON "public"."notification_template_history" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))))
CREATE POLICY "notification_template_history_update" ON "public"."notification_template_history" FOR UPDATE USING (false) WITH CHECK (false)
ALTER TABLE "public"."notification_templates" ENABLE ROW LEVEL SECURITY
CREATE POLICY "notification_templates_admins_delete" ON "public"."notification_templates" FOR DELETE USING ((("is_system_template" = false) AND (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text"))))))
CREATE POLICY "notification_templates_admins_insert" ON "public"."notification_templates" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))))
CREATE POLICY "notification_templates_admins_update" ON "public"."notification_templates" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))))
CREATE POLICY "notification_templates_select" ON "public"."notification_templates" FOR SELECT USING ((("status")::"text" = 'active'::"text"))
ALTER TABLE "public"."offer_products" ENABLE ROW LEVEL SECURITY
ALTER TABLE "public"."offer_usage" ENABLE ROW LEVEL SECURITY
CREATE POLICY "offer_usage_authenticated_can_view" ON "public"."offer_usage" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"))
CREATE POLICY "offer_usage_system_can_insert" ON "public"."offer_usage" FOR INSERT WITH CHECK (true)
CREATE POLICY "offer_usage_users_can_view_own" ON "public"."offer_usage" FOR SELECT USING (("auth"."uid"() = "user_id"))
ALTER TABLE "public"."offers" ENABLE ROW LEVEL SECURITY
ALTER TABLE "public"."order_counters" ENABLE ROW LEVEL SECURITY
ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY
ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY
ALTER TABLE "public"."payment_transactions" ENABLE ROW LEVEL SECURITY
ALTER TABLE "public"."product_images" ENABLE ROW LEVEL SECURITY
ALTER TABLE "public"."product_weight_variants" ENABLE ROW LEVEL SECURITY
ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY
ALTER TABLE "public"."user_contact_info" ENABLE ROW LEVEL SECURITY
CREATE POLICY "user_contact_info_admins_select" ON "public"."user_contact_info" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))))
CREATE POLICY "user_contact_info_service_delete" ON "public"."user_contact_info" FOR DELETE USING (false)
CREATE POLICY "user_contact_info_service_insert" ON "public"."user_contact_info" FOR INSERT WITH CHECK (false)
CREATE POLICY "user_contact_info_users_select" ON "public"."user_contact_info" FOR SELECT USING (("auth"."uid"() = "user_id"))
CREATE POLICY "user_contact_info_users_update" ON "public"."user_contact_info" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"))
ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres"
GRANT USAGE ON SCHEMA "public" TO "postgres"
GRANT USAGE ON SCHEMA "public" TO "anon"
GRANT USAGE ON SCHEMA "public" TO "authenticated"
GRANT USAGE ON SCHEMA "public" TO "service_role"
GRANT ALL ON FUNCTION "public"."generate_order_number"() TO "anon"
GRANT ALL ON FUNCTION "public"."generate_order_number"() TO "authenticated"
GRANT ALL ON FUNCTION "public"."generate_order_number"() TO "service_role"
GRANT ALL ON FUNCTION "public"."get_product_min_price"("p_product_id" "uuid") TO "anon"
GRANT ALL ON FUNCTION "public"."get_product_min_price"("p_product_id" "uuid") TO "authenticated"
GRANT ALL ON FUNCTION "public"."get_product_min_price"("p_product_id" "uuid") TO "service_role"
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon"
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated"
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role"
GRANT ALL ON FUNCTION "public"."track_template_version_history"() TO "anon"
GRANT ALL ON FUNCTION "public"."track_template_version_history"() TO "authenticated"
GRANT ALL ON FUNCTION "public"."track_template_version_history"() TO "service_role"
GRANT ALL ON FUNCTION "public"."update_notification_analytics_updated_at"() TO "anon"
GRANT ALL ON FUNCTION "public"."update_notification_analytics_updated_at"() TO "authenticated"
GRANT ALL ON FUNCTION "public"."update_notification_analytics_updated_at"() TO "service_role"
GRANT ALL ON FUNCTION "public"."update_notification_logs_updated_at"() TO "anon"
GRANT ALL ON FUNCTION "public"."update_notification_logs_updated_at"() TO "authenticated"
GRANT ALL ON FUNCTION "public"."update_notification_logs_updated_at"() TO "service_role"
GRANT ALL ON FUNCTION "public"."update_notification_queue_updated_at"() TO "anon"
GRANT ALL ON FUNCTION "public"."update_notification_queue_updated_at"() TO "authenticated"
GRANT ALL ON FUNCTION "public"."update_notification_queue_updated_at"() TO "service_role"
GRANT ALL ON FUNCTION "public"."update_notification_rate_limits_updated_at"() TO "anon"
GRANT ALL ON FUNCTION "public"."update_notification_rate_limits_updated_at"() TO "authenticated"
GRANT ALL ON FUNCTION "public"."update_notification_rate_limits_updated_at"() TO "service_role"
GRANT ALL ON FUNCTION "public"."update_notification_templates_updated_at"() TO "anon"
GRANT ALL ON FUNCTION "public"."update_notification_templates_updated_at"() TO "authenticated"
GRANT ALL ON FUNCTION "public"."update_notification_templates_updated_at"() TO "service_role"
GRANT ALL ON FUNCTION "public"."update_order_payment_status"("p_order_id" "uuid", "p_payment_id" "text", "p_signature" "text", "p_status" "text") TO "anon"
GRANT ALL ON FUNCTION "public"."update_order_payment_status"("p_order_id" "uuid", "p_payment_id" "text", "p_signature" "text", "p_status" "text") TO "authenticated"
GRANT ALL ON FUNCTION "public"."update_order_payment_status"("p_order_id" "uuid", "p_payment_id" "text", "p_signature" "text", "p_status" "text") TO "service_role"
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "anon"
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "authenticated"
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "service_role"
GRANT ALL ON FUNCTION "public"."update_user_contact_info_updated_at"() TO "anon"
GRANT ALL ON FUNCTION "public"."update_user_contact_info_updated_at"() TO "authenticated"
GRANT ALL ON FUNCTION "public"."update_user_contact_info_updated_at"() TO "service_role"
GRANT ALL ON TABLE "public"."addresses" TO "anon"
GRANT ALL ON TABLE "public"."addresses" TO "authenticated"
GRANT ALL ON TABLE "public"."addresses" TO "service_role"
GRANT ALL ON TABLE "public"."bulk_inquiries" TO "anon"
GRANT ALL ON TABLE "public"."bulk_inquiries" TO "authenticated"
GRANT ALL ON TABLE "public"."bulk_inquiries" TO "service_role"
GRANT ALL ON TABLE "public"."cart_items" TO "anon"
GRANT ALL ON TABLE "public"."cart_items" TO "authenticated"
GRANT ALL ON TABLE "public"."cart_items" TO "service_role"
GRANT ALL ON TABLE "public"."carts" TO "anon"
GRANT ALL ON TABLE "public"."carts" TO "authenticated"
GRANT ALL ON TABLE "public"."carts" TO "service_role"
GRANT ALL ON TABLE "public"."categories" TO "anon"
GRANT ALL ON TABLE "public"."categories" TO "authenticated"
GRANT ALL ON TABLE "public"."categories" TO "service_role"
GRANT ALL ON TABLE "public"."contact_messages" TO "anon"
GRANT ALL ON TABLE "public"."contact_messages" TO "authenticated"
GRANT ALL ON TABLE "public"."contact_messages" TO "service_role"
GRANT ALL ON TABLE "public"."notification_analytics" TO "anon"
GRANT ALL ON TABLE "public"."notification_analytics" TO "authenticated"
GRANT ALL ON TABLE "public"."notification_analytics" TO "service_role"
GRANT ALL ON TABLE "public"."notification_logs" TO "anon"
GRANT ALL ON TABLE "public"."notification_logs" TO "authenticated"
GRANT ALL ON TABLE "public"."notification_logs" TO "service_role"
GRANT ALL ON TABLE "public"."notification_queue" TO "anon"
GRANT ALL ON TABLE "public"."notification_queue" TO "authenticated"
GRANT ALL ON TABLE "public"."notification_queue" TO "service_role"
GRANT ALL ON TABLE "public"."notification_rate_limits" TO "anon"
GRANT ALL ON TABLE "public"."notification_rate_limits" TO "authenticated"
GRANT ALL ON TABLE "public"."notification_rate_limits" TO "service_role"
GRANT ALL ON TABLE "public"."notification_template_history" TO "anon"
GRANT ALL ON TABLE "public"."notification_template_history" TO "authenticated"
GRANT ALL ON TABLE "public"."notification_template_history" TO "service_role"
GRANT ALL ON TABLE "public"."notification_templates" TO "anon"
GRANT ALL ON TABLE "public"."notification_templates" TO "authenticated"
GRANT ALL ON TABLE "public"."notification_templates" TO "service_role"
GRANT ALL ON TABLE "public"."offer_products" TO "anon"
GRANT ALL ON TABLE "public"."offer_products" TO "authenticated"
GRANT ALL ON TABLE "public"."offer_products" TO "service_role"
GRANT ALL ON TABLE "public"."offer_usage" TO "anon"
GRANT ALL ON TABLE "public"."offer_usage" TO "authenticated"
GRANT ALL ON TABLE "public"."offer_usage" TO "service_role"
GRANT ALL ON TABLE "public"."offers" TO "anon"
GRANT ALL ON TABLE "public"."offers" TO "authenticated"
GRANT ALL ON TABLE "public"."offers" TO "service_role"
GRANT ALL ON TABLE "public"."order_counters" TO "anon"
GRANT ALL ON TABLE "public"."order_counters" TO "authenticated"
GRANT ALL ON TABLE "public"."order_counters" TO "service_role"
GRANT ALL ON TABLE "public"."order_items" TO "anon"
GRANT ALL ON TABLE "public"."order_items" TO "authenticated"
GRANT ALL ON TABLE "public"."order_items" TO "service_role"
GRANT ALL ON TABLE "public"."orders" TO "anon"
GRANT ALL ON TABLE "public"."orders" TO "authenticated"
GRANT ALL ON TABLE "public"."orders" TO "service_role"
GRANT ALL ON TABLE "public"."payment_transactions" TO "anon"
GRANT ALL ON TABLE "public"."payment_transactions" TO "authenticated"
GRANT ALL ON TABLE "public"."payment_transactions" TO "service_role"
GRANT ALL ON TABLE "public"."product_images" TO "anon"
GRANT ALL ON TABLE "public"."product_images" TO "authenticated"
GRANT ALL ON TABLE "public"."product_images" TO "service_role"
GRANT ALL ON TABLE "public"."product_weight_variants" TO "anon"
GRANT ALL ON TABLE "public"."product_weight_variants" TO "authenticated"
GRANT ALL ON TABLE "public"."product_weight_variants" TO "service_role"
GRANT ALL ON TABLE "public"."products" TO "anon"
GRANT ALL ON TABLE "public"."products" TO "authenticated"
GRANT ALL ON TABLE "public"."products" TO "service_role"
GRANT ALL ON TABLE "public"."profiles" TO "anon"
GRANT ALL ON TABLE "public"."profiles" TO "authenticated"
GRANT ALL ON TABLE "public"."profiles" TO "service_role"
GRANT ALL ON TABLE "public"."user_contact_info" TO "anon"
GRANT ALL ON TABLE "public"."user_contact_info" TO "authenticated"
GRANT ALL ON TABLE "public"."user_contact_info" TO "service_role"
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres"
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon"
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated"
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role"
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres"
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon"
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated"
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role"
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres"
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon"
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated"
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role"
drop extension if exists "pg_net"
drop policy "Categories are publicly readable" on "public"."categories"
drop policy "Anyone can submit contact message" on "public"."contact_messages"
drop policy "Offer products publicly readable" on "public"."offer_products"
drop policy "Active offers are publicly readable" on "public"."offers"
drop policy "Product images are publicly readable" on "public"."product_images"
drop policy "Products are publicly readable" on "public"."products"
alter table "public"."notification_logs" drop constraint "notification_logs_status_check"
alter table "public"."notification_queue" drop constraint "notification_queue_status_check"
alter table "public"."notification_templates" drop constraint "notification_templates_status_check"
alter table "public"."notification_templates" drop constraint "valid_channel"
drop index if exists "public"."idx_notification_logs_failed_retry"
drop index if exists "public"."idx_notification_queue_retry"
drop index if exists "public"."idx_notification_templates_name"
CREATE INDEX idx_notification_logs_failed_retry ON public.notification_logs USING btree (id, last_retry_at) WHERE (((status)::text = ANY ((ARRAY['failed'::character varying, 'pending'::character varying])::text[])) AND (retry_count < max_retries) AND (deleted_at IS NULL))
CREATE INDEX idx_notification_queue_retry ON public.notification_queue USING btree (id, next_retry_at) WHERE (((status)::text = ANY ((ARRAY['failed'::character varying, 'pending'::character varying])::text[])) AND (retry_count < max_retries))
CREATE INDEX idx_notification_templates_name ON public.notification_templates USING btree (name) WHERE ((status)::text = ANY ((ARRAY['active'::character varying, 'draft'::character varying])::text[]))
alter table "public"."notification_logs" add constraint "notification_logs_status_check" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'sent'::character varying, 'failed'::character varying, 'bounced'::character varying, 'clicked'::character varying, 'unsubscribed'::character varying])::text[]))) not valid
alter table "public"."notification_logs" validate constraint "notification_logs_status_check"
alter table "public"."notification_queue" add constraint "notification_queue_status_check" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying, 'cancelled'::character varying])::text[]))) not valid
alter table "public"."notification_queue" validate constraint "notification_queue_status_check"
alter table "public"."notification_templates" add constraint "notification_templates_status_check" CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'active'::character varying, 'inactive'::character varying, 'archived'::character varying])::text[]))) not valid
alter table "public"."notification_templates" validate constraint "notification_templates_status_check"
alter table "public"."notification_templates" add constraint "valid_channel" CHECK (((channel)::text = ANY ((ARRAY['email'::character varying, 'sms'::character varying, 'whatsapp'::character varying])::text[]))) not valid
alter table "public"."notification_templates" validate constraint "valid_channel"
create policy "Categories are publicly readable"
  on "public"."categories"
  as permissive
  for select
  to anon, authenticated
using (true)
create policy "Anyone can submit contact message"
  on "public"."contact_messages"
  as permissive
  for insert
  to anon, authenticated
with check (true)
create policy "Offer products publicly readable"
  on "public"."offer_products"
  as permissive
  for select
  to anon, authenticated
using (true)
create policy "Active offers are publicly readable"
  on "public"."offers"
  as permissive
  for select
  to anon, authenticated
using (((is_active = true) AND ((starts_at IS NULL) OR (starts_at <= now())) AND ((ends_at IS NULL) OR (ends_at >= now()))))
create policy "Product images are publicly readable"
  on "public"."product_images"
  as permissive
  for select
  to anon, authenticated
using (true)
create policy "Products are publicly readable"
  on "public"."products"
  as permissive
  for select
  to anon, authenticated
using (true)
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user()
create policy "Allow authenticated deletes"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'product-images'::text))
create policy "Allow authenticated uploads"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'product-images'::text))
create policy "Auth Delete"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'content-images'::text))
create policy "Auth Update"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = 'content-images'::text))
create policy "Auth Upload"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'content-images'::text))
create policy "Public Access"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'content-images'::text))
create policy "Public read access"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'product-images'::text))
CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger()
CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger()
CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger()
CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger()
CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger()