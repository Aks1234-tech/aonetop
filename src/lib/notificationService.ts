/**
 * Core Notification Service
 * Orchestrates multi-channel notification delivery (Email, SMS, WhatsApp)
 */

import { emailService } from './emailService';
import { smsService } from './smsService';
import { supabase } from './supabase';
import type { Database } from './database.types';

export type NotificationType =
  | 'account_signup'
  | 'password_reset'
  | 'profile_update'
  | 'cart_addition'
  | 'cart_reminder'
  | 'order_confirmation'
  | 'payment_confirmation'
  | 'order_tracking'
  | 'order_delivered'
  | 'refund_confirmation'
  | 'promotional'
  | 'error_notification';

export type NotificationChannel = 'email' | 'sms' | 'whatsapp';

export interface NotificationPayload {
  userId: string;
  notificationType: NotificationType;
  channels?: NotificationChannel[];
  recipient?: {
    email?: string;
    phone?: string;
  };
  subject?: string;
  templateId?: string;
  templateVariables?: Record<string, string | number | boolean>;
  metadata?: Record<string, any>;
  priority?: number; // 0-10, higher = more urgent
}

export interface NotificationResult {
  notificationId: string;
  userId: string;
  type: NotificationType;
  channels: {
    [K in NotificationChannel]?: {
      status: 'pending' | 'sent' | 'failed' | 'queued';
      messageId?: string;
      error?: string;
      sentAt?: string;
    };
  };
  overallStatus: 'success' | 'partial' | 'failed';
}

interface UserContactInfo {
  email: string;
  phone_number?: string;
  whatsapp_number?: string;
  email_verified: boolean;
  phone_verified: boolean;
  whatsapp_enabled: boolean;
  notification_preferences: Record<NotificationType, NotificationChannel[]>;
  unsubscribed_from: NotificationType[];
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}

