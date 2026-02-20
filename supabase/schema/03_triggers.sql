-- ============================================
-- 03_TRIGGERS.SQL
-- Consolidated Trigger Definitions for AONet
-- ============================================

-- 1. CORE TRIGGERS
-- ============================================

-- Auto-create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-generate order number
CREATE TRIGGER set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION public.generate_order_number();

-- Update timestamp for orders
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 2. NOTIFICATION SYSTEM TRIGGERS
-- ============================================

-- Notification Logs Timestamp
CREATE TRIGGER notification_logs_updated_at_trigger
  BEFORE UPDATE ON public.notification_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_notification_logs_updated_at();

-- User Contact Info Timestamp
CREATE TRIGGER user_contact_info_updated_at_trigger
  BEFORE UPDATE ON public.user_contact_info
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_contact_info_updated_at();

-- Notification Templates Timestamp
CREATE TRIGGER notification_templates_updated_at_trigger
  BEFORE UPDATE ON public.notification_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_notification_templates_updated_at();

-- Notification Queue Timestamp
CREATE TRIGGER notification_queue_updated_at_trigger
  BEFORE UPDATE ON public.notification_queue
  FOR EACH ROW
  EXECUTE FUNCTION public.update_notification_queue_updated_at();

-- Notification Rate Limits Timestamp
CREATE TRIGGER notification_rate_limits_updated_at_trigger
  BEFORE UPDATE ON public.notification_rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_notification_rate_limits_updated_at();

-- Notification Analytics Timestamp
CREATE TRIGGER notification_analytics_updated_at_trigger
  BEFORE UPDATE ON public.notification_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_notification_analytics_updated_at();

-- Template Version History Trigger
CREATE TRIGGER track_template_history_trigger
  BEFORE UPDATE ON public.notification_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.track_template_version_history();

-- 3. STORAGE TRIGGERS (Standard Supabase)
-- ============================================

-- These are usually managed by Supabase but good to document if custom behavior is needed.
-- Keeping it minimal as per migration source.
