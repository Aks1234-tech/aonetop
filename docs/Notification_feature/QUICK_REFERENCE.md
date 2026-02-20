# Notification System - Quick Reference ✅

**Last Updated:** 24 January 2026  
**Architecture:** Hybrid (Supabase + Custom Edge Functions)  
**Status:** Production Ready

---

## 🎯 At a Glance

### Who Sends What?

| Email | Sent By | When | Example |
|-------|---------|------|---------|
| Sign up verification | **Supabase** | User signs up | "Verify your email" |
| Password reset | **Supabase** | User forgets password | "Reset your password" |
| Welcome | **Our Edge Function** | After signup confirmed | "Welcome to AONet!" |
| Profile update | **Our Edge Function** | User edits profile | "You changed your name" |
| Order confirmation | ⏳ Coming soon | After order placed | "Order #123 confirmed" |
| Order tracking | ⏳ Coming soon | Shipping update | "Your order shipped" |
| Payment receipt | ⏳ Coming soon | After payment | "Payment successful" |

---

## 📁 File Structure

### Keep These (Production)
```
src/pages/
├── Signup.tsx                    # Uses Auth + send-signup-email
├── ForgotPassword.tsx            # Uses Auth only
└── Profile.tsx                   # Uses send-profile-update-email

src/hooks/
└── useNotifications.ts           # React notification hooks

src/lib/
├── notificationService.ts        # Core orchestration
└── smsService.ts                 # SMS support (commented out)

supabase/functions/
├── send-signup-email/            # Welcome email
├── send-profile-update-email/    # Change notification
└── send-email-internal/          # Nodemailer SMTP
```

### Delete These (Deprecated)
```
src/lib/
├── signupNotification.ts         # ❌ Moved to Edge Function
├── passwordResetNotification.ts  # ❌ Removed (Supabase handles)
└── profileUpdateNotification.ts  # ❌ Moved to Edge Function

supabase/functions/
└── send-password-reset-email/    # ❌ Not needed (Supabase handles)
```

---

## 🔄 Current Flows

### 1. User Signup
```
User → Signup.tsx
  ↓
auth.signUp()
  ↓ Supabase auto-sends verification email
  ↓
functions.invoke('send-signup-email')
  ↓ Our function sends welcome email
  ↓
User receives 2 emails:
✅ Verification link (Supabase)
✅ Welcome message (Us)
```

### 2. Password Reset
```
User → ForgotPassword.tsx
  ↓
auth.resetPasswordForEmail()
  ↓ Supabase auto-sends reset link
  ↓
User receives 1 email:
✅ Reset link (Supabase)
```

### 3. Profile Update
```
User → Profile.tsx
  ↓
updateProfile()
  ↓
functions.invoke('send-profile-update-email')
  ↓ Our function sends notification
  ↓
User receives 1 email:
✅ Change notification (Us)
```

---

## 💻 Code Examples

### Triggering Signup Flow
```typescript
// Signup.tsx
const { error } = await supabase.auth.signUp({
  email: email,
  password: password,
  options: { data: { full_name: fullName } }
});

// Supabase sends verification email automatically
// Then send welcome email
await supabase.functions.invoke('send-signup-email', {
  body: { userId: session.user.id, email, fullName }
});
```

### Triggering Password Reset
```typescript
// ForgotPassword.tsx
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password`
});
// That's it! Supabase sends reset email automatically
```

### Triggering Profile Update Notification
```typescript
// Profile.tsx
await updateProfile({ full_name: newName, phone: newPhone });

// Then send notification
await supabase.functions.invoke('send-profile-update-email', {
  body: {
    userId: user.id,
    email: user.email,
    fullName: newName,
    changedFields: [...],
    ipAddress: 'x.x.x.x',
    timestamp: new Date().toISOString()
  }
});
```

---

## 📊 Email Frequency (Monthly, ~100 new users)

| Type | Count |
|------|-------|
| Sign up verification | ~100 |
| Welcome emails | ~100 |
| Password resets | ~50 |
| Profile updates | ~200 |
| **TOTAL** | **~450** |

---

## 🧪 Quick Test Checklist

```
□ Signup
  □ Create account
  □ Receive verification email
  □ Receive welcome email
  □ Verify account
  □ Can log in

