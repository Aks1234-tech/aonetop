# Notification System - Quick Reference

**Status:** ✅ Redesigned and Ready  
**Migration File:** `012_notification_system_redesign.sql`

---

## 🚀 Quick Start

### 1. Apply the Migration
```bash
cd /home/hackycoder/my_Data/aonetop
supabase db push  # Applies all pending migrations including 012
```

### 2. Verify RLS Policies
```sql
-- Check in Supabase Dashboard > SQL Editor
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'notification%';
-- All should show: tablename | rowsecurity=true
```

### 3. Backend Setup
```javascript
// Use service_role key
const supabaseAdmin = createClient(url, SERVICE_ROLE_KEY);

// NOT the anon key!
// const supabaseClient = createClient(url, ANON_KEY);  // ❌ Wrong for notifications
```

---

## 📊 Table Structure

```
┌─────────────────────────────────────────────────────────────┐
│ CORE TABLES                                                 │
├──────────────────────────┬──────────────────────────────────┤
│ notification_logs        │ Audit trail of all notifications  │
│ user_contact_info        │ User preferences & contact info   │
│ notification_queue       │ Pending notifications (async)     │
│ notification_rate_limits │ Spam prevention                   │
├──────────────────────────┼──────────────────────────────────┤
│ TEMPLATE TABLES                                             │
├──────────────────────────┼──────────────────────────────────┤
│ notification_templates   │ Reusable templates               │
│ notification_template_   │ Version history & audit trail    │
│   history               │                                    │
├──────────────────────────┼──────────────────────────────────┤
│ ANALYTICS TABLES                                            │
├──────────────────────────┼──────────────────────────────────┤
│ notification_analytics   │ Daily aggregated metrics         │
└──────────────────────────┴──────────────────────────────────┘
```

---

## 🔐 RLS Access Control

| Table | Users | Admins | Backend |
|-------|-------|--------|---------|
| notification_logs | own logs | all | full |
| user_contact_info | own info | all | full |
| notification_queue | blocked | blocked | full |
| notification_templates | active only | manage | full |
| notification_rate_limits | own limits | all | full |
| notification_analytics | blocked | view only | full |

---

## 📝 Common Tasks

### Queue a Notification

```javascript
await supabaseAdmin.from('notification_queue').insert({
  user_id: userId,
  notification_type: 'order_confirmation',
  channels: ['email', 'sms'],
  template_id: templateId,
  template_variables: {
    order_id: '123',
    total: 5000,
    delivery_date: '2026-01-30'
  },
  priority: 8
});
```

### Get User Preferences

```javascript
// User can get their own preferences
const { data } = await supabase  // ← Use anon/user key
  .from('user_contact_info')
  .select('notification_preferences, quiet_hours_start, quiet_hours_end')
  .eq('user_id', auth.currentUser.id)
  .single();
```

### Update User Preferences

```javascript
// User updates their own preferences
await supabase
  .from('user_contact_info')
  .update({
    notification_preferences: {
      promotional: [],           // Unsubscribe from promotions
      order_confirmation: ['email', 'sms'],
      password_reset: ['email']
    }
  })
  .eq('user_id', auth.currentUser.id);
```

### Get Delivery Analytics (Admin Only)

```javascript
// Only admin users can see this
const { data } = await supabaseAdmin
  .from('notification_analytics')
  .select('*')
  .eq('notification_type', 'order_confirmation')
  .gte('metric_date', '2026-01-01');
```

### Create Notification Template

```javascript
// Admin only
await supabaseAdmin.from('notification_templates').insert({
  name: 'order_shipped_v1',
  display_name: 'Order Shipped Notification',
  notification_type: 'order_tracking',
  channel: 'sms',
  body: 'Your order {{order_id}} is on the way! Track: {{tracking_link}}',
  variables: ['order_id', 'tracking_link'],
  status: 'active',
  is_system_template: false
});
```

### Check Queue Health

```javascript
// Backend monitoring
const { data: queue } = await supabaseAdmin
  .from('notification_queue')
  .select('status')
  .in('status', ['pending', 'failed', 'processing']);

console.log('Queue Health:');
console.log(`  Pending: ${queue.filter(q => q.status === 'pending').length}`);
console.log(`  Failed: ${queue.filter(q => q.status === 'failed').length}`);
console.log(`  Processing: ${queue.filter(q => q.status === 'processing').length}`);
```

