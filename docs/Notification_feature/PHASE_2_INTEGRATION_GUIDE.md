# Phase 2: Notification Integration Guide

**Status:** ✅ Complete  
**Date:** 24 January 2026  
**Features:** Account Signup, Password Reset, Profile Update (Email-only)

---

## 📋 Overview

Phase 2 provides three ready-to-use notification handlers:

| Notification | File | Purpose | Trigger |
|---|---|---|---|
| **Signup Welcome** | `signupNotification.ts` | Send welcome email to new users | User creates account |
| **Password Reset** | `passwordResetNotification.ts` | Send reset link via email | User requests password reset |
| **Profile Update** | `profileUpdateNotification.ts` | Notify of profile changes | User updates sensitive fields |

---

## 🎯 Quick Start

### 1. Signup Welcome Email

```typescript
import { sendSignupWelcomeEmail } from '@/lib/signupNotification';

// Call this when user signs up
await sendSignupWelcomeEmail({
  userId: 'user-uuid',
  email: 'user@example.com',
  fullName: 'John Doe',
  phone: '+919876543210', // optional
});
```

### 2. Password Reset Email

```typescript
import { sendPasswordResetEmail } from '@/lib/passwordResetNotification';

// Call this when user requests password reset
await sendPasswordResetEmail({
  userId: 'user-uuid',
  email: 'user@example.com',
  fullName: 'John Doe',
  resetToken: 'secure-random-token',
  resetLink: 'https://aonetop.com/reset?token=...',
  expiresInMinutes: 30,
});
```

### 3. Profile Update Notification

```typescript
import { sendProfileUpdateNotification } from '@/lib/profileUpdateNotification';

// Call this when user updates their profile
await sendProfileUpdateNotification({
  userId: 'user-uuid',
  email: 'user@example.com',
  fullName: 'John Doe',
  changedFields: [
    { field: 'Email', oldValue: 'old@example.com', newValue: 'new@example.com' },
    { field: 'Phone', oldValue: '9876543210', newValue: '9876543211' }
  ],
  ipAddress: '192.168.1.1',
  timestamp: new Date(),
});
```

---

## 📁 File Structure

```
src/lib/
├── notificationService.ts ............. Core service (EMAIL ONLY)
├── emailService.ts ................... Gmail provider
├── smsService.ts ..................... Twilio (commented out)
├── signupNotification.ts ............ ✨ Signup handler
├── passwordResetNotification.ts ..... ✨ Password reset handler
├── profileUpdateNotification.ts ..... ✨ Profile update handler
└── supabase.ts ....................... Database client

src/hooks/
├── useNotifications.ts ............... React hooks
└── useSignupNotification.ts ......... (coming Phase 2)

docs/Notification_feature/
├── PHASE_2_INTEGRATION_GUIDE.md ... 👈 You are here
├── QUICK_START_GUIDE.md ............ Setup instructions
├── EXECUTION_PLAN.md .............. Full timeline
```

---

## 🔧 Integration Examples

### Example 1: Integrate with Signup Page

**File:** `src/pages/Signup.tsx`

```typescript
import { sendSignupWelcomeEmail } from '@/lib/signupNotification';
import { supabase } from '@/lib/supabase';

export default function SignupPage() {
  const handleSignup = async (email: string, password: string, fullName: string) => {
    try {
      // Step 1: Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      });

      if (error) throw error;

      // Step 2: Send welcome email
      if (data.user) {
        try {
          await sendSignupWelcomeEmail({
            userId: data.user.id,
            email: data.user.email!,
            fullName: fullName,
          });
          console.log('✅ Welcome email sent');
        } catch (emailError) {
          console.error('⚠️  Email failed:', emailError);
          // Don't block signup if email fails
        }
      }

      // Step 3: Redirect to login
      navigate('/login');
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  return (
    <div>
      {/* Your signup form */}
      <form onSubmit={(e) => {
        e.preventDefault();
        handleSignup(email, password, fullName);
      }}>
        {/* form fields */}
      </form>
    </div>
  );
}
```

---

### Example 2: Integrate with Password Reset

**File:** `src/pages/ForgotPassword.tsx`

