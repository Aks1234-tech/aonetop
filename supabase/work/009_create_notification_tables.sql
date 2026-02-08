-- Migration: Create Notification System Tables
-- Version: 1.0
-- Date: 24 January 2026
-- Description: Create core notification system tables with proper indexing and RLS policies

-- ============================================================================
-- 1. CREATE notification_logs TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  channel VARCHAR(20) NOT NULL,
  recipient TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  error_message TEXT,
  retry_count INT NOT NULL DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE public.notification_logs IS 'Logs for all notifications sent to users across all channels (email, SMS, WhatsApp)';
COMMENT ON COLUMN public.notification_logs.id IS 'Unique identifier for this notification log entry';
COMMENT ON COLUMN public.notification_logs.user_id IS 'Reference to the user receiving the notification';
COMMENT ON COLUMN public.notification_logs.notification_type IS 'Type of notification (signup, password_reset, order_confirmation, etc.)';
COMMENT ON COLUMN public.notification_logs.channel IS 'Channel through which notification was sent (email, sms, whatsapp)';
COMMENT ON COLUMN public.notification_logs.recipient IS 'Email address or phone number where notification was sent';
COMMENT ON COLUMN public.notification_logs.status IS 'Current status of notification (pending, sent, failed, bounced, clicked)';
COMMENT ON COLUMN public.notification_logs.error_message IS 'Error message if notification failed to send';
COMMENT ON COLUMN public.notification_logs.retry_count IS 'Number of times this notification was retried';
COMMENT ON COLUMN public.notification_logs.metadata IS 'Additional data related to the notification (order_id, product details, etc.)';
COMMENT ON COLUMN public.notification_logs.created_at IS 'When the notification was created/triggered';
COMMENT ON COLUMN public.notification_logs.sent_at IS 'When the notification was actually sent';
COMMENT ON COLUMN public.notification_logs.updated_at IS 'Last update timestamp';

-- ============================================================================
-- 2. CREATE INDEXES for notification_logs TABLE
-- ============================================================================

-- Index on user_id for quick lookup of user's notifications
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id 
ON public.notification_logs(user_id);

-- Index on status for finding pending/failed notifications
CREATE INDEX IF NOT EXISTS idx_notification_logs_status 
ON public.notification_logs(status);

-- Index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at 
ON public.notification_logs(created_at DESC);

-- Composite index for finding notifications by user and type
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_type 
ON public.notification_logs(user_id, notification_type);

-- Composite index for finding notifications by user and status
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_status 
ON public.notification_logs(user_id, status);

-- Index on notification_type for analytics
CREATE INDEX IF NOT EXISTS idx_notification_logs_type 
ON public.notification_logs(notification_type);

-- Index on channel for channel-specific analytics
CREATE INDEX IF NOT EXISTS idx_notification_logs_channel 
ON public.notification_logs(channel);

-- ============================================================================
-- 3. CREATE user_contact_info TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_contact_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number VARCHAR(15),
  email_verified BOOLEAN NOT NULL DEFAULT false,
  phone_verified BOOLEAN NOT NULL DEFAULT false,
  whatsapp_enabled BOOLEAN NOT NULL DEFAULT false,
  notification_preferences JSONB NOT NULL DEFAULT '{
    "signup": ["email", "sms"],
    "password_reset": ["email", "sms"],
    "profile_update": ["email"],
    "cart_addition": ["email"],
    "cart_reminder": ["email"],
    "order_confirmation": ["email"],
    "payment_confirmation": ["email", "sms", "whatsapp"],
    "order_tracking": ["email", "sms"],
    "error_notification": ["email"]
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE public.user_contact_info IS 'Stores contact information and notification preferences for each user';
COMMENT ON COLUMN public.user_contact_info.id IS 'Unique identifier for this contact info record';
COMMENT ON COLUMN public.user_contact_info.user_id IS 'Reference to the user (one-to-one relationship)';
COMMENT ON COLUMN public.user_contact_info.phone_number IS 'User phone number in format +91XXXXXXXXXX (for India)';
COMMENT ON COLUMN public.user_contact_info.email_verified IS 'Whether the user email has been verified';
COMMENT ON COLUMN public.user_contact_info.phone_verified IS 'Whether the user phone number has been verified via OTP';
COMMENT ON COLUMN public.user_contact_info.whatsapp_enabled IS 'Whether the user has enabled WhatsApp notifications';
COMMENT ON COLUMN public.user_contact_info.notification_preferences IS 'JSONB object storing which channels to use for each notification type';
COMMENT ON COLUMN public.user_contact_info.created_at IS 'When the contact info was created';
COMMENT ON COLUMN public.user_contact_info.updated_at IS 'When the contact info was last updated';

-- ============================================================================
-- 4. CREATE INDEXES for user_contact_info TABLE
-- ============================================================================

-- Index on phone_number for phone-based lookups
CREATE INDEX IF NOT EXISTS idx_user_contact_info_phone 
ON public.user_contact_info(phone_number);

