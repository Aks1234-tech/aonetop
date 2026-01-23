# Task 1.1: Database Schema Setup - Implementation Guide

**Date:** 24 January 2026  
**Status:** Ready for Implementation  
**Duration:** 2-3 days

---

## Overview

This document provides step-by-step instructions for setting up the notification system database schema. Two migration files have been created and are ready to deploy.

---

## Migration Files Created

### File 1: `20260124_create_notification_tables.sql`
**Purpose:** Core notification system tables  
**Tables Created:**
- `notification_logs` - Records of all notifications sent
- `user_contact_info` - User contact details and preferences

**Size:** ~10 KB  
**Execution Time:** ~2-3 seconds

### File 2: `20260124_create_notification_supporting_tables.sql`
**Purpose:** Supporting tables for advanced features  
**Tables Created:**
- `notification_templates` - Reusable email/SMS/WhatsApp templates
- `notification_queue` - Queue for pending notifications
- `notification_rate_limits` - Rate limiting per user per type
- `notification_analytics` - Daily aggregated statistics

**Size:** ~12 KB  
**Execution Time:** ~1-2 seconds

---

## Database Schema Overview

### 1. notification_logs Table

**Purpose:** Record of every notification sent

| Column | Type | Key | Description |
|--------|------|-----|-------------|
| id | UUID | PK | Unique notification log ID |
| user_id | UUID | FK | Reference to user |
| notification_type | VARCHAR(50) | - | Type of notification |
| channel | VARCHAR(20) | - | email, sms, or whatsapp |
| recipient | TEXT | - | Email or phone number |
| status | VARCHAR(20) | - | pending, sent, failed, bounced |
| error_message | TEXT | - | Error details if failed |
| retry_count | INT | - | Number of retry attempts |
| metadata | JSONB | - | Additional data (order_id, etc.) |
| created_at | TIMESTAMP | - | When notification was created |
| sent_at | TIMESTAMP | - | When successfully sent |
| updated_at | TIMESTAMP | - | Last update time |

**Indexes Created:**
- `idx_notification_logs_user_id` - Fast lookup by user
- `idx_notification_logs_status` - Find pending/failed notifications
- `idx_notification_logs_created_at` - Time-based queries
- `idx_notification_logs_user_type` - User + type lookups
- `idx_notification_logs_user_status` - User + status lookups
- `idx_notification_logs_type` - Analytics queries
- `idx_notification_logs_channel` - Channel-specific stats

**Example Data:**
```sql
INSERT INTO notification_logs 
  (user_id, notification_type, channel, recipient, status, metadata)
VALUES 
  ('uuid-123', 'order_confirmation', 'email', 'user@example.com', 'sent', 
   '{"order_id": "ORD-456", "amount": 5999}');
```

---

### 2. user_contact_info Table

**Purpose:** User contact information and notification preferences

| Column | Type | Key | Description |
|--------|------|-----|-------------|
| id | UUID | PK | Unique contact info ID |
| user_id | UUID | FK (UNIQUE) | Reference to user (one-to-one) |
| phone_number | VARCHAR(15) | - | Phone number in format +91XXXXXXXXXX |
| email_verified | BOOLEAN | - | Whether email is verified |
| phone_verified | BOOLEAN | - | Whether phone is verified |
| whatsapp_enabled | BOOLEAN | - | WhatsApp notifications enabled |
| notification_preferences | JSONB | - | Channel preferences per notification type |
| created_at | TIMESTAMP | - | Creation timestamp |
| updated_at | TIMESTAMP | - | Last update timestamp |

**Notification Preferences Schema:**
```json
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
```

**Indexes Created:**
- `idx_user_contact_info_phone` - Phone number lookups
- `idx_user_contact_info_user_id` - User lookups
- `idx_user_contact_info_email_verified` - Find verified emails
- `idx_user_contact_info_phone_verified` - Find verified phones
- `idx_user_contact_info_whatsapp_enabled` - Find WhatsApp users

**Example Data:**
```sql
INSERT INTO user_contact_info 
  (user_id, phone_number, email_verified, phone_verified)
VALUES 
  ('uuid-123', '+919876543210', true, true);
```

---

### 3. notification_templates Table (Optional)

