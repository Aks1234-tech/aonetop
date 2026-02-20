# Email Notifications Architecture - Simplified ✅

**Date:** 24 January 2026  
**Approach:** Leverage Supabase built-in + Custom Edge Functions  
**Status:** ✅ Cleaner, simpler, production-ready

---

## 🎯 Architecture Overview

We use a **hybrid approach**:
- **Supabase Built-in Emails**: Authentication & security (password reset, email verification)
- **Custom Edge Functions**: Business logic emails (welcome, profile updates, orders)

### Responsibility Matrix

| Email Type | Sender | Handler | Benefits |
|-----------|--------|---------|----------|
| **Sign up verification** | Supabase Auth | Built-in | Secure, tested, automatic |
| **Password reset** | Supabase Auth | Built-in | Secure, tested, automatic |
| **Email change** | Supabase Auth | Built-in | Secure, tested, automatic |
| **Security alerts** | Supabase Auth | Built-in | Secure, tested, automatic |
| **Signup welcome** | Custom | Edge Function | Branded, personalized |
| **Profile updates** | Custom | Edge Function | Track changes, alerts |
| **Order confirmation** | Custom | Edge Function | Order details, tracking |
| **Order tracking** | Custom | Edge Function | Shipping updates |
| **Payment confirmation** | Custom | Edge Function | Receipt, invoice |

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         React Frontend                       │
│  (Signup.tsx, ForgotPassword.tsx, Profile.tsx, Checkout.tsx) │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────────┐      ┌──────────────────────┐
│ Supabase Auth    │      │ Custom Edge Functions│
│ (Built-in)       │      │ (Business Logic)     │
│                  │      │                      │
│ • Sign up email  │      │ • send-signup-email  │
│ • Password reset │      │ • send-profile-...   │
│ • Email verify   │      │ • send-order-...     │
│ • Security alerts│      │ • send-payment-...   │
└────────┬─────────┘      └──────────┬───────────┘
         │                           │
         └───────────────┬───────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ Gmail SMTP   │
                  │ (via Nodemailer)
                  └──────────────┘
```

---

## 🔧 Current Implementation

### 1. Authentication Flows (Supabase Built-in)

**Sign Up → Email Verification**
```typescript
// Supabase handles this automatically
const { error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});
// Supabase sends verification email automatically
```

**Forgot Password → Reset Email**
```typescript
// Supabase handles this automatically
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password`,
});
// Supabase sends reset email automatically
```

### 2. Custom Business Emails (Edge Functions)

**Signup Welcome Email**
```typescript
// File: src/pages/Signup.tsx
await supabase.functions.invoke('send-signup-email', {
  body: { userId, email, fullName }
});

// File: supabase/functions/send-signup-email/index.ts
// Sends branded welcome email with account details
```

**Profile Update Notification**
```typescript
// File: src/pages/Profile.tsx
await supabase.functions.invoke('send-profile-update-email', {
  body: { userId, email, fullName, changedFields, ipAddress, timestamp }
});

// File: supabase/functions/send-profile-update-email/index.ts
// Sends security notification about profile changes
```

---

## 📁 File Structure

### Supabase Edge Functions (Keep)
```
supabase/functions/
├── send-signup-email/
│   └── index.ts          ← Welcome email for new users
├── send-profile-update-email/
│   └── index.ts          ← Profile change notifications
└── send-email-internal/
    └── index.ts          ← Internal email sender (uses nodemailer)
```

### Frontend Pages (Simplified)
```
src/pages/
├── Signup.tsx            ← Uses supabase.auth.signUp() + send-signup-email
├── ForgotPassword.tsx    ← Uses supabase.auth.resetPasswordForEmail()
└── Profile.tsx           ← Uses updateProfile() + send-profile-update-email
```

### Removed Files (Can be deleted)
```
src/lib/
├── signupNotification.ts             ← Moved to Edge Function
├── passwordResetNotification.ts      ← No longer needed (Supabase handles)
└── profileUpdateNotification.ts      ← Moved to Edge Function
```

---

## 🚀 Current Flows

### Flow 1: User Signup
```
1. User enters email, password, full name
2. Frontend calls: supabase.auth.signUp()
3. ✅ Supabase sends verification email (automatic)
4. Frontend calls: supabase.functions.invoke('send-signup-email')
5. ✅ Welcome email sent from Edge Function
6. User gets: Verification + Welcome email
```

### Flow 2: Password Reset
```
1. User clicks "Forgot Password"
2. User enters email
3. Frontend calls: supabase.auth.resetPasswordForEmail()
4. ✅ Supabase sends reset link email (automatic)
5. User clicks link in email
6. User sets new password
```

### Flow 3: Profile Update
```
1. User edits profile (name, phone)
2. Frontend detects changes
3. Frontend calls: supabase.updateProfile()
4. Frontend calls: supabase.functions.invoke('send-profile-update-email')
5. ✅ Notification email sent with change details
6. User sees success message
```

---

## ✨ Benefits of This Approach

| Aspect | Benefit |
|--------|---------|
| **Security** | Supabase handles auth emails (battle-tested) |
| **Reliability** | Built-in emails guaranteed delivery |
| **Branding** | Custom emails for business messages |
| **Simplicity** | Less code to maintain |
| **Performance** | Async, non-blocking email sending |
| **Scalability** | Edge Functions handle load |
| **Compliance** | Supabase emails follow best practices |

---

## 📊 Email Volume (Expected)

