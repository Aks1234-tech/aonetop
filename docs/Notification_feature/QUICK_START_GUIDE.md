# Notification System - Quick Start Guide

**Status:** Phase 1 Implementation Complete  
**Last Updated:** 24 January 2026

---

## 📋 Prerequisites

Before you begin, make sure you have:
- ✅ Node.js 18+ installed
- ✅ Supabase project set up
- ✅ Gmail account (for email)
- ✅ Twilio account (for SMS/WhatsApp)
- ✅ Database migrations applied (012_notification_system_redesign.sql)

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies

```bash
# Email service
npm install nodemailer

# SMS service
npm install twilio

# You might already have these installed
npm install supabase @supabase/supabase-js
```

### Step 2: Configure Environment Variables

```bash
# Copy the template
cp .env.notifications .env.local

# Edit with your credentials
nano .env.local
```

**Required environment variables:**
```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Step 3: Test Email Service

```typescript
// src/lib/emailService.ts is ready to use
import { emailService } from '@/lib/emailService';

// Test email send
const result = await emailService.send({
  to: 'test@example.com',
  subject: 'Test Email',
  html: '<p>Hello World</p>'
});

console.log(result); // { status: 'sent', messageId: '...' }
```

### Step 4: Test SMS Service

```typescript
// src/lib/smsService.ts is ready to use
import { smsService } from '@/lib/smsService';

// Test SMS send
const result = await smsService.sendSMS('+919876543210', 'Hello from AONet!');

console.log(result); // { status: 'sent', messageId: 'SM...' }
```

### Step 5: Send Your First Notification

```typescript
import { notificationService } from '@/lib/notificationService';

// Send a test notification
const result = await notificationService.send({
  userId: 'user-uuid-here',
  notificationType: 'account_signup',
  channels: ['email', 'sms']
});

console.log(result);
// {
//   notificationId: 'notif_...',
//   overallStatus: 'success',
//   channels: { email: {...}, sms: {...} }
// }
```

---

## 📧 Email Service Usage

### Basic Email

```typescript
import { emailService } from '@/lib/emailService';

await emailService.send({
  to: 'user@example.com',
  subject: 'Welcome to AONet',
  html: '<h1>Welcome!</h1><p>Thank you for signing up.</p>'
});
```

### Email with Template Variables

```typescript
const template = `
  <h1>Hello {{user_name}}!</h1>
  <p>Your order {{order_id}} for ₹{{amount}} is confirmed.</p>
`;

await emailService.sendWithTemplate(
  'user@example.com',
  'Order Confirmation',
  template,
  {
    user_name: 'John Doe',
    order_id: 'ORD-12345',
    amount: 5999
  }
);
```

### Batch Emails

```typescript
const emails = [
  { to: 'user1@example.com', subject: 'Hello User 1', html: '<p>Hi</p>' },
  { to: 'user2@example.com', subject: 'Hello User 2', html: '<p>Hi</p>' },
  { to: 'user3@example.com', subject: 'Hello User 3', html: '<p>Hi</p>' }
];

const results = await emailService.sendBatch(emails);
// Results: [{ status: 'sent' }, { status: 'sent' }, { status: 'failed' }]
```

---

## 📱 SMS Service Usage

### Send SMS

```typescript
import { smsService } from '@/lib/smsService';

// Phone number formats
await smsService.sendSMS('+919876543210', 'Hello from AONet!');
await smsService.sendSMS('+1234567890', 'Your code is 123456');
```

### Send WhatsApp

```typescript
await smsService.sendWhatsApp('+919876543210', 'Hello from WhatsApp!');
```

### Format Phone Numbers

```typescript
// Auto-format phone numbers
const formatted = smsService.formatPhoneNumber('9876543210');
// Returns: '+919876543210'

// Check if formatting needed
if (smsService.needsFormatting(phoneNumber)) {
  const formatted = smsService.formatPhoneNumber(phoneNumber);
}
```

### Batch SMS

```typescript
const messages = [
  { to: '+919876543210', message: 'Message 1', channel: 'sms' },
  { to: '+918765432109', message: 'Message 2', channel: 'sms' },
  { to: '+918765432109', message: 'Message 3', channel: 'whatsapp' }
];

const results = await smsService.sendBatch(messages);
```

---

## 🔔 Notification Service Usage

### Send Multi-Channel Notification

```typescript
import { notificationService } from '@/lib/notificationService';

const result = await notificationService.send({
  userId: 'user-uuid',
  notificationType: 'order_confirmation',
  channels: ['email', 'sms'], // Try email first, then SMS
  subject: 'Order Confirmed',
  metadata: {
    orderId: 'ORD-12345',
    amount: 5999
  }
});

// Result includes status for each channel
// {
//   notificationId: 'notif_...',
//   overallStatus: 'success' | 'partial' | 'failed',
//   channels: {
//     email: { status: 'sent', messageId: '...' },
//     sms: { status: 'sent', messageId: '...' }
//   }
// }
```

### Respects User Preferences

The notification service automatically:
- ✅ Fetches user contact info and preferences
- ✅ Respects notification preferences per type
- ✅ Honors unsubscribe requests
- ✅ Respects quiet hours
- ✅ Validates contact information
- ✅ Logs to database automatically

### Auto-Queuing Based on Quiet Hours

```typescript
// If user has quiet hours set (e.g., 22:00 - 08:00)
// Notifications automatically queue for delivery after quiet hours

const result = await notificationService.send({
  userId: 'user-uuid',
  notificationType: 'promotional', // Low priority
  priority: 0 // Lower priority = more likely to queue
});

