-- ============================================
-- 02_FUNCTIONS.SQL
-- Consolidated Function Definitions for AONet
-- ============================================

-- 1. UTILITY FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION "public"."update_updated_at"() 
RETURNS "trigger" AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE "plpgsql";

CREATE OR REPLACE FUNCTION "public"."generate_order_number"() 
RETURNS "trigger" SECURITY DEFINER
SET "search_path" TO 'public'
AS $$
DECLARE
  year_part INTEGER;
  seq_num INTEGER;
BEGIN
  year_part := EXTRACT(YEAR FROM NOW())::INTEGER;
  
  -- Upsert and increment counter atomically
  INSERT INTO order_counters (year, counter)
  VALUES (year_part, 1)
  ON CONFLICT (year) DO UPDATE
  SET counter = order_counters.counter + 1
  RETURNING counter INTO seq_num;
  
  NEW.order_number := 'ORD-' || year_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE "plpgsql";

CREATE OR REPLACE FUNCTION "public"."get_product_min_price"("p_product_id" "uuid") 
RETURNS integer AS $$
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
$$ LANGUAGE "plpgsql";

CREATE OR REPLACE FUNCTION "public"."handle_new_user"() 
RETURNS "trigger" SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE "plpgsql";

CREATE OR REPLACE FUNCTION "public"."update_order_payment_status"(
    "p_order_id" "uuid", 
    "p_payment_id" "text", 
    "p_signature" "text", 
    "p_status" "text"
) 
RETURNS "void" SECURITY DEFINER AS $$
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
$$ LANGUAGE "plpgsql";

-- 2. NOTIFICATION SYSTEM FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION "public"."update_notification_logs_updated_at"() 
RETURNS "trigger" AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE "plpgsql";

CREATE OR REPLACE FUNCTION "public"."update_user_contact_info_updated_at"() 
RETURNS "trigger" AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE "plpgsql";

CREATE OR REPLACE FUNCTION "public"."update_notification_templates_updated_at"() 
RETURNS "trigger" AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE "plpgsql";

CREATE OR REPLACE FUNCTION "public"."update_notification_queue_updated_at"() 
RETURNS "trigger" AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE "plpgsql";

CREATE OR REPLACE FUNCTION "public"."update_notification_rate_limits_updated_at"() 
RETURNS "trigger" AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE "plpgsql";

CREATE OR REPLACE FUNCTION "public"."update_notification_analytics_updated_at"() 
RETURNS "trigger" AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE "plpgsql";

CREATE OR REPLACE FUNCTION "public"."track_template_version_history"() 
RETURNS "trigger" AS $$
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
$$ LANGUAGE "plpgsql";

-- Permissions
ALTER FUNCTION "public"."generate_order_number"() OWNER TO "postgres";
ALTER FUNCTION "public"."get_product_min_price"("uuid") OWNER TO "postgres";
ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";
ALTER FUNCTION "public"."update_updated_at"() OWNER TO "postgres";
ALTER FUNCTION "public"."update_order_payment_status"("uuid", "text", "text", "text") OWNER TO "postgres";
ALTER FUNCTION "public"."update_notification_logs_updated_at"() OWNER TO "postgres";
ALTER FUNCTION "public"."update_user_contact_info_updated_at"() OWNER TO "postgres";
ALTER FUNCTION "public"."update_notification_templates_updated_at"() OWNER TO "postgres";
ALTER FUNCTION "public"."update_notification_queue_updated_at"() OWNER TO "postgres";
ALTER FUNCTION "public"."update_notification_rate_limits_updated_at"() OWNER TO "postgres";
ALTER FUNCTION "public"."update_notification_analytics_updated_at"() OWNER TO "postgres";
ALTER FUNCTION "public"."track_template_version_history"() OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."generate_order_number"() TO "anon", "authenticated", "service_role";
GRANT ALL ON FUNCTION "public"."get_product_min_price"("uuid") TO "anon", "authenticated", "service_role";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon", "authenticated", "service_role";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "anon", "authenticated", "service_role";
GRANT ALL ON FUNCTION "public"."update_order_payment_status"("uuid", "text", "text", "text") TO "anon", "authenticated", "service_role";

-- Grant notification functions
GRANT ALL ON FUNCTION "public"."update_notification_logs_updated_at"() TO "anon", "authenticated", "service_role";
GRANT ALL ON FUNCTION "public"."update_user_contact_info_updated_at"() TO "anon", "authenticated", "service_role";
GRANT ALL ON FUNCTION "public"."update_notification_templates_updated_at"() TO "anon", "authenticated", "service_role";
GRANT ALL ON FUNCTION "public"."update_notification_queue_updated_at"() TO "anon", "authenticated", "service_role";
GRANT ALL ON FUNCTION "public"."update_notification_rate_limits_updated_at"() TO "anon", "authenticated", "service_role";
GRANT ALL ON FUNCTION "public"."update_notification_analytics_updated_at"() TO "anon", "authenticated", "service_role";
GRANT ALL ON FUNCTION "public"."track_template_version_history"() TO "anon", "authenticated", "service_role";