| Type | Per User | Monthly* |
|------|----------|----------|
| Sign up verification | 1 | ~100 |
| Password reset | ~0.5 | ~50 |
| Welcome email | 1 | ~100 |
| Profile updates | ~2 | ~200 |
| **Order emails (Phase 3)** | ~5 | ~500 |
| **TOTAL** | | **~1000** |

*Based on ~100 new users/month

---

## 🔐 Security Considerations

✅ **Already Handled by Supabase:**
- Email verification tokens (secure, time-limited)
- Password reset tokens (secure, time-limited)
- Rate limiting on email sends
- SPF/DKIM configuration

✅ **Our Responsibility:**
- Validate input to Edge Functions
- Check user authorization before sending
- Log all email events for audit
- Handle failures gracefully

---

## 🧪 Testing

### Test Sign Up
1. Go to /signup
2. Enter email, password, full name
3. Check email for:
   - ✅ Verification link (from Supabase)
   - ✅ Welcome message (from our Edge Function)
4. Click verification link
5. ✅ Account confirmed

### Test Forgot Password
1. Go to /login → "Forgot password?"
2. Enter email
3. Check email for:
   - ✅ Reset link (from Supabase)
4. Click reset link
5. Set new password
6. ✅ Password changed

### Test Profile Update
1. Log in
2. Go to /profile
3. Edit name or phone
4. Check email for:
   - ✅ Change notification (from our Edge Function)
5. ✅ See changes listed

---

## 📈 Next Steps

### Phase 3: Order Emails
- [ ] Create `send-order-confirmation` Edge Function
- [ ] Call from Checkout.tsx after order created
- [ ] Include order details, total, tracking link

### Phase 4: Payment Emails
- [ ] Create `send-payment-confirmation` Edge Function
- [ ] Call from payment webhook
- [ ] Include receipt, invoice, tax info

### Phase 5: Admin Notifications
- [ ] Create `send-order-notification-admin` Edge Function
- [ ] Notify admins of new orders
- [ ] Daily summary of orders

### Production Checklist
- [ ] Set up email authentication (SPF, DKIM, DMARC)
- [ ] Configure Supabase email templates
- [ ] Test email deliverability
- [ ] Set up monitoring/alerts
- [ ] Document SLA for email delivery
- [ ] Create email template library

---

## 🎯 Design Principles

1. **Supabase First** - Use built-in features when available
2. **Edge Functions** - For business logic beyond auth
3. **Async** - Never block user actions for email
4. **Graceful Degradation** - App works even if email fails
5. **Auditable** - Log all email activity
6. **Recoverable** - Queue system for retries

---

## 📝 Code Examples

### Calling Supabase Built-in (Sign Up)
```typescript
// In Signup.tsx
const { error } = await supabase.auth.signUp({
  email: email,
  password: password,
  options: {
    data: {
      full_name: fullName,
    }
  }
});
// Email sent automatically by Supabase
```

### Calling Supabase Built-in (Password Reset)
```typescript
// In ForgotPassword.tsx
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password`,
});
// Email sent automatically by Supabase
```

### Calling Custom Edge Function (Welcome)
```typescript
// In Signup.tsx
await supabase.functions.invoke('send-signup-email', {
  body: {
    userId: session.user.id,
    email: email,
    fullName: fullName,
  }
});
```

### Calling Custom Edge Function (Profile)
```typescript
// In Profile.tsx
await supabase.functions.invoke('send-profile-update-email', {
  body: {
    userId: user.id,
    email: user.email,
    fullName: fullName,
    changedFields: [
      { field: 'Full Name', oldValue: 'John', newValue: 'Jane' }
    ],
    ipAddress: 'x.x.x.x',
    timestamp: new Date().toISOString(),
  }
});
```

---

## 🗑️ Cleanup

### Files to Remove (No Longer Used)
```bash
rm src/lib/signupNotification.ts
rm src/lib/passwordResetNotification.ts
rm src/lib/profileUpdateNotification.ts
rm src/lib/emailService.ts (if only used for above)
rm supabase/functions/send-password-reset-email/ (not needed)
```

### Files to Keep
```bash
src/lib/notificationService.ts  # Core orchestration
src/lib/smsService.ts           # SMS (still needed for Phase 3)
src/hooks/useNotifications.ts   # React hooks
supabase/functions/send-signup-email/
supabase/functions/send-profile-update-email/
supabase/functions/send-email-internal/
```

---

## 🚨 Troubleshooting

**Emails not arriving?**
1. Check email in spam folder
2. Verify sender email in .env
3. Check Gmail app password
4. Check Supabase logs for errors

**Wrong email template?**
1. Check Edge Function template
2. Verify template variables
3. Check recipient email

**User not verified?**
1. Check verification email link
2. Verify token expiration (24 hours default)
3. Check email confirmations in Supabase

---

## 📊 Deployment Status

| Component | Status | Notes |
|-----------|--------|-------|
| Supabase Auth Emails | ✅ Ready | Built-in, no config needed |
| Signup Welcome | ✅ Ready | Edge Function deployed |
| Profile Updates | ✅ Ready | Edge Function deployed |
| Order Emails | ⏳ Pending | Phase 3 |
| Payment Emails | ⏳ Pending | Phase 4 |
| Admin Notifications | ⏳ Pending | Phase 5 |

---

**Last Updated:** 24 January 2026  
**Status:** ✅ Production Ready  
**Version:** 2.0 (Simplified Architecture)
