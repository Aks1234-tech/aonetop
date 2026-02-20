/**
 * Profile Update Notification Handler
 * Notifies user when their profile is updated (especially security-related changes)
 * 
 * Phase 2: Task 2.3
 * Status: ✅ Email-only (SMS/WhatsApp commented out)
 */

import { notificationService } from './notificationService';
import type { NotificationPayload } from './notificationService';

interface ProfileChangeData {
  userId: string;
  email: string;
  fullName: string;
  changedFields: {
    field: string;
    oldValue?: string;
    newValue: string;
  }[];
  ipAddress?: string;
  userAgent?: string;
  timestamp?: Date;
}

/**
 * Send profile update notification
 * 
 * Usage:
 * ```
 * await sendProfileUpdateNotification({
 *   userId: 'user-uuid',
 *   email: 'user@example.com',
 *   fullName: 'John Doe',
 *   changedFields: [
 *     { field: 'Email', oldValue: 'old@example.com', newValue: 'new@example.com' },
 *     { field: 'Phone', oldValue: '9876543210', newValue: '9876543211' }
 *   ],
 *   ipAddress: '192.168.1.1',
 * });
 * ```
 */
export async function sendProfileUpdateNotification(
  profileData: ProfileChangeData
): Promise<void> {
  const changedFieldsList = profileData.changedFields
    .map(f => `• ${f.field}: ${f.oldValue || 'N/A'} → ${f.newValue}`)
    .join('\n');

  const payload: NotificationPayload = {
    userId: profileData.userId,
    notificationType: 'profile_update',
    channels: ['email'], // EMAIL ONLY - Uncomment 'sms' when ready
    subject: 'Profile Update Confirmation - AONet',
    templateVariables: {
      user_name: profileData.fullName,
      changed_fields: changedFieldsList,
      timestamp: profileData.timestamp?.toLocaleString('en-IN') || new Date().toLocaleString('en-IN'),
      ip_address: profileData.ipAddress || 'Unknown',
    },
  };

  try {
    console.log(`📧 Sending profile update notification to ${profileData.email}`);
    const result = await notificationService.send(payload);

    if (result.overallStatus === 'success') {
      console.log(`✅ Profile update notification sent to ${profileData.email}`);
    } else if (result.overallStatus === 'partial') {
      console.log(`⚠️  Profile update notification partially sent (${profileData.email})`);
    } else {
      console.error(`❌ Failed to send profile update notification to ${profileData.email}`);
      throw new Error('Failed to send profile update notification');
    }
  } catch (error) {
    console.error('Error sending profile update notification:', error);
    throw error;
  }
}

/**
 * Profile update email template
 */