```typescript
import { sendPasswordResetEmail } from '@/lib/passwordResetNotification';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export default function ForgotPasswordPage() {
  const handleForgotPassword = async (email: string) => {
    try {
      // Step 1: Find user
      const { data: user, error } = await supabase
        .from('auth.users')
        .select('id, email, raw_user_meta_data')
        .eq('email', email)
        .single();

      if (!user) {
        // Don't reveal if user exists (security)
        alert('If account exists, check your email');
        return;
      }

      // Step 2: Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetLink = `${window.location.origin}/reset-password?token=${resetToken}`;

      // Step 3: Store token in database
      await supabase
        .from('password_reset_tokens')
        .insert({
          user_id: user.id,
          token: resetToken,
          expires_at: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        });

      // Step 4: Send reset email
      await sendPasswordResetEmail({
        userId: user.id,
        email: user.email,
        fullName: user.raw_user_meta_data?.full_name || user.email,
        resetToken: resetToken,
        resetLink: resetLink,
        expiresInMinutes: 30,
      });

      alert('Check your email for password reset link');
    } catch (error) {
      console.error('Failed to send reset email:', error);
    }
  };

  return (
    <div>
      {/* Your forgot password form */}
      <form onSubmit={(e) => {
        e.preventDefault();
        handleForgotPassword(email);
      }}>
        {/* form fields */}
      </form>
    </div>
  );
}
```

---

### Example 3: Integrate with Profile Updates

**File:** `src/pages/Profile.tsx`

```typescript
import { sendProfileUpdateNotification } from '@/lib/profileUpdateNotification';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);

  const handleProfileUpdate = async (updatedData: any) => {
    try {
      const user = await supabase.auth.getUser();
      
      // Step 1: Get current profile
      const { data: currentProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.user.id)
        .single();

      // Step 2: Detect changes
      const changedFields = [];
      
      if (currentProfile?.email !== updatedData.email) {
        changedFields.push({
          field: 'Email',
          oldValue: currentProfile?.email,
          newValue: updatedData.email,
        });
      }

      if (currentProfile?.phone_number !== updatedData.phone) {
        changedFields.push({
          field: 'Phone Number',
          oldValue: currentProfile?.phone_number,
          newValue: updatedData.phone,
        });
      }

      if (currentProfile?.full_name !== updatedData.fullName) {
        changedFields.push({
          field: 'Full Name',
          oldValue: currentProfile?.full_name,
          newValue: updatedData.fullName,
        });
      }

      // Step 3: Update profile
      await supabase
        .from('user_profiles')
        .update(updatedData)
        .eq('user_id', user.user.id);

      // Step 4: Send notification if changes made
      if (changedFields.length > 0) {
        await sendProfileUpdateNotification({
          userId: user.user.id,
          email: user.user.email!,
          fullName: updatedData.fullName,
          changedFields: changedFields,
          ipAddress: await getClientIpAddress(),
          timestamp: new Date(),
        });
      }

      alert('Profile updated successfully');
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  return (
    <div>
      {/* Your profile form */}
      <form onSubmit={(e) => {
        e.preventDefault();
        handleProfileUpdate(formData);
      }}>
        {/* form fields */}
      </form>
    </div>
  );
}
```

---

## ✅ Current State: Email-Only Mode

All three notifications are currently configured for **email only**:

```typescript
// Current (email only)
channels: ['email']

// When SMS/WhatsApp are needed, change to:
channels: ['email', 'sms']        // Email + SMS
channels: ['email', 'whatsapp']   // Email + WhatsApp
channels: ['email', 'sms', 'whatsapp'] // All channels
```

The SMS and WhatsApp code is fully implemented but disabled:
- See `notificationService.ts` lines 180-190 (SMS commented out)
- See `notificationService.ts` lines 191-195 (WhatsApp commented out)

To enable SMS/WhatsApp later:
1. Open `notificationService.ts`
2. Uncomment the SMS/WhatsApp case statements
3. Remove the throw statements
4. Update your `.env.local` with SMS credentials
5. Change channels array to include 'sms' or 'whatsapp'

---

## 🧪 Testing Locally

### Test Signup Email

```bash
# Add this to src/lib/__tests__/testSignupNotification.js
import { sendSignupWelcomeEmail } from '../signupNotification';

await sendSignupWelcomeEmail({
  userId: 'test-user-123',
  email: 'your-email@example.com',
  fullName: 'Test User',
});
```

