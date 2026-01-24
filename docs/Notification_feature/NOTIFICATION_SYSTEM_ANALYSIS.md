# Notification System Database Design Analysis & Rectification

**Date:** 24 January 2026  
**Status:** ✅ Redesigned and Optimized  
**Version:** 2.0

---

## 📋 Executive Summary

The original notification system design (migrations 009, 010, 011) had several architectural and implementation issues. A comprehensive redesign has been created in migration `012_notification_system_redesign.sql` that addresses all identified issues while providing enhanced functionality and performance.

---

## 🔍 Issues Identified in Original Design

### 1. **RLS Policy Conflicts**
**Problem:** Three separate migration files (009, 010, 011) defined overlapping RLS policies on the same tables, causing conflicts.

```sql
-- Migration 009: Creates policies
CREATE POLICY notification_logs_insert_policy ON notification_logs FOR INSERT WITH CHECK (false);

-- Migration 011: Creates conflicting policy with same name
CREATE POLICY notification_logs_insert ON notification_logs FOR INSERT WITH CHECK (false);
```

**Impact:** Database migration failures, unclear security boundaries, difficult maintenance.

**Solution:** Consolidated all RLS policies in migration 012 with clear naming conventions:
- `{table}_{role}_{operation}` (e.g., `notification_logs_users_select`)

---

### 2. **Admin Verification Issues**
**Problem:** RLS policies reference non-existent `admin_users` table and use incorrect auth patterns.

```sql
-- WRONG - admin_users table doesn't exist
CREATE POLICY notification_templates_insert_policy ON notification_templates
FOR INSERT WITH CHECK (EXISTS (
  SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
));
```

**Impact:** All admin insert/update operations would fail silently.

**Solution:** Fixed to reference the existing `profiles` table:
```sql
CREATE POLICY notification_templates_admins_insert ON notification_templates
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

---

### 3. **Missing NOT NULL Constraints**
**Problem:** Critical fields lack NOT NULL constraints, allowing invalid data states.

```sql
-- Original - allows NULL
CREATE TABLE notification_logs (
  user_id UUID NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  -- ... but no constraint on:
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),  -- Missing NOT NULL
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()   -- Missing NOT NULL
);
```

**Impact:** Inconsistent data, query reliability issues, null pointer exceptions in backend.

**Solution:** Added NOT NULL constraints on all temporal and critical fields:
```sql
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
```

---

### 4. **Unstructured Metadata**
**Problem:** JSONB metadata has no schema documentation or validation.

```sql
metadata JSONB,  -- What goes here? Nobody knows!
```

**Impact:** Backend developers must guess the structure, inconsistent data, hard to query.

**Solution:** Added structured comments and examples:
```sql
metadata JSONB,  -- {order_id, product_id, user_data, tracking_url, etc.}

COMMENT ON COLUMN public.notification_logs.metadata IS 
  'Additional context: {order_id: uuid, product_ids: [uuid], tracking_url: string, etc.}';
```

---

### 5. **Status Enum Without Validation**
**Problem:** Original used VARCHAR with no constraints, allowing invalid values.

```sql
status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- What are valid values?
```

**Impact:** Invalid status values in database, inconsistent behavior.

**Solution:** Added CHECK constraint with clear list:
```sql
status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN 
  ('pending', 'sent', 'failed', 'bounced', 'clicked', 'unsubscribed')),
```

---

### 6. **Queue Ready-to-Send Index Syntax Error**
**Problem:** Invalid index definition in migration 010:

```sql
CREATE INDEX IF NOT EXISTS idx_notification_queue_ready_to_send 
ON public.notification_queue(scheduled_at)
WHERE 'status' = 'pending';  -- ❌ WRONG! 'status' is a string literal, not column
```

**Impact:** Index not created, no performance optimization for pending queue items.

**Solution:** Fixed to proper column reference:
```sql
CREATE INDEX IF NOT EXISTS idx_notification_queue_status_priority 
ON public.notification_queue(status, priority DESC, scheduled_at ASC) 
WHERE status = 'pending';
```

---

### 7. **No Soft Delete Support**
**Problem:** No audit trail when notifications are deleted.

```sql
-- Original - hard delete only
CREATE TABLE notification_logs (
  id UUID PRIMARY KEY,
  -- ... no deleted_at or is_deleted column
);
```

**Impact:** Lost audit trail, regulatory compliance issues, can't recover deleted records.

**Solution:** Added soft delete columns:
```sql
deleted_at TIMESTAMP WITH TIME ZONE,
is_deleted BOOLEAN DEFAULT false
```

And updated indexes to respect soft deletes:
```sql
WHERE deleted_at IS NULL
```

---

### 8. **Insufficient Notification Preferences Structure**
**Problem:** Original preferences hard-coded in JSONB, no flexibility for quiet hours or per-user limits.

**Solution:** Enhanced with:
```sql
notification_preferences JSONB,  -- Mapping of notification_type -> channels
unsubscribed_from JSONB,         -- Array of unsubscribed notification types
max_daily_notifications INT,     -- Per-user limit
quiet_hours_start TIME,          -- Do not disturb settings
quiet_hours_end TIME,            -- Do not disturb settings
unsubscribe_token UUID,          -- For email unsubscribe links
```

---

### 9. **No Template Versioning History**
**Problem:** Template changes not tracked, no rollback capability.

**Solution:** Added new table:
```sql
CREATE TABLE notification_template_history (
  id UUID PRIMARY KEY,
  template_id UUID REFERENCES notification_templates(id),
  version INT,
  subject VARCHAR(255),
  body TEXT,
  variables JSONB,
  changed_by UUID,
  change_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE
);

