# SMS Testing Guide - Twilio Trial Account Fix

**Status:** SMS not being received  
**Cause:** Twilio trial accounts can only send SMS to verified numbers  
**Solution:** Add your phone number to verified numbers in Twilio console

---

## ✅ Step 1: Verify Your Phone Number in Twilio Console

1. Go to: https://console.twilio.com/
2. Sign in with your credentials
3. Go to **Phone Numbers** → **Verify Numbers** (or **Manage Numbers**)
4. Click **+ Verify a Number**
5. Enter your phone number (e.g., +919876543210)
6. You'll receive a verification code via SMS
7. Enter the code to verify

---

## ✅ Step 2: Update `.env.local` with Your Verified Number

After verifying your number, update:

```bash
# In .env.local
TWILIO_TEST_RECIPIENT=+919876543210  # Your verified phone number
```

---

## ✅ Step 3: Run Updated SMS Test

```bash
node src/lib/__tests__/testSmsRecipient.js
```

This will:
1. Load your verified phone number from `.env.local`
2. Send a test SMS to your verified number
3. Confirm delivery status

---

## 📋 Alternative: Use Twilio Message Logs

If you want to check if SMS was sent (even if not received):

1. Go to: https://console.twilio.com/
2. Click **Logs** → **Message Logs**
3. Look for your message with status:
   - ✅ **Sent** = Successfully sent to provider
   - ⏳ **Queued** = Waiting to be sent
   - ❌ **Failed** = Not delivered (check error)

---

## 📞 Common SMS Errors

**Error: "Invalid 'To' parameter"**
- Solution: Use international format (+919876543210 or +1234567890)

**Error: "'To' number is not a valid mobile number"**
- Solution: The number must be a real mobile number (verified in trial)

**Error: "Account sent too many SMS"**
- Solution: Trial accounts have rate limits (usually 1 SMS every few seconds)

**Status: Undelivered**
- Solution: Check Twilio's message logs for the actual failure reason

---

## 🔐 Production: Upgrade from Trial

To remove verification requirements:
1. Go to Twilio Console
2. Click **Billing** → **Upgrade Account**
3. Add payment method
4. Production account can send to any number

---

## 📌 Tip: Check Twilio Status

```bash
# List your verified numbers (if you have API access)
curl -X GET "https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/OutgoingCallerIds.json" \
  -u "AccountSid:AuthToken"
```

---

**Need help?** Check your Twilio account settings at console.twilio.com