### Test Password Reset Email

```bash
# Add this to src/lib/__tests__/testPasswordReset.js
import { sendPasswordResetEmail } from '../passwordResetNotification';

await sendPasswordResetEmail({
  userId: 'test-user-123',
  email: 'your-email@example.com',
  fullName: 'Test User',
  resetToken: 'test-token-12345',
  resetLink: 'https://aonetop.com/reset?token=test-token-12345',
  expiresInMinutes: 30,
});
```

### Test Profile Update Email

```bash
# Add this to src/lib/__tests__/testProfileUpdate.js
import { sendProfileUpdateNotification } from '../profileUpdateNotification';

await sendProfileUpdateNotification({
  userId: 'test-user-123',
  email: 'your-email@example.com',
  fullName: 'Test User',
  changedFields: [
    { field: 'Email', oldValue: 'old@test.com', newValue: 'new@test.com' },
    { field: 'Phone', oldValue: '9876543210', newValue: '9876543211' }
  ],
  ipAddress: '127.0.0.1',
  timestamp: new Date(),
});
```

---

## 🔐 Security Considerations

### ✅ Implemented

1. **Email Verification** - Checks `email_verified` flag
2. **Phone Verification** - Checks `phone_verified` flag (for SMS)
3. **Unsubscribe Handling** - Respects user's unsubscribe list
4. **Quiet Hours** - Queues notifications during quiet hours
5. **Rate Limiting** - Prevents spam via database constraints
6. **Token Expiration** - Reset tokens expire in 30 minutes
7. **IP Logging** - Records IP address for profile changes
8. **Audit Trail** - All notifications logged to database

### ⚠️ Recommended Additional Steps

1. **Hash Reset Tokens** - Store only hash in database
2. **Encrypt Sensitive Data** - Encrypt phone numbers in logs
3. **Failed Attempt Tracking** - Monitor failed password reset attempts
4. **Suspicious Activity Alerts** - Alert on unusual profile changes
5. **2FA Before Reset** - Require 2FA for password reset
6. **DKIM/SPF/DMARC** - Configure email authentication (production)

---

## 📊 Next Steps

### Phase 2 Remaining Tasks
- [ ] Create notification preference UI component
- [ ] Implement email template management
- [ ] Add integration testing
- [ ] Set up notification logs dashboard

### Phase 3 (Order Notifications)
- [ ] Order confirmation email
- [ ] Order tracking email
- [ ] Delivery confirmation email
- [ ] Refund notification email

### Phase 4 (Payment & WhatsApp)
- [ ] Payment confirmation (Email + SMS + WhatsApp)
- [ ] Payment failed alert (Email + SMS)
- [ ] Invoice attachment in email

### Phase 5 (Error Handling & Monitoring)
- [ ] Failed notification retry logic
- [ ] Email bounce handling
- [ ] SMS delivery tracking
- [ ] Error alerting dashboard

### Phase 6 (Testing & Optimization)
- [ ] Integration tests for all flows
- [ ] Load testing
- [ ] Performance optimization
- [ ] Production deployment

---

## 📚 Related Documentation

- [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md) - Setup and configuration
- [EXECUTION_PLAN.md](./EXECUTION_PLAN.md) - Full implementation timeline
- [DATABASE_SETUP_GUIDE.md](./TASK_1_1_DATABASE_SETUP_GUIDE.md) - Database schema
- [RLS_POLICIES.md](./RLS_POLICIES_DOCUMENTATION.md) - Security policies
- [TWILIO_SETUP_GUIDE.md](./TWILIO_SETUP_GUIDE.md) - SMS/WhatsApp setup

---

## 🆘 Troubleshooting

**Q: Emails not being sent**
- A: Check `.env.local` for Gmail credentials and `email_verified` flag in database

**Q: Notification not appearing in logs**
- A: Check `notification_logs` table - may need to enable user contact info first

**Q: Want to enable SMS later**
- A: See section "Email-Only Mode" above for uncommenting instructions

**Q: Need WhatsApp instead of SMS**
- A: Change channel from `'sms'` to `'whatsapp'` in the handlers

---

**Version:** 1.0  
**Last Updated:** 24 January 2026  
**Author:** AONet Notification System  
**Status:** ✅ Production Ready for Email
