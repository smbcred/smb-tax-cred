import sgMail from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Email template IDs for SMBTaxCredits
export const EMAIL_TEMPLATES = {
  WELCOME: process.env.SENDGRID_TEMPLATE_WELCOME || 'd-12345-default-welcome',
  DOCUMENT_READY: process.env.SENDGRID_TEMPLATE_DOCUMENT_READY || 'd-12345-document-ready',
  PAYMENT_CONFIRMATION: process.env.SENDGRID_TEMPLATE_PAYMENT_CONFIRMATION || 'd-12345-payment-confirmation',
  INTAKE_REMINDER: process.env.SENDGRID_TEMPLATE_INTAKE_REMINDER || 'd-12345-intake-reminder',
} as const;

interface EmailParams {
  to: string;
  from?: string;
  subject?: string;
  text?: string;
  html?: string;
}

interface TemplateEmailParams {
  to: string;
  templateId: string;
  dynamicTemplateData: Record<string, any>;
  from?: string;
}

/**
 * Send a basic email using SendGrid
 */
export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    const message = {
      to: params.to,
      from: params.from || process.env.SENDGRID_FROM_EMAIL || 'noreply@smbtaxcredits.com',
      subject: params.subject,
      text: params.text,
      html: params.html,
    };

    await sgMail.send(message);
    console.log(`Email sent successfully to ${params.to}`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

/**
 * Send a templated email using SendGrid Dynamic Templates
 */
export async function sendTemplateEmail(params: TemplateEmailParams): Promise<boolean> {
  try {
    const message = {
      to: params.to,
      from: params.from || process.env.SENDGRID_FROM_EMAIL || 'noreply@smbtaxcredits.com',
      templateId: params.templateId,
      dynamicTemplateData: params.dynamicTemplateData,
    };

    await sgMail.send(message);
    console.log(`Template email sent successfully to ${params.to} using template ${params.templateId}`);
    return true;
  } catch (error) {
    console.error('SendGrid template email error:', error);
    return false;
  }
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(to: string, userData: { name: string; companyName: string }): Promise<boolean> {
  return sendTemplateEmail({
    to,
    templateId: EMAIL_TEMPLATES.WELCOME,
    dynamicTemplateData: {
      name: userData.name,
      companyName: userData.companyName,
      loginUrl: `${process.env.FRONTEND_URL || 'https://smbtaxcredits.com'}/login`,
      supportEmail: process.env.SENDGRID_SUPPORT_EMAIL || 'support@smbtaxcredits.com',
    },
  });
}

/**
 * Send document ready notification
 */
export async function sendDocumentReadyEmail(
  to: string, 
  userData: { name: string; companyName: string; documentName: string; downloadUrl: string }
): Promise<boolean> {
  return sendTemplateEmail({
    to,
    templateId: EMAIL_TEMPLATES.DOCUMENT_READY,
    dynamicTemplateData: {
      name: userData.name,
      companyName: userData.companyName,
      documentName: userData.documentName,
      downloadUrl: userData.downloadUrl,
      supportEmail: process.env.SENDGRID_SUPPORT_EMAIL || 'support@smbtaxcredits.com',
    },
  });
}

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmationEmail(
  to: string,
  userData: { name: string; companyName: string; amount: number; receiptUrl: string }
): Promise<boolean> {
  return sendTemplateEmail({
    to,
    templateId: EMAIL_TEMPLATES.PAYMENT_CONFIRMATION,
    dynamicTemplateData: {
      name: userData.name,
      companyName: userData.companyName,
      amount: userData.amount,
      receiptUrl: userData.receiptUrl,
      supportEmail: process.env.SENDGRID_SUPPORT_EMAIL || 'support@smbtaxcredits.com',
    },
  });
}

/**
 * Send intake form reminder email
 */
export async function sendIntakeReminderEmail(
  to: string,
  userData: { name: string; companyName: string; intakeUrl: string; daysRemaining: number }
): Promise<boolean> {
  return sendTemplateEmail({
    to,
    templateId: EMAIL_TEMPLATES.INTAKE_REMINDER,
    dynamicTemplateData: {
      name: userData.name,
      companyName: userData.companyName,
      intakeUrl: userData.intakeUrl,
      daysRemaining: userData.daysRemaining,
      supportEmail: process.env.SENDGRID_SUPPORT_EMAIL || 'support@smbtaxcredits.com',
    },
  });
}

// Export the SendGrid instance for testing purposes
export { sgMail };