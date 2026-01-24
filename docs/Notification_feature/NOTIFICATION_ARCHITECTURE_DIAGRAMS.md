# Notification System - Architecture Diagrams

**Date:** 24 January 2026

---

## 1. Database Schema Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    NOTIFICATION SYSTEM TABLES                    │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐
│   notification_logs      │  ◄── AUDIT & HISTORY
├──────────────────────────┤
│ id (UUID) PK             │
│ user_id (FK)             │
│ notification_type        │
│ channel (email/sms/wa)   │
│ recipient                │
│ status                   │
│ subject / body           │
│ metadata (JSONB)         │
│ created_at / sent_at     │
│ deleted_at (soft delete) │
└──────────────────────────┘
          │
          │ References user_id
          ▼
┌──────────────────────────┐
│   user_contact_info      │  ◄── PREFERENCES & CONTACT
├──────────────────────────┤
│ id (UUID) PK             │
│ user_id (FK) UNIQUE      │
│ email                    │
│ phone_number             │
│ whatsapp_number          │
│ email_verified (bool)    │
│ phone_verified (bool)    │
│ notification_preferences │ (JSONB)
│ unsubscribed_from        │ (JSONB array)
│ quiet_hours_start/end    │
│ max_daily_notifications  │
│ unsubscribe_token        │
└──────────────────────────┘

┌──────────────────────────┐
│  notification_queue      │  ◄── ASYNC PROCESSING
├──────────────────────────┤
│ id (UUID) PK             │
│ user_id (FK)             │
│ notification_type        │
│ channels (TEXT array)    │
│ template_id (FK)         │
│ template_variables       │ (JSONB)
│ status (pending/sent)    │
│ priority (0-10)          │
│ scheduled_at             │
│ retry_count / max_retries│
│ next_retry_at            │
│ processing_started_at    │
└──────────────────────────┘
          │
          │ References template_id
          ▼
┌──────────────────────────┐
│ notification_templates   │  ◄── TEMPLATE MANAGEMENT
├──────────────────────────┤
│ id (UUID) PK             │
│ name (VARCHAR UNIQUE)    │
│ notification_type        │
│ channel                  │
│ subject / body           │
│ variables (JSONB array)  │
│ status (active/inactive) │
│ version (INT)            │
│ is_system_template       │
│ created_by / updated_by  │
└──────────────────────────┘
          │
          │ Has history
          ▼
┌──────────────────────────────┐
│ notification_template_history│  ◄── VERSION HISTORY
├──────────────────────────────┤
│ id (UUID) PK                 │
│ template_id (FK)             │
│ version (INT)                │
│ subject / body               │
│ variables                    │
│ changed_by / change_reason   │
│ created_at                   │
└──────────────────────────────┘

┌──────────────────────────┐
│ notification_rate_limits │  ◄── SPAM PREVENTION
├──────────────────────────┤
│ id (UUID) PK             │
│ user_id (FK)             │
│ notification_type        │
│ count_in_period          │
│ max_count / period_hours │
│ period_start             │
│ blocked_until            │
│ UNIQUE(user_id, type)    │
└──────────────────────────┘