□ Forgot Password
  □ Click "Forgot Password"
  □ Enter email
  □ Receive reset email
  □ Click reset link
  □ Set new password
  □ Can log in with new password

□ Profile Update
  □ Log in
  □ Go to profile
  □ Edit name or phone
  □ Save
  □ Receive change notification email
  □ Email shows correct changes
```

---

## ⚙️ Configuration

### Required Environment Variables
```env
# Gmail credentials
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password

# Supabase (auto-configured)
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
```

### Optional Customization
```env
# Email templates
COMPANY_NAME=9 Planet Impex
COMPANY_PHONE=+91-XXX-XXX-XXXX
COMPANY_EMAIL=support@aonetop.com
WEBSITE_URL=https://aonetop.com
```

---

## 🚨 Troubleshooting

### Verification email not arriving?
1. Check spam folder
2. Check Supabase Auth settings
3. Verify SMTP credentials

### Welcome email not arriving?
1. Check spam folder
2. Check Edge Function logs
3. Verify GMAIL_USER in .env

### Reset email not arriving?
1. Check spam folder
2. Verify email exists in Supabase
3. Check rate limiting

### Email has wrong content?
1. Check Edge Function template
2. Verify template variables
3. Check recipient email format

---

## 📈 Next Phase (Order Emails)

### Needed Functions
```
send-order-confirmation/        # Order placed
send-order-tracking/            # Shipping update
send-payment-receipt/           # Invoice + receipt
```

### Trigger Points
```
Checkout.tsx → Order created → send-order-confirmation
Webhook → Shipping updated → send-order-tracking
Webhook → Payment confirmed → send-payment-receipt
```

---

## 🔐 Security Notes

✅ **Supabase Auth Emails:**
- 24-hour token expiration
- One-time use only
- Rate limited
- SPF/DKIM ready

✅ **Our Custom Emails:**
- Validate all inputs
- Log all sends
- Check user auth
- Graceful error handling

⚠️ **To Remember:**
- Never log sensitive data
- Validate redirectURIs
- Check user permissions
- Test with real emails

---

## 📞 Support

### Check These Files First
1. `SIMPLIFIED_ARCHITECTURE.md` - System overview
2. `CLEANUP_SUMMARY.md` - What changed
3. `FRONTEND_INTEGRATION_COMPLETE.md` - Testing guide
4. `API_REFERENCE.md` - Function signatures

### Common Issues
- See Troubleshooting section above
- Check browser console for errors
- Check Supabase logs in dashboard
- Check Edge Function logs

---

## ✅ Deployment Checklist

```
□ Environment variables set (.env.local)
□ Supabase Auth configured
□ Edge Functions deployed
□ Email templates tested
□ Signup flow tested end-to-end
□ Password reset tested end-to-end
□ Profile update tested end-to-end
□ Check email spam folder
□ Monitor for delivery issues
□ Set up email alerts
```

---

## 📊 System Health

| Component | Status | Last Checked |
|-----------|--------|--------------|
| Supabase Auth | ✅ Working | 24 Jan 2026 |
| send-signup-email | ✅ Working | 24 Jan 2026 |
| send-profile-update-email | ✅ Working | 24 Jan 2026 |
| send-email-internal | ✅ Configured | 24 Jan 2026 |
| Order emails | ⏳ Pending | - |
| SMS notifications | 🔴 Disabled | - |

---

**Quick Links:**
- Docs: `docs/Notification_feature/`
- Source: `src/pages/` + `supabase/functions/`
- Tests: `src/lib/__tests__/`

**Status:** ✅ Production Ready  
**Last Update:** 24 January 2026  
**Version:** 2.0
