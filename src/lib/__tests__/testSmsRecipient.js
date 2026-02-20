#!/usr/bin/env node

/**
 * SMS Recipient Test Script
 * Tests SMS delivery to a verified phone number
 * 
 * IMPORTANT: Before running this, add your phone number to 
 * Twilio verified numbers: https://console.twilio.com/
 * 
 * Run with: node src/lib/__tests__/testSmsRecipient.js
 */

import twilio from 'twilio';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config({ path: '.env.local' });

const twilioSid = process.env.TWILIO_ACCOUNT_SID;
const twilioToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
const testRecipient = process.env.TWILIO_TEST_RECIPIENT;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query) {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

async function checkTwilioAccount() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║        Twilio SMS Verification & Testing                    ║');
  console.log('║                  24 January 2026                           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  console.log('\n=== Twilio Account Information ===');
  console.log(`Account SID: ${twilioSid ? '✓ Configured' : '✗ Missing'}`);
  console.log(`Auth Token: ${twilioToken ? '✓ Configured' : '✗ Missing'}`);
  console.log(`From Phone: ${twilioPhone || '✗ Missing'}`);

  if (!twilioSid || !twilioToken || !twilioPhone) {
    console.error('\n✗ Missing Twilio credentials in .env.local');
    process.exit(1);
  }

  try {
    const client = twilio(twilioSid, twilioToken);
    
    console.log('\n=== Verifying Twilio Credentials ===');
    const account = await client.api.accounts(twilioSid).fetch();
    console.log(`✓ Account Name: ${account.friendlyName}`);
    console.log(`✓ Account Status: ${account.status}`);
    console.log(`✓ Account Type: ${account.type}`);
    
    return client;
  } catch (error) {
    console.error('\n✗ Failed to authenticate with Twilio:', error.message);
    process.exit(1);
  }
}

async function sendTestSMS(client, toNumber) {
  console.log('\n=== Sending Test SMS ===');
  try {
    console.log(`Sending from: ${twilioPhone}`);
    console.log(`Sending to: ${toNumber}`);
    console.log('Message: "AONet Test SMS - If you received this, SMS is working! ✓"');
    
    const message = await client.messages.create({
      body: 'AONet Test SMS - If you received this, SMS is working! ✓',
      from: twilioPhone,
      to: toNumber
    });

    console.log('\n✓ SMS sent successfully!');
    console.log(`Message SID: ${message.sid}`);
    console.log(`Status: ${message.status}`);
    console.log(`Date Sent: ${message.dateSent}`);

    // Check message status
    if (message.status === 'failed') {
      console.log(`\n✗ Message failed. Error: ${message.errorMessage}`);
      return false;
    } else if (message.status === 'undelivered') {
      console.log('\n⚠️  Message undelivered. Check Twilio logs for details.');
      return false;
    } else {
      console.log('\n✓ SMS queued for delivery');
      console.log('Check your phone - you should receive it in a few seconds');
      return true;
    }
  } catch (error) {
    console.error('\n✗ Failed to send SMS:', error.message);
    
    // Check for common errors
    if (error.message.includes('not a valid mobile number')) {
      console.error('\n💡 Hint: The number is not verified in Twilio');
      console.error('   Go to: https://console.twilio.com/');
      console.error('   Add your number to verified numbers');
    } else if (error.message.includes('Invalid')) {
      console.error('\n💡 Hint: Check phone number format (should be +91XXXXXXXXXX)');
    }
    
    return false;
  }
}

async function checkMessageLogs(client, messageId) {
  console.log('\n=== Checking Message Status ===');
  try {
    const message = await client.messages(messageId).fetch();
    
    console.log(`Message ID: ${message.sid}`);
    console.log(`Status: ${message.status}`);
    console.log(`Direction: ${message.direction}`);
    console.log(`Date Sent: ${message.dateSent}`);
    console.log(`Date Updated: ${message.dateUpdated}`);
    
    if (message.errorCode) {
      console.log(`Error Code: ${message.errorCode}`);
      console.log(`Error Message: ${message.errorMessage}`);
    }
    
    return message.status;
  } catch (error) {
    console.error('Failed to fetch message status:', error.message);
    return null;
  }
}

async function main() {
  try {
    // Verify Twilio account
    const client = await checkTwilioAccount();

    // Determine recipient number
    let toNumber = testRecipient;

    if (!toNumber) {
      console.log('\n⚠️  TWILIO_TEST_RECIPIENT not set in .env.local');
      console.log('Please add your verified phone number:\n');
      
      const answer = await askQuestion('Enter your verified phone number (e.g., +919876543210): ');
      
      if (!answer) {
        console.error('✗ No phone number provided');
        process.exit(1);
      }
      
      toNumber = answer.trim();
    }

    // Validate phone format
    if (!/^\+\d{10,15}$/.test(toNumber)) {
      console.error('\n✗ Invalid phone number format');
      console.error('Expected format: +919876543210 or +1234567890');
      process.exit(1);
    }

    // Send test SMS
    const success = await sendTestSMS(client, toNumber);

    if (success) {
      console.log('\n╔════════════════════════════════════════════════════════════╗');
      console.log('║                  NEXT STEPS                                 ║');
      console.log('╚════════════════════════════════════════════════════════════╝');
      console.log('\n1. Check your phone - SMS should arrive in a few seconds');
      console.log('2. If received: ✅ SMS service is working!');
      console.log('3. If not received:');
      console.log('   - Go to: https://console.twilio.com/');
      console.log('   - Check Message Logs for delivery status');
      console.log('   - Verify your number is added to verified numbers');
      console.log('\n4. Once working, add to .env.local:');
      console.log(`   TWILIO_TEST_RECIPIENT=${toNumber}\n`);
    } else {
      console.log('\n⚠️  SMS send failed. Follow the hints above.');
    }

    rl.close();
  } catch (error) {
    console.error('Fatal error:', error);
    rl.close();
    process.exit(1);
  }
}

main();