export const profileUpdateEmailTemplate = {
  subject: 'Profile Update Confirmation - AONet',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <!-- Header -->
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
        <h1 style="color: #333; margin: 0;">Profile Update Confirmation</h1>
      </div>

      <!-- Body -->
      <div style="padding: 30px;">
        <h2 style="color: #333;">Hello {{user_name}},</h2>
        
        <p style="color: #666; line-height: 1.6;">
          Your profile has been successfully updated. Here's a summary of the changes:
        </p>

        <!-- Changes List -->
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Changes Made:</h3>
          <pre style="
            color: #666;
            background-color: white;
            padding: 15px;
            border-radius: 4px;
            overflow-x: auto;
            font-size: 13px;
            line-height: 1.8;
          ">{{changed_fields}}</pre>
          <p style="color: #999; margin: 10px 0 0 0; font-size: 12px;">
            Last updated: <strong>{{timestamp}}</strong>
          </p>
        </div>

        <!-- Security Alert (if sensitive fields changed) -->
        <div style="background-color: #ffe6e6; padding: 15px; border-left: 4px solid #ff5252; margin: 20px 0;">
          <p style="color: #c62828; margin: 0;">
            ⚠️ <strong>Security Alert:</strong> If you didn't make this change, 
            <a href="https://aonetop.com/account/security" style="color: #ff5252; text-decoration: underline;">
              secure your account
            </a> immediately.
          </p>
        </div>

        <!-- Connection Info -->
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <h3 style="color: #333; font-size: 13px; margin-top: 0;">Connection Details:</h3>
          <p style="color: #666; margin: 5px 0; font-size: 12px;">
            <strong>IP Address:</strong> {{ip_address}}<br>
            <strong>Location:</strong> Based on IP
          </p>
        </div>

        <!-- Action Buttons -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://aonetop.com/account" style="
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            margin-right: 10px;
          ">
            View Profile
          </a>
          <a href="https://aonetop.com/account/security" style="
            display: inline-block;
            background-color: #6c757d;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
          ">
            Security Settings
          </a>
        </div>

        <!-- FAQ -->
        <div style="background-color: #e7f3ff; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0;">
          <h3 style="color: #1565c0; font-size: 13px; margin-top: 0;">Didn't make this change?</h3>
          <p style="color: #1565c0; margin: 0; font-size: 12px; line-height: 1.6;">
            Your account security is important. If you didn't authorize this change, 
            please reset your password immediately and check your account activity.
            <a href="https://aonetop.com/account/security" style="color: #1565c0; text-decoration: underline;">
              Go to Security Settings
            </a>
          </p>
        </div>

        <!-- Footer Info -->
        <p style="color: #999; font-size: 12px; line-height: 1.6;">
          This is an automated notification email. Please don't reply to this message.
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
 * Option 1: In Profile Update Endpoint
 * ===================================
 * ```typescript
 * // pages/api/profile/update.ts
 * export async function POST(req) {
 *   const { userId, profile } = await req.json();
 *   
 *   // Get current profile
 *   const current = await supabase
 *     .from('user_profiles')
 *     .select('*')
 *     .eq('user_id', userId)
 *     .single();
 *   
 *   // Track changes
 *   const changedFields = [];
 *   if (current.phone !== profile.phone) {
 *     changedFields.push({
 *       field: 'Phone Number',
 *       oldValue: current.phone,
 *       newValue: profile.phone,
 *     });
 *   }
 *   if (current.full_name !== profile.fullName) {
 *     changedFields.push({
 *       field: 'Full Name',
 *       oldValue: current.full_name,
 *       newValue: profile.fullName,
 *     });
 *   }
 *   // ... more fields
 *   
 *   // Update profile
 *   await supabase
 *     .from('user_profiles')
 *     .update(profile)
 *     .eq('user_id', userId);
 *   
 *   // Send notification only if changes were made
 *   if (changedFields.length > 0) {
 *     await sendProfileUpdateNotification({
 *       userId: userId,
 *       email: current.email,
 *       fullName: profile.fullName,
 *       changedFields: changedFields,
 *       ipAddress: req.headers.get('x-forwarded-for'),
 *       timestamp: new Date(),
 *     });
 *   }
 *   
 *   return { success: true };
 * }
 * ```
 * 
 * Option 2: In React Context
 * =========================
 * ```typescript
 * // contexts/ProfileContext.tsx
 * import { sendProfileUpdateNotification } from '@/lib/profileUpdateNotification';
 * 
 * export const useProfile = () => {
 *   const updateProfile = async (newData) => {
 *     const oldData = profile;
 *     
 *     // Update in Supabase
 *     await supabase
 *       .from('user_profiles')
 *       .update(newData)
 *       .eq('user_id', user.id);
 *     
 *     // Detect changes
 *     const changedFields = Object.keys(newData)
 *       .filter(key => oldData[key] !== newData[key])
 *       .map(key => ({
 *         field: formatFieldName(key),
 *         oldValue: oldData[key],
 *         newValue: newData[key],
 *       }));
 *     
 *     // Send notification
 *     if (changedFields.length > 0) {
 *       await sendProfileUpdateNotification({
 *         userId: user.id,
 *         email: user.email,
 *         fullName: newData.fullName || oldData.fullName,
 *         changedFields,
 *         timestamp: new Date(),
 *       });
 *     }
 *   };
 *   
 *   return { updateProfile };
 * };
 * ```
 * 
 * Option 3: On Secure Field Changes Only
 * ====================================
 * ```typescript
 * // Only notify on important changes
 * const importantFields = ['email', 'phone', 'password', 'recovery_email'];
 * 
 * const shouldNotify = changedFields.some(cf => 
 *   importantFields.includes(cf.field)
 * );
 * 
 * if (shouldNotify) {
 *   await sendProfileUpdateNotification({...});
 * }
 * ```
 */

/**
 * Sensitive Fields for Notification
 * ==================================
 * Always notify on changes to:
 * - Email address ✅
 * - Phone number ✅
 * - Password ✅
 * - Two-factor authentication status ✅
 * - Account recovery email ✅
 * - Payment methods ✅
 * 
 * Optional notification on:
 * - Full name
 * - Address
 * - Profile picture
 * - Display name
 */
