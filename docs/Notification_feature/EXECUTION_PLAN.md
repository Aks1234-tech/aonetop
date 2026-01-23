# Notifications System - Phase-Wise Execution Plan

## Document Overview
This document provides a detailed, actionable execution plan for implementing the comprehensive notification system across the AONet application. Each phase includes specific tasks, dependencies, deliverables, and success criteria.

**Total Timeline:** 10 weeks  
**Status:** Ready for Kickoff  
**Last Updated:** 24 January 2026

---

## Table of Contents
1. [Phase 1: Foundation](#phase-1-foundation)
2. [Phase 2: Core Notifications](#phase-2-core-notifications)
3. [Phase 3: Cart & Order Notifications](#phase-3-cart--order-notifications)
4. [Phase 4: Payment & WhatsApp](#phase-4-payment--whatsapp)
5. [Phase 5: Error Handling & Monitoring](#phase-5-error-handling--monitoring)
6. [Phase 6: Testing & Optimization](#phase-6-testing--optimization)
7. [Appendix: Risk Management](#appendix-risk-management)

---

## Phase 1: Foundation (Week 1-2)

### Objective
Establish the core infrastructure and dependencies required for all notification services.

### Tasks

#### Task 1.1: Database Schema Setup
**Duration:** 2-3 days  
**Dependencies:** None  
**Owner:** Backend Lead

**Deliverables:**
- [ ] Migration file for `notification_logs` table
- [ ] Migration file for `user_contact_info` table
- [ ] Migration file for `notification_preferences` JSONB schema
- [ ] SQL script with indexes for performance
- [ ] Documentation of schema relationships

**Acceptance Criteria:**
- Tables created successfully in Supabase
- Foreign key constraints properly defined
- Indexes created on frequently queried columns
- RLS (Row Level Security) policies configured

**SQL Implementation:**
```sql
-- Create notification_logs table
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  channel VARCHAR(20) NOT NULL,
  recipient TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  error_message TEXT,
  retry_count INT DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  sent_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX idx_notification_logs_status ON notification_logs(status);
CREATE INDEX idx_notification_logs_created_at ON notification_logs(created_at);

-- Create user_contact_info table
CREATE TABLE IF NOT EXISTS user_contact_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number VARCHAR(15),
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  whatsapp_enabled BOOLEAN DEFAULT false,
  notification_preferences JSONB DEFAULT '{
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
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_contact_info_phone ON user_contact_info(phone_number);
```

---

#### Task 1.2: Email Service Integration
**Duration:** 3-4 days  
**Dependencies:** Task 1.1  
**Owner:** Backend Lead

**Email Service Options:**

| Provider | Cost | Rate Limit | Deliverability | Setup Ease | Production Ready |
|----------|------|------------|-----------------|-----------|------------------|
| **Gmail (SMTP)** | Free | 500/day (personal) | Good | Very Easy | Development/Low volume |
| **SendGrid** | $20-300/mo | 100/sec | Excellent | Easy | ✅ Production |
| **Nodemailer + Gmail** | Free | 500/day (personal) | Good | Very Easy | Development/Low volume |
| **AWS SES** | $0.10/1000 | High | Excellent | Medium | ✅ Production |

**Recommendation for Production:** SendGrid or AWS SES  
**Recommendation for Development/MVP:** Gmail SMTP

### Gmail SMTP Setup (Quick & Free)

**Prerequisites:**
- Gmail account
- Enable "2-Step Verification"
- Generate "App Password"

**Installation:**
```bash
npm install nodemailer
```

**Configuration:**
```typescript
// src/lib/emailService.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // your-email@gmail.com
    pass: process.env.GMAIL_APP_PASSWORD // 16-character app password
  }
});

async function sendEmail(to: string, subject: string, html: string) {
  try {
    const info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      html,
      replyTo: process.env.REPLY_TO_EMAIL
    });
    
    console.log('Email sent:', info.response);
    return { status: 'sent', messageId: info.messageId };
  } catch (error) {
    console.error('Email failed:', error);
    throw error;
  }
}

export default { sendEmail };
```

**Environment Variables:**
```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
REPLY_TO_EMAIL=noreply@aonetop.com
```

**Limitations & Notes:**
- ⚠️ Daily limit: 500 emails/day (personal Gmail)
- ⚠️ Better for MVP/development phase
- ✅ Free to use
- ✅ No API key setup needed
- ⚠️ Not ideal for production with high volume
- ✅ Good for testing notification system

**For Production Migration to SendGrid:**
- Same interface, easy to switch providers
- Just change the transporter configuration
- Email templates remain the same

---

### SendGrid Setup (Production-Grade)

**Installation:**
```bash
npm install @sendgrid/mail
```

**Configuration:**
```typescript
// src/lib/emailService.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail(to: string, subject: string, html: string) {
  try {
    const msg = {
      to,
      from: process.env.FROM_EMAIL,
      subject,
      html,
      replyTo: process.env.REPLY_TO_EMAIL
    };
    
    const response = await sgMail.send(msg);
    return { status: 'sent', messageId: response[0].headers['x-message-id'] };
  } catch (error) {
    console.error('Email failed:', error);
    throw error;
  }
}

export default { sendEmail };
```

**Environment Variables:**
```
SENDGRID_API_KEY=SG.xxxxxxxxxxx
FROM_EMAIL=noreply@aonetop.com
REPLY_TO_EMAIL=support@aonetop.com
```

**Benefits:**
- ✅ 99.9% uptime SLA
- ✅ Unlimited sending
- ✅ Excellent deliverability
- ✅ Built-in analytics & tracking
- ✅ Supports templates, attachments, bulk
- ✅ Production-ready

---

**Deliverables:**
- [ ] Email service configuration file (using chosen provider)
- [ ] Email integration module (Gmail or SendGrid)
- [ ] Email template engine setup
- [ ] Environment variables documentation
- [ ] Test email sending functionality
- [ ] Migration path documentation (if starting with Gmail)

**Implementation Steps:**
1. Create `src/lib/emailService.ts`
   - Initialize Gmail or SendGrid client
   - Create send email function
   - Implement error handling
   - Add retry logic

2. Create template directory structure:
   ```
   src/templates/emails/
   ├── base.html (layout)
   ├── signup.html
   ├── password-reset.html
   ├── profile-update.html
   ├── cart-addition.html
   ├── cart-reminder.html
   ├── order-confirmation.html
   ├── payment-confirmation.html
   ├── order-tracking.html
   └── error-notification.html
   ```

3. Implement template rendering with variables

**Acceptance Criteria:**
- Email service successfully sends test emails
- Templates render correctly with variables
- Error handling works for failed deliveries
- Logs are properly recorded in database
- Rate limiting implemented (respects provider limits)
- Can handle provider-specific features

---

#### Task 1.3: SMS Service Integration
**Duration:** 3-4 days  
**Dependencies:** Task 1.1  
**Owner:** Backend Lead

**Choose Provider:** Twilio (recommended - WhatsApp ready)

**Deliverables:**
- [ ] Twilio API integration module
- [ ] SMS service configuration file
- [ ] SMS template system
- [ ] Environment variables setup
- [ ] Test SMS sending functionality

**Implementation Steps:**
1. Create `src/lib/smsService.ts`
   - Initialize Twilio client
   - Create send SMS function
   - Implement character limit handling (160 chars)
   - Add delivery confirmation tracking

2. Create SMS templates:
   ```
   src/templates/sms/
   ├── signup.txt
   ├── password-reset.txt
   ├── cart-reminder.txt
   ├── order-confirmation.txt
   ├── payment-confirmation.txt
   ├── order-tracking.txt
   └── error-notification.txt
   ```

**Acceptance Criteria:**
- SMS service successfully sends test messages
- Character limit enforcement (160 chars + Unicode support)
- Delivery status tracking implemented
- Error handling for invalid phone numbers
- Cost-effective batching implemented

---

#### Task 1.4: Notification Service Core Module
**Duration:** 2-3 days  
**Dependencies:** Task 1.2, Task 1.3  
**Owner:** Backend Lead

**Deliverables:**
- [ ] Core notification service class
- [ ] Channel router logic
- [ ] Template engine
- [ ] Logging system
- [ ] Configuration management

**Implementation File:** `src/lib/notificationService.ts`

**Key Functions:**
```typescript
interface NotificationPayload {
  userId: string;
  type: NotificationType;
  data: Record<string, any>;
  channels?: Channel[];
}

class NotificationService {
  async send(payload: NotificationPayload): Promise<void>
  async sendToUser(userId: string, type: NotificationType, data: any): Promise<void>
  async sendBatch(payloads: NotificationPayload[]): Promise<void>
  async getNotificationLogs(userId: string): Promise<NotificationLog[]>
  async updateNotificationPreferences(userId: string, prefs: any): Promise<void>
}
```

**Acceptance Criteria:**
- Service routes notifications to correct channels
- Supports batch operations
- Handles concurrent requests
- Proper error logging and recovery
- Unit tests pass (80%+ coverage)

---

#### Task 1.5: Database Hooks & Event Listeners
**Duration:** 2 days  
**Dependencies:** Task 1.1, Task 1.4  
**Owner:** Backend Lead

**Deliverables:**
- [ ] Supabase realtime listener setup
- [ ] Event emitter configuration
- [ ] Database trigger documentation
- [ ] Testing of event flow

**Implementation:**
- Set up Supabase client with realtime subscriptions
- Create event emitters for notification triggers
- Document when notifications should be triggered

---

#### Task 1.6: Testing & Documentation (Phase 1)
**Duration:** 1-2 days  
**Dependencies:** All Phase 1 tasks  
**Owner:** QA Lead

**Deliverables:**
- [ ] Unit tests for email service
- [ ] Unit tests for SMS service
- [ ] Unit tests for core notification service
- [ ] Integration test for database
- [ ] API documentation
- [ ] Setup guide for developers

**Testing Checklist:**
- Email service sends valid emails
- SMS service formats messages correctly
- Database correctly logs notifications
- Error handling works as expected
- All services handle concurrent requests

---

### Phase 1 Summary

| Task | Duration | Owner | Status |
|------|----------|-------|--------|
| 1.1: Database Schema | 2-3 days | Backend | Not Started |
| 1.2: Email Service | 3-4 days | Backend | Not Started |
| 1.3: SMS Service | 3-4 days | Backend | Not Started |
| 1.4: Core Service | 2-3 days | Backend | Not Started |
| 1.5: Event Listeners | 2 days | Backend | Not Started |
| 1.6: Testing & Docs | 1-2 days | QA | Not Started |

**Phase 1 Success Criteria:**
- ✅ Database schema deployed to production
- ✅ Email service tested with 10+ test cases
- ✅ SMS service tested with 10+ test cases
- ✅ Core notification service operational
- ✅ All Phase 1 unit tests passing
- ✅ Documentation complete and reviewed

---

## Phase 2: Core Notifications (Week 3-4)

### Objective
Implement the most critical notification types: Signup, Password Reset, and Profile Update.

### Tasks

#### Task 2.1: Account Signup Notification
**Duration:** 2-3 days  
**Dependencies:** Phase 1 complete  
**Owner:** Backend Lead

**Trigger Point:** After successful user registration in Auth

**Implementation:**
1. Create signup email template (`src/templates/emails/signup.html`)
   - Welcome message
   - Account confirmation
   - Profile completion link
   - Support contact info

2. Create signup SMS template (`src/templates/sms/signup.txt`)
   - Welcome message
   - Email verification link
   - Max 160 characters

3. Implement hook in Auth/signup flow:
   ```typescript
   // In signup controller/action
   await notificationService.send({
     userId: newUser.id,
     type: 'account_signup',
     data: { userName: newUser.name, email: newUser.email },
     channels: ['email', 'sms'] // Based on user preferences
   });
   ```

**Deliverables:**
- [ ] Email template (HTML + CSS)
- [ ] SMS template (text)
- [ ] Signup notification function
- [ ] Database logging working
- [ ] Unit tests (100% coverage)
- [ ] Signup flow integration tested

**Acceptance Criteria:**
- Email sent within 2 seconds of signup
- SMS sent if phone available
- Logging records all attempts
- Templates render correctly
- Zero failures on happy path

---

#### Task 2.2: Password Reset Notification
**Duration:** 2-3 days  
**Dependencies:** Task 2.1  
**Owner:** Backend Lead

**Trigger Point:** User initiates "Forgot Password" flow

**Implementation:**
1. Email template with reset link
   - 24-hour expiry notice
   - Security warning
   - Alternative action link

2. SMS template with short URL
   - Reset link (shortened)
   - 24-hour validity
   - Don't share warning

3. Integration with password reset flow:
   ```typescript
   // Generate token, send notification
   const resetToken = generateSecureToken();
   const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
   
   await notificationService.send({
     userId: user.id,
     type: 'password_reset',
     data: { resetLink, expiryTime: '24 hours' },
     channels: ['email', 'sms']
   });
   ```

**Deliverables:**
- [ ] Email template with reset link
- [ ] SMS template with shortened URL
- [ ] Password reset notification function
- [ ] Token generation & validation
- [ ] Unit tests
- [ ] Security tests (token expiry, one-time use)

**Acceptance Criteria:**
- Reset link valid for exactly 24 hours
- One-time use enforcement
- IP logging for security
- Email/SMS sent immediately
- User can't use same token twice

---

#### Task 2.3: Profile Update Notification
**Duration:** 2 days  
**Dependencies:** Task 2.1  
**Owner:** Backend Lead

**Trigger Point:** User updates profile information

**Implementation:**
1. Email template summarizing changes
   - Changed fields listed
   - Timestamp of change
   - Verification link if sensitive fields changed

2. Integration with profile update:
   ```typescript
   // After profile update
   const changedFields = Object.keys(updates);
   
   await notificationService.send({
     userId: user.id,
     type: 'profile_update',
     data: { changedFields, timestamp: new Date() },
     channels: ['email']
   });
   ```

3. Special handling for sensitive fields:
   - Email address changes
   - Password changes
   - Phone number changes

**Deliverables:**
- [ ] Email template (profile update)
- [ ] Change tracking logic
- [ ] Sensitive field detection
- [ ] Unit tests
- [ ] Integration tests

**Acceptance Criteria:**
- Email sent within 5 minutes
- Changed fields clearly listed
- Security warnings for sensitive changes
- No sensitive data in email content
- User can verify changes

---

#### Task 2.4: Notification Preferences UI
**Duration:** 2 days  
**Dependencies:** Phase 1 complete  
**Owner:** Frontend Lead

**Implementation:**
Create notification preferences page/modal in user dashboard:
- Toggle each notification type
- Choose channels (email/SMS/WhatsApp)
- Unsubscribe options
- Frequency settings

**Components:**
1. `NotificationPreferences.tsx` - Main component
2. `PreferenceToggle.tsx` - Individual preference control
3. Hook: `useNotificationPreferences.ts`

**Deliverables:**
- [ ] React component for preferences
- [ ] Save preferences to database
- [ ] Load current preferences
- [ ] User feedback on save
- [ ] Responsive design

**Acceptance Criteria:**
- UI functional on desktop & mobile
- Changes persist to database
- Real-time updates
- Clear visual feedback
- Accessibility compliant

---

#### Task 2.5: Testing & Documentation (Phase 2)
**Duration:** 1-2 days  
**Dependencies:** All Phase 2 tasks  
**Owner:** QA Lead

**Deliverables:**
- [ ] Integration tests for signup flow
- [ ] Integration tests for password reset
- [ ] Integration tests for profile update
- [ ] End-to-end testing scenarios
- [ ] Documentation of notification flows

**Testing Scenarios:**
- Signup → Email + SMS delivered
- Password reset → Email + SMS delivered + link works
- Profile update → Email sent + changes verified
- Preferences → Saved & respected on next notification

---

### Phase 2 Summary

| Task | Duration | Owner | Status |
|------|----------|-------|--------|
| 2.1: Signup Notification | 2-3 days | Backend | Not Started |
| 2.2: Password Reset | 2-3 days | Backend | Not Started |
| 2.3: Profile Update | 2 days | Backend | Not Started |
| 2.4: Preferences UI | 2 days | Frontend | Not Started |
| 2.5: Testing & Docs | 1-2 days | QA | Not Started |

**Phase 2 Success Criteria:**
- ✅ All 3 notification types working end-to-end
- ✅ User preferences respected
- ✅ No notifications sent to opted-out users
- ✅ >95% email delivery rate
- ✅ >98% SMS delivery rate
- ✅ All integration tests passing

---

## Phase 3: Cart & Order Notifications (Week 5-6)

### Objective
Implement cart-related and order confirmation notifications with sophisticated timing logic.

### Tasks

#### Task 3.1: Cart Addition Notification
**Duration:** 2-3 days  
**Dependencies:** Phase 2 complete  
**Owner:** Backend Lead

**Trigger Point:** User adds item to cart

**Implementation:**
1. Email template with product details
   - Product image/thumbnail
   - Product name, price, quantity
   - Current cart total
   - Continue shopping button
   - Checkout button

2. Batching logic (important for performance):
   ```typescript
   // Don't send email for EVERY cart addition
   // Instead, batch within time window
   
   async sendCartNotification(userId: string) {
     const hasRecentNotification = await checkRecentNotification(
       userId, 
       'cart_addition', 
       '1 hour'
     );
     
     if (!hasRecentNotification) {
       await notificationService.send({...});
     }
   }
   ```

3. User preference check:
   - Only send if user opted in for cart notifications
   - Respect frequency preferences

**Deliverables:**
- [ ] Email template (product details)
- [ ] Cart notification function
- [ ] Batching/throttling logic
- [ ] Product data integration
- [ ] Unit tests

**Acceptance Criteria:**
- Email sent max once per hour per user
- Product image loads correctly
- Cart total accurate
- Email links to cart/checkout work
- User preferences respected

---

#### Task 3.2: Cart Abandonment Reminder (Background Job)
**Duration:** 3 days  
**Dependencies:** Phase 3.1  
**Owner:** Backend Lead

**Trigger:** Background job runs every 4 hours
- Check carts unproceed for 24+ hours
- Send first reminder
- Check for 48+ hours
- Send second reminder

**Implementation:**
1. Background job using Bull queue or cron:
   ```typescript
   // cron job - runs every 4 hours
   cron.schedule('0 */4 * * *', async () => {
     const abandonedCarts = await getAbandonedCarts(24); // 24 hrs
     for (const cart of abandonedCarts) {
       if (!hasReminderSent(cart.id, 1)) {
         await sendCartReminder(cart, 1);
       }
     }
   });
   ```

2. Email template:
   - List of abandoned items with images
   - Total cart value
   - Optional discount code
   - Urgency messaging
   - Direct checkout link

3. Reminder tracking:
   - Record in database: reminder_sent_at, reminder_number
   - Max 2 reminders per cart
   - Respect user preferences

**Deliverables:**
- [ ] Background job setup (Bull/cron)
- [ ] Abandoned cart detection logic
- [ ] Email template (reminder)
- [ ] Reminder tracking in DB
- [ ] Testing & monitoring

**Acceptance Criteria:**
- Jobs run reliably on schedule
- Correct carts identified as abandoned
- Max 2 emails per abandoned cart
- Emails contain correct product info
- User can complete purchase from email
- Logging of all reminders sent

---

#### Task 3.3: Order Confirmation Notification
**Duration:** 2-3 days  
**Dependencies:** Phase 3.1  
**Owner:** Backend Lead

**Trigger Point:** User successfully places order (payment approved)

**Implementation:**
1. Comprehensive email template:
   - Order number & date (prominent)
   - Itemized order details (images, prices, quantities)
   - Shipping address
   - Total amount (with tax breakdown)
   - Estimated delivery date
   - Order tracking link
   - Return policy summary
   - Support contact info

2. Generate PDF invoice:
   - Use existing `generateInvoicePDF` function
   - Attach to email
   - Also store link for reference

3. Send immediately after order placement:
   ```typescript
   // In order creation
   await notificationService.send({
     userId: order.userId,
     type: 'order_confirmation',
     data: {
       orderId: order.id,
       items: order.items,
       total: order.total,
       shippingAddress: order.address,
       estimatedDelivery: calculateDelivery(order.createdAt)
     },
     channels: ['email']
   });
   ```

**Deliverables:**
- [ ] Email template (order confirmation)
- [ ] PDF invoice generation
- [ ] Order data integration
- [ ] Immediate sending logic
- [ ] Unit & integration tests

**Acceptance Criteria:**
- Email sent within 2 seconds of order
- Order number clearly visible
- All order details correct
- PDF invoice attached & correct
- Estimated delivery accurate
- Links functional

---

#### Task 3.4: Order Status Update Notifications
**Duration:** 3-4 days  
**Dependencies:** Phase 3.3  
**Owner:** Backend Lead

**Trigger:** Admin updates order status in dashboard

**Order Status Stages:**
1. Pending → Processing (auto, on payment)
2. Processing → Shipped (admin action + tracking number)
3. Shipped → Delivered (based on carrier/admin action)
4. Delivered → Completed (auto after 7 days if no return)

**Email Templates (status-specific):**

**Processing Status:**
- Order being prepared
- Estimated processing time
- Order tracking link

**Shipped Status:**
- Tracking number (clickable)
- Carrier name & link
- Estimated delivery date
- How to track

**Delivered Status:**
- Delivery confirmation
- Product review link
- Return window notification
- Feedback request

**SMS Template (brief):**
- "Order #[id] [status]. Track: [link]" (160 chars max)

**Implementation:**
```typescript
// When admin updates order status
async updateOrderStatus(orderId: string, newStatus: string) {
  const order = await getOrder(orderId);
  const previousStatus = order.status;
  
  // Update order
  await db.orders.update(orderId, { status: newStatus });
  
  // Send notification
  if (shouldNotifyUser(previousStatus, newStatus)) {
    await notificationService.send({
      userId: order.userId,
      type: 'order_tracking',
      data: {
        orderId,
        newStatus,
        tracking: order.trackingNumber,
        carrier: order.carrier
      },
      channels: ['email', 'sms']
    });
  }
}
```

**Deliverables:**
- [ ] Email templates for each status
- [ ] SMS template
- [ ] Status change detection
- [ ] Tracking number integration
- [ ] Unit & integration tests

**Acceptance Criteria:**
- Correct template used per status
- Tracking numbers accurate
- SMS within 160 characters
- Email sent within 1 minute of status change
- No duplicate emails for same status
- Users can click tracking links

---

#### Task 3.5: Testing & Documentation (Phase 3)
**Duration:** 1-2 days  
**Dependencies:** All Phase 3 tasks  
**Owner:** QA Lead

**Testing Scenarios:**
- Cart addition → Email batching works
- Abandonment (24h, 48h) → Reminders sent at right times
- Order placement → Confirmation email with PDF
- Status updates → Correct templates, no duplicates
- Edge cases → Multiple status updates, cart additions

**Deliverables:**
- [ ] Integration tests
- [ ] End-to-end test scenarios
- [ ] Performance tests (batch operations)
- [ ] Documentation

---

### Phase 3 Summary

| Task | Duration | Owner | Status |
|------|----------|-------|--------|
| 3.1: Cart Addition | 2-3 days | Backend | Not Started |
| 3.2: Abandonment | 3 days | Backend | Not Started |
| 3.3: Order Confirmation | 2-3 days | Backend | Not Started |
| 3.4: Order Tracking | 3-4 days | Backend | Not Started |
| 3.5: Testing & Docs | 1-2 days | QA | Not Started |

**Phase 3 Success Criteria:**
- ✅ Cart notifications batched (max 1/hour)
- ✅ Abandonment reminders sent correctly (2 max)
- ✅ Order confirmation within 2 seconds
- ✅ Order tracking notifications accurate
- ✅ No duplicate notifications
- ✅ All integration tests passing
- ✅ >95% delivery rate maintained

---

## Phase 4: Payment & WhatsApp (Week 7-8)

### Objective
Implement payment confirmation notifications and WhatsApp integration for multi-channel delivery.

### Tasks

#### Task 4.1: Payment Confirmation Notification
**Duration:** 2-3 days  
**Dependencies:** Phase 3 complete  
**Owner:** Backend Lead

**Trigger Point:** Payment successfully processed via Razorpay webhook

**Implementation:**
1. Email template:
   - Payment confirmed badge
   - Order number
   - Payment method used (last 4 digits only)
   - Amount paid (INR)
   - Transaction ID
   - Receipt/Invoice attachment
   - Order tracking link
   - Thank you message

2. SMS template:
   - "Payment of ₹[amount] received for Order #[order_id]. Track: [link]. Thank you!"
   - Max 160 characters

3. Webhook handler:
   ```typescript
   // Razorpay webhook handler
   router.post('/webhooks/razorpay', async (req, res) => {
     const event = req.body;
     
     if (event.event === 'payment.authorized') {
       const payment = event.payload.payment.entity;
       const order = await getOrderByPaymentId(payment.id);
       
       await notificationService.send({
         userId: order.userId,
         type: 'payment_confirmation',
         data: {
           orderId: order.id,
           amount: payment.amount / 100, // Convert from paise
           paymentMethod: payment.method,
           transactionId: payment.id
         },
         channels: ['email', 'sms']
       });
     }
     res.json({ status: 'ok' });
   });
   ```

**Security Considerations:**
- ✅ No full card numbers in emails
- ✅ No sensitive payment data logged
- ✅ PCI compliance maintained
- ✅ Secure transaction ID handling
- ✅ HTTPS for all links

**Deliverables:**
- [ ] Email template (payment)
- [ ] SMS template (payment)
- [ ] Webhook handler
- [ ] Razorpay integration validation
- [ ] Security audit
- [ ] Unit & integration tests

**Acceptance Criteria:**
- Email sent within 2 minutes of payment
- SMS sent within 2 minutes
- No sensitive data in messages
- Correct amount displayed
- Attachments included
- All channels respect user preferences

---

#### Task 4.2: WhatsApp Service Integration
**Duration:** 4-5 days  
**Dependencies:** Phase 1 complete  
**Owner:** Backend Lead

**Choose Provider:** Twilio WhatsApp Business API or WhatsApp Cloud API
**Recommendation:** Twilio (already integrated for SMS, easier setup)

**Implementation:**

1. Create `src/lib/whatsappService.ts`:
   ```typescript
   import twilio from 'twilio';
   
   class WhatsAppService {
     private client: typeof twilio;
     
     async sendMessage(phoneNumber: string, message: string) {
       // Send via WhatsApp Business API
     }
     
     async sendTemplate(phoneNumber: string, templateName: string, params: any) {
       // Send pre-approved template
     }
     
     async sendMediaMessage(phoneNumber: string, mediaUrl: string, caption: string) {
       // Send with media (invoice, receipt)
     }
   }
   ```

2. WhatsApp templates (pre-approved by Meta):
   ```
   src/templates/whatsapp/
   ├── payment_confirmation.json
   ├── order_tracking.json
   ├── order_confirmation.json
   └── error_notification.json
   ```

3. Example template format:
   ```json
   {
     "name": "payment_confirmation",
     "parameters": [
       {
         "name": "order_id",
         "type": "text"
       },
       {
         "name": "amount",
         "type": "currency",
         "currency_code": "INR"
       }
     ],
     "content": "Payment of {{amount}} received for Order {{order_id}}"
   }
   ```

4. Integration with notification service:
   ```typescript
   // whatsappService integrated into notificationService
   if (channels.includes('whatsapp')) {
     await whatsappService.sendTemplate(
       userPhone,
       templateName,
       templateData
     );
   }
   ```

**Phone Number Validation:**
- Validate format: +91XXXXXXXXXX (for India)
- Check against user profile
- Require WhatsApp opt-in

**Deliverables:**
- [ ] Twilio WhatsApp integration
- [ ] WhatsApp templates (approved by Meta)
- [ ] Phone validation logic
- [ ] Service integration
- [ ] Error handling
- [ ] Unit tests

**Acceptance Criteria:**
- WhatsApp messages deliver reliably
- Templates approved by Meta
- Only send to opted-in users
- Rich message formatting works
- Media delivery functional
- Error handling for invalid numbers

---

#### Task 4.3: Multi-Channel Delivery Strategy
**Duration:** 2 days  
**Dependencies:** Task 4.2  
**Owner:** Backend Lead

**Fallback Logic:**
```
Primary Channel → Success: DONE
Primary Channel → Failure: Try Secondary
Secondary Channel → Success: DONE
Secondary Channel → Failure: Try Tertiary
Tertiary Channel → Failure: Log + Dashboard Alert
```

**Channel Priority by Notification Type:**

| Notification Type | Primary | Secondary | Tertiary |
|------------------|---------|-----------|----------|
| Payment Confirmation | Email | SMS | WhatsApp |
| Order Tracking | Email | SMS | - |
| Order Confirmation | Email | SMS | WhatsApp |
| Cart Reminder | Email | SMS | - |
| Error Notification | Email | SMS | Dashboard |
| Password Reset | Email | SMS | - |

**Implementation:**
```typescript
async sendWithFallback(payload: NotificationPayload) {
  const channels = getChannelsForUser(payload.userId, payload.type);
  let success = false;
  
  for (const channel of channels) {
    try {
      await this.sendViaChannel(channel, payload);
      success = true;
      break; // Success, stop trying
    } catch (error) {
      console.log(`${channel} failed, trying next...`);
      continue;
    }
  }
  
  if (!success) {
    await this.createDashboardAlert(payload.userId);
  }
}
```

**Deliverables:**
- [ ] Fallback routing logic
- [ ] Channel priority configuration
- [ ] Error tracking
- [ ] Dashboard alert system
- [ ] Unit tests

**Acceptance Criteria:**
- Notifications delivered via primary or fallback
- Dashboard alerts for failures
- Logging complete
- No message loss

---

#### Task 4.4: Payment Notification Edge Cases
**Duration:** 2 days  
**Dependencies:** Task 4.1  
**Owner:** Backend Lead

**Scenarios to Handle:**
1. Payment pending → Later confirmed
2. Payment failed → Retry
3. Partial payment
4. Refund issued
5. Payment timeout

**Implementation:**
- Handle Razorpay webhook events:
  - `payment.authorized`
  - `payment.failed`
  - `payment.captured`
  - `refund.created`

**Deliverables:**
- [ ] Edge case handlers
- [ ] Webhook event mapping
- [ ] Email templates for each scenario
- [ ] Unit tests

**Acceptance Criteria:**
- All payment scenarios covered
- Correct notification sent per scenario
- User informed of any payment issues

---

#### Task 4.5: Testing & Documentation (Phase 4)
**Duration:** 1-2 days  
**Dependencies:** All Phase 4 tasks  
**Owner:** QA Lead

**Testing:**
- Payment webhook integration
- WhatsApp message delivery
- Multi-channel fallback
- Payment edge cases
- Security & PCI compliance

**Deliverables:**
- [ ] Integration tests
- [ ] Webhook testing
- [ ] WhatsApp delivery tests
- [ ] Security audit report
- [ ] Documentation

---

### Phase 4 Summary

| Task | Duration | Owner | Status |
|------|----------|-------|--------|
| 4.1: Payment Confirmation | 2-3 days | Backend | Not Started |
| 4.2: WhatsApp Integration | 4-5 days | Backend | Not Started |
| 4.3: Multi-Channel Logic | 2 days | Backend | Not Started |
| 4.4: Edge Cases | 2 days | Backend | Not Started |
| 4.5: Testing & Docs | 1-2 days | QA | Not Started |

**Phase 4 Success Criteria:**
- ✅ Payment notifications sent within 2 minutes
- ✅ WhatsApp deliveries >95% successful
- ✅ Fallback mechanism working
- ✅ All payment scenarios handled
- ✅ PCI compliance verified
- ✅ No sensitive data in messages

---

## Phase 5: Error Handling & Monitoring (Week 9)

### Objective
Implement comprehensive error handling, retry mechanisms, and monitoring/analytics dashboard.

### Tasks

#### Task 5.1: Retry Mechanism Implementation
**Duration:** 2-3 days  
**Dependencies:** Phase 4 complete  
**Owner:** Backend Lead

**Retry Strategy:**
```
Attempt 1: Immediate
Attempt 2: After 5 minutes
Attempt 3: After 15 minutes
Attempt 4: After 1 hour
Attempt 5: After 6 hours

After 5 failed attempts:
→ Log failure with reason
→ Try alternate channel
→ Create support ticket
→ Alert admin
```

**Implementation:**
```typescript
async function sendWithRetry(
  payload: NotificationPayload,
  channel: Channel,
  attempt: number = 0
) {
  try {
    return await notificationService.sendViaChannel(channel, payload);
  } catch (error) {
    if (attempt < MAX_RETRIES) {
      const delay = calculateDelay(attempt); // exponential backoff
      setTimeout(
        () => sendWithRetry(payload, channel, attempt + 1),
        delay
      );
    } else {
      await handlePermanentFailure(payload, error);
    }
  }
}

function calculateDelay(attempt: number): number {
  const delays = [0, 5*60*1000, 15*60*1000, 60*60*1000, 6*60*60*1000];
  return delays[attempt] || delays[delays.length - 1];
}
```

**Database Updates:**
- Add `retry_count` and `next_retry_at` columns
- Track each retry attempt
- Log error messages

**Deliverables:**
- [ ] Retry queue implementation (Bull)
- [ ] Exponential backoff logic
- [ ] Database schema updates
- [ ] Retry tracking
- [ ] Unit tests

**Acceptance Criteria:**
- Retries follow schedule
- Max 5 attempts per notification
- Accurate logging
- No infinite retry loops

---

#### Task 5.2: Error Notification System
**Duration:** 2 days  
**Dependencies:** Phase 4 complete  
**Owner:** Backend Lead

**Error Scenarios:**
1. Failed email delivery
2. Failed SMS delivery
3. Failed WhatsApp delivery
4. Invalid phone number
5. Invalid email format
6. Service provider timeout
7. Database errors
8. Webhook processing errors

**Email Template (Error Notification):**
```
Subject: "Alert: Issue with Your [ACTION] - AONet"

Content:
- Clear description of error
- What went wrong
- What we're doing about it
- Suggested user actions
- Support contact information
- Retry link (if applicable)
```

**Example Error Email:**
```
Hi [User Name],

We encountered an issue while processing your Order #12345.

Error: Payment confirmation could not be sent
Timestamp: [date/time]
Reference ID: ERR-1234567890

What we're doing:
- We're automatically retrying the operation
- Your order is safe and processing normally
- We'll notify you when payment is confirmed

What you can do:
- Check your email and SMS for confirmation (might be delayed)
- Contact support if issue persists
- View order status here: [link]

Support: [phone] | [email]

Thank you for your patience.
```

**Error Tracking:**
```typescript
async function logError(
  error: Error,
  context: {
    userId: string;
    notificationType: string;
    channel: string;
    attempt: number;
  }
) {
  await db.notification_logs.update(logId, {
    status: 'failed',
    error_message: error.message,
    error_code: error.code,
    error_stack: error.stack,
    retry_count: context.attempt,
    metadata: {
      ...context,
      timestamp: new Date(),
      userAgent: process.env.NODE_ENV
    }
  });
}
```

**Deliverables:**
- [ ] Error notification templates
- [ ] Error logging system
- [ ] Error classification
- [ ] Admin alert system
- [ ] Unit tests

**Acceptance Criteria:**
- All error types captured
- Users informed of issues
- Admins alerted to system errors
- Error logs searchable & analyzable

---

#### Task 5.3: Monitoring & Analytics Dashboard
**Duration:** 3-4 days  
**Dependencies:** All previous phases  
**Owner:** Full Stack (Backend + Frontend)

**Metrics to Track:**

**Delivery Metrics:**
- Total notifications sent (by type, by channel)
- Successfully delivered
- Failed deliveries
- Delivery rate (%) by channel
- Average delivery time
- Retry statistics

**Performance Metrics:**
- API response time
- Queue processing time
- Database query performance
- Service provider latency
- Peak load analysis

**User Metrics:**
- Opt-in rates per notification type
- Click-through rates
- Unsubscribe rates
- Preference changes

**Error Metrics:**
- Error rate by channel
- Error types distribution
- Retry success rate
- Time to resolution

**Implementation:**

1. Create analytics table:
```sql
CREATE TABLE notification_analytics (
  id UUID PRIMARY KEY,
  date DATE,
  notification_type VARCHAR(50),
  channel VARCHAR(20),
  sent_count INT,
  delivered_count INT,
  failed_count INT,
  avg_delivery_time_ms INT,
  click_count INT,
  bounce_count INT,
  created_at TIMESTAMP
);
```

2. Dashboard Components:
   - Real-time metrics display
   - Charts (delivery rate, error rate)
   - Filters by date range, type, channel
   - Error logs viewer
   - Performance graphs

3. Daily aggregation job:
```typescript
// Daily job to aggregate metrics
cron.schedule('0 0 * * *', async () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const stats = await aggregateNotificationStats(yesterday);
  await db.notification_analytics.insert(stats);
});
```

**Deliverables:**
- [ ] Analytics tables & schemas
- [ ] Daily aggregation job
- [ ] Dashboard React components
- [ ] Real-time metrics API
- [ ] Charts & visualizations
- [ ] Admin access control

**Acceptance Criteria:**
- Dashboard loads in <2 seconds
- Metrics accurate and up-to-date
- All required metrics displayed
- Filtering works correctly
- Mobile responsive

---

#### Task 5.4: Admin Alert System
**Duration:** 2 days  
**Dependencies:** Task 5.2  
**Owner:** Backend Lead

**Alert Triggers:**
- Notification delivery rate < 90%
- Error rate > 5%
- Service provider downtime
- Failed payment notifications
- System overload (queue > 10,000)

**Implementation:**
```typescript
async function checkHealthMetrics() {
  const metrics = await getMetrics('last_hour');
  
  if (metrics.deliveryRate < 0.90) {
    await alertAdmin('LOW_DELIVERY_RATE', metrics);
  }
  
  if (metrics.errorRate > 0.05) {
    await alertAdmin('HIGH_ERROR_RATE', metrics);
  }
  
  // ... more checks
}

async function alertAdmin(alertType: string, data: any) {
  // Send email to admin
  // Create in-app notification
  // Log to monitoring service (Sentry, DataDog, etc.)
}
```

**Alert Channels:**
- Email to admin
- In-app notification
- SMS (critical alerts only)
- Third-party monitoring (Sentry/DataDog)

**Deliverables:**
- [ ] Alert trigger logic
- [ ] Alert email templates
- [ ] Admin notification system
- [ ] Third-party integration
- [ ] Unit tests

**Acceptance Criteria:**
- Alerts trigger correctly
- Admins receive immediate notification
- Historical alert data stored
- Can acknowledge & resolve alerts

---

#### Task 5.5: Documentation & Knowledge Base
**Duration:** 2 days  
**Dependencies:** All Phase 5 tasks  
**Owner:** Tech Lead

**Documentation to Create:**
- [ ] Error handling guide
- [ ] Troubleshooting guide
- [ ] Monitoring guide
- [ ] Dashboard user guide
- [ ] Admin procedures
- [ ] Incident response playbook

**Deliverables:**
- [ ] Complete documentation
- [ ] Screenshots & examples
- [ ] Video tutorials (optional)
- [ ] Runbook for common issues

---

### Phase 5 Summary

| Task | Duration | Owner | Status |
|------|----------|-------|--------|
| 5.1: Retry Mechanism | 2-3 days | Backend | Not Started |
| 5.2: Error Notifications | 2 days | Backend | Not Started |
| 5.3: Analytics Dashboard | 3-4 days | Full Stack | Not Started |
| 5.4: Admin Alerts | 2 days | Backend | Not Started |
| 5.5: Documentation | 2 days | Tech Lead | Not Started |

**Phase 5 Success Criteria:**
- ✅ Retry mechanism working reliably
- ✅ Dashboard shows all metrics
- ✅ Admins alerted to issues
- ✅ Error rate trackable & improvable
- ✅ Documentation complete
- ✅ System resilient to failures

---

## Phase 6: Testing & Optimization (Week 10)

### Objective
Comprehensive testing, performance optimization, and production readiness.

### Tasks

#### Task 6.1: Unit Testing
**Duration:** 2 days  
**Dependencies:** All previous phases  
**Owner:** QA Lead

**Coverage Targets:**
- Email service: 90%+
- SMS service: 90%+
- WhatsApp service: 85%+
- Core notification service: 95%+
- Retry logic: 100%
- Error handling: 95%+

**Test Files to Create:**
```
tests/
├── emailService.test.ts
├── smsService.test.ts
├── whatsappService.test.ts
├── notificationService.test.ts
├── retryLogic.test.ts
└── errorHandling.test.ts
```

**Example Tests:**
```typescript
describe('EmailService', () => {
  it('should send email successfully', async () => {
    const result = await emailService.send({...});
    expect(result.status).toBe('sent');
  });
  
  it('should handle invalid email', async () => {
    expect(() => emailService.send('invalid')).toThrow();
  });
  
  it('should include all template variables', async () => {
    // Verify all {{variables}} are replaced
  });
});
```

**Deliverables:**
- [ ] Unit tests for all services
- [ ] Test coverage report (90%+)
- [ ] Test documentation
- [ ] CI/CD pipeline integration

**Acceptance Criteria:**
- All unit tests passing
- >90% code coverage
- No critical/high severity issues

---

#### Task 6.2: Integration Testing
**Duration:** 2-3 days  
**Dependencies:** All previous phases  
**Owner:** QA Lead

**Integration Test Scenarios:**

**1. Complete User Journey:**
- [ ] User signup → Email + SMS
- [ ] Password reset → Works end-to-end
- [ ] Cart addition → Email sent, batched correctly
- [ ] Cart abandonment → Reminders at 24h & 48h
- [ ] Order placement → Confirmation email
- [ ] Payment processing → Email + SMS + WhatsApp
- [ ] Order tracking → Status emails
- [ ] Preferences → Respected in notifications

**2. Multi-Channel Tests:**
- [ ] Primary channel fails → Secondary works
- [ ] All channels fail → Dashboard alert
- [ ] User preferences → Honored

**3. Database Tests:**
- [ ] Data consistency
- [ ] Foreign key constraints
- [ ] Index performance
- [ ] Concurrent operations

**4. External Service Tests:**
- [ ] SendGrid integration
- [ ] Twilio (SMS) integration
- [ ] Twilio WhatsApp integration
- [ ] Razorpay webhook handling

**Deliverables:**
- [ ] Integration test suite
- [ ] Test data fixtures
- [ ] Test results report
- [ ] Performance baseline

**Acceptance Criteria:**
- All integration tests passing
- No race conditions
- Consistent data across tests
- >95% pass rate

---

#### Task 6.3: End-to-End Testing
**Duration:** 2 days  
**Dependencies:** All previous phases  
**Owner:** QA Lead

**E2E Test Scenarios (Using Playwright/Cypress):**
1. Complete signup flow with notification delivery
2. Password reset with link verification
3. Cart to order journey
4. Payment flow with confirmation
5. Order tracking updates
6. Notification preferences management

**Tools:** Playwright or Cypress

**Example E2E Test:**
```typescript
test('Complete order flow with notifications', async ({ page }) => {
  // Navigate to site
  await page.goto('https://aonetop.com');
  
  // Login
  await page.fill('[name=email]', 'test@example.com');
  await page.fill('[name=password]', 'password');
  await page.click('button[type=submit]');
  
  // Add to cart
  await page.click('[data-testid=product-1-add-btn]');
  
  // Verify email notification in test mailbox
  const emails = await getTestEmails('test@example.com');
  expect(emails).toContainEmail({
    subject: /Item Added to Your Cart/
  });
  
  // Proceed to checkout
  // ...
});
```

**Deliverables:**
- [ ] E2E test suite
- [ ] Test scenarios documented
- [ ] Test data management
- [ ] CI/CD integration

**Acceptance Criteria:**
- All happy path scenarios tested
- All critical user flows working
- No critical failures
- Tests maintainable

---

#### Task 6.4: Performance Testing & Optimization
**Duration:** 2-3 days  
**Dependencies:** Phases 1-5  
**Owner:** Backend Lead

**Performance Targets:**
- Email send time: < 2 seconds
- SMS send time: < 2 seconds
- WhatsApp send time: < 3 seconds
- Batch operations: < 5 seconds for 100 notifications
- Dashboard load: < 2 seconds
- API response: < 500ms

**Load Testing Scenarios:**
```
Scenario 1: Peak load
- 1,000 notifications/minute
- All channels
- Verify no dropped notifications

Scenario 2: Concurrent signups
- 100 users signing up simultaneously
- Email + SMS for each
- Verify all delivered

Scenario 3: Batch operations
- 10,000 abandoned cart reminders
- Verify database doesn't timeout
- Check queue doesn't overflow
```

**Tools:** Apache JMeter or k6

**Optimization Opportunities:**
1. Database indexing (verify indexes on frequently queried columns)
2. Query optimization (N+1 query detection)
3. Caching (template caching, user preference caching)
4. Connection pooling (database & service provider APIs)
5. Async processing (all non-blocking operations)

**Implementation:**
```typescript
// Add caching for templates
const templateCache = new Map<string, string>();

async function getTemplate(templateName: string) {
  if (templateCache.has(templateName)) {
    return templateCache.get(templateName);
  }
  
  const template = await db.templates.findOne({ name: templateName });
  templateCache.set(templateName, template.content);
  return template.content;
}

// Add monitoring
const metrics = {
  emailSendTime: new Histogram('email_send_time_ms'),
  smsSendTime: new Histogram('sms_send_time_ms'),
  dbQueryTime: new Histogram('db_query_time_ms')
};
```

**Deliverables:**
- [ ] Load testing report
- [ ] Performance metrics baseline
- [ ] Optimization recommendations implemented
- [ ] Monitoring setup for production

**Acceptance Criteria:**
- All performance targets met
- Load tests passing at 2x expected capacity
- Database handles concurrent operations
- No memory leaks

---

#### Task 6.5: Security & Compliance Audit
**Duration:** 2 days  
**Dependencies:** All previous phases  
**Owner:** Security Lead

**Security Checklist:**
- [ ] No hardcoded secrets (use env variables)
- [ ] API keys never logged
- [ ] No sensitive data in emails/SMS
- [ ] Password reset tokens one-time use
- [ ] Rate limiting on sensitive endpoints
- [ ] CSRF protection on forms
- [ ] SQL injection protection
- [ ] XSS prevention
- [ ] HTTPS for all external links
- [ ] PCI compliance for payment data
- [ ] GDPR compliance (user consent, data deletion)
- [ ] CCPA compliance (California users)
- [ ] RLS policies on user data

**Compliance Checks:**
- [ ] User data deletion working
- [ ] Unsubscribe honored
- [ ] Preferences stored & respected
- [ ] Audit logs for all changes
- [ ] Privacy policy updated

**Security Test Example:**
```typescript
describe('Security', () => {
  it('should not log sensitive data', async () => {
    const logs = await getLogs();
    expect(logs).not.toContain(/password|token|secret|card/i);
  });
  
  it('should validate email before sending', async () => {
    expect(() => emailService.send('invalid-email')).toThrow();
  });
  
  it('should enforce rate limits', async () => {
    for (let i = 0; i < 101; i++) {
      const result = await passwordResetService.requestReset(email);
      if (i > 5) expect(result.status).toBe('rate_limited');
    }
  });
});
```

**Deliverables:**
- [ ] Security audit report
- [ ] Compliance checklist completed
- [ ] Vulnerabilities fixed
- [ ] Security documentation

**Acceptance Criteria:**
- No critical/high severity vulnerabilities
- GDPR/CCPA compliant
- PCI DSS compliant (if handling payments)
- Audit trail complete

---

#### Task 6.6: Production Deployment Preparation
**Duration:** 1-2 days  
**Dependencies:** All Phase 6 tasks  
**Owner:** DevOps Lead

**Pre-Deployment Checklist:**
- [ ] All tests passing
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Database migrations ready
- [ ] Environment variables configured
- [ ] API keys stored in vault
- [ ] Monitoring & alerts configured
- [ ] Backup & recovery plan in place
- [ ] Rollback plan documented
- [ ] Load balancer configured
- [ ] CDN configured (for email assets)
- [ ] SSL certificates valid

**Deployment Plan:**
```markdown
## Deployment Steps

### Pre-Deployment (1 hour before)
1. Notify stakeholders
2. Create database backup
3. Test backup restoration
4. Prepare rollback scripts

### Deployment Phase 1 (Database)
1. Run migrations (schema changes)
2. Verify schema
3. Test connections

### Deployment Phase 2 (Code)
1. Deploy services to staging
2. Run smoke tests
3. Deploy to production (canary/blue-green)
4. Monitor error rates

### Post-Deployment (2 hours after)
1. Monitor system metrics
2. Check notification delivery
3. Verify no errors in logs
4. Test critical user journeys
5. Document any issues

### Rollback Plan
If critical issues:
1. Revert code deployment
2. Rollback database migrations
3. Clear caches
4. Notify users if needed
```

**Deliverables:**
- [ ] Deployment guide
- [ ] Rollback procedures
- [ ] Monitoring setup
- [ ] On-call procedures

**Acceptance Criteria:**
- Deployment can be executed safely
- Rollback available if needed
- Monitoring alerts configured
- Team trained on procedures

---

#### Task 6.7: UAT (User Acceptance Testing)
**Duration:** 2-3 days  
**Dependencies:** Production deployment  
**Owner:** Product Lead

**Test Users:**
- Internal team members (5-10)
- Sample of real users (10-20, if possible)
- Customer support team

**Testing Scenarios:**
- Signup with notification preferences
- Cart operations with email notifications
- Order placement with multi-channel notifications
- Payment confirmation
- Order tracking
- Preference management

**Feedback Collection:**
- Email delivery experience
- Email/SMS content clarity
- Preference management usability
- Any missing features

**Deliverables:**
- [ ] UAT test plan
- [ ] Feedback report
- [ ] Issues/bugs documented
- [ ] UAT sign-off

**Acceptance Criteria:**
- >90% test scenarios passed
- No critical issues from users
- Users understand notification system
- Positive feedback on experience

---

### Phase 6 Summary

| Task | Duration | Owner | Status |
|------|----------|-------|--------|
| 6.1: Unit Testing | 2 days | QA | Not Started |
| 6.2: Integration Testing | 2-3 days | QA | Not Started |
| 6.3: E2E Testing | 2 days | QA | Not Started |
| 6.4: Performance Testing | 2-3 days | Backend | Not Started |
| 6.5: Security Audit | 2 days | Security | Not Started |
| 6.6: Deployment Prep | 1-2 days | DevOps | Not Started |
| 6.7: UAT | 2-3 days | Product | Not Started |

**Phase 6 Success Criteria:**
- ✅ >90% unit test coverage
- ✅ All integration tests passing
- ✅ All E2E scenarios working
- ✅ Performance targets met
- ✅ Security audit passed
- ✅ UAT sign-off obtained
- ✅ Ready for production

---

## Timeline Summary

```
Week 1-2:  Phase 1 - Foundation
├─ Database schema
├─ Email service
├─ SMS service
├─ Core notification service
├─ Event listeners
└─ Testing & documentation

Week 3-4:  Phase 2 - Core Notifications
├─ Signup notifications
├─ Password reset
├─ Profile update
├─ Preferences UI
└─ Integration testing

Week 5-6:  Phase 3 - Cart & Order
├─ Cart addition
├─ Cart abandonment
├─ Order confirmation
├─ Order tracking
└─ Testing

Week 7-8:  Phase 4 - Payment & WhatsApp
├─ Payment confirmation
├─ WhatsApp integration
├─ Multi-channel logic
├─ Edge cases
└─ Testing

Week 9:    Phase 5 - Error Handling
├─ Retry mechanism
├─ Error notifications
├─ Analytics dashboard
├─ Admin alerts
└─ Documentation

Week 10:   Phase 6 - Testing & Optimization
├─ Unit testing
├─ Integration testing
├─ E2E testing
├─ Performance testing
├─ Security audit
├─ Deployment prep
└─ UAT
```

---

## Resource Requirements

### Team Composition
- **Backend Lead:** 1 person (full-time, Weeks 1-10)
- **Frontend Lead:** 1 person (Weeks 3-4, 5-6, part-time)
- **QA Lead:** 1 person (Weeks 2-10, part-time to full-time)
- **DevOps Lead:** 0.5 person (Weeks 1, 9-10)
- **Security Lead:** 0.5 person (Week 10)
- **Product Lead:** 0.5 person (Week 10)

**Total:** ~3.5-4 FTE

### Tools & Services Required
- SendGrid account (email service)
- Twilio account (SMS + WhatsApp)
- Supabase project (database)
- Razorpay account (payment processing)
- Monitoring tool (DataDog, Sentry, or similar)
- Testing tools (Jest, Playwright, JMeter)

### Infrastructure
- Database: Supabase PostgreSQL
- Message Queue: Bull (Redis-based) for background jobs
- Caching: Redis
- Monitoring: ELK Stack or Cloud-based monitoring

---

## Risk Management & Mitigation

### Identified Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| Email deliverability issues | High | Medium | Use reputable provider (SendGrid), warm up IP, monitor delivery rates |
| Webhook failures (payment) | Critical | Low | Implement robust webhook validation, retry logic, manual verification |
| Database performance under load | High | Medium | Proper indexing, connection pooling, load testing |
| Third-party service outages | High | Low | Implement fallback channels, monitoring, alert system |
| User opt-out/preference not respected | High | Medium | Comprehensive testing, clear consent UI, audit logs |
| Data privacy violations | Critical | Low | Security audit, GDPR/CCPA compliance check, legal review |
| Notification spam | Medium | Medium | Rate limiting, preference management, clear unsubscribe |

### Mitigation Strategies

**Email Deliverability:**
- Use SendGrid (99.9% uptime SLA)
- Implement SPF, DKIM, DMARC
- Monitor bounce rates
- Warm up IP address
- Maintain sender reputation

**Webhook Reliability:**
- Validate webhook signatures
- Implement idempotency checks
- Retry failed webhooks
- Maintain transaction log
- Manual reconciliation process

**Database Performance:**
- Load testing at 2x expected capacity
- Proper indexing strategy
- Connection pooling
- Query optimization
- Archiving old notification logs

**User Privacy:**
- Clear consent UI
- Preference validation
- Audit logging
- Right to deletion
- GDPR/CCPA compliance

---

## Success Metrics

### Delivery Metrics
- Email delivery rate: ≥ 95%
- SMS delivery rate: ≥ 98%
- WhatsApp delivery rate: ≥ 95%
- Notification latency: < 2 seconds (95th percentile)

### User Experience
- User satisfaction: ≥ 4/5 stars
- Opt-in rate: ≥ 80%
- Unsubscribe rate: < 5%
- Click-through rate: ≥ 25%

### System Reliability
- Uptime: ≥ 99.9%
- Error rate: < 1%
- Retry success rate: ≥ 90%
- Zero data loss

### Business Impact
- Increased order completion (via reminders)
- Improved customer satisfaction
- Reduced support tickets (via clear communication)
- Better order tracking experience

---

## Approval & Sign-Off

**Document Prepared By:** Development Team  
**Reviewed By:** [Product Manager]  
**Approved By:** [Project Lead]  
**Last Updated:** 24 January 2026  

---

## Next Steps

1. **Team Alignment** (Day 1)
   - Review this plan with entire team
   - Clarify roles & responsibilities
   - Answer questions & concerns

2. **Tool Setup** (Days 1-2)
   - Create SendGrid account
   - Create Twilio account
   - Set up Supabase project
   - Configure environment variables

3. **Phase 1 Kickoff** (Week 1)
   - Begin database schema setup
   - Set up email service integration
   - Start SMS service integration

---

**For questions or updates, please contact the Development Team.**
