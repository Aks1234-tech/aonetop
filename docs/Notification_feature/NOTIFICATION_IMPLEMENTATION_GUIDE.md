# Notification System - Implementation Guide for Backend

**Version:** 2.0  
**Date:** 24 January 2026  
**Based on:** Migration `012_notification_system_redesign.sql`

---

## Table of Contents

1. [Overview](#overview)
2. [Database Access Patterns](#database-access-patterns)
3. [Notification Types & Channels](#notification-types--channels)
4. [Core Operations](#core-operations)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Code Examples](#code-examples)
8. [Monitoring & Analytics](#monitoring--analytics)

---

## Overview

The notification system has three distinct layers:

```
┌──────────────────────────────────────────────────────┐
│           Frontend/Client Applications                │
│   (Cannot directly access notification tables)        │
└──────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────┐
│          Backend Service (Node.js/Python)             │
│  ✓ Queue notifications                               │
│  ✓ Process notifications                             │
│  ✓ Send via email/SMS/WhatsApp providers             │
│  ✓ Track delivery status                             │
│  ✓ Manage templates                                  │
│  ✓ Calculate rate limits                             │
│  ✓ Aggregate analytics                               │
└──────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────┐
│        Supabase PostgreSQL Database                   │
│  Tables managed with service_role key                │
│  (RLS policies enforced transparently)               │
└──────────────────────────────────────────────────────┘
```

---

## Database Access Patterns

### Using service_role Key

All backend operations use the service_role key to bypass RLS:

```javascript
// Node.js Example
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // ← Use service role, not anon key
);

// Now you can access all tables without RLS restrictions
const { data, error } = await supabaseAdmin
  .from('notification_queue')
  .select('*')
  .eq('status', 'pending');
```

```python
# Python Example
from supabase import create_client, Client

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")  # ← Use service role
supabase: Client = create_client(url, key)

# Access protected tables
response = supabase.table("notification_queue").select("*").eq("status", "pending").execute()
```

### Important Security Notes

⚠️ **NEVER expose SERVICE_ROLE_KEY to clients**
- Keep it secret on backend servers only
- Store in environment variables
- Rotate regularly
- Use different keys for different environments

✅ **Client access patterns:**
- Users query their own notifications: `notification_logs` with SELECT
- Users update their preferences: `user_contact_info` with UPDATE
- Users read active templates: `notification_templates` with SELECT (status='active')

---

## Notification Types & Channels

### Supported Notification Types

| Type | Channels | Trigger | Required Data |
|------|----------|---------|---|
| `account_signup` | email | User registration | user_name, activation_link |
| `password_reset` | email, sms | Forgot password | reset_link, expiry_time |
| `profile_update` | email | Profile changed | updated_fields |
| `cart_addition` | email | Item added to cart | product_name, cart_url |
| `cart_reminder` | email | Abandoned cart (24h) | item_count, cart_total, checkout_link |
| `order_confirmation` | email, sms | Order placed | order_id, total, delivery_date |
| `payment_confirmation` | email, sms, whatsapp | Payment received | order_id, amount, transaction_id |
| `order_tracking` | email, sms | Order shipped | order_id, tracking_number, tracking_link |
| `order_delivered` | email, sms | Order delivered | order_id, review_link |
| `refund_confirmation` | email | Refund processed | order_id, refund_amount |
| `promotional` | email | Marketing campaign | promo_code, offer_details |
| `error_notification` | email | System error | error_details, support_link |

### Supported Channels

1. **Email**
   - Provider: SendGrid, AWS SES, or similar
   - Speed: 1-5 seconds
   - Delivery: 95%+ reliability
   - Cost: $0.10-0.30 per 10k emails

2. **SMS**
   - Provider: Twilio, AWS SNS, or similar
   - Speed: <1 second
   - Delivery: 98%+ reliability
   - Cost: $0.01-0.05 per message (India-specific pricing)

3. **WhatsApp**
   - Provider: Twilio, Meta Business API
   - Speed: 1-3 seconds
   - Delivery: 99%+ reliability
   - Cost: $0.002-0.025 per message

---

## Core Operations

### 1. Queue a Notification

```javascript
// Queue a notification for background processing
async function queueNotification(supabase, {
  userId,
  notificationType,    // 'order_confirmation'
  channels,            // ['email', 'sms']
  templateVariables,   // { order_id, total, delivery_date }
  priority = 5,        // 0-10, higher = process first
  scheduledFor = null  // ISO string or null for immediate
}) {
  try {
    // 1. Get notification template
    const { data: template, error: templateError } = await supabase
      .from('notification_templates')
      .select('*')
      .eq('notification_type', notificationType)
      .eq('status', 'active')
      .single();
    
    if (templateError) throw new Error(`Template not found: ${notificationType}`);

    // 2. Check rate limits
    const isRateLimited = await checkRateLimit(supabase, userId, notificationType);
    if (isRateLimited) {
      console.warn(`Rate limit exceeded for user ${userId}, notification ${notificationType}`);
      return { success: false, reason: 'rate_limited' };
    }

    // 3. Queue the notification
    const { data: queued, error: queueError } = await supabase
      .from('notification_queue')
      .insert({
        user_id: userId,
        notification_type: notificationType,
        channels: channels,
        template_id: template.id,
        template_variables: templateVariables,
        status: 'pending',
        priority: priority,
        scheduled_at: scheduledFor || new Date().toISOString()
      })
      .select()
      .single();

    if (queueError) throw queueError;

    console.log(`Queued notification ${queued.id} for user ${userId}`);
    return { success: true, notificationId: queued.id };

  } catch (error) {
    console.error('Error queuing notification:', error);
    throw error;
  }
}

// Usage
await queueNotification(supabaseAdmin, {
  userId: user.id,
  notificationType: 'order_confirmation',
  channels: ['email', 'sms'],
  templateVariables: {
    order_id: order.id,
    total: order.total,
    delivery_date: order.estimated_delivery
  },
  priority: 8  // High priority
});
```

### 2. Process Queue (Background Job)

```javascript
// Run this as a scheduled job (e.g., every 5 minutes)
async function processNotificationQueue(supabase) {
  const BATCH_SIZE = 50;
  const MAX_RETRIES = 3;

  try {
    // 1. Get pending notifications, ordered by priority
    const { data: notifications, error } = await supabase
      .from('notification_queue')
      .select(`
        *,
        notification_templates(*),
        profiles:user_id(*)
      `)
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString())
      .order('priority', { ascending: false })
      .order('scheduled_at', { ascending: true })
      .limit(BATCH_SIZE);

    if (error) throw error;

    console.log(`Processing ${notifications.length} pending notifications`);

    // 2. Process each notification
    for (const notification of notifications) {
      await processNotification(supabase, notification);
    }

  } catch (error) {
    console.error('Error processing notification queue:', error);
    // Don't throw - queue processor should be resilient
  }
}

async function processNotification(supabase, notification) {
  const { id, user_id, notification_type, channels, template_id, template_variables } = notification;

  try {
    // 1. Mark as processing
    await supabase
      .from('notification_queue')
      .update({ 
        status: 'processing',
        processing_started_at: new Date().toISOString()
      })
      .eq('id', id);

    // 2. Get template and render
    const template = notification.notification_templates;
    const rendered = renderTemplate(template, template_variables);

    // 3. Get user contact info
    const { data: contactInfo } = await supabase
      .from('user_contact_info')
      .select('*')
      .eq('user_id', user_id)
      .single();

    // 4. Check if user can receive notifications
    if (isInQuietHours(contactInfo) || isUnsubscribed(contactInfo, notification_type)) {
      await supabase
        .from('notification_queue')
        .update({ 
          status: 'cancelled',
          error_message: 'User in quiet hours or unsubscribed'
        })
        .eq('id', id);
      return;
    }

    // 5. Send via each channel
    const results = await Promise.all(
      channels.map(channel => sendViaChannel(channel, contactInfo, rendered))
    );

    // 6. Create notification log entries
    for (let i = 0; i < channels.length; i++) {
      const channel = channels[i];
      const result = results[i];

      await supabase
        .from('notification_logs')
        .insert({
          user_id,
          notification_type,
          channel,
          recipient: result.recipient,
          status: result.success ? 'sent' : 'failed',
          error_message: result.error,
          metadata: template_variables,
          sent_at: result.success ? new Date().toISOString() : null
        });
    }

    // 7. Mark queue entry as completed
    const allSucceeded = results.every(r => r.success);
    await supabase
      .from('notification_queue')
      .update({ 
        status: allSucceeded ? 'completed' : 'failed',
        sent_at: new Date().toISOString(),
        execution_time_ms: Date.now() - new Date(notification.created_at).getTime()
      })
      .eq('id', id);

  } catch (error) {
    console.error(`Error processing notification ${id}:`, error);

    // Retry logic
    const nextRetryAt = new Date();
    nextRetryAt.setMinutes(nextRetryAt.getMinutes() + Math.pow(2, notification.retry_count)); // Exponential backoff

    await supabase
      .from('notification_queue')
      .update({
        status: notification.retry_count < MAX_RETRIES ? 'failed' : 'failed',
        error_message: error.message,
        retry_count: notification.retry_count + 1,
        next_retry_at: notification.retry_count < MAX_RETRIES ? nextRetryAt.toISOString() : null
      })
      .eq('id', notification.id);
  }
}

async function sendViaChannel(channel, contactInfo, rendered) {
  try {
    switch (channel) {
      case 'email':
        return await sendEmail(contactInfo.email, rendered);
      case 'sms':
        return await sendSMS(contactInfo.phone_number, rendered.body);
      case 'whatsapp':
        return await sendWhatsApp(contactInfo.whatsapp_number, rendered.body);
      default:
        throw new Error(`Unknown channel: ${channel}`);
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      recipient: contactInfo[getContactField(channel)]
    };
  }
}

function renderTemplate(template, variables) {
  let body = template.body;
  let subject = template.subject;

  // Replace variables: {{user_name}} -> value
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    body = body.replace(placeholder, String(value));
    if (subject) subject = subject.replace(placeholder, String(value));
  }

  return { body, subject };
}

function isInQuietHours(contactInfo) {
  if (!contactInfo.quiet_hours_start || !contactInfo.quiet_hours_end) {
    return false;
  }

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const [startHour, startMin] = contactInfo.quiet_hours_start.split(':').map(Number);
  const [endHour, endMin] = contactInfo.quiet_hours_end.split(':').map(Number);
  const startTime = startHour * 60 + startMin;
  const endTime = endHour * 60 + endMin;

  if (startTime <= endTime) {
    return currentTime >= startTime && currentTime < endTime;
  } else {
    return currentTime >= startTime || currentTime < endTime;
  }
}

function isUnsubscribed(contactInfo, notificationType) {
  const unsubscribed = contactInfo.unsubscribed_from || [];
  return unsubscribed.includes(notificationType) || unsubscribed.includes('all');
}
```

### 3. Update Notification Status (Webhooks)

When email/SMS providers send delivery confirmations:

```javascript
// Handle SendGrid webhook event
async function handleSendGridWebhook(supabase, event) {
  const { email, status, timestamp } = event;

  // Map SendGrid statuses to our status values
  const statusMap = {
    'processed': 'sent',
    'delivered': 'sent',
    'bounce': 'bounced',
    'dropped': 'failed'
  };

  const ourStatus = statusMap[status] || 'sent';

  // Update notification log
  await supabase
    .from('notification_logs')
    .update({
      status: ourStatus,
      updated_at: new Date(timestamp * 1000).toISOString()
    })
    .eq('recipient', email)
    .eq('status', 'sent');  // Only update if currently marked as sent
}
```

---

## Error Handling

### Retry Strategy

```javascript
// Exponential backoff with max retries
const RETRY_CONFIG = {
  max_retries: 3,
  base_delay_ms: 60000,  // 1 minute
  max_delay_ms: 3600000  // 1 hour
};

function calculateNextRetryTime(retryCount) {
  const delay = Math.min(
    RETRY_CONFIG.base_delay_ms * Math.pow(2, retryCount),
    RETRY_CONFIG.max_delay_ms
  );
  return new Date(Date.now() + delay);
}
```

### Error Logging

All errors logged in `notification_logs.error_message`:

```javascript
const ERROR_MESSAGES = {
  INVALID_EMAIL: 'Invalid email address format',
  INVALID_PHONE: 'Invalid phone number format',
  TEMPLATE_NOT_FOUND: 'Notification template not found',
  RATE_LIMITED: 'User rate limit exceeded',
  SEND_FAILED: 'Failed to send via provider',
  UNSUBSCRIBED: 'User has unsubscribed from this notification type',
  QUIET_HOURS: 'Notification blocked during quiet hours'
};
```

---

## Rate Limiting

### Check Rate Limit

```javascript
async function checkRateLimit(supabase, userId, notificationType) {
  // 1. Get current rate limit record
  const { data: rateLimit } = await supabase
    .from('notification_rate_limits')
    .select('*')
    .eq('user_id', userId)
    .eq('notification_type', notificationType)
    .single();

  if (!rateLimit) {
    // Create new rate limit record
    await supabase
      .from('notification_rate_limits')
      .insert({
        user_id: userId,
        notification_type: notificationType,
        count_in_period: 1,
        period_start: new Date().toISOString(),
        max_count: 10,  // Default, can be customized per type
        period_hours: 24
      });
    return false;  // Not rate limited
  }

  // 2. Check if hard-blocked
  if (rateLimit.blocked_until && new Date(rateLimit.blocked_until) > new Date()) {
    return true;  // User is blocked
  }

  // 3. Check if period has expired
  const periodEndTime = new Date(rateLimit.period_start);
  periodEndTime.setHours(periodEndTime.getHours() + rateLimit.period_hours);

  if (new Date() > periodEndTime) {
    // Period expired, reset counter
    await supabase
      .from('notification_rate_limits')
      .update({
        count_in_period: 1,
        period_start: new Date().toISOString()
      })
      .eq('id', rateLimit.id);
    return false;  // Not rate limited
  }

  // 4. Check if count exceeded
  if (rateLimit.count_in_period >= rateLimit.max_count) {
    return true;  // Rate limited
  }

  // 5. Increment counter
  await supabase
    .from('notification_rate_limits')
    .update({
      count_in_period: rateLimit.count_in_period + 1,
      last_notification_at: new Date().toISOString()
    })
    .eq('id', rateLimit.id);

  return false;  // Not rate limited
}
```

---

## Code Examples

### Complete Example: Order Confirmation

```javascript
// 1. When order is created
async function createOrder(supabase, orderData) {
  // ... create order in database ...

  // Queue notifications
  await queueNotification(supabase, {
    userId: orderData.userId,
    notificationType: 'order_confirmation',
    channels: ['email', 'sms'],
    templateVariables: {
      order_id: orderData.id,
      total: orderData.total,
      delivery_date: calculateDeliveryDate(orderData.createdAt),
      order_link: `https://aonet.com/orders/${orderData.id}`
    },
    priority: 9  // High priority
  });
}

// 2. When payment is confirmed
async function confirmPayment(supabase, orderId, paymentData) {
  const order = await getOrder(supabase, orderId);

  await queueNotification(supabase, {
    userId: order.userId,
    notificationType: 'payment_confirmation',
    channels: ['email', 'sms', 'whatsapp'],
    templateVariables: {
      order_id: order.id,
      amount: order.total,
      transaction_id: paymentData.transactionId
    },
    priority: 10  // Highest priority
  });
}

// 3. Background job processes queue every 5 minutes
// Schedule with node-cron or equivalent
cron.schedule('*/5 * * * *', async () => {
  await processNotificationQueue(supabaseAdmin);
});

// 4. Analytics aggregation (daily, at end of day)
async function aggregateNotificationAnalytics(supabase) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split('T')[0];

  // Query notification_logs for yesterday
  const { data: logs } = await supabase
    .from('notification_logs')
    .select('notification_type, channel, status')
    .gte('created_at', `${dateStr}T00:00:00`)
    .lt('created_at', `${dateStr}T23:59:59`);

  // Group and aggregate
  const metrics = {};
  for (const log of logs) {
    const key = `${log.notification_type}::${log.channel}`;
    if (!metrics[key]) {
      metrics[key] = {
        sent_count: 0,
        delivered_count: 0,
        failed_count: 0,
        bounced_count: 0
      };
    }
    
    if (log.status === 'sent' || log.status === 'clicked') {
      metrics[key].delivered_count++;
    } else if (log.status === 'failed') {
      metrics[key].failed_count++;
    } else if (log.status === 'bounced') {
      metrics[key].bounced_count++;
    }
    metrics[key].sent_count++;
  }

  // Insert into notification_analytics
  for (const [key, data] of Object.entries(metrics)) {
    const [notificationType, channel] = key.split('::');
    await supabase
      .from('notification_analytics')
      .insert({
        metric_date: dateStr,
        notification_type: notificationType,
        channel: channel,
        sent_count: data.sent_count,
        delivered_count: data.delivered_count,
        failed_count: data.failed_count,
        bounced_count: data.bounced_count,
        delivery_rate: (data.delivered_count / data.sent_count * 100).toFixed(2),
        bounce_rate: (data.bounced_count / data.sent_count * 100).toFixed(2)
      });
  }
}
```

---

## Monitoring & Analytics

### Key Metrics to Track

```javascript
// Delivery Rate (Dashboard metric)
async function getDeliveryRate(supabase, notificationType, channel, days = 7) {
  const { data } = await supabase
    .from('notification_analytics')
    .select('sent_count, delivered_count')
    .eq('notification_type', notificationType)
    .eq('channel', channel)
    .gte('metric_date', getDateNDaysAgo(days));

  const totalSent = data.reduce((sum, m) => sum + m.sent_count, 0);
  const totalDelivered = data.reduce((sum, m) => sum + m.delivered_count, 0);
  
  return (totalDelivered / totalSent * 100).toFixed(2);
}

// Queue Health Check
async function getQueueHealth(supabase) {
  const { data } = await supabase
    .from('notification_queue')
    .select('status')
    .in('status', ['pending', 'failed', 'processing']);

  return {
    pending: data.filter(n => n.status === 'pending').length,
    failed: data.filter(n => n.status === 'failed').length,
    processing: data.filter(n => n.status === 'processing').length
  };
}

// User Unsubscribe Rate
async function getUnsubscribeRate(supabase, notificationType) {
  const { data } = await supabase
    .from('user_contact_info')
    .select('unsubscribed_from');

  const unsubscribed = data.filter(u => 
    u.unsubscribed_from.includes(notificationType)
  ).length;

  return (unsubscribed / data.length * 100).toFixed(2);
}
```

---

## Summary

This backend implementation ensures:
- ✅ Reliable notification delivery with retries
- ✅ Respects user preferences (quiet hours, unsubscribe)
- ✅ Rate limiting to prevent spam
- ✅ Complete audit trail
- ✅ Easy monitoring and analytics
- ✅ Secure (service_role key only on backend)

For questions or issues, refer back to the Database Analysis document.