┌──────────────────────────┐
│ notification_analytics   │  ◄── METRICS & REPORTING
├──────────────────────────┤
│ id (UUID) PK             │
│ metric_date (DATE)       │
│ notification_type        │
│ channel                  │
│ sent_count               │
│ delivered_count          │
│ failed_count             │
│ bounced_count            │
│ delivery_rate (%)        │
│ bounce_rate (%)          │
│ UNIQUE(date, type, ch)   │
└──────────────────────────┘
```

---

## 2. Data Flow Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                      NOTIFICATION LIFECYCLE                        │
└────────────────────────────────────────────────────────────────────┘

1. EVENT TRIGGERED
   ├─ User signs up
   ├─ Order placed
   ├─ Payment confirmed
   └─ Order shipped
        │
        ▼
2. QUEUE NOTIFICATION
   ├─ Check rate limits
   ├─ Check if unsubscribed
   ├─ Load template
   └─ Insert into notification_queue
        │
        ▼
3. BACKGROUND JOB (Every 5 minutes)
   ├─ Read pending notifications
   ├─ Sort by priority + scheduled_at
   └─ Process batch of 50
        │
        ├─ Check quiet hours
        ├─ Check unsubscribe status
        ├─ Render template with variables
        ├─ Get user contact info
        ├─ For each channel:
        │  ├─ Validate recipient (email/phone)
        │  ├─ Send via provider (SendGrid/Twilio)
        │  ├─ Get response status
        │  ├─ Log in notification_logs
        │  └─ Update retry info
        └─ Update queue status
        │
        ▼
4. PROVIDER WEBHOOKS (Async)
   ├─ Email provider sends delivery status
   ├─ SMS provider sends delivery status
   └─ Update notification_logs status
        │
        ▼
5. DAILY AGGREGATION JOB
   ├─ Query notification_logs from yesterday
   ├─ Group by type + channel
   ├─ Calculate metrics (sent, delivered, failed, etc.)
   ├─ Calculate rates (delivery %, bounce %, etc.)
   └─ Insert into notification_analytics
        │
        ▼
6. USER/ADMIN VIEWS
   ├─ Users view their notification history
   ├─ Users manage preferences
   ├─ Admins view analytics dashboards
   └─ Admins troubleshoot failed notifications
```

---

## 3. RLS Policy Enforcement

```
┌─────────────────────────────────────────────────────────────────┐
│              RLS POLICY ENFORCEMENT MATRIX                      │
├─────────────────────────────────────────────────────────────────┤

TABLE: notification_logs
─────────────────────────────────────────────────────────────────
ACCESS LEVEL         SELECT    INSERT    UPDATE    DELETE
─────────────────────────────────────────────────────────────────
Regular User         Own logs   ❌        ❌        ❌
Admin User           All logs   ❌        ❌        ❌
Service Role         ✅        ✅        ✅        ✅
Anonymous            ❌        ❌        ❌        ❌

TABLE: user_contact_info
─────────────────────────────────────────────────────────────────
ACCESS LEVEL         SELECT     INSERT    UPDATE     DELETE
─────────────────────────────────────────────────────────────────
Regular User         Own info   ❌        Own pref   ❌
Admin User           All info   ❌        ❌         ❌
Service Role         ✅         ✅        ✅         ✅
Anonymous            ❌         ❌        ❌         ❌

TABLE: notification_templates
─────────────────────────────────────────────────────────────────
ACCESS LEVEL         SELECT     INSERT    UPDATE    DELETE
─────────────────────────────────────────────────────────────────
Regular User         Active     ❌        ❌        ❌
Admin User           Active     ✅        ✅        ✅
Service Role         ✅         ✅        ✅        ✅
Anonymous            Active     ❌        ❌        ❌

TABLE: notification_queue
─────────────────────────────────────────────────────────────────
ACCESS LEVEL         SELECT    INSERT    UPDATE    DELETE
─────────────────────────────────────────────────────────────────
Regular User         ❌        ❌        ❌        ❌
Admin User           ❌        ❌        ❌        ❌
Service Role         ✅        ✅        ✅        ✅
Anonymous            ❌        ❌        ❌        ❌

TABLE: notification_rate_limits
─────────────────────────────────────────────────────────────────
ACCESS LEVEL         SELECT     INSERT    UPDATE    DELETE
─────────────────────────────────────────────────────────────────
Regular User         Own limits ❌        ❌        ❌
Admin User           All limits ❌        ❌        ❌
Service Role         ✅         ✅        ✅        ✅
Anonymous            ❌         ❌        ❌        ❌

TABLE: notification_analytics
─────────────────────────────────────────────────────────────────
ACCESS LEVEL         SELECT    INSERT    UPDATE    DELETE
─────────────────────────────────────────────────────────────────
Regular User         ❌        ❌        ❌        ❌
Admin User           ✅        ❌        ❌        ❌
Service Role         ✅        ✅        ✅        ✅
Anonymous            ❌        ❌        ❌        ❌
```

