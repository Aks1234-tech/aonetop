/**
 * Email Service - Handles email delivery via Nodemailer + Gmail SMTP
 * For production, can be easily switched to SendGrid or AWS SES
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

interface EmailServiceResponse {
  status: 'sent' | 'failed';
  messageId?: string;
  response?: string;
  error?: string;
}

class EmailService {
  private transporter: Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  /**
   * Initialize the email transporter based on environment
   */
  private initializeTransporter(): void {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.warn('⚠️  Email service credentials not configured. Email sending disabled.');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
        logger: process.env.NODE_ENV === 'development',
        debug: process.env.NODE_ENV === 'development',
      });

      console.log('✅ Email service initialized (Gmail SMTP)');
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
    }
  }

  /**
   * Verify transporter connection
   */
  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      console.warn('⚠️  Email transporter not configured');
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('✅ Email service connection verified');
      return true;
    } catch (error) {
      console.error('❌ Email service verification failed:', error);
      return false;
    }
  }

  /**
   * Send email
   */
  async send(options: SendEmailOptions): Promise<EmailServiceResponse> {
    if (!this.transporter) {
      return {
        status: 'failed',
        error: 'Email service not configured',
      };
    }

    // Validate email
    if (!this.isValidEmail(options.to)) {
      return {
        status: 'failed',
        error: 'Invalid email address',
      };
    }

    try {
      const info = await this.transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments,
        replyTo: process.env.REPLY_TO_EMAIL || process.env.GMAIL_USER,
      });

      console.log(`📧 Email sent to ${options.to} (Message ID: ${info.messageId})`);

      return {
        status: 'sent',
        messageId: info.messageId,
        response: info.response,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to send email to ${options.to}:`, errorMessage);

      return {
        status: 'failed',
        error: errorMessage,
      };
    }
  }

  /**
   * Send email with template variables substitution
   */
  async sendWithTemplate(
    to: string,
    subject: string,
    template: string,
    variables: Record<string, string | number | boolean>
  ): Promise<EmailServiceResponse> {
    // Replace template variables
    const html = this.replaceVariables(template, variables);

    return this.send({
      to,
      subject,
      html,
    });
  }

  /**
   * Send batch emails
   */
  async sendBatch(
    emails: SendEmailOptions[]
  ): Promise<EmailServiceResponse[]> {
    console.log(`📧 Sending ${emails.length} emails...`);

    const results = await Promise.all(
      emails.map((email) => this.send(email))
    );

    const successful = results.filter((r) => r.status === 'sent').length;
    const failed = results.filter((r) => r.status === 'failed').length;

    console.log(`✅ Batch complete: ${successful} sent, ${failed} failed`);

    return results;
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Replace template variables (e.g., {{user_name}})
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
}

// Export singleton instance
export const emailService = new EmailService();

export default emailService;
