-- Migration: Create Email Template Storage
-- Version: 1.0
-- Date: 24 January 2026
-- Description: Create tables for storing and managing email templates

-- ============================================================================
-- 1. CREATE notification_templates TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL, -- 'email', 'sms', 'whatsapp'
  subject VARCHAR(255),
  content TEXT NOT NULL,
  variables JSONB, -- List of variables used in template: ["user_name", "order_id", etc.]
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'archived'
  version INT NOT NULL DEFAULT 1,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_template_type CHECK (type IN ('email', 'sms', 'whatsapp'))
);

COMMENT ON TABLE public.notification_templates IS 'Stores reusable notification templates for emails, SMS, and WhatsApp';
COMMENT ON COLUMN public.notification_templates.name IS 'Unique name identifier for the template (e.g., signup_welcome)';
COMMENT ON COLUMN public.notification_templates.type IS 'Type of template (email, sms, whatsapp)';
COMMENT ON COLUMN public.notification_templates.subject IS 'Email subject line (only for email templates)';
COMMENT ON COLUMN public.notification_templates.content IS 'Template content with variables: {{user_name}}, {{order_id}}, etc.';
COMMENT ON COLUMN public.notification_templates.variables IS 'JSONB array of variables used in this template';
COMMENT ON COLUMN public.notification_templates.status IS 'Whether template is active for use';
COMMENT ON COLUMN public.notification_templates.version IS 'Template version number for tracking changes';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notification_templates_name 
ON public.notification_templates(name);

CREATE INDEX IF NOT EXISTS idx_notification_templates_type 
ON public.notification_templates(type);

CREATE INDEX IF NOT EXISTS idx_notification_templates_status 
ON public.notification_templates(status);

-- ============================================================================
-- 2. CREATE notification_queue TABLE (for pending notifications)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  channels TEXT[] NOT NULL, -- Array of channels: ['email', 'sms']
  template_id UUID NOT NULL REFERENCES public.notification_templates(id),
  template_variables JSONB NOT NULL, -- Variables to render template
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INT NOT NULL DEFAULT 0,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  priority INT DEFAULT 0, -- Higher number = higher priority
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.notification_queue IS 'Queue of notifications waiting to be sent';
COMMENT ON COLUMN public.notification_queue.channels IS 'Array of channels to send through (email, sms, whatsapp)';
COMMENT ON COLUMN public.notification_queue.status IS 'Current processing status';
COMMENT ON COLUMN public.notification_queue.priority IS 'Higher priority notifications are processed first';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notification_queue_user_id 
ON public.notification_queue(user_id);

CREATE INDEX IF NOT EXISTS idx_notification_queue_status 
ON public.notification_queue(status);

CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled_at 
ON public.notification_queue(scheduled_at);

CREATE INDEX IF NOT EXISTS idx_notification_queue_priority_status 
ON public.notification_queue(priority DESC, status);

-- Index for finding notifications ready to send
CREATE INDEX IF NOT EXISTS idx_notification_queue_ready_to_send 
ON public.notification_queue(scheduled_at)
WHERE 'status' = 'pending'; -- AND scheduled_at <= NOW();

-- ============================================================================
-- 3. CREATE notification_rate_limits TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notification_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  count_in_period INT NOT NULL DEFAULT 0,
  period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  period_end TIMESTAMP WITH TIME ZONE,
  max_count INT NOT NULL DEFAULT 10, -- Max notifications of this type per period
  period_hours INT NOT NULL DEFAULT 24, -- Period duration in hours
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.notification_rate_limits IS 'Tracks notification sending rate limits per user per notification type';
COMMENT ON COLUMN public.notification_rate_limits.count_in_period IS 'Number of notifications sent in current period';
COMMENT ON COLUMN public.notification_rate_limits.max_count IS 'Maximum allowed notifications in period';
COMMENT ON COLUMN public.notification_rate_limits.period_hours IS 'Duration of the rate limit period in hours';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notification_rate_limits_user_id 
ON public.notification_rate_limits(user_id);

CREATE INDEX IF NOT EXISTS idx_notification_rate_limits_user_type 
ON public.notification_rate_limits(user_id, notification_type);

-- ============================================================================
-- 4. CREATE notification_analytics TABLE (for aggregated metrics)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notification_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  channel VARCHAR(20) NOT NULL,
  sent_count INT NOT NULL DEFAULT 0,
  delivered_count INT NOT NULL DEFAULT 0,
  failed_count INT NOT NULL DEFAULT 0,
  bounced_count INT NOT NULL DEFAULT 0,
  clicked_count INT NOT NULL DEFAULT 0,
  avg_delivery_time_ms INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_analytics UNIQUE(date, notification_type, channel)
);