---

## 4. System Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                    SYSTEM ARCHITECTURE                             │
└────────────────────────────────────────────────────────────────────┘

TIER 1: CLIENT LAYER
────────────────────
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   Web Browser    │    │   Mobile App     │    │   Admin Portal   │
├──────────────────┤    ├──────────────────┤    ├──────────────────┤
│ • View own logs  │    │ • View own logs  │    │ • Manage templ.  │
│ • Edit pref.     │    │ • Edit pref.     │    │ • View analytics │
│ • Unsubscribe    │    │ • Unsubscribe    │    │ • Troubleshoot   │
└──────────────────┘    └──────────────────┘    └──────────────────┘
         │                      │                       │
         └──────────────────────┼───────────────────────┘
                                ▼
TIER 2: API LAYER (Supabase REST/RLS)
─────────────────────────────────────
                    ┌─────────────────────┐
                    │  Supabase Auth      │
                    │ (User identification)│
                    └─────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  RLS Policies     │
                    │ (Authorization)   │
                    └─────────┬─────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
    ┌────▼────┐         ┌─────▼────┐        ┌────▼────┐
    │ SELECT  │         │ INSERT   │        │ UPDATE  │
    │ Queries │         │ Allowed  │        │ Allowed │
    │ (Read)  │         │ (Write)  │        │(Update) │
    └────┬────┘         └─────┬────┘        └────┬────┘
         │                    │                   │
         └────────────────────┼───────────────────┘
                              ▼
TIER 3: DATABASE LAYER
──────────────────────
┌──────────────────────────────────────────────────────────────┐
│          PostgreSQL (Supabase)                               │
├──────────────────────────────────────────────────────────────┤
│ • notification_logs                                          │
│ • user_contact_info                                          │
│ • notification_queue                                         │
│ • notification_templates                                     │
│ • notification_template_history                              │
│ • notification_rate_limits                                   │
│ • notification_analytics                                     │
└──────────────────────────────────────────────────────────────┘

TIER 4: BACKEND SERVICE
──────────────────────
┌────────────────────────────────────────────────────────────────┐
│  Node.js / Python Backend (SERVICE_ROLE_KEY)                   │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Event Handlers                                           │  │
│  │ ├─ onUserSignup → queueNotification()                   │  │
│  │ ├─ onOrderCreated → queueNotification()                 │  │
│  │ ├─ onPaymentConfirmed → queueNotification()             │  │
│  │ └─ onOrderShipped → queueNotification()                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                     │
│  ┌────────────────────────▼──────────────────────────────────┐  │
│  │ Cron Jobs (Scheduled Tasks)                              │  │
│  │ ├─ Every 5 min: processNotificationQueue()               │  │
│  │ ├─ Every 1 hour: retryFailedNotifications()              │  │
│  │ ├─ Daily @23:00: aggregateNotificationAnalytics()        │  │
│  │ └─ Daily @22:00: checkBlockedUsers()                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                     │
│  ┌────────────────────────▼──────────────────────────────────┐  │
│  │ Core Functions                                           │  │
│  │ ├─ queueNotification()                                   │  │
│  │ ├─ processNotification()                                 │  │
│  │ ├─ checkRateLimit()                                      │  │
│  │ ├─ renderTemplate()                                      │  │
│  │ └─ sendViaChannel()                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
TIER 5: EXTERNAL SERVICES
─────────────────────────
┌────────────────┐    ┌────────────────┐    ┌────────────────┐
│  SendGrid      │    │  Twilio SMS    │    │  Twilio WhatsApp
│ (Email)        │    │  (SMS)         │    │  (WhatsApp)    │
├────────────────┤    ├────────────────┤    ├────────────────┤
│ • Send email   │    │ • Send SMS     │    │ • Send messages│
│ • Track opens  │    │ • Track delivery│    │ • Track delivery
│ • Webhooks     │    │ • Webhooks     │    │ • Webhooks     │
└────────────────┘    └────────────────┘    └────────────────┘
```

---

## 5. Sequence Diagram - Order Confirmation Flow

```
User          Frontend         Backend           Supabase       SendGrid
 │               │                │                 │               │
 │─ Places ─────►│                │                 │               │
 │  order        │─ POST order ──►│                 │               │
 │               │                │                 │               │
 │               │◄─ order created│                 │               │
 │◄──────────────│                │                 │               │
 │               │                │ Check rate ────►│               │
 │               │                │ limits           │               │
 │               │                │◄─ OK            │               │
 │               │                │                 │               │
 │               │                │ Load template ─►│               │
 │               │                │                 │               │
 │               │                │ Queue notif ───►│               │
 │               │                │                 │               │
 │               │                │ [5 min later]   │               │
 │               │                │ Get pending ───►│               │
 │               │                │                 │               │
 │               │                │ Get user info ─►│               │
 │               │                │                 │               │
 │               │                │ Check prefs ────│ OK            │
 │               │                │                 │               │
 │               │                │ Render template │               │
 │               │                │                 │               │
 │               │                │ Send email ────────────────────►│
 │               │                │                 │               │
 │               │                │◄──── msg sent──────────────────│
 │               │                │                 │               │
 │               │                │ Log delivery ──►│               │
 │               │                │                 │               │
 │── Receives ──────────────────────────────────────► [Gmail]       │
 │  email        │                │                 │               │
 │               │                │                 │◄──[webhook]───│
 │               │                │ [SendGrid webhook]              │
 │               │                │                 │               │
 │               │                │ Update status ─►│               │
 │               │                │                 │               │
 │               │                │ Update queue ──►│               │
 │               │                │                 │               │

