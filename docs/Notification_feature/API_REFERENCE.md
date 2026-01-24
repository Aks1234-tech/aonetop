# Notification System API Reference

**Phase 2 Complete** | Email-Only Mode | SMS/WhatsApp Ready to Enable

---

## 📬 Available Notification Handlers

### 1. Signup Welcome Email
```typescript
import { sendSignupWelcomeEmail } from '@/lib/signupNotification';

await sendSignupWelcomeEmail({
  userId: string;
  email: string;
  fullName: string;
  phone?: string;
});
```

**Response:** `Promise<void>`  
**Throws:** Error if email fails  
**When to use:** After user creates account  
**Template:** Professional welcome with CTA

---

### 2. Password Reset Email
```typescript
import { sendPasswordResetEmail } from '@/lib/passwordResetNotification';

await sendPasswordResetEmail({
  userId: string;
  email: string;
  fullName: string;
  resetToken: string;
  resetLink: string;
  expiresInMinutes?: number; // Default: 30
});
```

**Response:** `Promise<void>`  
**Throws:** Error if email fails  
**When to use:** When user requests password reset  
**Security:** Token expires in 30 minutes  
**Template:** Reset link with security warnings

---

### 3. Profile Update Email
```typescript
import { sendProfileUpdateNotification } from '@/lib/profileUpdateNotification';

await sendProfileUpdateNotification({
  userId: string;
  email: string;
  fullName: string;
  changedFields: Array<{
    field: string;
    oldValue?: string;
    newValue: string;
  }>;
  ipAddress?: string;
  userAgent?: string;
  timestamp?: Date;
});
```

**Response:** `Promise<void>`  
**Throws:** Error if email fails  
**When to use:** After user updates profile/settings  
**Logs:** IP address and timestamp  
**Template:** Change summary with security alert

---

## 🔧 Core Notification Service

### Send Generic Notification
```typescript
import { notificationService } from '@/lib/notificationService';

const result = await notificationService.send({
  userId: string;
  notificationType: NotificationType;
  channels?: NotificationChannel[]; // ['email'] by default
  recipient?: { email?: string; phone?: string };
  subject?: string;
  templateId?: string;
  templateVariables?: Record<string, string | number | boolean>;
  metadata?: Record<string, any>;
  priority?: number; // 0-10, higher = more urgent
});
```

**Returns:**
```typescript
{
  notificationId: string;
  userId: string;
  type: NotificationType;
  channels: {
    email?: { status: 'sent' | 'failed' | 'queued'; messageId?: string; error?: string; sentAt?: string };
    sms?: { status: 'sent' | 'failed' | 'queued'; messageId?: string };
    whatsapp?: { status: 'sent' | 'failed' | 'queued'; messageId?: string };
  };
  overallStatus: 'success' | 'partial' | 'failed';
}
```

---

## 📧 Email Service

### Send Simple Email
```typescript
import { emailService } from '@/lib/emailService';

const result = await emailService.send({
  to: string;
  subject: string;
  html: string;
});
```

**Returns:** `{ status: 'sent' | 'failed'; messageId?: string; error?: string }`

---

### Send Email with Template Variables
```typescript
const result = await emailService.sendWithTemplate(
  to: string,
  subject: string,
  template: string,
  variables: Record<string, string | number | boolean>
);
```

**Returns:** `{ status: 'sent' | 'failed'; messageId?: string; error?: string }`

---

### Send Batch Emails
```typescript
const results = await emailService.sendBatch([
  { to: 'user1@example.com', subject: 'Hello', html: '<p>Hi</p>' },
  { to: 'user2@example.com', subject: 'Hello', html: '<p>Hi</p>' },
]);
```

**Returns:** `Array<{ status: 'sent' | 'failed'; messageId?: string; error?: string }>`

---

## 💬 SMS Service (DISABLED - Ready to Enable)

**Note:** SMS methods exist but are disabled in notificationService.ts  
To enable: Uncomment lines in notificationService.ts

### Send SMS
```typescript
import { smsService } from '@/lib/smsService';

const result = await smsService.sendSMS(
  to: string,
  message: string
);
```

**Returns:** `{ status: 'sent' | 'queued' | 'failed'; messageId?: string; error?: string }`

---

### Send WhatsApp
```typescript
const result = await smsService.sendWhatsApp(
  to: string,
  message: string
);
```

**Returns:** `{ status: 'sent' | 'queued' | 'failed'; messageId?: string; error?: string }`

---

### Format Phone Number
```typescript
const formatted = smsService.formatPhoneNumber('9876543210');
// Returns: '+919876543210'
```

---

## 🎯 Notification Types

```typescript
type NotificationType =
  | 'account_signup'          // ✅ Implemented
  | 'password_reset'          // ✅ Implemented
  | 'profile_update'          // ✅ Implemented
  | 'cart_addition'           // Coming Phase 3
  | 'cart_reminder'           // Coming Phase 3
  | 'order_confirmation'      // Coming Phase 3
  | 'payment_confirmation'    // Coming Phase 4
  | 'order_tracking'          // Coming Phase 3
  | 'order_delivered'         // Coming Phase 3
  | 'refund_confirmation'     // Coming Phase 4
  | 'promotional'             // Coming Phase 5
  | 'error_notification';     // Coming Phase 5
```