COMMENT ON TABLE public.notification_analytics IS 'Aggregated daily statistics for notifications';
COMMENT ON COLUMN public.notification_analytics.date IS 'Date for which metrics are aggregated';
COMMENT ON COLUMN public.notification_analytics.sent_count IS 'Total notifications sent';
COMMENT ON COLUMN public.notification_analytics.delivered_count IS 'Successfully delivered';
COMMENT ON COLUMN public.notification_analytics.failed_count IS 'Failed to send';
COMMENT ON COLUMN public.notification_analytics.avg_delivery_time_ms IS 'Average time to delivery in milliseconds';

-- Create indexes for quick analytics queries
CREATE INDEX IF NOT EXISTS idx_notification_analytics_date 
ON public.notification_analytics(date DESC);

CREATE INDEX IF NOT EXISTS idx_notification_analytics_type_channel 
ON public.notification_analytics(notification_type, channel);

-- ============================================================================
-- 5. CREATE RLS (Row Level Security) POLICIES
-- ============================================================================

-- ============================================================================
-- RLS Policies for notification_templates
-- ============================================================================

ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active templates (for rendering notifications)
CREATE POLICY notification_templates_select_policy 
ON public.notification_templates 
FOR SELECT 
USING (status = 'active');

-- Policy: Only authenticated admins can insert templates
CREATE POLICY notification_templates_insert_policy 
ON public.notification_templates 
FOR INSERT 
WITH CHECK (auth.jwt() ->> 'role' = 'authenticated' AND EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE user_id = auth.uid()
));

-- Policy: Only authenticated admins can update templates
CREATE POLICY notification_templates_update_policy 
ON public.notification_templates 
FOR UPDATE 
USING (auth.jwt() ->> 'role' = 'authenticated' AND EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE user_id = auth.uid()
))
WITH CHECK (auth.jwt() ->> 'role' = 'authenticated' AND EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE user_id = auth.uid()
));

-- Policy: Only authenticated admins can delete templates
CREATE POLICY notification_templates_delete_policy 
ON public.notification_templates 
FOR DELETE 
USING (auth.jwt() ->> 'role' = 'authenticated' AND EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE user_id = auth.uid()
));

-- ============================================================================
-- RLS Policies for notification_queue
-- ============================================================================

ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

-- Policy: Block all direct access from clients (managed by backend service only)
CREATE POLICY notification_queue_select_policy 
ON public.notification_queue 
FOR SELECT 
USING (false);

CREATE POLICY notification_queue_insert_policy 
ON public.notification_queue 
FOR INSERT 
WITH CHECK (false);

CREATE POLICY notification_queue_update_policy 
ON public.notification_queue 
FOR UPDATE 
USING (false)
WITH CHECK (false);

CREATE POLICY notification_queue_delete_policy 
ON public.notification_queue 
FOR DELETE 
USING (false);

-- Note: Backend service will access this table using service_role key
-- which bypasses RLS policies

-- ============================================================================
-- RLS Policies for notification_rate_limits
-- ============================================================================

ALTER TABLE public.notification_rate_limits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own rate limit records
CREATE POLICY notification_rate_limits_select_policy 
ON public.notification_rate_limits 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Block direct inserts from clients
CREATE POLICY notification_rate_limits_insert_policy 
ON public.notification_rate_limits 
FOR INSERT 
WITH CHECK (false);

-- Policy: Block direct updates from clients
CREATE POLICY notification_rate_limits_update_policy 
ON public.notification_rate_limits 
FOR UPDATE 
USING (false)
WITH CHECK (false);

-- Policy: Block direct deletes from clients
CREATE POLICY notification_rate_limits_delete_policy 
ON public.notification_rate_limits 
FOR DELETE 
USING (false);

-- Note: Backend service will manage rate limits via service_role

-- ============================================================================
-- RLS Policies for notification_analytics
-- ============================================================================

ALTER TABLE public.notification_analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view analytics
CREATE POLICY notification_analytics_select_policy 
ON public.notification_analytics 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE user_id = auth.uid()
));

-- Policy: Only admins can insert analytics (via backend job)
CREATE POLICY notification_analytics_insert_policy 
ON public.notification_analytics 
FOR INSERT 
WITH CHECK (false);

-- Policy: Only admins can update analytics
CREATE POLICY notification_analytics_update_policy 
ON public.notification_analytics 
FOR UPDATE 
USING (false)
WITH CHECK (false);

-- Policy: Only admins can delete analytics
CREATE POLICY notification_analytics_delete_policy 
ON public.notification_analytics 
FOR DELETE 
USING (false);

-- Note: Backend service inserts daily aggregated data via service_role

-- ============================================================================
-- 6. CREATE TRIGGERS
-- ============================================================================

-- Auto-update timestamp for notification_templates
CREATE OR REPLACE FUNCTION update_notification_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notification_templates_updated_at_trigger ON public.notification_templates;
CREATE TRIGGER notification_templates_updated_at_trigger
BEFORE UPDATE ON public.notification_templates
FOR EACH ROW
EXECUTE FUNCTION update_notification_templates_updated_at();