Timeline:
T=0:000   Order placed in system
T=0:001   queueNotification() called
T=0:002   Notification queued in notification_queue
T=5:000   Background job runs
T=5:001   Notification sent to SendGrid
T=5:100   SendGrid returns success
T=5:101   notification_logs created with status='sent'
T=5:102   notification_queue updated with status='completed'
T=15:000  Email delivered to user inbox
T=15:001  SendGrid webhook received
T=15:002  notification_logs updated with status='delivered'
T=86400   Daily aggregation job runs (next day)
T=86401   Metrics inserted into notification_analytics
```

---

## 6. Performance Index Strategy

```
┌────────────────────────────────────────────────────────────────┐
│              INDEX OPTIMIZATION STRATEGY                       │
└────────────────────────────────────────────────────────────────┘

QUERY PATTERN 1: Get user's notification history
───────────────────────────────────────────────────
SELECT * FROM notification_logs WHERE user_id = ? ORDER BY created_at DESC

┌─────────────────────────────────────────────┐
│ Index: idx_notification_logs_user_id        │
├─────────────────────────────────────────────┤
│ Columns: (user_id)                          │
│ Condition: WHERE deleted_at IS NULL         │
│ Speed: ~1ms for 10K records                 │
└─────────────────────────────────────────────┘

QUERY PATTERN 2: Get failed notifications for retry
──────────────────────────────────────────────────
SELECT * FROM notification_logs
WHERE status IN ('failed', 'pending')
  AND retry_count < max_retries
  AND last_retry_at < NOW()

┌─────────────────────────────────────────────┐
│ Index: idx_notification_logs_failed_retry   │
├─────────────────────────────────────────────┤
│ Columns: (id, last_retry_at)                │
│ Condition: WHERE status IN (...)            │
│ Speed: ~2ms for B-tree traversal            │
└─────────────────────────────────────────────┘

QUERY PATTERN 3: Dequeue next batch to process
──────────────────────────────────────────────
SELECT * FROM notification_queue
WHERE status = 'pending'
  AND scheduled_at <= NOW()
ORDER BY priority DESC, scheduled_at ASC
LIMIT 50

