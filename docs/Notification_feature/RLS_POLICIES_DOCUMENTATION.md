# RLS Policies for Notification System

**Date:** 24 January 2026  
**Status:** Ready for Implementation  
**File:** `011_notification_system_rls_policies.sql`

---

## Overview

Row Level Security (RLS) is implemented to ensure:
- ✅ Users can only access their own data
- ✅ Admins can access all data for management
- ✅ Backend service has full access via service_role
- ✅ Prevents unauthorized access and data breaches
- ✅ Enforces business logic at database level

---

## Policy Summary by Table

### 1. notification_logs

**Accessible By:**
- Users: Their own logs only
- Admins: All logs
- Backend Service: Full access

**Policies:**
```sql
-- User can see own logs
SELECT: auth.uid() = user_id

-- Admin can see all logs
SELECT: admin_users check

-- Backend only for insert/update/delete
INSERT: false (via service_role)
UPDATE: false (via service_role)
DELETE: false (via service_role)
```

**Use Case:**
Users view their notification history in dashboard, admins monitor delivery in admin panel.

---

### 2. user_contact_info

**Accessible By:**
- Users: Their own contact info
- Admins: All contact info
- Backend Service: Full access

**Policies:**
```sql
-- User can read own contact info
SELECT: auth.uid() = user_id

-- User can update own preferences
UPDATE: auth.uid() = user_id

-- Admin can read all
SELECT: admin_users check

-- Backend only for insert/delete
INSERT: false (via service_role)
DELETE: false (via service_role)
```

**Use Case:**
Users manage notification preferences, backend creates record on signup.

---

### 3. notification_templates

**Accessible By:**
- Everyone: Can read active templates (for rendering)
- Admins: Can create/edit/delete
- Backend Service: Full access

**Policies:**
```sql
-- Everyone can read active templates
SELECT: status = 'active'

-- Admin only for insert/update/delete
INSERT: admin_users check
UPDATE: admin_users check
DELETE: admin_users check
```

**Use Case:**
Backend loads templates to render notifications, admins manage template library.

---

### 4. notification_queue

**Accessible By:**
- Backend Service ONLY (via service_role)
- No client access

**Policies:**
```sql
-- Block all client access
SELECT: false
INSERT: false
UPDATE: false
DELETE: false
```

**Critical Security:** Prevents unauthorized notification injection.

---

### 5. notification_rate_limits

**Accessible By:**
- Users: Their own limits (read-only)
- Admins: All limits
- Backend Service: Full access

**Policies:**
```sql
-- User can read own limits
SELECT: auth.uid() = user_id

-- Admin can read all
SELECT: admin_users check

-- Backend only for insert/update/delete
INSERT: false (via service_role)
UPDATE: false (via service_role)
DELETE: false (via service_role)
```

**Use Case:**
Prevent notification spam, admins monitor usage patterns.

---

### 6. notification_analytics

**Accessible By:**
- Admins ONLY (read-only)
- Backend Service: Insert via service_role

**Policies:**
```sql
-- Admin only
SELECT: admin_users check

-- Backend only for insert/update/delete
INSERT: false (via service_role)
UPDATE: false (via service_role)
DELETE: false (via service_role)
```

**Use Case:**
Admin dashboard showing delivery metrics and statistics.

---

## Security Architecture

### Three-Tier Access Model

```
┌─────────────────────────────────────────────────┐
│  AUTHENTICATED CLIENT (User/Admin Dashboard)     │
│  - Limited access via RLS policies              │
│  - User sees own data                           │
│  - Admin sees all data                          │
└──────────────────┬──────────────────────────────┘
                   │
                   │ Supabase Client Library
                   │ (authenticated JWT)
                   │
┌──────────────────▼──────────────────────────────┐
│  SUPABASE DATABASE                              │
│  ┌──────────────────────────────────────────┐  │
│  │  RLS POLICIES (enforced at database)     │  │
│  │  - Check auth.uid()                      │  │
│  │  - Check admin_users table               │  │
│  │  - Allow/Deny based on policy            │  │
│  └──────────────────────────────────────────┘  │
└──────────────────┬──────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
┌───────▼────────┐    ┌───────▼────────┐
│  USER DATA     │    │  ADMIN DATA    │
│  (filtered)    │    │  (full access) │
└────────────────┘    └────────────────┘

┌─────────────────────────────────────────────────┐
│  BACKEND SERVICE (Node.js/Python)               │
│  - Uses service_role key                        │
│  - Bypasses RLS (highest privileges)            │
│  - Full access to all tables                    │
└─────────────────────────────────────────────────┘
```

