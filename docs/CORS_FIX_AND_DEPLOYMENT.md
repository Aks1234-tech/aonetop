# CORS Fix and Edge Functions Deployment Guide

## Problem
Edge Functions were returning 500 errors with CORS issues because:
1. **CORS headers missing in error responses** - The functions had CORS headers only in the OPTIONS handler, not in actual responses
2. **Functions not deployed** - Need to deploy/redeploy to Supabase

## Solutions Applied

### 1. CORS Headers Fixed ✅
Updated all Edge Functions to include CORS headers in ALL responses:

**Before:**
```typescript
return new Response(JSON.stringify({ success: true }), {
  headers: { "Content-Type": "application/json" },  // ❌ Missing CORS!
  status: 200,
});
```

**After:**
```typescript
return new Response(JSON.stringify({ success: true }), {
  headers: { ...corsHeaders, "Content-Type": "application/json" },  // ✅ CORS included
  status: 200,
});
```

**Files Updated:**
- ✅ `supabase/functions/send-signup-email/index.ts`
- ✅ `supabase/functions/send-profile-update-email/index.ts`
- ✅ `supabase/functions/send-email-internal/index.ts`

All success (200) and error (400, 500) responses now include CORS headers.

## Deployment Steps

### Step 1: Install Supabase CLI (if not already installed)
```bash
npm install -g supabase
```

### Step 2: Login to Supabase
```bash
supabase login
```

### Step 3: Link to Your Project
```bash
cd /home/hackycoder/my_Data/aonetop
supabase link --project-ref <YOUR_PROJECT_REF>
```
Get `<YOUR_PROJECT_REF>` from your Supabase project URL: `https://[PROJECT_REF].supabase.co`

### Step 4: Deploy Functions
```bash
# Deploy send-signup-email
supabase functions deploy send-signup-email

# Deploy send-email-internal
supabase functions deploy send-email-internal

# Deploy send-profile-update-email
supabase functions deploy send-profile-update-email
```

### Step 5: Verify Deployment
Go to your Supabase Dashboard:
1. Navigate to Functions section
2. Check that all three functions show as "Active" ✅
3. Click each function to see recent logs

## Testing After Deployment

### Test 1: Verify Functions Exist
Try creating an account - you should see:
```
✅ User created: [userId]
📧 Sending welcome email to: [email]
✅ Welcome email function invoked: {response}
```

### Test 2: Check Database Logs
Query notification_logs table:
```sql
SELECT * FROM notification_logs 
ORDER BY created_at DESC 
LIMIT 5;
```

You should see:
- `type: 'signup'`
- `status: 'sent'` (after successful invocation)
- `message_id: [id]`
- `created_at: [timestamp]`

### Test 3: Verify Emails Received
Check the email used for signup - you should receive a welcome email with:
- Subject: "Welcome to AONet, [fullName]!"
- Branded HTML template
- CTA button to complete profile

## Environment Variables Required

Make sure these are set in your Supabase project (Settings → Configuration):

```env
# Email Configuration
GMAIL_USER=your-gmail@gmail.com
GMAIL_PASSWORD=your-app-password  # NOT your regular password!

# Supabase (usually auto-configured)
SUPABASE_URL=https://[project].supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Troubleshooting

### Issue: Functions Deploy but Return 500 Error
**Solution:**
1. Check function logs in Supabase Dashboard
2. Verify environment variables are set
3. Check that nodemailer can access Gmail credentials

### Issue: Still Getting CORS Errors
**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Redeploy functions: `supabase functions deploy send-signup-email`
3. Wait 30 seconds for cache invalidation
4. Try signup again

### Issue: Email Not Received
**Solution:**
1. Check notification_logs table for the request
2. If status is "sent": Check spam folder
3. If status is "failed": Check function logs for nodemailer error
4. If no log entry: Function not being invoked (check browser console)

## Current Status

✅ **Code Changes:** All CORS headers fixed in all functions
⏳ **Next Step:** Deploy functions using Supabase CLI
🎯 **Expected Result:** Signup flow will complete with welcome email sent

## Key Files Modified

1. [src/pages/Signup.tsx](../../src/pages/Signup.tsx#L1)
   - Already calling `supabase.functions.invoke('send-signup-email')`
   - Ready to work once functions are deployed

2. [supabase/functions/send-signup-email/index.ts](../../supabase/functions/send-signup-email/index.ts#L1)
   - ✅ CORS headers added to all responses

3. [supabase/functions/send-email-internal/index.ts](../../supabase/functions/send-email-internal/index.ts#L1)
   - ✅ CORS headers added to all responses
   - ✅ Database logging enabled

4. [supabase/functions/send-profile-update-email/index.ts](../../supabase/functions/send-profile-update-email/index.ts#L1)
   - ✅ CORS headers added to all responses