┌──────────────────────────────────────────────────────┐
│ Index: idx_notification_queue_status_priority        │
├──────────────────────────────────────────────────────┤
│ Columns: (status, priority DESC, scheduled_at ASC)   │
│ Condition: WHERE status = 'pending'                  │
│ Speed: ~1ms - optimal for queue processing            │
└──────────────────────────────────────────────────────┘

QUERY PATTERN 4: Get today's analytics
──────────────────────────────────────
SELECT * FROM notification_analytics
WHERE metric_date >= '2026-01-24'
ORDER BY metric_date DESC

┌──────────────────────────────────────────┐
│ Index: idx_notification_analytics_date   │
├──────────────────────────────────────────┤
│ Columns: (metric_date DESC)              │
│ Speed: ~2ms even with 1M records          │
└──────────────────────────────────────────┘

INDEX SUMMARY:
──────────────
Total indexes: 35+
Covering indexes (all data in index): 8
Partial indexes (WHERE condition): 12
Multi-column indexes: 15
Cardinality: Medium-High (good for filtering)
Est. index size: ~50MB
Est. data size: ~200MB/month
```

---

## 7. Error Handling Flow

```
┌──────────────────────────────────────────────────────────────┐
│                  ERROR HANDLING FLOW                         │
└──────────────────────────────────────────────────────────────┘

SENDING EMAIL FAILS
───────────────────
Process Notification
   │
   ├─ Try to send email
   │   │
   │   └─ ERROR: Invalid email address
   │
   ├─ Catch error
   │
   ├─ Log in notification_logs:
   │   • status: 'failed'
   │   • error_message: 'Invalid email address format'
   │
   ├─ Update notification_queue:
   │   • status: 'failed'
   │   • retry_count: 1
   │   • next_retry_at: NOW() + 2 minutes (exponential backoff)
   │
   └─ Continue processing next notification

SUBSEQUENT RETRY ATTEMPT (2 minutes later)
──────────────────────────────────────────
Next queue run
   │
   ├─ Find notifications WHERE:
   │   • status = 'failed' OR status = 'pending'
   │   • retry_count < max_retries (3)
   │   • next_retry_at <= NOW()
   │
   ├─ Try to send again
   │
   ├─ If still fails:
   │   • Log error message
   │   • Increment retry_count: 2
   │   • Set next_retry_at: NOW() + 4 minutes
   │
   ├─ Try again at T+4 min:
   │   • retry_count: 3
   │   • Set next_retry_at: NOW() + 8 minutes
   │
   └─ Try again at T+8 min:
       • retry_count: 3 (max reached)
       • No more retries
       • Set status: 'failed'
       • Clear next_retry_at
       • Manual intervention needed

ADMIN INTERVENTION
──────────────────
View failed notifications:
   SELECT * FROM notification_logs
   WHERE status = 'failed'
   AND deleted_at IS NULL

Options:
1. Fix data (e.g., correct email address)
2. Manually resend
3. Mark as delivered
4. Delete permanently (soft delete)

ERROR TYPES & RECOVERY
──────────────────────
┌──────────────────────────┬──────────────────┬────────────────────┐
│ Error Type               │ Cause            │ Recovery Strategy  │
├──────────────────────────┼──────────────────┼────────────────────┤
│ Invalid Email            │ Bad data         │ Fix data, retry    │
│ Provider Rate Limited    │ Too many/sec     │ Exponential backoff│
│ Network Timeout          │ Transient        │ Retry with backoff │
│ Template Not Found       │ Deployment issue │ Fix template, retry│
│ User Unsubscribed        │ User action      │ Don't retry, skip  │
│ Quiet Hours              │ User settings    │ Defer to later     │
│ Rate Limit Exceeded      │ Too many/day     │ Don't retry, skip  │
└──────────────────────────┴──────────────────┴────────────────────┘

FINAL FALLBACK
──────────────
If notification cannot be sent after all retries:
1. Mark as failed permanently
2. Log detailed error for debugging
3. Send alert to admin team
4. Offer manual resolution in dashboard
5. Keep audit trail forever for compliance
```

---

This visual documentation provides quick reference for understanding the notification system architecture, data flows, and design decisions.
