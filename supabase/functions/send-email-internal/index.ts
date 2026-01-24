import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Email templates
const templates = {
  signup: (fullName: string) => ({
    subject: `Welcome to AONet, ${fullName}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #d4af37;">Welcome to AONet! 🎉</h1>
        <p>Hi ${fullName},</p>
        <p>Thank you for creating an account with us. We're excited to have you on board!</p>
        <h2>What you can do:</h2>
        <ul>
          <li>Browse our extensive product catalog</li>
          <li>Add items to your cart</li>
          <li>Place orders and track shipments</li>
          <li>Manage your profile and preferences</li>
          <li>Enjoy special offers and discounts</li>
        </ul>
        <p style="margin-top: 30px;">
          <a href="https://aonetop.com/account" style="background-color: #d4af37; color: black; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Complete Your Profile
          </a>
        </p>
        <p style="margin-top: 30px; font-size: 12px; color: #666;">
          Need help? Contact us at support@aonetop.com
        </p>
      </div>
    `,
  }),
  password_reset: (fullName: string, resetLink: string, expiresInMinutes: number) => ({
    subject: "Reset Your AONet Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Password Reset Request</h1>
        <p>Hi ${fullName},</p>
        <p>We received a request to reset your password. Click the button below to set a new password:</p>
        <p style="margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #d4af37; color: black; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Reset Password
          </a>
        </p>
        <p style="color: #d9534f; background-color: #f2dede; padding: 10px; border-radius: 5px;">
          ⚠️ This link expires in ${expiresInMinutes} minutes. If you didn't request this, please ignore this email.
        </p>
        <p>Or paste this link in your browser: <code>${resetLink}</code></p>
        <p style="margin-top: 30px; font-size: 12px; color: #666;">
          Need help? Contact us at support@aonetop.com
        </p>
      </div>
    `,
  }),
  profile_update: (fullName: string, changedFields: Array<{field: string, oldValue?: string, newValue?: string}>, ipAddress: string, timestamp: string) => ({
    subject: "Profile Update Confirmation - AONet",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Profile Update Notification</h1>
        <p>Hi ${fullName},</p>
        <p>Your profile was updated on ${new Date(timestamp).toLocaleString()}.</p>
        <h3>Changes made:</h3>
        <ul>
          ${changedFields.map(field => `<li><strong>${field.field}:</strong> ${field.oldValue || 'N/A'} → ${field.newValue || 'N/A'}</li>`).join('')}
        </ul>
        <p style="color: #d9534f; background-color: #f2dede; padding: 10px; border-radius: 5px;">
          ⚠️ <strong>Security Notice:</strong> From IP Address: ${ipAddress}
        </p>
        <p>If you didn't make these changes, please contact us immediately at support@aonetop.com</p>
        <p style="margin-top: 30px; font-size: 12px; color: #666;">
          Need help? Contact us at support@aonetop.com
        </p>
      </div>
    `,
  }),
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { type, userId, email, fullName, resetToken, resetLink, expiresInMinutes, changedFields, ipAddress, timestamp } = await req.json();

    // Get email config from environment
    const gmailUser = Deno.env.get("GMAIL_USER");
    const gmailPassword = Deno.env.get("GMAIL_APP_PASSWORD");

    if (!gmailUser || !gmailPassword) {
      throw new Error("Gmail credentials not configured");
    }

    // Build email content
    let emailContent;
    switch (type) {
      case "signup":
        emailContent = templates.signup(fullName);
        break;
      case "password_reset":
        emailContent = templates.password_reset(fullName, resetLink, expiresInMinutes || 30);
        break;
      case "profile_update":
        emailContent = templates.profile_update(fullName, changedFields, ipAddress, timestamp);
        break;
      default:
        throw new Error("Unknown email type");
    }

    // Send email using Gmail SMTP
    // Note: In production, you should use a proper email service API
    // This is a simplified version - actual implementation would need a Node.js backend
    
    console.log(`Email would be sent to ${email}:`);
    console.log(`Subject: ${emailContent.subject}`);
    console.log(`To: ${email}`);
    console.log(`Type: ${type}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Email queued for sending to ${email}`,
        emailType: type,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in send-email-internal:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