---

## 🔄 Processing Flow

```
1. Event Triggered
   ↓
2. queueNotification()
   └─ Insert into notification_queue
   ↓
3. Background Job (every 5 min)
   └─ processNotificationQueue()
   ↓
4. For Each Pending Notification:
   ├─ Check user preferences
   ├─ Check rate limits
   ├─ Check quiet hours
   ├─ Render template
   ├─ Send via channels (email/SMS/WhatsApp)
   ├─ Log results in notification_logs
   └─ Update notification_queue status
   ↓
5. Provider Webhooks (optional)
   └─ Update delivery status in notification_logs
   ↓
6. Daily Job (end of day)
   └─ aggregateNotificationAnalytics()
      └─ Insert into notification_analytics
```

---

## ❌ What NOT to Do

```javascript
// ❌ DON'T: Direct queue manipulation from frontend
supabaseClient.from('notification_queue').insert({...});

// ❌ DON'T: Expose service_role key to frontend
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;  // ← Keep on backend only!

// ❌ DON'T: Bypass rate limiting
// Always check before queuing

// ❌ DON'T: Update notification_logs directly
// Update via webhooks or queue processing only

// ❌ DON'T: Hard-code template content
// Always use notification_templates table
```

---

## ✅ What TO Do

```javascript
// ✅ DO: Queue from backend
const backend = createClient(url, SERVICE_ROLE_KEY);
await backend.from('notification_queue').insert({...});

// ✅ DO: Users update own preferences
await supabaseClient
  .from('user_contact_info')
  .update({...})
  .eq('user_id', auth.currentUser.id);

// ✅ DO: Check rate limits before queuing
if (!isRateLimited(userId, type)) {
  await queueNotification(...);
}

// ✅ DO: Use versioned templates
// Let triggers auto-version on updates

// ✅ DO: Log everything in notification_logs
// Create detailed audit trail for debugging
```

---

## 📊 Key Statistics

| Metric | Value | Notes |
|--------|-------|-------|
| Tables | 7 | Core + Templates + Analytics |
| Indexes | 35+ | Optimized for common queries |
| RLS Policies | 30+ | Per-table, per-operation |
| Notification Types | 12 | account_signup, order_confirmation, etc. |
| Supported Channels | 3 | email, sms, whatsapp |
| Max Retries | 3 | Configurable per notification |
| Default Rate Limit | 10/day | Per user per notification type |
| Analytics History | Forever | No purge by default |

---

## 🛠️ Troubleshooting

### Problem: "Permission denied" on notification_queue
**Cause:** Using anon/user key instead of service_role  
**Fix:** Use `createClient(url, SERVICE_ROLE_KEY)` for backend

### Problem: RLS policies not visible in Supabase Dashboard
**Cause:** Migration not applied  
**Fix:** Run `supabase db push` to apply migration 012

### Problem: Can't insert templates
**Cause:** Not an admin user  
**Fix:** Set `role = 'admin'` in profiles table

### Problem: Notifications not sending
**Cause:** Multiple possible (queue stuck, provider error, etc.)  
**Fix:** Check notification_logs for error_message, check queue status

### Problem: Rate limiting too strict
**Cause:** max_count too low  
**Fix:** Update in notification_rate_limits table or adjust defaults

---

## 📚 Related Documentation

- **Database Analysis:** `/docs/NOTIFICATION_SYSTEM_ANALYSIS.md`
- **Implementation Guide:** `/docs/NOTIFICATION_IMPLEMENTATION_GUIDE.md`
- **Migration File:** `/supabase/migrations/012_notification_system_redesign.sql`

---

## ✨ Key Features

✅ Soft deletes (audit trail)  
✅ Template versioning  
✅ Rate limiting  
✅ Quiet hours support  
✅ Multi-channel sending (email, SMS, WhatsApp)  
✅ Async queue processing  
✅ Complete audit logging  
✅ Daily analytics aggregation  
✅ Comprehensive RLS policies  
✅ Retry with exponential backoff  

---

## 📞 Support Resources

1. Check the Analysis document for detailed design rationale
2. Check the Implementation Guide for code examples
3. Review migration 012 for exact schema definitions
4. Check notification_logs.error_message for send errors
5. Review queue status in notification_queue table

**Last Updated:** 24 January 2026
