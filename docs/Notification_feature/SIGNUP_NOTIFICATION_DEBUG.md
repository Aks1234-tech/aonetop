# Signup Notification Debugging Guide ✅

**Date:** 24 January 2026  
**Issue:** Notification not triggered after signup  
**Status:** 🔧 Fixed

---

## 🐛 Problem Found & Fixed

### Root Cause
After `signUp()`, the code was trying to get the session with `getSession()`, but:
1. The session might not be available immediately
2. We weren't using the user ID returned from the signup response itself

### Solution
Extract the user ID directly from the signup response and use it immediately:

```typescript
// ✅ FIXED: Get userId from signup response
const { error: signupError, data: signupData } = await supabase.auth.signUp({...});
const userId = signupData?.user?.id;

// ✅ Then use it immediately
await supabase.functions.invoke('send-signup-email', {
  body: { userId, email, fullName }
});
```

---

## ✅ Changes Made

### 1. **src/pages/Signup.tsx**
**Changed from:**
```typescript
const { error } = await signUp(email, password, fullName);
// Get session after signup (might be undefined)
const { data: { session } } = await supabase.auth.getSession();
if (session?.user?.id) { ... }
```

**Changed to:**
```typescript
const { error: signupError, data: signupData } = await supabase.auth.signUp({...});
// Extract userId immediately from response
const userId = signupData?.user?.id;
if (userId) { ... }
```

### 2. **supabase/functions/send-email-internal/index.ts**
**Added:**
- ✅ Database logging to `notification_logs` table
- ✅ Detailed console logging for debugging
- ✅ Status tracking: pending → sent/failed
- ✅ Log ID returned in response

```typescript
// Log to database
const { data: logData } = await supabaseAdmin
  .from('notification_logs')
  .insert({
    user_id: userId,
    notification_type: type,
    channel: 'email',
    recipient: email,
    subject: emailContent.subject,
    status: 'pending',
  })
  .select('id')
  .single();

// Update status after processing
await supabaseAdmin
  .from('notification_logs')
  .update({ status: 'sent' })
  .eq('id', logId);
```

### 3. **supabase/functions/send-signup-email/index.ts**
**Added:**
- ✅ Better console logging with `[send-signup-email]` prefix
- ✅ Error tracking and logging
- ✅ Detailed step-by-step logging

---

## 🔍 How to Debug

### Step 1: Check Browser Console
After signing up, look for these logs:
```
✅ User created: [user-id-here]
📧 Sending welcome email to: user@email.com
✅ Welcome email function invoked: {...}
```

### Step 2: Check Supabase Function Logs
1. Go to Supabase Dashboard
2. Navigate to Edge Functions
3. Click on `send-signup-email`
4. Look for logs starting with `[send-signup-email]`

Expected logs:
```
[send-signup-email] Received request for user@email.com (userId: xxx)
[send-signup-email] Invoking send-email-internal function
[send-signup-email] Successfully processed: {...}
```

### Step 3: Check send-email-internal Logs
1. Go to Supabase Dashboard
2. Navigate to Edge Functions
3. Click on `send-email-internal`
4. Look for logs starting with `[send-email-internal]`

Expected logs:
```
[send-email-internal] Processing signup email for user@email.com
[send-email-internal] Logging email to database for [user-id]
[send-email-internal] Logged with ID: [log-id]
[send-email-internal] Email prepared for sending to user@email.com
[send-email-internal] Log status updated to sent
```

### Step 4: Check Database Logs
1. Open Supabase SQL Editor
2. Run this query:
```sql
SELECT * FROM notification_logs 
ORDER BY created_at DESC 
LIMIT 10;
```

You should see:
- ✅ `user_id` - User ID
- ✅ `notification_type` - "signup"
- ✅ `channel` - "email"
- ✅ `recipient` - User's email
- ✅ `status` - "sent" or "pending"
- ✅ `created_at` - Timestamp

---

## 📋 Checklist for Testing

```
□ Sign up with test account
  □ Enter email: testuser@example.com
  □ Enter password: password123
  □ Enter full name: Test User
  
□ Check browser console (F12)
  □ See "✅ User created: [id]"
  □ See "📧 Sending welcome email to: testuser@example.com"
  □ See "✅ Welcome email function invoked"
  
□ Check Supabase Function Logs
  □ send-signup-email shows "[send-signup-email] Received request"
  □ send-email-internal shows "[send-email-internal] Processing signup email"
  □ send-email-internal shows "Logged with ID:"
  □ No error messages
  
□ Check Database
  □ SELECT * FROM notification_logs ORDER BY created_at DESC LIMIT 1;
  □ See one record with:
    ✓ user_id = your user id
    ✓ notification_type = "signup"
    ✓ channel = "email"
    ✓ status = "sent"
  
□ Check Email
  □ Receive verification email from Supabase
  □ Receive welcome email (from our function)
```