---

## 📞 Notification Channels

```typescript
type NotificationChannel = 'email' | 'sms' | 'whatsapp';
```

**Current Status:**
- ✅ Email - ACTIVE
- 🔴 SMS - DISABLED (uncomment to enable)
- 🔴 WhatsApp - DISABLED (uncomment to enable)

---

## 🎨 Email Templates Available

### 1. Signup Welcome
**File:** `signupNotification.ts`  
**Variables:** `user_name`, `signup_date`, `account_url`

```html
<h1>Welcome to AONet! 🎉</h1>
<p>Hello {{user_name}},</p>
<!-- Features list with CTAs -->
<!-- Complete profile prompt -->
```

### 2. Password Reset
**File:** `passwordResetNotification.ts`  
**Variables:** `user_name`, `reset_link`, `expires_in_minutes`, `reset_token`

```html
<h1>Password Reset Request</h1>
<p>Hello {{user_name}},</p>
<!-- Reset button with {{reset_link}} -->
<!-- Security warnings -->
<!-- Alternative copy/paste link -->
```

### 3. Profile Update
**File:** `profileUpdateNotification.ts`  
**Variables:** `user_name`, `changed_fields`, `timestamp`, `ip_address`

```html
<h1>Profile Update Confirmation</h1>
<p>Hello {{user_name}},</p>
<!-- List of {{changed_fields}} -->
<!-- IP address and timestamp -->
<!-- Security alert for unauthorized changes -->
```

---

## 🔐 User Preferences

Users can control notifications via:
```typescript
notification_preferences: {
  "account_signup": ["email"],
  "password_reset": ["email"],
  "profile_update": ["email"],
  // ... more types
}
```

Stored in database: `user_contact_info.notification_preferences` (JSONB)

---

## ⚙️ Configuration

### Environment Variables
```
# Gmail (Email)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
REPLY_TO_EMAIL=noreply@aonetop.com

# Twilio (SMS/WhatsApp)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=+1234567890

# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx

# Notification Settings
NOTIFICATION_MAX_RETRIES=3
NOTIFICATION_RETRY_DELAY_MS=5000
NOTIFICATION_MAX_PER_DAY=50
NOTIFICATION_MAX_PER_HOUR=10
NOTIFICATION_QUIET_HOURS_START=22:00
NOTIFICATION_QUIET_HOURS_END=08:00
```

---

## 📊 Database Tables

### notification_logs
```sql
SELECT * FROM notification_logs WHERE user_id = 'xxx';
```
Columns: id, user_id, notification_type, channel, recipient, status, 
error_message, metadata, created_at, sent_at, deleted_at

### user_contact_info
```sql
SELECT * FROM user_contact_info WHERE user_id = 'xxx';
```
Columns: user_id, email, phone_number, email_verified, phone_verified,
notification_preferences (JSONB), unsubscribed_from, quiet_hours_start, quiet_hours_end

### notification_queue
```sql
SELECT * FROM notification_queue WHERE status = 'pending';
```
Columns: id, user_id, notification_type, channels, status, 
scheduled_at, retry_count, created_at

---

## 🧪 Testing

### Test All Services
```bash
node src/lib/__tests__/serviceTestNode.js
```

### Test SMS with Real Number
```bash
node src/lib/__tests__/testSmsRecipient.js
```

---

## 🔄 Error Handling

All notification handlers throw errors on failure:
```typescript
try {
  await sendSignupWelcomeEmail({...});
} catch (error) {
  console.error('Email failed:', error);
  // Handle error - log, alert admin, etc.
}
```

---

## 📈 Future Endpoints (Phase 3-6)

Coming soon:
- `sendOrderConfirmationEmail()`
- `sendOrderTrackingEmail()`
- `sendDeliveryNotification()`
- `sendPaymentConfirmation()`
- `sendRefundNotification()`
- And more...

---

## 🚀 Quick Integration Examples

### In Signup Page
```typescript
const handleSignup = async (email, password, fullName) => {
  const user = await supabase.auth.signUp({email, password});
  await sendSignupWelcomeEmail({userId: user.id, email, fullName});
};
```

### In Forgot Password
```typescript
const handleForgotPassword = async (email) => {
  const token = generateToken();
  await sendPasswordResetEmail({
    userId: user.id, email, fullName: user.fullName,
    resetToken: token,
    resetLink: `https://aonetop.com/reset?token=${token}`
  });
};
```

### In Profile Update
```typescript
const handleProfileUpdate = async (oldData, newData) => {
  const changes = detectChanges(oldData, newData);
  if (changes.length > 0) {
    await sendProfileUpdateNotification({
      userId: user.id, email: user.email, fullName: user.fullName,
      changedFields: changes, ipAddress: clientIp
    });
  }
};
```

---

## 📞 Support

- Full integration examples: See PHASE_2_INTEGRATION_GUIDE.md
- Setup instructions: See QUICK_START_GUIDE.md
- Email templates: See individual handler files
- Database schema: See DATABASE_SETUP_GUIDE.md

---

**API Version:** 2.0  
**Status:** ✅ Production Ready  
**Mode:** Email-Only  
**Last Updated:** 24 January 2026
