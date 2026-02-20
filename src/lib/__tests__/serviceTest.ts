/**
 * Service Testing Script
 * Tests email, SMS, and notification services
 * Run with: npx ts-node src/lib/__tests__/serviceTest.ts
 */

import { emailService } from '../emailService';
import { smsService } from '../smsService';

async function testEmailService() {
  console.log('\n=== Testing Email Service ===');
  try {
    console.log('✓ Testing simple email...');
    const result = await emailService.send({
      to: 'techatvision@gmail.com',
      subject: 'Test Email from AONet Notification System',
      html: `
        <h1>Welcome to AONet Notification System</h1>
        <p>This is a test email to verify the email service is working correctly.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
        <p>Status: If you received this, the email service is configured correctly!</p>
      `
    });
    
    console.log('Email Result:', result);
    return result.status === 'sent';
  } catch (error) {
    console.error('Email Test Failed:', error);
    return false;
  }
}

async function testEmailWithTemplate() {
  console.log('\n=== Testing Email with Template Variables ===');
  try {
    console.log('✓ Testing template substitution...');
    const template = `
      <h1>Hello {{user_name}}!</h1>
      <p>Welcome to AONet, {{user_name}}!</p>
      <p>Your order {{order_id}} for ₹{{amount}} has been confirmed.</p>
      <p>Estimated delivery: {{delivery_date}}</p>
    `;
    
    const result = await emailService.sendWithTemplate(
      'techatvision@gmail.com',
      'Order Confirmation Test',
      template,
      {
        user_name: 'Test User',
        order_id: 'ORD-TEST-12345',
        amount: '5999',
        delivery_date: '2026-01-28'
      }
    );
    
    console.log('Template Email Result:', result);
    return result.status === 'sent';
  } catch (error) {
    console.error('Template Email Test Failed:', error);
    return false;
  }
}

async function testSMSService() {
  console.log('\n=== Testing SMS Service ===');
  try {
    console.log('✓ Testing SMS...');
    // Using the Twilio phone number from env for testing
    const result = await smsService.sendSMS(
      '+917691848733',
      'Test SMS from AONet Notification System'
    );
    
    console.log('SMS Result:', result);
    return ['sent', 'queued'].includes(result.status);
  } catch (error) {
    console.error('SMS Test Failed:', error);
    return false;
  }
}

async function testPhoneFormatting() {
  console.log('\n=== Testing Phone Number Formatting ===');
  try {
    const testNumbers = [
      '9691848733',
      '07691848733',
      '+919691848733',
      '+1234567890'
    ];
    
    console.log('Testing phone number formatting:');
    testNumbers.forEach(num => {
      const formatted = smsService.formatPhoneNumber(num);
      const isValid = smsService.isValidPhoneNumber(formatted);
      console.log(`  ${num} => ${formatted} (Valid: ${isValid ? '✓' : '✗'})`);
    });
    
    return true;
  } catch (error) {
    console.error('Phone Format Test Failed:', error);
    return false;
  }
}

async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║       AONet Notification System - Service Tests             ║');
  console.log('║                  24 January 2026                           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  const results = {
    emailService: false,
    emailTemplate: false,
    smsService: false,
    phoneFormatting: false
  };
  
  // Run tests
  results.emailService = await testEmailService();
  results.emailTemplate = await testEmailWithTemplate();
  results.smsService = await testSMSService();
  results.phoneFormatting = await testPhoneFormatting();
  
  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    TEST SUMMARY                             ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  const tests = [
    { name: 'Email Service', result: results.emailService },
    { name: 'Email with Template', result: results.emailTemplate },
    { name: 'SMS Service', result: results.smsService },
    { name: 'Phone Number Formatting', result: results.phoneFormatting }
  ];
  
  tests.forEach(test => {
    const status = test.result ? '✓ PASS' : '✗ FAIL';
    console.log(`${status}: ${test.name}`);
  });
  
  const passCount = Object.values(results).filter(r => r).length;
  const totalCount = Object.keys(results).length;
  
  console.log('\n' + '═'.repeat(60));
  console.log(`Total: ${passCount}/${totalCount} tests passed`);
  console.log('═'.repeat(60) + '\n');
  
  if (passCount === totalCount) {
    console.log('🎉 All services configured correctly! Ready for Phase 2.\n');
  }
}

// Run tests
runAllTests().catch(console.error);