### Service Role Key Usage

```typescript
// Backend (NEVER expose to client)
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ← Highest privileges
);

// Can insert without RLS restrictions
await supabaseAdmin
  .from('notification_queue')
  .insert({ user_id, notification_type, channels, template_id, template_variables });
```

```typescript
// Frontend (uses anon/user key)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY // ← Limited by RLS
);

// Can only see own notifications (RLS enforced)
const { data } = await supabase
  .from('notification_logs')
  .select('*')
  // Where clause is implicit: auth.uid() = user_id
```

---

## Admin Users Table

**CRITICAL:** These RLS policies depend on an `admin_users` table.

```sql
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'admin', -- 'admin', 'moderator', 'support'
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_admin_users_user_id ON admin_users(user_id);

-- Insert admin user
INSERT INTO admin_users (user_id, role)
VALUES ('admin-uuid-here', 'admin');
```

---

## Testing RLS Policies

### Test 1: User Can See Own Notifications Only

```sql
-- Login as user-123
SELECT * FROM notification_logs;
-- Result: Only notifications where user_id = 'user-123'

-- Try to see another user's data
SELECT * FROM notification_logs 
WHERE user_id = 'other-user-456';
-- Result: 0 rows (RLS blocks access)
```

### Test 2: Admin Can See All Notifications

```sql
-- Login as admin user
SELECT * FROM notification_logs;
-- Result: All notifications (RLS allows for admins)
```

### Test 3: User Cannot Insert Directly

```sql
-- Login as regular user
INSERT INTO notification_logs 
  (user_id, notification_type, channel, recipient, status)
VALUES 
  ('user-123', 'test', 'email', 'test@example.com', 'pending');
-- Result: ERROR - permission denied for schema public

-- Backend can insert
-- (using service_role key, which bypasses RLS)
```

### Test 4: Rate Limits Protected

```sql
-- User can see own rate limits
SELECT * FROM notification_rate_limits;
-- Result: Own rate limit records only

-- Cannot see other users' limits
SELECT * FROM notification_rate_limits 
WHERE user_id = 'other-user';
-- Result: 0 rows (RLS blocks)

-- Cannot modify own limits directly
UPDATE notification_rate_limits 
SET count_in_period = 0 
WHERE user_id = 'user-123';
-- Result: ERROR - permission denied
```

---

## Common Scenarios

### Scenario 1: User Signs Up

```
1. Frontend calls signup endpoint
2. Auth.users entry created
3. Backend uses service_role to:
   - Insert into user_contact_info (bypasses RLS)
   - Initialize notification preferences (JSONB)
4. User can now see their contact info via RLS
```

### Scenario 2: Order Placed → Notification Sent

```
1. User places order
2. Backend uses service_role to:
   - Insert into notification_queue
   - Background job processes queue
   - Loads template from notification_templates
   - Renders and sends notification
   - Inserts into notification_logs
3. User sees notification in their history (RLS filters)
4. Admin sees all notifications (RLS allows for admin)
```

### Scenario 3: User Updates Preferences

```
1. Frontend loads user_contact_info (RLS allows)
2. User updates notification_preferences
3. Frontend updates via RLS (must be own record)
4. Next notification respects new preferences
```

### Scenario 4: Admin Views Analytics

```
1. Admin logs in
2. Requests notification_analytics
3. RLS checks admin_users table
4. Returns all analytics (admin check passes)
5. Dashboard displays metrics
```