---

## 🚨 Common Issues & Solutions

### Issue 1: No logs in database
**Check:**
1. Does `notification_logs` table exist?
   ```sql
   SELECT * FROM notification_logs LIMIT 1;
   ```
2. Do you have INSERT permissions?
   ```sql
   -- Check RLS policies
   SELECT * FROM pg_policies WHERE tablename = 'notification_logs';
   ```
3. Are the function logs showing database errors?
   - Look for `Database log error` in send-email-internal logs

**Fix:**
- Ensure RLS policy allows service_role to insert
- Verify table columns match: `user_id`, `notification_type`, `channel`, `recipient`, `status`, `created_at`

### Issue 2: Function not being invoked
**Check:**
1. Browser console for errors
2. Is there a console.error message?
3. Are the Edge Function names correct?
   - `send-signup-email` ✅
   - `send-email-internal` ✅

**Fix:**
- Deploy functions: `supabase functions deploy send-signup-email`
- Deploy functions: `supabase functions deploy send-email-internal`
- Restart dev server: `npm run dev`

### Issue 3: Missing userId
**Check:**
1. Browser console shows: `⚠️ No userId returned from signup`
2. Sign up response doesn't include user

**Fix:**
- Verify Supabase project has email confirmation OFF (if you want auto-login)
- Or handle email confirmation flow differently

### Issue 4: Function returns error
**Check:**
1. What error does browser console show?
2. What error do function logs show?
3. Is there a network error?

**Fix:**
- Check function deployment status
- Verify environment variables are set
- Check SUPABASE_URL and SERVICE_ROLE_KEY

---

## 🔧 Quick Fixes

### Re-deploy Functions
```bash
supabase functions deploy send-signup-email
supabase functions deploy send-email-internal
```

### Clear Cache and Restart
```bash
# Clear node modules
rm -rf node_modules/.vite

# Restart dev server
npm run dev
```

### Test Function Directly
Use Supabase API explorer or curl:
```bash
curl -X POST https://your-project.supabase.co/functions/v1/send-signup-email \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-id",
    "email": "test@example.com",
    "fullName": "Test User"
  }'
```

---

## 📊 Debug Information to Gather

When reporting issues, provide:

1. **Browser Console Output**
   - Copy everything after signup
   - Look for any red error messages

2. **Function Logs**
   - From Supabase Dashboard → Functions → send-signup-email
   - From Supabase Dashboard → Functions → send-email-internal
   - Copy last 10-20 lines

3. **Database Query Result**
   ```sql
   SELECT * FROM notification_logs 
   WHERE user_id = 'your-user-id' 
   ORDER BY created_at DESC;
   ```

4. **Account Details**
   - Email used for signup
   - Exact error message (if any)
   - Screenshot of console errors (if any)

---

## ✅ What Should Happen Now

### 1. User Fills Signup Form
```
Full Name: John Doe
Email: john@example.com
Password: ••••••
```

### 2. Clicks "Sign Up"
```
Frontend: Calls supabase.auth.signUp()
```

### 3. Browser Shows Success Message
```
"Account created! Please check your email..."
```

### 4. Browser Console Shows
```
✅ User created: [user-id]
📧 Sending welcome email to: john@example.com
✅ Welcome email function invoked: {...}
```

### 5. Supabase Function Logs Show
```
[send-signup-email] Received request for john@example.com
[send-signup-email] Invoking send-email-internal function
[send-email-internal] Processing signup email for john@example.com
[send-email-internal] Logging email to database
[send-email-internal] Logged with ID: [log-id]
[send-email-internal] Email prepared for sending
[send-email-internal] Log status updated to sent
```

### 6. Database Contains Log
```
SELECT * FROM notification_logs WHERE user_id = '[user-id]';

Result:
  id: [log-id]
  user_id: [user-id]
  notification_type: signup
  channel: email
  recipient: john@example.com
  subject: Welcome to AONet, John Doe!
  status: sent
  created_at: 2026-01-24T...
```

### 7. User Receives Emails
- ✅ Email 1: "Verify your email" (from Supabase)
- ✅ Email 2: "Welcome to AONet" (from our function)

---

## 📞 Still Not Working?

1. **Check all three locations:**
   - Browser console (F12)
   - Supabase function logs
   - Database notification_logs table

2. **Look for error messages** in any of the above

3. **Try manually testing** the function with curl

4. **Check deployment status:**
   - Are functions showing as "Active" in Supabase Dashboard?
   - Is the code deployed (not just local)?

5. **Verify permissions:**
   - Can the service_role user insert into notification_logs?
   - Are RLS policies correct?

---

**Updated:** 24 January 2026  
**Status:** ✅ Fixed with better logging  
**Next Step:** Test signup flow and check for logs
