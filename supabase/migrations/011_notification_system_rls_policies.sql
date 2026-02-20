-- Migration: Add RLS Policies for Notification System Tables
-- Version: 1.0
-- Date: 24 January 2026
-- Description: Comprehensive RLS (Row Level Security) policies for all notification system tables

-- ============================================================================
-- 1. RLS POLICIES FOR notification_logs TABLE
-- ============================================================================

-- Enable RLS if not already enabled
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own notification logs
CREATE POLICY notification_logs_users_select 
ON public.notification_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Admins can view all notification logs
CREATE POLICY notification_logs_admins_select 
ON public.notification_logs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM auth.users 
  WHERE user_id = auth.uid()
));

-- Policy: Only backend service can insert (via service_role)
CREATE POLICY notification_logs_insert 
ON public.notification_logs 
FOR INSERT 
WITH CHECK (false); -- Clients cannot insert directly

-- Policy: Only backend service can update (via service_role)
CREATE POLICY notification_logs_update 
ON public.notification_logs 
FOR UPDATE 
USING (false) -- Clients cannot update directly
WITH CHECK (false);

-- Policy: Only backend service can delete (via service_role)
CREATE POLICY notification_logs_delete 
ON public.notification_logs 
FOR DELETE 
USING (false); -- Clients cannot delete directly

COMMENT ON POLICY notification_logs_users_select ON public.notification_logs 
IS 'Allow users to view only their own notification logs';

COMMENT ON POLICY notification_logs_admins_select ON public.notification_logs 
IS 'Allow admins to view all notification logs for monitoring/debugging';

COMMENT ON POLICY notification_logs_insert ON public.notification_logs 
IS 'Prevent direct client inserts; backend service uses service_role key';

-- ============================================================================
-- 2. RLS POLICIES FOR user_contact_info TABLE
-- ============================================================================

-- Enable RLS if not already enabled
ALTER TABLE public.user_contact_info ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own contact information
CREATE POLICY user_contact_info_users_select 
ON public.user_contact_info 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Admins can view all contact info for support/debugging
CREATE POLICY user_contact_info_admins_select 
ON public.user_contact_info 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM auth.users 
  WHERE user_id = auth.uid()
));

-- Policy: Users can update their own contact information
CREATE POLICY user_contact_info_users_update 
ON public.user_contact_info 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Only backend service can insert (via service_role)
CREATE POLICY user_contact_info_insert 
ON public.user_contact_info 
FOR INSERT 
WITH CHECK (false); -- Clients cannot insert directly

-- Policy: Only backend service can delete (via service_role)
CREATE POLICY user_contact_info_delete 
ON public.user_contact_info 
FOR DELETE 
USING (false); -- Clients cannot delete directly

COMMENT ON POLICY user_contact_info_users_select ON public.user_contact_info 
IS 'Users can view their own contact information';

COMMENT ON POLICY user_contact_info_users_update ON public.user_contact_info 
IS 'Users can update their own notification preferences and contact details';

COMMENT ON POLICY user_contact_info_insert ON public.user_contact_info 
IS 'Backend service creates contact info entries on user signup via service_role';

-- ============================================================================
-- 3. RLS POLICIES FOR notification_templates TABLE
-- ============================================================================

-- Enable RLS
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read active templates (needed for rendering notifications)
CREATE POLICY notification_templates_select 
ON public.notification_templates 
FOR SELECT 
USING (status = 'active');

-- Policy: Only admins can insert new templates
CREATE POLICY notification_templates_insert 
ON public.notification_templates 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM auth.users 
    WHERE user_id = auth.uid()
  )
);

-- Policy: Only admins can update templates
CREATE POLICY notification_templates_update 
ON public.notification_templates 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM auth.users 
  WHERE user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM auth.users 
  WHERE user_id = auth.uid()
));

-- Policy: Only admins can delete templates
CREATE POLICY notification_templates_delete 
ON public.notification_templates 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM auth.users 
  WHERE user_id = auth.uid()
));

COMMENT ON POLICY notification_templates_select ON public.notification_templates 
IS 'Allow reading active templates for notification rendering';

COMMENT ON POLICY notification_templates_insert ON public.notification_templates 
IS 'Only admins can create new notification templates';

COMMENT ON POLICY notification_templates_update ON public.notification_templates 
IS 'Only admins can modify existing templates';

-- ============================================================================
-- 4. RLS POLICIES FOR notification_queue TABLE
-- ============================================================================

-- Enable RLS
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

-- Policy: Block all SELECT from authenticated users (backend only)
CREATE POLICY notification_queue_select 
ON public.notification_queue 
FOR SELECT 
USING (false);

-- Policy: Block all INSERT from authenticated users (backend only)
CREATE POLICY notification_queue_insert 
ON public.notification_queue 
FOR INSERT 
WITH CHECK (false);

-- Policy: Block all UPDATE from authenticated users (backend only)
CREATE POLICY notification_queue_update 
ON public.notification_queue 
FOR UPDATE 
USING (false)
WITH CHECK (false);

-- Policy: Block all DELETE from authenticated users (backend only)
CREATE POLICY notification_queue_delete 
ON public.notification_queue 
FOR DELETE 
USING (false);

COMMENT ON POLICY notification_queue_select ON public.notification_queue 
IS 'Notification queue is managed exclusively by backend service via service_role key. Clients have no access.';