-- Auto-track with trigger
CREATE TRIGGER track_template_history_trigger
BEFORE UPDATE ON notification_templates
FOR EACH ROW
EXECUTE FUNCTION track_template_version_history();
```

---

### 10. **Missing Rate Limit Uniqueness Constraint**
**Problem:** Multiple rate limit records could exist for same user-type combination.

```sql
-- Original - allows duplicates
CREATE TABLE notification_rate_limits (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  -- No unique constraint!
);
```

**Impact:** Duplicate rate limit records, inconsistent limiting behavior.

**Solution:** Added composite unique constraint:
```sql
CONSTRAINT unique_user_notification_rate_limit UNIQUE(user_id, notification_type)
```

---

## 📊 Schema Comparison

| Aspect | Original | Redesigned |
|--------|----------|-----------|
| **Tables** | 6 | 7 (+ history table) |
| **RLS Policies** | ~40+ (conflicting) | 30+ (consolidated, clear) |
| **Indexes** | ~25 | 35+ (optimized) |
| **Soft Deletes** | ❌ | ✅ |
| **Template History** | ❌ | ✅ |
| **Audit Trail** | Partial | Complete |
| **Performance Index Tuning** | ❌ | ✅ |
| **Constraint Validation** | Minimal | Comprehensive |
| **Documentation** | Partial | Complete |

---

## 🏗️ New Table: notification_template_history

```sql
CREATE TABLE notification_template_history (
  id UUID PRIMARY KEY,
  template_id UUID REFERENCES notification_templates(id) ON DELETE CASCADE,
  version INT NOT NULL,
  subject VARCHAR(255),
  body TEXT NOT NULL,
  variables JSONB,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  change_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL
);
```

**Purpose:** Complete audit trail of all template changes  
**Automatic Tracking:** Trigger fires on every template update  
**Rollback:** Can restore previous versions  
**Compliance:** Meets audit requirements

---

## 🔐 RLS Policy Architecture

### For End Users:
- ✅ Can read their own notification logs
- ✅ Can update their own contact info and preferences
- ✅ Can view their own rate limits
- ❌ Cannot access system tables (queue, analytics)

### For Admins:
- ✅ Can read all notification logs
- ✅ Can manage notification templates
- ✅ Can view all rate limits and analytics
- ❌ Cannot modify notification queue directly

### For Backend Service (service_role):
- ✅ Full access to all tables (bypasses RLS)
- ✅ Manages queue processing
- ✅ Handles rate limiting
- ✅ Aggregates analytics

```
┌─────────────────────────────────────────────────────────┐
│             RLS POLICY ENFORCEMENT MODEL               │
├─────────────────────────────────────────────────────────┤
│ Client (Authenticated User)                             │
│  ├─ SELECT: own logs, own contact info, own rate limits│
│  ├─ UPDATE: own preferences                             │
│  └─ INSERT/DELETE: Blocked                              │
├─────────────────────────────────────────────────────────┤
│ Admin User (role = 'admin' in profiles)                │
│  ├─ SELECT: all logs, all templates, analytics          │
│  ├─ INSERT/UPDATE: templates                            │
│  └─ DELETE: non-system templates                        │
├─────────────────────────────────────────────────────────┤
│ Backend Service (service_role)                          │
│  ├─ Full CRUD on all tables                             │
│  ├─ Bypasses RLS policies                               │
│  └─ Uses explicit GRANT statements                      │
└─────────────────────────────────────────────────────────┘
```

---

## ⚡ Performance Optimizations

### Index Strategy

**1. User-Centric Queries**
```sql
idx_notification_logs_user_id
idx_notification_logs_user_type
idx_notification_logs_user_status
```

**2. Queue Processing**
```sql
idx_notification_queue_status_priority  -- Primary: Get next batch to process
idx_notification_queue_retry           -- Fallback: Retry failed notifications
idx_notification_queue_processing      -- Monitor: Stuck processing jobs
```

**3. Analytics**
```sql
idx_notification_analytics_date        -- Time-series queries
idx_notification_analytics_type_date   -- Trending by type
```

**4. Soft Delete Optimization**
All indexes include `WHERE deleted_at IS NULL` to skip archived records:
```sql
CREATE INDEX idx_notification_logs_user_id ON notification_logs(user_id) 
WHERE deleted_at IS NULL;
```

---

## 📈 New Features in Redesign

### 1. Quiet Hours
```sql
quiet_hours_start TIME,  -- e.g., '22:00'
quiet_hours_end TIME,    -- e.g., '08:00'
```
Backend skips notifications during quiet hours.

### 2. Per-User Daily Limits
```sql
max_daily_notifications INT DEFAULT 10 CHECK (max_daily_notifications > 0),
```
Prevent notification fatigue.

### 3. Email Unsubscribe Support
```sql
unsubscribe_token UUID UNIQUE,
unsubscribed_from JSONB DEFAULT '[]',  -- ["promotional", "marketing"]
```
Compliant with email regulations (CAN-SPAM, GDPR).

### 4. Notification Processing Metrics
```sql
execution_time_ms INT,
processing_started_at TIMESTAMP WITH TIME ZONE,
```
Monitor notification system performance.

### 5. Analytics Computed Rates
```sql
delivery_rate NUMERIC(5, 2),    -- Percentage
bounce_rate NUMERIC(5, 2),      -- Percentage
unsubscribe_rate NUMERIC(5, 2),
```
Ready-made dashboards metrics.

---

## 🔧 Migration Path

### Step 1: Deprecate Original Migrations
Comment out or mark as deprecated:
- `009_create_notification_tables.sql`
- `010_create_notification_supporting_tables.sql`
- `011_notification_system_rls_policies.sql`

### Step 2: Apply New Migration
```bash
supabase db push  # Applies 012_notification_system_redesign.sql
```

### Step 3: Verify RLS Policies
```sql
-- Check all tables have RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'notification%';