**Purpose:** Reusable templates for different notification types

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Template ID |
| name | VARCHAR(100) | Unique template name (e.g., 'signup_welcome') |
| type | VARCHAR(50) | 'email', 'sms', or 'whatsapp' |
| subject | VARCHAR(255) | Email subject (email only) |
| content | TEXT | Template content with {{variables}} |
| variables | JSONB | Array of variable names used |
| status | VARCHAR(20) | 'active', 'inactive', or 'archived' |
| version | INT | Template version number |

**Example:**
```sql
-- Signup welcome email template
INSERT INTO notification_templates 
  (name, type, subject, content, variables, status)
VALUES 
  (
    'signup_welcome',
    'email',
    'Welcome to AONet - Your Account is Ready!',
    '<h1>Welcome {{user_name}}!</h1><p>Your account has been successfully created.</p>',
    '["user_name", "profile_link"]',
    'active'
  );
```

---

### 4. notification_queue Table (Optional)

**Purpose:** Queue of pending notifications for background processing

Used by background jobs to:
1. Pull pending notifications from queue
2. Render template with variables
3. Send via channels
4. Update notification_logs
5. Mark as complete in queue

**Statuses:**
- `pending` - Waiting to be sent
- `processing` - Currently being sent
- `completed` - Successfully sent
- `failed` - Failed after retries

---

### 5. notification_analytics Table (Optional)

**Purpose:** Daily aggregated statistics for monitoring

```sql
-- Example query for daily stats
SELECT 
  date,
  notification_type,
  channel,
  sent_count,
  delivered_count,
  (delivered_count::numeric / sent_count * 100) as delivery_rate
FROM notification_analytics
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date DESC, notification_type;
```

---

## Setup Instructions

### Step 1: Review Migration Files

```bash
# Check the migration files
cat supabase/migrations/20260124_create_notification_tables.sql
cat supabase/migrations/20260124_create_notification_supporting_tables.sql
```

### Step 2: Deploy to Supabase (Local Development)

```bash
# Start Supabase locally
supabase start

# The migrations will run automatically when Supabase starts
# Or manually run them:
supabase db push
```

### Step 3: Verify Schema Creation

```sql
-- Connect to your Supabase database and run:

-- Check tables exist
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('notification_logs', 'user_contact_info', 'notification_templates', 'notification_queue');

-- Check indexes exist
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('notification_logs', 'user_contact_info');

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('notification_logs', 'user_contact_info');
```

### Step 4: Test Basic Queries

```sql
-- Test notification_logs table
INSERT INTO notification_logs 
  (user_id, notification_type, channel, recipient, status)
VALUES 
  (auth.uid(), 'test_notification', 'email', 'test@example.com', 'pending');

-- Retrieve your notifications
SELECT * FROM notification_logs 
WHERE user_id = auth.uid()
ORDER BY created_at DESC;
```

### Step 5: Deploy to Production

```bash
# Link to production Supabase project
supabase link --project-ref your-project-id

# Push migrations to production
supabase db push --linked

# Verify production schema
supabase db pull
```

---

## RLS (Row Level Security) Policies

### notification_logs Policies

```sql
-- Users can only view their own notification logs
CREATE POLICY notification_logs_select_policy 
ON public.notification_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Backend service can insert (via authenticated service role)
CREATE POLICY notification_logs_insert_policy 
ON public.notification_logs 
FOR INSERT 
WITH CHECK (false); -- Backend inserts via service role, not client
```

**Implications:**
- Users cannot directly insert notifications (prevents spam)
- Only backend service can create notification logs
- Users can only view their own notifications

### user_contact_info Policies

```sql
-- Users can view their own contact info
CREATE POLICY user_contact_info_select_policy 
ON public.user_contact_info 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY user_contact_info_update_policy 
ON public.user_contact_info 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

**Implications:**
- Users can manage their own notification preferences
- Users cannot view other users' contact info
- Backend service creates initial contact info on signup

---

## Database Relationships

```
auth.users (Supabase built-in)
    ↓
    ├─→ notification_logs (one-to-many)
    │    └─→ Records of notifications sent to user
    │
    ├─→ user_contact_info (one-to-one)
    │    └─→ User's phone number and preferences
    │
    ├─→ notification_queue (one-to-many)
    │    └─→ Pending notifications to send
    │
    └─→ notification_rate_limits (one-to-many)
         └─→ Rate limit tracking per type