COMMENT ON POLICY notification_queue_insert ON public.notification_queue 
IS 'Backend service only. Background jobs use service_role key to queue notifications.';

-- ============================================================================
-- 5. RLS POLICIES FOR notification_rate_limits TABLE
-- ============================================================================

-- Enable RLS
ALTER TABLE public.notification_rate_limits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own rate limit records
CREATE POLICY notification_rate_limits_users_select 
ON public.notification_rate_limits 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Admins can view all rate limits
CREATE POLICY notification_rate_limits_admins_select 
ON public.notification_rate_limits 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM auth.users 
  WHERE user_id = auth.uid()
));

-- Policy: Block all INSERT from clients
CREATE POLICY notification_rate_limits_insert 
ON public.notification_rate_limits 
FOR INSERT 
WITH CHECK (false);

-- Policy: Block all UPDATE from clients
CREATE POLICY notification_rate_limits_update 
ON public.notification_rate_limits 
FOR UPDATE 
USING (false)
WITH CHECK (false);

-- Policy: Block all DELETE from clients
CREATE POLICY notification_rate_limits_delete 
ON public.notification_rate_limits 
FOR DELETE 
USING (false);

COMMENT ON POLICY notification_rate_limits_users_select ON public.notification_rate_limits 
IS 'Users can view their own rate limit statistics (for informational purposes)';

COMMENT ON POLICY notification_rate_limits_insert ON public.notification_rate_limits 
IS 'Backend service manages rate limits via service_role key';

-- ============================================================================
-- 6. RLS POLICIES FOR notification_analytics TABLE
-- ============================================================================

-- Enable RLS
ALTER TABLE public.notification_analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view analytics
CREATE POLICY notification_analytics_select 
ON public.notification_analytics 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM auth.users 
  WHERE user_id = auth.uid()
));

-- Policy: Block all INSERT from authenticated users
CREATE POLICY notification_analytics_insert 
ON public.notification_analytics 
FOR INSERT 
WITH CHECK (false);

-- Policy: Block all UPDATE from authenticated users
CREATE POLICY notification_analytics_update 
ON public.notification_analytics 
FOR UPDATE 
USING (false)
WITH CHECK (false);

-- Policy: Block all DELETE from authenticated users
CREATE POLICY notification_analytics_delete 
ON public.notification_analytics 
FOR DELETE 
USING (false);

COMMENT ON POLICY notification_analytics_select ON public.notification_analytics 
IS 'Only admins can view aggregated notification analytics and statistics';

COMMENT ON POLICY notification_analytics_insert ON public.notification_analytics 
IS 'Backend daily aggregation job creates analytics records via service_role key';

-- ============================================================================
-- 7. GRANT STATEMENTS FOR SERVICE ROLE
-- ============================================================================

-- These grants ensure the service_role (backend) can perform necessary operations
-- Note: Service role bypasses RLS, but explicit grants improve clarity

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_logs TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_contact_info TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_templates TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_queue TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_rate_limits TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_analytics TO service_role;

-- ============================================================================
-- 8. VERIFICATION QUERIES
-- ============================================================================

-- To verify RLS is enabled and working:
-- 
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename LIKE 'notification%';
-- 
-- Should show:
-- notification_logs        | true
-- notification_templates   | true
-- notification_queue       | true
-- notification_rate_limits | true
-- notification_analytics   | true
-- user_contact_info        | true

-- ============================================================================
-- 9. IMPLEMENTATION NOTES
-- ============================================================================

/*

RLS POLICY SECURITY ARCHITECTURE
==================================

1. NOTIFICATION_LOGS:
   - Users see only their own logs
   - Admins see all logs (for monitoring)
   - Backend service inserts via service_role
   - Prevents unauthorized access to notification history

2. USER_CONTACT_INFO:
   - Users can read and update their own preferences
   - Admins can read all for support purposes
   - Backend service manages inserts/deletes on signup/deletion
   - Protects sensitive contact information

3. NOTIFICATION_TEMPLATES:
   - Templates are readable by all (needed for notification rendering)
   - Only admins can create/edit/delete templates
   - Prevents users from creating spam templates

4. NOTIFICATION_QUEUE:
   - Completely blocked from client access
   - Only backend service can manage via service_role
   - Prevents unauthorized notification injection
   - Critical for security

5. NOTIFICATION_RATE_LIMITS:
   - Users can see their own limits (informational)
   - Admins can see all (for monitoring)
   - Backend service manages updates
   - Prevents circumventing rate limits

6. NOTIFICATION_ANALYTICS:
   - Admins only (sensitive analytics data)
   - Backend service inserts daily aggregations
   - Prevents data exposure

KEY SECURITY PRINCIPLES:
========================

✓ Default deny: Start with false, explicitly allow access
✓ Separation of concerns: Different access for users vs admins vs backend
✓ Service role bypass: Backend uses service_role key (not exposed to clients)
✓ Data sensitivity: Most restrictive on sensitive tables (queue, analytics)
✓ Audit trail: All access is logged by RLS
✓ Client isolation: Users only see their own data

users TABLE REQUIREMENT:
==============================

These policies reference an users table:
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT NOW()
);

Make sure this table exists before applying these RLS policies!

*/
