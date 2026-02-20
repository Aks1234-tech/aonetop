/**
 * Account Signup Notification Handler
 * Sends welcome email when a new user creates an account
 * 
 * Phase 2: Task 2.1
 * Status: ✅ Email-only (SMS/WhatsApp commented out)
 */

import { notificationService } from './notificationService';
import type { NotificationPayload } from './notificationService';

interface SignupData {
  userId: string;
  email: string;
  fullName: string;
  phone?: string;
}

/**
 * Send welcome email to new user
 * 
 * Usage:
 * ```
 * await sendSignupWelcomeEmail({
 *   userId: 'user-uuid',
 *   email: 'user@example.com',
 *   fullName: 'John Doe',
 *   phone: '+919876543210'
 * });
 * ```
 */
export async function sendSignupWelcomeEmail(
  signupData: SignupData
): Promise<void> {
  const payload: NotificationPayload = {
    userId: signupData.userId,
    notificationType: 'account_signup',
    channels: ['email'], // EMAIL ONLY - Uncomment 'sms' when ready
    subject: `Welcome to AONet, ${signupData.fullName}!`,
    templateVariables: {
      user_name: signupData.fullName,
      signup_date: new Date().toLocaleDateString('en-IN'),
      account_url: 'https://aonetop.com/account',
    },
  };

  try {
    console.log(`📧 Sending signup welcome email to ${signupData.email}`);
    const result = await notificationService.send(payload);

    if (result.overallStatus === 'success') {
      console.log(`✅ Welcome email sent to ${signupData.email}`);
    } else if (result.overallStatus === 'partial') {
      console.log(`⚠️  Welcome email partially sent (${signupData.email})`);
    } else {
      console.error(`❌ Failed to send welcome email to ${signupData.email}`);
      throw new Error('Failed to send signup welcome email');
    }
  } catch (error) {
    console.error('Error sending signup email:', error);
    throw error;
  }
}

/**
 * Signup email template content
 * 
 * Can be used to create database templates or inline emails
 */
export const signupWelcomeEmailTemplate = {
  subject: 'Welcome to AONet, {{user_name}}!',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <!-- Header -->
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
        <h1 style="color: #333; margin: 0;">Welcome to AONet! 🎉</h1>
      </div>

      <!-- Body -->
      <div style="padding: 30px;">
        <h2 style="color: #333;">Hello {{user_name}},</h2>
        
        <p style="color: #666; line-height: 1.6;">
          Thank you for joining AONet! We're excited to have you as part of our community.
        </p>

        <p style="color: #666; line-height: 1.6;">
          Your account has been successfully created on <strong>{{signup_date}}</strong>.
        </p>

        <!-- Features Section -->
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">What You Can Do Now:</h3>
          <ul style="color: #666; line-height: 1.8;">
            <li>📦 Browse our latest products</li>
            <li>🛒 Add items to your cart</li>
            <li>💳 Place orders with one click</li>
            <li>📱 Track your orders in real-time</li>
            <li>⭐ Save your favorite products</li>
          </ul>
        </div>

        <!-- Call to Action -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{account_url}}" style="
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
          ">
            Go to Your Account
          </a>
        </div>

        <!-- Info -->
        <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
          <p style="color: #856404; margin: 0;">
            💡 <strong>Tip:</strong> Complete your profile to unlock exclusive offers and faster checkout!
          </p>
        </div>

        <!-- Footer Info -->
        <p style="color: #999; font-size: 12px; line-height: 1.6;">
          If you didn't create this account, please ignore this email or contact our support team.
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #ddd;">
        <p style="color: #999; margin: 0; font-size: 12px;">
          © 2026 AONet. All rights reserved.<br>
          <a href="https://aonetop.com/help" style="color: #007bff; text-decoration: none;">Help Center</a> • 
          <a href="https://aonetop.com/privacy" style="color: #007bff; text-decoration: none;">Privacy Policy</a>
        </p>
      </div>
    </div>
  `,
};

/**
 * Integration Guide: Where to call this function
 * 
 * Option 1: In Supabase Auth Trigger
 * ================================
 * Create a Supabase Edge Function that triggers on auth.users INSERT:
 * 
 * ```typescript
 * // supabase/functions/on-auth-signup/index.ts
 * import { sendSignupWelcomeEmail } from '@/lib/signupNotification';
 * 
 * Deno.serve(async (req) => {
 *   const { record } = await req.json(); // auth.users record
 *   
 *   await sendSignupWelcomeEmail({
 *     userId: record.id,
 *     email: record.email,
 *     fullName: record.user_metadata?.full_name || record.email,
 *   });
 *   
 *   return new Response(JSON.stringify({ ok: true }));
 * });
 * ```
 * 
 * Option 2: In React after signup
 * ==============================
 * ```typescript
 * // pages/Signup.tsx
 * import { sendSignupWelcomeEmail } from '@/lib/signupNotification';
 * 
 * const handleSignup = async (email, password, fullName) => {
 *   const { data, error } = await supabase.auth.signUp({
 *     email,
 *     password,
 *     options: {
 *       data: { full_name: fullName }
 *     }
 *   });
 *   
 *   if (!error && data.user) {
 *     // Send welcome email
 *     await sendSignupWelcomeEmail({
 *       userId: data.user.id,
 *       email: data.user.email!,
 *       fullName: fullName,
 *     });
 *   }
 * };
 * ```
 * 
 * Option 3: In API endpoint
 * =========================
 * ```typescript
 * // pages/api/auth/signup.ts (or similar)
 * export async function POST(req) {
 *   const { email, password, fullName } = await req.json();
 *   
 *   // Create auth user
 *   const user = await supabase.auth.signUp({ email, password });
 *   
 *   // Send notification
 *   if (user) {
 *     await sendSignupWelcomeEmail({
 *       userId: user.id,
 *       email: user.email,
 *       fullName,
 *     });
 *   }
 *   
 *   return { success: true };
 * }
 * ```
 */

/**
 * Testing: Run this to test signup notification
 * 
 * ```bash
 * # Add to src/lib/__tests__/testSignupNotification.js
 * import { sendSignupWelcomeEmail } from '../signupNotification';
 * 
 * await sendSignupWelcomeEmail({
 *   userId: 'test-user-123',
 *   email: 'your-email@example.com',
 *   fullName: 'Test User',
 * });
 * ```
 */