-- Verify policies are correct
SELECT * FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename LIKE 'notification%';
```

### Step 4: Update Backend Service
Update notification service to use:
- `notification_queue` for async processing
- `notification_templates` for templating
- Trigger rate limits before queueing
- Track analytics after sending

---

## 📚 Data Dictionary

### notification_logs
- **Purpose:** Complete audit trail of all notifications sent
- **Retention:** Keep forever (or per compliance policy)
- **Soft Delete:** Yes, use `deleted_at` for archives
- **Access:** Users (own only), Admins (all)

### user_contact_info
- **Purpose:** User contact details and preferences
- **Retention:** Keep while user account active
- **Verification:** Email and phone OTP verified
- **Preferences:** Granular per notification type

### notification_templates
- **Purpose:** Reusable notification templates with variable substitution
- **Versioning:** Automatic version increment on update
- **System Templates:** Protected from deletion
- **Status:** draft, active, inactive, archived

### notification_queue
- **Purpose:** Async queue for pending notifications
- **Processing:** Dequeue by status + priority + scheduled_at
- **Retry Logic:** Exponential backoff via `next_retry_at`
- **Visibility:** Backend service only (via service_role)

### notification_rate_limits
- **Purpose:** Prevent notification spam per user per type
- **Period:** Configurable (default 24 hours)
- **Blocking:** Set `blocked_until` to hard-stop notifications
- **Reset:** Automatic period_start reset after period_hours

### notification_analytics
- **Purpose:** Daily aggregated metrics for dashboards
- **Computation:** Run as backend job at end of day
- **Metrics:** Counts, rates, delivery times
- **Retention:** Permanent historical record

---

## ✅ Validation Checklist

Before applying this migration, verify:

- [ ] Database user has proper role (should be `postgres` or with appropriate grants)
- [ ] No existing data in notification tables (or have migration strategy)
- [ ] `profiles` table exists with `role` column
- [ ] `auth.users` table exists (Supabase)
- [ ] Service role user exists in Supabase
- [ ] Read through all comments in `012_notification_system_redesign.sql`

---

## 🚀 Next Steps

1. **Apply Migration 012** - Consolidates all notification tables with fixes
2. **Deprecate Migrations 009-011** - Remove conflicting definitions
3. **Update Backend Service** - Implement notification sending logic
4. **Create Test Cases** - RLS policies, queue processing, analytics
5. **Monitor Performance** - Track index usage and query times

---

## 📞 Support

For questions about:
- **RLS Policies:** See section "RLS Policy Architecture"
- **Performance:** See section "Performance Optimizations"
- **New Features:** See section "New Features in Redesign"
- **Migration Issues:** See section "Migration Path"

---

**Status:** Ready for Implementation ✅  
**Last Updated:** 24 January 2026