class NotificationService {
  /**
   * Send notification to user via specified channels
   */
  async send(payload: NotificationPayload): Promise<NotificationResult> {
    console.log(
      `📬 Sending ${payload.notificationType} notification to user ${payload.userId}`
    );

    try {
      // Fetch user contact info
      const contactInfo = await this.getUserContactInfo(payload.userId);
      if (!contactInfo) {
        throw new Error('User contact info not found');
      }

      // Check if user has unsubscribed from this notification type
      if (contactInfo.unsubscribed_from?.includes(payload.notificationType)) {
        console.log(
          `⏸️  User ${payload.userId} has unsubscribed from ${payload.notificationType}`
        );
        return this.createResult(payload, 'failed', {});
      }

      // Check quiet hours
      if (this.isQuietHours(contactInfo)) {
        console.log(
          `🤫 User ${payload.userId} has quiet hours enabled. Scheduling for later.`
        );
        // Queue the notification for later
        await this.queueNotification(payload, contactInfo);
        return this.createResult(payload, 'success', {});
      }

      // Determine channels to use
      const channelsToUse =
        payload.channels ||
        contactInfo.notification_preferences[payload.notificationType] ||
        ['email'];

      // Send via each channel
      const results: Record<NotificationChannel, any> = {};
      let successCount = 0;
      let failureCount = 0;

      for (const channel of channelsToUse) {
        try {
          const result = await this.sendViaChannel(
            channel,
            payload,
            contactInfo
          );

          results[channel] = result;

          if (result.status === 'sent' || result.status === 'queued') {
            successCount++;
          } else {
            failureCount++;
          }

          // Log to database
          await this.logNotification(payload, channel, contactInfo, result);
        } catch (error) {
          failureCount++;
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          console.error(`❌ Failed to send via ${channel}:`, errorMessage);

          results[channel] = {
            status: 'failed',
            error: errorMessage,
          };

          await this.logNotification(
            payload,
            channel,
            contactInfo,
            results[channel]
          );
        }
      }

      // Determine overall status
      const overallStatus =
        failureCount === 0
          ? 'success'
          : successCount > 0
            ? 'partial'
            : 'failed';

      const notificationResult = this.createResult(
        payload,
        overallStatus,
        results
      );

      console.log(
        `✅ Notification result: ${overallStatus} (${successCount} succeeded, ${failureCount} failed)`
      );

      return notificationResult;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`❌ Notification service error:`, errorMessage);

      return this.createResult(payload, 'failed', {
        email: {
          status: 'failed',
          error: errorMessage,
        },
      });
    }
  }

  /**
   * Send via specific channel
   */
  private async sendViaChannel(
    channel: NotificationChannel,
    payload: NotificationPayload,
    contactInfo: UserContactInfo
  ): Promise<any> {
    switch (channel) {
      case 'email':
        return await this.sendEmail(payload, contactInfo);
      case 'sms':
        return await this.sendSMS(payload, contactInfo);
      case 'whatsapp':
        return await this.sendWhatsApp(payload, contactInfo);
      default:
        throw new Error(`Unknown channel: ${channel}`);
    }
  }

  /**
   * Send email notification
   */
  private async sendEmail(
    payload: NotificationPayload,
    contactInfo: UserContactInfo
  ): Promise<any> {
    if (!contactInfo.email_verified) {
      throw new Error('User email not verified');
    }

    const emailTo = payload.recipient?.email || contactInfo.email;

    // For now, use simple text. In Phase 2, we'll load templates from DB
    let html = payload.subject || `${payload.notificationType} notification`;

    if (payload.templateVariables) {
      html = this.replaceVariables(html, payload.templateVariables);
    }

    const result = await emailService.send({
      to: emailTo,
      subject: payload.subject || `AONet - ${payload.notificationType}`,
      html: `<p>${html}</p>`,
    });

    return {
      status: result.status === 'sent' ? 'sent' : 'failed',
      messageId: result.messageId,
      error: result.error,
      sentAt: result.status === 'sent' ? new Date().toISOString() : undefined,
    };
  }

  /**
   * Send SMS notification
   */
  private async sendSMS(
    payload: NotificationPayload,
    contactInfo: UserContactInfo
  ): Promise<any> {
    if (
      !contactInfo.phone_verified ||
      !contactInfo.phone_number
    ) {
      throw new Error('User phone number not verified');
    }

    let message = `AONet: ${payload.notificationType} notification`;

    if (payload.templateVariables) {
      message = this.replaceVariables(message, payload.templateVariables);
    }

    // Limit to 160 characters for SMS
    if (message.length > 160) {
      message = message.substring(0, 157) + '...';
    }

    const phoneNumber =
      payload.recipient?.phone || contactInfo.phone_number;
    const formattedPhone = smsService.needsFormatting(phoneNumber)
      ? smsService.formatPhoneNumber(phoneNumber)
      : phoneNumber;

    const result = await smsService.sendSMS(formattedPhone, message);

    return {
      status: result.status,
      messageId: result.messageId,
      error: result.error,
      sentAt:
        result.status === 'sent' || result.status === 'queued'
          ? new Date().toISOString()
          : undefined,
    };
  }

  /**
   * Send WhatsApp notification
   */
  private async sendWhatsApp(
    payload: NotificationPayload,
    contactInfo: UserContactInfo
  ): Promise<any> {
    if (
      !contactInfo.whatsapp_enabled ||
      !contactInfo.whatsapp_number
    ) {
      throw new Error('User WhatsApp not enabled');
    }

    let message = `AONet: ${payload.notificationType}`;

    if (payload.templateVariables) {
      message = this.replaceVariables(message, payload.templateVariables);
    }

    const phoneNumber =
      payload.recipient?.phone || contactInfo.whatsapp_number;
    const formattedPhone = smsService.needsFormatting(phoneNumber)
      ? smsService.formatPhoneNumber(phoneNumber)
      : phoneNumber;

    const result = await smsService.sendWhatsApp(formattedPhone, message);

    return {
      status: result.status,
      messageId: result.messageId,
      error: result.error,
      sentAt:
        result.status === 'sent' || result.status === 'queued'
          ? new Date().toISOString()
          : undefined,
    };
  }

  /**
   * Get user contact info
   */
  private async getUserContactInfo(
    userId: string
  ): Promise<UserContactInfo | null> {
    try {
      const { data, error } = await supabase
        .from('user_contact_info')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user contact info:', error);
        return null;
      }

      return data as UserContactInfo;
    } catch (error) {
      console.error('Error fetching user contact info:', error);
      return null;
    }
  }

  /**
   * Log notification to database
   */
  private async logNotification(
    payload: NotificationPayload,
    channel: NotificationChannel,
    contactInfo: UserContactInfo,
    result: any
  ): Promise<void> {
    try {
      const recipient =
        channel === 'email'
          ? contactInfo.email
          : channel === 'sms'
            ? contactInfo.phone_number
            : contactInfo.whatsapp_number;

      await supabase.from('notification_logs').insert({
        user_id: payload.userId,
        notification_type: payload.notificationType,
        channel,
        recipient: recipient || '',
        status: result.status,
        error_message: result.error,
        metadata: payload.metadata || {},
        sent_at:
          result.status === 'sent' ? new Date().toISOString() : null,
      });
    } catch (error) {
      console.error('Error logging notification:', error);
    }
  }

  /**
   * Queue notification for later delivery
   */
  private async queueNotification(
    payload: NotificationPayload,
    contactInfo: UserContactInfo
  ): Promise<void> {
    try {
      // Default template ID - will be replaced in Phase 2
      const templateId = payload.templateId || 'default-template-id';

      const channels =
        payload.channels ||
        contactInfo.notification_preferences[payload.notificationType] ||
        ['email'];

      // Calculate next retry time (schedule for after quiet hours)
      const nextRetryAt = this.calculateNextRetryTime(contactInfo);

      await supabase.from('notification_queue').insert({
        user_id: payload.userId,
        notification_type: payload.notificationType,
        channels,
        template_id: templateId,
        template_variables: payload.templateVariables || {},
        status: 'pending',
        scheduled_at: nextRetryAt.toISOString(),
        priority: payload.priority || 0,
      });

      console.log(
        `📋 Notification queued for ${payload.userId} at ${nextRetryAt.toISOString()}`
      );
    } catch (error) {
      console.error('Error queuing notification:', error);
    }
  }

  /**
   * Check if current time falls within user's quiet hours
   */
  private isQuietHours(contactInfo: UserContactInfo): boolean {
    if (!contactInfo.quiet_hours_start || !contactInfo.quiet_hours_end) {
      return false;
    }

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Simple string comparison (works for HH:MM format)
    if (contactInfo.quiet_hours_start < contactInfo.quiet_hours_end) {
      // Normal case: e.g., 22:00 to 08:00 wrapping midnight is handled below
      return (
        currentTime >= contactInfo.quiet_hours_start &&
        currentTime < contactInfo.quiet_hours_end
      );
    } else {
      // Wraps midnight: e.g., 22:00 to 08:00
      return (
        currentTime >= contactInfo.quiet_hours_start ||
        currentTime < contactInfo.quiet_hours_end
      );
    }
  }

  /**
   * Calculate next retry time based on quiet hours
   */
  private calculateNextRetryTime(contactInfo: UserContactInfo): Date {
    if (!contactInfo.quiet_hours_start || !contactInfo.quiet_hours_end) {
      return new Date(); // Send immediately
    }

    const now = new Date();
    const [endHour, endMinute] = contactInfo.quiet_hours_end
      .split(':')
      .map(Number);

    const nextTime = new Date(now);
    nextTime.setHours(endHour, endMinute, 0, 0);

    // If calculated time is in the past, schedule for tomorrow
    if (nextTime <= now) {
      nextTime.setDate(nextTime.getDate() + 1);
    }

    return nextTime;
  }

  /**
   * Replace template variables
   */
  private replaceVariables(
    template: string,
    variables: Record<string, string | number | boolean>
  ): string {
    let result = template;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, String(value));
    }

    return result;
  }

  /**
   * Create notification result object
   */
  private createResult(
    payload: NotificationPayload,
    overallStatus: 'success' | 'partial' | 'failed',
    channels: Record<NotificationChannel, any>
  ): NotificationResult {
    return {
      notificationId: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: payload.userId,
      type: payload.notificationType,
      channels,
      overallStatus,
    };
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

export default notificationService;