-- Auto-update timestamp for notification_queue
CREATE OR REPLACE FUNCTION update_notification_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notification_queue_updated_at_trigger ON public.notification_queue;
CREATE TRIGGER notification_queue_updated_at_trigger
BEFORE UPDATE ON public.notification_queue
FOR EACH ROW
EXECUTE FUNCTION update_notification_queue_updated_at();

-- Auto-update timestamp for notification_rate_limits
CREATE OR REPLACE FUNCTION update_notification_rate_limits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notification_rate_limits_updated_at_trigger ON public.notification_rate_limits;
CREATE TRIGGER notification_rate_limits_updated_at_trigger
BEFORE UPDATE ON public.notification_rate_limits
FOR EACH ROW
EXECUTE FUNCTION update_notification_rate_limits_updated_at();

-- ============================================================================
-- 6. INITIAL DATA (Optional)
-- ============================================================================

-- Insert default notification templates
INSERT INTO public.notification_templates (name, type, subject, content, variables, status)
VALUES
  (
    'signup_welcome',
    'email',
    'Welcome to AONet - Your Account is Ready!',
    '<h1>Welcome {{user_name}}!</h1><p>Your account has been successfully created. Click the button below to complete your profile.</p>',
    '["user_name", "profile_link"]',
    'active'
  ),
  (
    'password_reset',
    'email',
    'Reset Your AONet Password',
    '<h1>Password Reset</h1><p>Click the link below to reset your password. This link is valid for 24 hours.</p><a href="{{reset_link}}">Reset Password</a>',
    '["reset_link", "expiry_time"]',
    'active'
  ),
  (
    'order_confirmation',
    'email',
    'Order Confirmed - Order #{{order_id}}',
    '<h1>Your Order is Confirmed!</h1><p>Order ID: {{order_id}}</p><p>Total: ₹{{total}}</p><p>Estimated Delivery: {{delivery_date}}</p>',
    '["order_id", "total", "delivery_date", "items"]',
    'active'
  ),
  (
    'payment_confirmation',
    'email',
    'Payment Successful - Order #{{order_id}}',
    '<h1>Payment Received!</h1><p>Payment of ₹{{amount}} received for Order #{{order_id}}</p><p>Transaction ID: {{transaction_id}}</p>',
    '["order_id", "amount", "transaction_id", "payment_method"]',
    'active'
  ),
  (
    'payment_confirmation_sms',
    'sms',
    NULL,
    'Payment of ₹{{amount}} received for Order #{{order_id}}. Track: {{tracking_link}}. Thank you!',
    '["amount", "order_id", "tracking_link"]',
    'active'
  ),
  (
    'order_shipped',
    'email',
    'Order #{{order_id}} Has Been Shipped',
    '<h1>Your Order is on the Way!</h1><p>Order ID: {{order_id}}</p><p>Tracking Number: {{tracking_number}}</p><a href="{{tracking_link}}">Track Your Order</a>',
    '["order_id", "tracking_number", "tracking_link", "carrier"]',
    'active'
  ),
  (
    'order_delivered',
    'email',
    'Order #{{order_id}} Delivered',
    '<h1>Your Order Has Been Delivered!</h1><p>Order ID: {{order_id}}</p><p>Please review your order: {{review_link}}</p>',
    '["order_id", "review_link"]',
    'active'
  ),
  (
    'cart_reminder',
    'email',
    'Don''t Miss Out! Complete Your Order',
    '<h1>Items waiting in your cart!</h1><p>You have {{item_count}} items worth ₹{{cart_total}} in your cart.</p><a href="{{checkout_link}}">Complete Your Purchase</a>',
    '["item_count", "cart_total", "checkout_link"]',
    'active'
  )
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 7. NOTES
-- ============================================================================
/*

IMPLEMENTATION NOTES:
---------------------

1. notification_templates:
   - Stores templates that can be reused
   - Supports versioning for template changes
   - Variables are stored as JSONB array for validation

2. notification_queue:
   - Used for async/background job processing
   - Priority field allows critical notifications first
   - next_retry_at tracks when to retry failed notifications

3. notification_rate_limits:
   - Prevents notification spam to users
   - Period resets based on period_hours
   - Can be customized per user per notification type

4. notification_analytics:
   - Aggregated daily metrics
   - Useful for dashboards and monitoring
   - Can be queried for historical analysis

5. How They Work Together:
   - User signs up
   → notification_queue entry created
   → Background job processes queue
   → Loads template from notification_templates
   → Renders with variables
   → Sends via channel
   → Creates entry in notification_logs
   → Updates notification_analytics daily

6. Rate Limiting Example:
   - MAX 10 password reset emails per user per 24 hours
   - MAX 5 cart reminders per user per 24 hours
   - MAX 1 order confirmation per order (custom logic)

*/