---

## Troubleshooting RLS Issues

### Issue: "Permission Denied" on SELECT

**Cause:** User trying to access data outside RLS policy

**Solution:**
```typescript
// Check if policy allows access
SELECT * FROM information_schema.tables 
WHERE table_name = 'notification_logs' 
AND table_schema = 'public';

// Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'notification_logs';
```

### Issue: Backend Cannot Insert

**Cause:** Not using service_role key, regular user key has RLS restrictions

**Solution:**
```typescript
// WRONG - uses anon/user key
const { data } = await supabase
  .from('notification_queue')
  .insert({ /* ... */ });

// CORRECT - uses service_role key (backend only)
const { data } = await supabaseAdmin
  .from('notification_queue')
  .insert({ /* ... */ });
```

### Issue: Admin Cannot See Data

**Cause:** User not marked as admin in admin_users table

**Solution:**
```sql
-- Add user as admin
INSERT INTO admin_users (user_id, role)
VALUES ('admin-uuid', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- Verify
SELECT * FROM admin_users WHERE user_id = 'admin-uuid';
```

---

## Best Practices

### ✅ DO:

1. **Always use RLS** for user data
2. **Default to deny** (false) and explicitly allow
3. **Use service_role** only in backend services
4. **Never expose service_role key** to client
5. **Test RLS policies** thoroughly
6. **Document RLS logic** for future devs
7. **Monitor RLS performance** (can impact query speed)

### ❌ DON'T:

1. ❌ Disable RLS to "fix" permissions
2. ❌ Trust client to enforce security
3. ❌ Put service_role key in frontend code
4. ❌ Allow direct user modification of sensitive fields
5. ❌ Over-complicate RLS policies
6. ❌ Assume RLS is invisible (it affects performance)

---

## Performance Considerations

### RLS Overhead

Each RLS policy check adds a small query overhead:

```
Without RLS:      5ms
With RLS (simple): 6ms (+1ms overhead)
With RLS (complex): 8ms (+3ms overhead)
```

### Optimization Tips

1. **Index the auth.uid():**
```sql
CREATE INDEX idx_notification_logs_user_id 
ON notification_logs(user_id);
-- Already done in core migration
```

2. **Index admin_users.user_id:**
```sql
CREATE INDEX idx_admin_users_user_id 
ON admin_users(user_id);
```

3. **Avoid complex subqueries in RLS:**
```sql
-- BAD (slow)
USING (auth.uid() IN (
  SELECT user_id FROM huge_table 
  WHERE complex_condition = true
))

-- GOOD (fast)
USING (EXISTS (
  SELECT 1 FROM admin_users 
  WHERE user_id = auth.uid()
  LIMIT 1
))
```

---

## Deployment Checklist

- [ ] Create admin_users table before applying RLS migration
- [ ] Add at least one admin user to admin_users table
- [ ] Run RLS migration (011_notification_system_rls_policies.sql)
- [ ] Verify all policies created without errors
- [ ] Test user access (can see own data)
- [ ] Test admin access (can see all data)
- [ ] Test backend inserts (with service_role)
- [ ] Monitor query performance
- [ ] Document admin user management process

---

## Maintenance

### Monthly Tasks

```sql
-- Check for unused policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename LIKE 'notification%';

-- Monitor admin_users table
SELECT COUNT(*) as admin_count 
FROM admin_users;

-- Check for RLS violations/denials
-- (Check application logs for "permission denied" errors)
```

### Quarterly Tasks

```sql
-- Review RLS performance
EXPLAIN ANALYZE
SELECT * FROM notification_logs 
WHERE user_id = 'specific-user-uuid'
LIMIT 20;
-- Look for "Index Scan" vs "Seq Scan"

-- Check for policy updates needed
-- (Review new business requirements)
```

---

## References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Official Docs](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)

---

**Prepared by:** Development Team  
**Status:** Ready for Implementation  
**Last Updated:** 24 January 2026
