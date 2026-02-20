/**
 * Password Reset Notification Handler
 * Sends password reset email with secure reset link
 * 
 * Phase 2: Task 2.2
 * Status: ✅ Email-only (SMS/WhatsApp commented out)
 */

import { notificationService } from './notificationService';
import type { NotificationPayload } from './notificationService';

interface PasswordResetData {
  userId: string;
  email: string;
  fullName: string;
  resetToken: string;
  resetLink: string;
  expiresInMinutes?: number; // Default: 30 minutes
}

/**
 * Send password reset email
 * 
 * Usage:
 * ```
 * const resetToken = generateSecureToken();
 * 
 * await sendPasswordResetEmail({
 *   userId: 'user-uuid',
 *   email: 'user@example.com',
 *   fullName: 'John Doe',
 *   resetToken: resetToken,
 *   resetLink: `https://aonetop.com/reset-password?token=${resetToken}`,
 *   expiresInMinutes: 30,
 * });
 * ```
 */
export async function sendPasswordResetEmail(
  resetData: PasswordResetData
): Promise<void> {
  const expiresIn = resetData.expiresInMinutes || 30;

  const payload: NotificationPayload = {
    userId: resetData.userId,
    notificationType: 'password_reset',
    channels: ['email'], // EMAIL ONLY - Uncomment 'sms' when ready
    subject: 'Reset Your AONet Password',
    templateVariables: {
      user_name: resetData.fullName,
      reset_link: resetData.resetLink,
      expires_in_minutes: expiresIn.toString(),
      reset_token: resetData.resetToken,
    },
  };

  try {
    console.log(`📧 Sending password reset email to ${resetData.email}`);
    const result = await notificationService.send(payload);

    if (result.overallStatus === 'success') {
      console.log(`✅ Password reset email sent to ${resetData.email}`);
    } else if (result.overallStatus === 'partial') {
      console.log(`⚠️  Password reset email partially sent (${resetData.email})`);
    } else {
      console.error(`❌ Failed to send password reset email to ${resetData.email}`);
      throw new Error('Failed to send password reset email');
    }
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

/**
 * Password reset email template
 */
export const passwordResetEmailTemplate = {
  subject: 'Reset Your AONet Password',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <!-- Header -->
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
        <h1 style="color: #333; margin: 0;">Password Reset Request</h1>
      </div>

      <!-- Body -->
      <div style="padding: 30px;">
        <h2 style="color: #333;">Hello {{user_name}},</h2>
        
        <p style="color: #666; line-height: 1.6;">
          We received a request to reset the password associated with this email address. 
          If you made this request, click the button below to reset your password.
        </p>

        <!-- Security Warning -->
        <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
          <p style="color: #856404; margin: 0;">
            ⚠️ <strong>Security Notice:</strong> This link will expire in <strong>{{expires_in_minutes}} minutes</strong>. 
            Never share this link with anyone.
          </p>
        </div>

        <!-- Call to Action -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{reset_link}}" style="
            display: inline-block;
            background-color: #dc3545;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
          ">
            Reset Password
          </a>
        </div>

        <!-- Alternative Link -->
        <p style="color: #666; font-size: 12px; line-height: 1.6;">
          Or copy and paste this link in your browser:<br>
          <code style="background-color: #f5f5f5; padding: 5px 10px; border-radius: 3px; display: block; margin-top: 10px; word-break: break-all;">
            {{reset_link}}
          </code>
        </p>

        <!-- Info -->
        <div style="background-color: #e7f3ff; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0;">
          <p style="color: #1565c0; margin: 0; font-size: 13px;">
            <strong>Didn't request this?</strong> Don't worry! This link will expire shortly. 
            If you continue to have problems, please contact our support team.
          </p>
        </div>

        <!-- FAQ -->
        <div style="margin: 20px 0;">
          <h3 style="color: #333; font-size: 14px;">What happens next?</h3>
          <ol style="color: #666; line-height: 1.8;">
            <li>Click the button above</li>
            <li>Enter your new password</li>
            <li>Confirm your password</li>
            <li>Your password will be updated immediately</li>
          </ol>
        </div>

        <!-- Footer Info -->
        <p style="color: #999; font-size: 12px; line-height: 1.6;">
          This is an automated email. Please don't reply to this message.
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #ddd;">
        <p style="color: #999; margin: 0; font-size: 12px;">
          © 2026 AONet. All rights reserved.<br>
          <a href="https://aonetop.com/help" style="color: #007bff; text-decoration: none;">Help Center</a> • 
          <a href="https://aonetop.com/privacy" style="color: #007bff; text-decoration: none;">Privacy Policy</a> •
          <a href="https://aonetop.com/security" style="color: #007bff; text-decoration: none;">Security</a>
        </p>
      </div>
    </div>
  `,
};

/**
 * Integration Guide: Where to call this function
 * 
 * Option 1: In Password Reset Endpoint
 * ===================================
 * ```typescript
 * // pages/api/auth/forgot-password.ts
 * export async function POST(req) {
 *   const { email } = await req.json();
 *   
 *   // Find user
 *   const user = await supabase
 *     .from('auth.users')
 *     .select('*')
 *     .eq('email', email)
 *     .single();
 *   
 *   if (user) {
 *     // Generate reset token
 *     const resetToken = crypto.randomBytes(32).toString('hex');
 *     const resetLink = `https://aonetop.com/reset-password?token=${resetToken}`;
 *     
 *     // Store token in database (with expiration)
 *     await supabase
 *       .from('password_reset_tokens')
 *       .insert({
 *         user_id: user.id,
 *         token: resetToken,
 *         expires_at: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
 *       });
 *     
 *     // Send email
 *     await sendPasswordResetEmail({
 *       userId: user.id,
 *       email: user.email,
 *       fullName: user.user_metadata?.full_name || user.email,
 *       resetToken: resetToken,
 *       resetLink: resetLink,
 *       expiresInMinutes: 30,
 *     });
 *   }
 *   
 *   // Always return success (security best practice)
 *   return { success: true };
 * }
 * ```
 * 
 * Option 2: Using Supabase Auth Recovery
 * =====================================
 * ```typescript
 * const { error } = await supabase.auth.resetPasswordForEmail(email);
 * 
 * // Then use sendPasswordResetEmail with the recovery token
 * // from the confirmation URL
 * ```
 * 
 * Option 3: In React Form
 * ======================
 * ```typescript
 * // components/ForgotPasswordForm.tsx
 * import { sendPasswordResetEmail } from '@/lib/passwordResetNotification';
 * 
 * const handleForgotPassword = async (email: string) => {
 *   // Call your API
 *   const response = await fetch('/api/auth/forgot-password', {
 *     method: 'POST',
 *     body: JSON.stringify({ email }),
 *   });
 *   
 *   if (response.ok) {
 *     // Email will be sent by the API
 *     showMessage('Check your email for reset link');
 *   }
 * };
 * ```
 */

/**
 * Security Best Practices Implemented
 * ===================================
 * 1. ✅ Token expires in 30 minutes
 * 2. ✅ Reset link includes token (not sent in SMS)
 * 3. ✅ Email only (not SMS with sensitive link)
 * 4. ✅ Clear security warnings in email
 * 5. ✅ Large, clear CTA button for easy clicking
 * 6. ✅ Alternative link provided for copy/paste
 * 7. ✅ "Didn't request" reassurance message
 * 8. ✅ Automated email (no reply address exposed)
 * 
 * Recommended Additional Steps
 * =============================
 * 1. Hash the reset token in database (store only hash)
 * 2. Log failed reset attempts for security monitoring
 * 3. Invalidate token after first use
 * 4. Send alert if too many failed attempts
 * 5. Consider 2FA before allowing reset
 */
