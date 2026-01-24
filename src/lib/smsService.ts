/**
 * SMS Service - Handles SMS delivery via Twilio
 * Also supports WhatsApp messaging through the same Twilio API
 */

import twilio from 'twilio';
import type { Twilio } from 'twilio';

interface SendSMSOptions {
  to: string;
  message: string;
  channel?: 'sms' | 'whatsapp'; // Default: sms
}

interface SMSServiceResponse {
  status: 'sent' | 'failed' | 'queued';
  messageId?: string;
  error?: string;
  price?: string;
  priceCurrency?: string;
}

class SMSService {
  private client: Twilio | null = null;
  private fromNumber: string = '';
  private whatsappFromNumber: string = '';

  constructor() {
    this.initializeClient();
  }

  /**
   * Initialize Twilio client
   */
  private initializeClient(): void {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    if (!accountSid || !authToken) {
      console.warn(
        '⚠️  Twilio credentials not configured. SMS/WhatsApp sending disabled.'
      );
      return;
    }

    if (!fromNumber) {
      console.warn(
        '⚠️  TWILIO_PHONE_NUMBER not configured. SMS sending disabled.'
      );
      return;
    }

    try {
      this.client = twilio(accountSid, authToken);
      this.fromNumber = fromNumber;
      this.whatsappFromNumber = whatsappNumber || `whatsapp:${fromNumber}`;

      console.log('✅ SMS service initialized (Twilio)');
    } catch (error) {
      console.error('❌ Failed to initialize SMS service:', error);
    }
  }

  /**
   * Send SMS
   */
  async sendSMS(to: string, message: string): Promise<SMSServiceResponse> {
    if (!this.client) {
      return {
        status: 'failed',
        error: 'SMS service not configured',
      };
    }

    // Validate phone number format
    if (!this.isValidPhoneNumber(to)) {
      return {
        status: 'failed',
        error: 'Invalid phone number format. Use +91XXXXXXXXXX format',
      };
    }

    // Validate message length (160 chars for standard SMS)
    if (message.length > 160) {
      console.warn(
        `⚠️  SMS message exceeds 160 characters (${message.length}). May be split into multiple messages.`
      );
    }

    try {
      const sms = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: to,
      });

      console.log(
        `📱 SMS sent to ${to} (SID: ${sms.sid}, Status: ${sms.status})`
      );

      return {
        status: sms.status as 'sent' | 'queued' | 'failed',
        messageId: sms.sid,
        price: sms.price,
        priceCurrency: sms.priceUnit,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to send SMS to ${to}:`, errorMessage);

      return {
        status: 'failed',
        error: errorMessage,
      };
    }
  }

  /**
   * Send WhatsApp message
   */
  async sendWhatsApp(
    to: string,
    message: string
  ): Promise<SMSServiceResponse> {
    if (!this.client) {
      return {
        status: 'failed',
        error: 'SMS service not configured',
      };
    }

    // Validate phone number
    if (!this.isValidPhoneNumber(to)) {
      return {
        status: 'failed',
        error: 'Invalid phone number format',
      };
    }

    try {
      const whatsappMessage = await this.client.messages.create({
        body: message,
        from: this.whatsappFromNumber,
        to: `whatsapp:${to}`,
      });

      console.log(
        `💬 WhatsApp sent to ${to} (SID: ${whatsappMessage.sid}, Status: ${whatsappMessage.status})`
      );

      return {
        status: whatsappMessage.status as 'sent' | 'queued' | 'failed',
        messageId: whatsappMessage.sid,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to send WhatsApp to ${to}:`, errorMessage);

      return {
        status: 'failed',
        error: errorMessage,
      };
    }
  }

  /**
   * Send message via specified channel
   */
  async send(options: SendSMSOptions): Promise<SMSServiceResponse> {
    const channel = options.channel || 'sms';

    if (channel === 'whatsapp') {
      return this.sendWhatsApp(options.to, options.message);
    } else {
      return this.sendSMS(options.to, options.message);
    }
  }

  /**
   * Send batch SMS
   */
  async sendBatch(
    messages: SendSMSOptions[]
  ): Promise<SMSServiceResponse[]> {
    console.log(`📱 Sending ${messages.length} SMS...`);

    const results = await Promise.all(messages.map((msg) => this.send(msg)));

    const successful = results.filter(
      (r) => r.status === 'sent' || r.status === 'queued'
    ).length;
    const failed = results.filter((r) => r.status === 'failed').length;

    console.log(`✅ SMS batch complete: ${successful} sent/queued, ${failed} failed`);

    return results;
  }

  /**
   * Validate phone number format (India: +91XXXXXXXXXX)
   */
  private isValidPhoneNumber(phoneNumber: string): boolean {
    // Accept: +919876543210, +1234567890, etc.
    const phoneRegex = /^\+\d{10,15}$/;
    return phoneRegex.test(phoneNumber);
  }

  /**
   * Format phone number to international format
   */
  formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');

    // If starts with 91 (India), add +
    if (digits.startsWith('91')) {
      return `+${digits}`;
    }

    // Otherwise, assume it needs +91 prefix (for India)
    if (digits.length === 10) {
      return `+91${digits}`;
    }

    // Already international format?
    if (!phoneNumber.startsWith('+')) {
      return `+${digits}`;
    }

    return phoneNumber;
  }

  /**
   * Check if phone number needs formatting
   */
  needsFormatting(phoneNumber: string): boolean {
    return !this.isValidPhoneNumber(phoneNumber);
  }
}

// Export singleton instance
export const smsService = new SMSService();

export default smsService;