// Result: Notification queued if during quiet hours
// notification_queue table will have entry
```

---

## 🎯 React Component Usage

### Manage Notification Preferences

```typescript
import { useNotificationPreferences } from '@/hooks/useNotifications';

function NotificationSettings() {
  const { preferences, toggleChannel, unsubscribe, loading } = 
    useNotificationPreferences();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Notification Settings</h2>
      
      {/* Toggle channels for order confirmation */}
      <label>
        <input
          type="checkbox"
          checked={preferences?.order_confirmation?.includes('email')}
          onChange={() => toggleChannel('order_confirmation', 'email')}
        />
        Email for Order Confirmations
      </label>

      {/* Unsubscribe button */}
      <button onClick={() => unsubscribe('promotional')}>
        Unsubscribe from Promotional Emails
      </button>
    </div>
  );
}
```

### View Notification History

```typescript
import { useNotificationHistory } from '@/hooks/useNotifications';

function NotificationHistory() {
  const { notifications, loading } = useNotificationHistory(20);

  return (
    <div>
      <h2>Notification History</h2>
      {notifications.map((notif) => (
        <div key={notif.id}>
          <p>Type: {notif.notification_type}</p>
          <p>Channel: {notif.channel}</p>
          <p>Status: {notif.status}</p>
          <p>Sent: {new Date(notif.created_at).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🧪 Testing

### Test Email Service

```typescript
// src/lib/__tests__/emailService.test.ts
import { emailService } from '@/lib/emailService';

describe('Email Service', () => {
  it('should send email successfully', async () => {
    const result = await emailService.send({
      to: 'test@example.com',
      subject: 'Test',
      html: '<p>Test</p>'
    });

    expect(result.status).toBe('sent');
    expect(result.messageId).toBeDefined();
  });

  it('should handle invalid email', async () => {
    const result = await emailService.send({
      to: 'invalid-email',
      subject: 'Test',
      html: '<p>Test</p>'
    });

    expect(result.status).toBe('failed');
    expect(result.error).toBeDefined();
  });
});
```

### Test SMS Service

```typescript
// src/lib/__tests__/smsService.test.ts
import { smsService } from '@/lib/smsService';

describe('SMS Service', () => {
  it('should send SMS successfully', async () => {
    const result = await smsService.sendSMS('+919876543210', 'Test');

    expect(['sent', 'queued']).toContain(result.status);
    expect(result.messageId).toBeDefined();
  });

  it('should validate phone numbers', () => {
    expect(smsService.formatPhoneNumber('9876543210')).toBe('+919876543210');
    expect(smsService.needsFormatting('+919876543210')).toBe(false);
  });
});
```

---

## 🐛 Troubleshooting

### Email Service Issues

**Problem:** "Email service credentials not configured"
```bash
# Solution: Check .env.local
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

**Problem:** "Invalid email address"
```
# Solution: Use valid email format
user@example.com ✅
user.name+tag@example.co.uk ✅
invalid ❌
user@example ❌
```

**Problem:** "Gmail login failed"
```
# Solution:
1. Enable 2-Step Verification: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use 16-character password (without spaces)
```

### SMS Service Issues

**Problem:** "Twilio credentials not configured"
```bash
# Solution: Check environment variables
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

**Problem:** "Invalid phone number format"
```
# Solution: Use international format
+919876543210 ✅
+1234567890 ✅
9876543210 (will be auto-formatted)
123456 ❌
```

**Problem:** "Message exceeds 160 characters"
```
# Solution: SMS will be split into multiple messages
# Or use WhatsApp which supports longer messages
```

---

## 📊 Monitoring

### Check Notification Logs

```sql
-- View all notifications for a user
SELECT * FROM notification_logs 
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC;

-- Check delivery rates
SELECT 
  channel,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as delivered
FROM notification_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY channel;

-- Find failed notifications
SELECT * FROM notification_logs 
WHERE status = 'failed'
ORDER BY created_at DESC;
```

### Check Queue Status

```sql
-- View pending notifications
SELECT * FROM notification_queue 
WHERE status = 'pending'
ORDER BY priority DESC, scheduled_at ASC;

-- Count by status
SELECT status, COUNT(*) as count 
FROM notification_queue 
GROUP BY status;
```

---

## 📚 File Structure

```
src/
├── lib/
│   ├── emailService.ts ............... Email service (Gmail)
│   ├── smsService.ts ................ SMS/WhatsApp service
│   ├── notificationService.ts ........ Core orchestration
│   └── supabase.ts .................. Database client
├── hooks/
│   └── useNotifications.ts .......... React hooks
└── components/
    ├── NotificationPreferences.tsx ... Settings component (coming Phase 2)
    └── NotificationHistory.tsx ....... History component (coming Phase 2)

docs/Notification_feature/
├── EXECUTION_PLAN.md ................. Full implementation plan
├── PHASE_1_IMPLEMENTATION_STATUS.md . Current status
├── RLS_POLICIES_DOCUMENTATION.md .... Security policies
└── TASK_1_1_DATABASE_SETUP_GUIDE.md . Database setup
```

---

## 🔄 Next Phase (Phase 2)

Ready for Phase 2 features:
- [ ] Signup notification (automatic on auth.users creation)
- [ ] Password reset notification
- [ ] Profile update notification
- [ ] UI components for preferences
- [ ] Email template management

---

## 📞 Support

For detailed information, refer to:
- [EXECUTION_PLAN.md](EXECUTION_PLAN.md) - Full phase plan
- [DATABASE_SETUP_GUIDE.md](TASK_1_1_DATABASE_SETUP_GUIDE.md) - Database schema
- [RLS_POLICIES.md](RLS_POLICIES_DOCUMENTATION.md) - Security details

---

**Happy notifying! 🎉**