```

---

## Notification Statuses

```
pending → processing → sent ✓
  ↓
failed → (retry) → pending
  ↓
(max retries) → escalated → support ticket
```

---

## Performance Optimization

### Index Strategy

**Frequently Queried Patterns:**
1. "Get all notifications for user X"
   - Covered by: `idx_notification_logs_user_id`

2. "Get all pending notifications"
   - Covered by: `idx_notification_logs_status`

3. "Get notifications created in last 24 hours"
   - Covered by: `idx_notification_logs_created_at DESC`

4. "Find notifications by user + type"
   - Covered by: `idx_notification_logs_user_type`

5. "Analytics: Send count by type and channel"
   - Covered by: `idx_notification_logs_type` and `idx_notification_logs_channel`

### Query Examples

```sql
-- Find all pending notifications (for background job)
SELECT * FROM notification_logs 
WHERE status = 'pending'
AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at ASC
LIMIT 100;

-- Get user's recent notifications
SELECT * FROM notification_logs 
WHERE user_id = 'uuid-123'
ORDER BY created_at DESC
LIMIT 20;

-- Analytics: Today's delivery rate
SELECT 
  channel,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as delivered,
  ROUND(
    SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100, 2
  ) as delivery_rate
FROM notification_logs
WHERE DATE(created_at) = CURRENT_DATE
GROUP BY channel;
```

---

## Data Retention Policy

**Recommended:**
- Keep notification logs for 90 days in hot storage
- Archive logs older than 90 days
- Delete logs older than 1 year (GDPR compliance)

```sql
-- Archive old logs (example)
-- Run monthly as a scheduled job
INSERT INTO notification_logs_archive
SELECT * FROM notification_logs
WHERE created_at < NOW() - INTERVAL '90 days';

DELETE FROM notification_logs
WHERE created_at < NOW() - INTERVAL '90 days';
```

---

## Troubleshooting

### Issue: RLS Policies Preventing Access

**Problem:** Getting "permission denied" errors

**Solution:** Ensure you're using the correct authentication method:
```typescript
// For user operations (frontend)
const { data } = await supabase
  .from('notification_logs')
  .select('*')
  .eq('user_id', userId); // Automatically filtered by RLS

// For backend service operations
const { data } = await supabase
  .from('notification_logs')
  .insert({ /* data */ })
  // Use service role (backend only, not exposed to client)
```

### Issue: Slow Queries

**Problem:** Queries taking too long

**Solution:** Check if indexes are being used:
```sql
EXPLAIN ANALYZE
SELECT * FROM notification_logs 
WHERE user_id = 'uuid-123' 
ORDER BY created_at DESC;

-- Should show "Index Scan" if using indexes
```

### Issue: JSONB Queries Slow

**Problem:** Filtering by JSONB fields is slow

**Solution:** Add GIN index for JSONB:
```sql
CREATE INDEX idx_user_contact_info_preferences_gin 
ON user_contact_info USING GIN (notification_preferences);
```

---

## Next Steps

After successful schema deployment:

1. **Phase 1.3:** SMS Service Integration
2. **Phase 1.4:** Core Notification Service Module
3. **Phase 1.5:** Database Hooks & Event Listeners

---

## Rollback Instructions

If you need to rollback the migrations:

```bash
# Supabase will track migrations automatically
# To see migration history:
supabase migration list

# To rollback (if needed, create a new migration file to drop tables)
supabase db reset # For local development only
```

---

## Success Criteria ✅

- [x] Both migration files created without syntax errors
- [ ] Migrations deployed to development database
- [ ] All tables created successfully
- [ ] All indexes created
- [ ] RLS policies enforced
- [ ] Test data can be inserted
- [ ] User can query their own notifications
- [ ] Backend service can insert/update notifications
- [ ] Production database ready for deployment

---

## Additional Resources

- [Supabase Database Documentation](https://supabase.com/docs/guides/database)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [JSONB Best Practices](https://www.postgresql.org/docs/current/datatype-json.html)
- [Index Performance Tuning](https://www.postgresql.org/docs/current/indexes.html)

---

**Prepared by:** Development Team  
**Status:** Ready for Deployment  
**Last Updated:** 24 January 2026