-- Index on user_id (for quick user lookups)
CREATE INDEX IF NOT EXISTS idx_user_contact_info_user_id 
ON public.user_contact_info(user_id);

-- Index for finding users with verified emails
CREATE INDEX IF NOT EXISTS idx_user_contact_info_email_verified 
ON public.user_contact_info(email_verified)
WHERE email_verified = true;

-- Index for finding users with verified phones
CREATE INDEX IF NOT EXISTS idx_user_contact_info_phone_verified 
ON public.user_contact_info(phone_verified)
WHERE phone_verified = true;

-- Index for finding users with WhatsApp enabled
CREATE INDEX IF NOT EXISTS idx_user_contact_info_whatsapp_enabled 
ON public.user_contact_info(whatsapp_enabled)
WHERE whatsapp_enabled = true;

-- ============================================================================
-- 5. CREATE RLS (Row Level Security) POLICIES
-- ============================================================================

-- Enable RLS on notification_logs table
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own notification logs
CREATE POLICY notification_logs_select_policy 
ON public.notification_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Only service role can insert notification logs (from backend)
CREATE POLICY notification_logs_insert_policy 
ON public.notification_logs 
FOR INSERT 
WITH CHECK (false); -- Restrict direct inserts, use backend service instead

-- Policy: Only service role can update notification logs (for status changes)
CREATE POLICY notification_logs_update_policy 
ON public.notification_logs 
FOR UPDATE 
USING (false) -- Restrict updates from client
WITH CHECK (false);

-- Policy: Only service role can delete (for data cleanup)
CREATE POLICY notification_logs_delete_policy 
ON public.notification_logs 
FOR DELETE 
USING (false); -- Restrict deletes, should be done by backend service

-- Enable RLS on user_contact_info table
ALTER TABLE public.user_contact_info ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own contact info
CREATE POLICY user_contact_info_select_policy 
ON public.user_contact_info 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can update their own contact info
CREATE POLICY user_contact_info_update_policy 
ON public.user_contact_info 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Only service role can insert (for new user signup)
CREATE POLICY user_contact_info_insert_policy 
ON public.user_contact_info 
FOR INSERT 
WITH CHECK (false); -- Restrict direct inserts

-- ============================================================================
-- 6. CREATE TRIGGERS for automated timestamp updates
-- ============================================================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on notification_logs
DROP TRIGGER IF EXISTS notification_logs_updated_at_trigger ON public.notification_logs;
CREATE TRIGGER notification_logs_updated_at_trigger
BEFORE UPDATE ON public.notification_logs
FOR EACH ROW
EXECUTE FUNCTION update_notification_logs_updated_at();

-- Create function to update user_contact_info updated_at
CREATE OR REPLACE FUNCTION update_user_contact_info_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on user_contact_info
DROP TRIGGER IF EXISTS user_contact_info_updated_at_trigger ON public.user_contact_info;
CREATE TRIGGER user_contact_info_updated_at_trigger
BEFORE UPDATE ON public.user_contact_info
FOR EACH ROW
EXECUTE FUNCTION update_user_contact_info_updated_at();

-- ============================================================================
-- 7. VERIFICATION QUERIES
-- ============================================================================

-- Verify tables were created
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('notification_logs', 'user_contact_info');

-- Verify indexes were created
-- SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND tablename IN ('notification_logs', 'user_contact_info');

-- ============================================================================
-- 8. NOTES FOR IMPLEMENTATION
-- ============================================================================
/*

SETUP NOTES:
-----------

1. RLS Policies:
   - The RLS policies prevent direct client access to these tables
   - All inserts/updates must go through backend service
   - This is important for security and data consistency

2. Notification Preferences Schema (JSONB):
   Example structure:
   {
     "signup": ["email", "sms"],
     "password_reset": ["email", "sms"],
     "profile_update": ["email"],
     "cart_addition": ["email"],
     "cart_reminder": ["email"],
     "order_confirmation": ["email"],
     "payment_confirmation": ["email", "sms", "whatsapp"],
     "order_tracking": ["email", "sms"],
     "error_notification": ["email"]
   }

3. Notification Status Values:
   - "pending" - Notification queued for sending
   - "sent" - Notification successfully sent
   - "failed" - Notification failed to send
   - "bounced" - Email bounced back
   - "clicked" - User clicked link in notification (future)
   - "unsubscribed" - User unsubscribed (future)

4. Notification Types:
   - account_signup
   - password_reset
   - profile_update
   - cart_addition
   - cart_reminder
   - order_confirmation
   - payment_confirmation
   - order_tracking
   - error_notification
   - order_delivered
   - refund_confirmation

5. Channels:
   - email
   - sms
   - whatsapp

6. Performance Considerations:
   - Indexes are optimized for common queries
   - JSONB allows flexible metadata storage
   - Triggers ensure timestamp accuracy
   - Consider archiving old logs (>90 days) for performance

7. Future Enhancements:
   - Add notification_templates table
   - Add notification_queue table for pending notifications
   - Add notification_analytics table for aggregated stats
   - Add notification_rate_limits table for user-specific rate limiting

*/
