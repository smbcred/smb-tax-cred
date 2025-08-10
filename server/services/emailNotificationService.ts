import { z } from 'zod';
import sgMail from '@sendgrid/mail';

// Email notification schemas
export const emailNotificationRequestSchema = z.object({
  recipientEmail: z.string().email("Valid email address is required"),
  recipientName: z.string().min(1, "Recipient name is required"),
  templateType: z.enum(['document_ready', 'calculation_complete', 'compliance_memo_ready', 'download_ready', 'welcome', 'payment_confirmation'], {
    description: 'Type of email template to use'
  }),
  templateData: z.record(z.any()).default({}),
  userId: z.string().min(1, "User ID is required"),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  scheduledAt: z.string().optional(),
  trackingEnabled: z.boolean().default(true),
  unsubscribeEnabled: z.boolean().default(true),
});

export const emailDeliveryStatusSchema = z.object({
  notificationId: z.string(),
  messageId: z.string().optional(),
  status: z.enum(['queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed', 'unsubscribed']),
  recipientEmail: z.string().email(),
  sentAt: z.string().optional(),
  deliveredAt: z.string().optional(),
  openedAt: z.string().optional(),
  clickedAt: z.string().optional(),
  bouncedAt: z.string().optional(),
  failedAt: z.string().optional(),
  errorMessage: z.string().optional(),
  bounceType: z.enum(['soft', 'hard', 'block', 'spam']).optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
});

export const emailTemplateSchema = z.object({
  templateId: z.string(),
  templateType: z.string(),
  subject: z.string(),
  htmlContent: z.string(),
  textContent: z.string(),
  variables: z.array(z.string()),
  isActive: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const emailStatsSchema = z.object({
  totalSent: z.number(),
  totalDelivered: z.number(),
  totalOpened: z.number(),
  totalClicked: z.number(),
  totalBounced: z.number(),
  totalFailed: z.number(),
  deliveryRate: z.number(),
  openRate: z.number(),
  clickRate: z.number(),
  bounceRate: z.number(),
  recentActivity: z.array(z.object({
    date: z.string(),
    sent: z.number(),
    delivered: z.number(),
    opened: z.number(),
    clicked: z.number(),
  })),
});

export type EmailNotificationRequest = z.infer<typeof emailNotificationRequestSchema>;
export type EmailDeliveryStatus = z.infer<typeof emailDeliveryStatusSchema>;
export type EmailTemplate = z.infer<typeof emailTemplateSchema>;
export type EmailStats = z.infer<typeof emailStatsSchema>;

export class EmailNotificationService {
  private readonly isConfigured: boolean;
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly baseUrl: string;
  
  // In-memory tracking for demo purposes
  private readonly deliveryTracking: Map<string, EmailDeliveryStatus> = new Map();
  private readonly unsubscribeList: Set<string> = new Set();
  private readonly bounceList: Set<string> = new Set();

  constructor() {
    // Check if SendGrid is configured
    const apiKey = process.env.SENDGRID_API_KEY;
    this.isConfigured = !!apiKey;
    
    if (this.isConfigured && apiKey) {
      sgMail.setApiKey(apiKey);
      console.log('SendGrid API configured successfully');
    } else {
      console.log('SendGrid API key not found - using placeholder mode');
    }

    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'no-reply@smbtaxcredits.com';
    this.fromName = process.env.SENDGRID_FROM_NAME || 'SMB Tax Credits';
    this.baseUrl = process.env.BASE_URL || 'https://smbtaxcredits.com';

    console.log('Email Notification Service initialized', {
      configured: this.isConfigured,
      fromEmail: this.fromEmail,
      fromName: this.fromName,
    });
  }

  async sendNotification(request: EmailNotificationRequest): Promise<{
    notificationId: string;
    messageId?: string;
    status: 'queued' | 'sent' | 'failed';
    error?: string;
  }> {
    try {
      console.log('Sending email notification:', {
        recipientEmail: request.recipientEmail,
        templateType: request.templateType,
        priority: request.priority,
        scheduledAt: request.scheduledAt,
      });

      // Check if recipient is unsubscribed
      if (this.unsubscribeList.has(request.recipientEmail)) {
        throw new Error('Recipient has unsubscribed from notifications');
      }

      // Check if recipient email has bounced
      if (this.bounceList.has(request.recipientEmail)) {
        throw new Error('Recipient email has bounced and is blocked');
      }

      // Generate notification ID
      const notificationId = this.generateNotificationId();
      
      // Get email template
      const template = this.getEmailTemplate(request.templateType);
      const renderedTemplate = this.renderTemplate(template, request.templateData, request.recipientName);

      // Create delivery tracking record
      const deliveryStatus: EmailDeliveryStatus = {
        notificationId,
        status: 'queued',
        recipientEmail: request.recipientEmail,
      };

      this.deliveryTracking.set(notificationId, deliveryStatus);

      if (this.isConfigured) {
        // Send real email via SendGrid
        const msg = {
          to: {
            email: request.recipientEmail,
            name: request.recipientName,
          },
          from: {
            email: this.fromEmail,
            name: this.fromName,
          },
          subject: renderedTemplate.subject,
          html: renderedTemplate.htmlContent,
          text: renderedTemplate.textContent,
          customArgs: {
            notificationId,
            userId: request.userId,
            templateType: request.templateType,
          },
          trackingSettings: {
            clickTracking: {
              enable: request.trackingEnabled,
            },
            openTracking: {
              enable: request.trackingEnabled,
            },
          },
        };

        const [response] = await sgMail.send(msg);
        
        // Update delivery status
        deliveryStatus.messageId = response.headers['x-message-id'] as string;
        deliveryStatus.status = 'sent';
        deliveryStatus.sentAt = new Date().toISOString();

        console.log('Email sent successfully via SendGrid:', {
          notificationId,
          messageId: deliveryStatus.messageId,
          recipient: request.recipientEmail,
        });

        return {
          notificationId,
          messageId: deliveryStatus.messageId,
          status: 'sent',
        };

      } else {
        // Placeholder mode - simulate email sending
        console.log('Placeholder email sent:', {
          notificationId,
          recipient: request.recipientEmail,
          subject: renderedTemplate.subject,
          templateType: request.templateType,
        });

        // Simulate successful delivery
        setTimeout(() => {
          deliveryStatus.status = 'sent';
          deliveryStatus.sentAt = new Date().toISOString();
          
          // Simulate delivery after a delay
          setTimeout(() => {
            deliveryStatus.status = 'delivered';
            deliveryStatus.deliveredAt = new Date().toISOString();
          }, 2000);
        }, 1000);

        return {
          notificationId,
          status: 'sent',
        };
      }

    } catch (error: any) {
      console.error('Failed to send email notification:', error);
      
      // Update delivery status to failed
      const notificationId = this.generateNotificationId();
      const deliveryStatus: EmailDeliveryStatus = {
        notificationId,
        status: 'failed',
        recipientEmail: request.recipientEmail,
        failedAt: new Date().toISOString(),
        errorMessage: error.message,
      };
      
      this.deliveryTracking.set(notificationId, deliveryStatus);

      return {
        notificationId,
        status: 'failed',
        error: error.message,
      };
    }
  }

  async getDeliveryStatus(notificationId: string): Promise<EmailDeliveryStatus | null> {
    return this.deliveryTracking.get(notificationId) || null;
  }

  async handleWebhook(webhookData: any): Promise<void> {
    try {
      console.log('Processing SendGrid webhook:', webhookData);

      // SendGrid webhook events are sent as arrays
      const events = Array.isArray(webhookData) ? webhookData : [webhookData];

      for (const event of events) {
        const notificationId = event.notificationId || event.unique_args?.notificationId;
        if (!notificationId) continue;

        const deliveryStatus = this.deliveryTracking.get(notificationId);
        if (!deliveryStatus) continue;

        // Update delivery status based on webhook event
        switch (event.event) {
          case 'delivered':
            deliveryStatus.status = 'delivered';
            deliveryStatus.deliveredAt = new Date(event.timestamp * 1000).toISOString();
            break;
          
          case 'open':
            deliveryStatus.status = 'opened';
            deliveryStatus.openedAt = new Date(event.timestamp * 1000).toISOString();
            deliveryStatus.userAgent = event.useragent;
            deliveryStatus.ipAddress = event.ip;
            break;
          
          case 'click':
            deliveryStatus.status = 'clicked';
            deliveryStatus.clickedAt = new Date(event.timestamp * 1000).toISOString();
            deliveryStatus.userAgent = event.useragent;
            deliveryStatus.ipAddress = event.ip;
            break;
          
          case 'bounce':
            deliveryStatus.status = 'bounced';
            deliveryStatus.bouncedAt = new Date(event.timestamp * 1000).toISOString();
            deliveryStatus.bounceType = this.mapBounceType(event.type);
            deliveryStatus.errorMessage = event.reason;
            
            // Add to bounce list for hard bounces
            if (deliveryStatus.bounceType === 'hard') {
              this.bounceList.add(deliveryStatus.recipientEmail);
            }
            break;
          
          case 'dropped':
          case 'deferred':
            deliveryStatus.status = 'failed';
            deliveryStatus.failedAt = new Date(event.timestamp * 1000).toISOString();
            deliveryStatus.errorMessage = event.reason;
            break;
          
          case 'unsubscribe':
            deliveryStatus.status = 'unsubscribed';
            this.unsubscribeList.add(deliveryStatus.recipientEmail);
            break;
        }

        console.log('Updated delivery status:', {
          notificationId,
          event: event.event,
          status: deliveryStatus.status,
        });
      }

    } catch (error: any) {
      console.error('Webhook processing error:', error);
      throw error;
    }
  }

  async unsubscribe(email: string, reason?: string): Promise<void> {
    console.log('Unsubscribing email:', { email, reason });
    this.unsubscribeList.add(email);
    
    // In a real implementation, this would be stored in the database
    // and integrated with SendGrid suppression lists
  }

  async getEmailStats(userId?: string, days: number = 30): Promise<EmailStats> {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    // Filter tracking data
    const relevantDeliveries = Array.from(this.deliveryTracking.values()).filter(delivery => {
      const deliveryDate = new Date(delivery.sentAt || new Date());
      return deliveryDate >= cutoffDate && (!userId || delivery.recipientEmail.includes(userId));
    });

    const totalSent = relevantDeliveries.filter(d => ['sent', 'delivered', 'opened', 'clicked'].includes(d.status)).length;
    const totalDelivered = relevantDeliveries.filter(d => d.status === 'delivered' || d.status === 'opened' || d.status === 'clicked').length;
    const totalOpened = relevantDeliveries.filter(d => d.status === 'opened' || d.status === 'clicked').length;
    const totalClicked = relevantDeliveries.filter(d => d.status === 'clicked').length;
    const totalBounced = relevantDeliveries.filter(d => d.status === 'bounced').length;
    const totalFailed = relevantDeliveries.filter(d => d.status === 'failed').length;

    const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
    const openRate = totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0;
    const clickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;
    const bounceRate = totalSent > 0 ? (totalBounced / totalSent) * 100 : 0;

    // Generate recent activity (last 7 days)
    const recentActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayDeliveries = relevantDeliveries.filter(d => {
        const deliveryDate = d.sentAt ? new Date(d.sentAt).toISOString().split('T')[0] : null;
        return deliveryDate === dateStr;
      });

      recentActivity.push({
        date: dateStr,
        sent: dayDeliveries.filter(d => ['sent', 'delivered', 'opened', 'clicked'].includes(d.status)).length,
        delivered: dayDeliveries.filter(d => ['delivered', 'opened', 'clicked'].includes(d.status)).length,
        opened: dayDeliveries.filter(d => ['opened', 'clicked'].includes(d.status)).length,
        clicked: dayDeliveries.filter(d => d.status === 'clicked').length,
      });
    }

    return {
      totalSent,
      totalDelivered,
      totalOpened,
      totalClicked,
      totalBounced,
      totalFailed,
      deliveryRate: Math.round(deliveryRate * 100) / 100,
      openRate: Math.round(openRate * 100) / 100,
      clickRate: Math.round(clickRate * 100) / 100,
      bounceRate: Math.round(bounceRate * 100) / 100,
      recentActivity,
    };
  }

  private getEmailTemplate(templateType: string): EmailTemplate {
    // In a real implementation, these would be stored in the database
    // or loaded from template files
    const templates: Record<string, Omit<EmailTemplate, 'templateId' | 'createdAt' | 'updatedAt'>> = {
      document_ready: {
        templateType: 'document_ready',
        subject: 'Your R&D Tax Credit Documents are Ready - {{companyName}}',
        htmlContent: this.getDocumentReadyHtmlTemplate(),
        textContent: this.getDocumentReadyTextTemplate(),
        variables: ['recipientName', 'companyName', 'documentCount', 'downloadUrl', 'unsubscribeUrl'],
        isActive: true,
      },
      calculation_complete: {
        templateType: 'calculation_complete',
        subject: 'R&D Tax Credit Calculation Complete - {{estimatedCredit}}',
        htmlContent: this.getCalculationCompleteHtmlTemplate(),
        textContent: this.getCalculationCompleteTextTemplate(),
        variables: ['recipientName', 'companyName', 'estimatedCredit', 'viewUrl', 'unsubscribeUrl'],
        isActive: true,
      },
      compliance_memo_ready: {
        templateType: 'compliance_memo_ready',
        subject: 'Your IRS Compliance Memo is Ready - {{companyName}}',
        htmlContent: this.getComplianceMemoHtmlTemplate(),
        textContent: this.getComplianceMemoTextTemplate(),
        variables: ['recipientName', 'companyName', 'downloadUrl', 'unsubscribeUrl'],
        isActive: true,
      },
      download_ready: {
        templateType: 'download_ready',
        subject: 'Your Document Download is Ready',
        htmlContent: this.getDownloadReadyHtmlTemplate(),
        textContent: this.getDownloadReadyTextTemplate(),
        variables: ['recipientName', 'fileCount', 'downloadUrl', 'expiresAt', 'unsubscribeUrl'],
        isActive: true,
      },
      welcome: {
        templateType: 'welcome',
        subject: 'Welcome to SMB Tax Credits - Let\'s Maximize Your R&D Credits',
        htmlContent: this.getWelcomeHtmlTemplate(),
        textContent: this.getWelcomeTextTemplate(),
        variables: ['recipientName', 'dashboardUrl', 'supportUrl', 'unsubscribeUrl'],
        isActive: true,
      },
      payment_confirmation: {
        templateType: 'payment_confirmation',
        subject: 'Payment Confirmed - Your R&D Documentation is Processing',
        htmlContent: this.getPaymentConfirmationHtmlTemplate(),
        textContent: this.getPaymentConfirmationTextTemplate(),
        variables: ['recipientName', 'companyName', 'amount', 'transactionId', 'statusUrl', 'unsubscribeUrl'],
        isActive: true,
      },
    };

    const template = templates[templateType];
    if (!template) {
      throw new Error(`Unknown email template type: ${templateType}`);
    }

    return {
      templateId: templateType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...template,
    };
  }

  private renderTemplate(template: EmailTemplate, data: Record<string, any>, recipientName: string): {
    subject: string;
    htmlContent: string;
    textContent: string;
  } {
    // Add default template variables
    const templateData = {
      recipientName,
      baseUrl: this.baseUrl,
      unsubscribeUrl: `${this.baseUrl}/unsubscribe?email={{recipientEmail}}`,
      supportUrl: `${this.baseUrl}/support`,
      dashboardUrl: `${this.baseUrl}/dashboard`,
      currentYear: new Date().getFullYear(),
      ...data,
    };

    // Simple template variable replacement
    let subject = template.subject;
    let htmlContent = template.htmlContent;
    let textContent = template.textContent;

    for (const [key, value] of Object.entries(templateData)) {
      const placeholder = `{{${key}}}`;
      const stringValue = String(value);
      
      subject = subject.replace(new RegExp(placeholder, 'g'), stringValue);
      htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), stringValue);
      textContent = textContent.replace(new RegExp(placeholder, 'g'), stringValue);
    }

    return {
      subject,
      htmlContent,
      textContent,
    };
  }

  private generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private mapBounceType(sendgridType: string): 'soft' | 'hard' | 'block' | 'spam' {
    switch (sendgridType) {
      case 'bounce':
      case 'blocked':
        return 'hard';
      case 'deferred':
        return 'soft';
      case 'spam_report':
        return 'spam';
      default:
        return 'soft';
    }
  }

  // Email template content methods
  private getDocumentReadyHtmlTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Documents Ready - SMB Tax Credits</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { padding: 30px 20px; }
    .cta-button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #666; }
    .unsubscribe { color: #888; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your R&D Tax Credit Documents Are Ready!</h1>
    </div>
    <div class="content">
      <p>Hi {{recipientName}},</p>
      
      <p>Great news! Your R&D tax credit documentation for <strong>{{companyName}}</strong> has been completed and is ready for download.</p>
      
      <p><strong>What's included:</strong></p>
      <ul>
        <li>IRS-compliant Form 6765</li>
        <li>Detailed R&D activity narratives</li>
        <li>Compliance memo with supporting documentation</li>
        <li>Expense breakdown and calculations</li>
      </ul>
      
      <p>Your documentation package contains <strong>{{documentCount}} files</strong> that you can download securely using the link below:</p>
      
      <div style="text-align: center;">
        <a href="{{downloadUrl}}" class="cta-button">Download Your Documents</a>
      </div>
      
      <p><strong>Important:</strong> This download link will expire in 24 hours for security. Please download your documents soon.</p>
      
      <p>If you have any questions about your R&D tax credit documentation, please don't hesitate to reach out to our support team.</p>
      
      <p>Best regards,<br>The SMB Tax Credits Team</p>
    </div>
    <div class="footer">
      <p>© {{currentYear}} SMB Tax Credits. All rights reserved.</p>
      <p><a href="{{unsubscribeUrl}}" class="unsubscribe">Unsubscribe</a> | <a href="{{supportUrl}}" class="unsubscribe">Support</a></p>
    </div>
  </div>
</body>
</html>`;
  }

  private getDocumentReadyTextTemplate(): string {
    return `Your R&D Tax Credit Documents Are Ready!

Hi {{recipientName}},

Great news! Your R&D tax credit documentation for {{companyName}} has been completed and is ready for download.

What's included:
- IRS-compliant Form 6765
- Detailed R&D activity narratives
- Compliance memo with supporting documentation
- Expense breakdown and calculations

Your documentation package contains {{documentCount}} files that you can download securely using this link:

{{downloadUrl}}

IMPORTANT: This download link will expire in 24 hours for security. Please download your documents soon.

If you have any questions about your R&D tax credit documentation, please don't hesitate to reach out to our support team at {{supportUrl}}.

Best regards,
The SMB Tax Credits Team

© {{currentYear}} SMB Tax Credits. All rights reserved.
Unsubscribe: {{unsubscribeUrl}}`;
  }

  private getCalculationCompleteHtmlTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Calculation Complete - SMB Tax Credits</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: #059669; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { padding: 30px 20px; }
    .highlight-box { background: #f0f9ff; border-left: 4px solid #059669; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .cta-button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #666; }
    .unsubscribe { color: #888; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your R&D Tax Credit Calculation is Complete!</h1>
    </div>
    <div class="content">
      <p>Hi {{recipientName}},</p>
      
      <p>We've finished calculating your R&D tax credit for <strong>{{companyName}}</strong>.</p>
      
      <div class="highlight-box">
        <h3>🎉 Estimated R&D Tax Credit</h3>
        <h2 style="color: #059669; margin: 10px 0;">{{estimatedCredit}}</h2>
        <p>This represents potential tax savings based on your qualified R&D activities and expenses.</p>
      </div>
      
      <p>Your calculation includes:</p>
      <ul>
        <li>Qualified research activities analysis</li>
        <li>Eligible expense categorization</li>
        <li>IRS Section 41 compliance validation</li>
        <li>Detailed calculation worksheets</li>
      </ul>
      
      <div style="text-align: center;">
        <a href="{{viewUrl}}" class="cta-button">View Detailed Results</a>
      </div>
      
      <p><strong>Next steps:</strong> You can now proceed to generate your complete documentation package to claim this credit with the IRS.</p>
      
      <p>Questions about your calculation? Our tax credit specialists are here to help.</p>
      
      <p>Best regards,<br>The SMB Tax Credits Team</p>
    </div>
    <div class="footer">
      <p>© {{currentYear}} SMB Tax Credits. All rights reserved.</p>
      <p><a href="{{unsubscribeUrl}}" class="unsubscribe">Unsubscribe</a> | <a href="{{supportUrl}}" class="unsubscribe">Support</a></p>
    </div>
  </div>
</body>
</html>`;
  }

  private getCalculationCompleteTextTemplate(): string {
    return `Your R&D Tax Credit Calculation is Complete!

Hi {{recipientName}},

We've finished calculating your R&D tax credit for {{companyName}}.

🎉 ESTIMATED R&D TAX CREDIT: {{estimatedCredit}}

This represents potential tax savings based on your qualified R&D activities and expenses.

Your calculation includes:
- Qualified research activities analysis
- Eligible expense categorization
- IRS Section 41 compliance validation
- Detailed calculation worksheets

View your detailed results: {{viewUrl}}

Next steps: You can now proceed to generate your complete documentation package to claim this credit with the IRS.

Questions about your calculation? Our tax credit specialists are here to help at {{supportUrl}}.

Best regards,
The SMB Tax Credits Team

© {{currentYear}} SMB Tax Credits. All rights reserved.
Unsubscribe: {{unsubscribeUrl}}`;
  }

  private getComplianceMemoHtmlTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Compliance Memo Ready - SMB Tax Credits</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: #7c3aed; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { padding: 30px 20px; }
    .cta-button { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #666; }
    .unsubscribe { color: #888; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your IRS Compliance Memo is Ready</h1>
    </div>
    <div class="content">
      <p>Hi {{recipientName}},</p>
      
      <p>Your IRS compliance memo for <strong>{{companyName}}</strong> has been completed and is ready for download.</p>
      
      <p>This memo provides:</p>
      <ul>
        <li>Legal justification for your R&D tax credit claim</li>
        <li>IRS Section 41 compliance analysis</li>
        <li>Supporting documentation references</li>
        <li>Risk assessment and mitigation strategies</li>
      </ul>
      
      <div style="text-align: center;">
        <a href="{{downloadUrl}}" class="cta-button">Download Compliance Memo</a>
      </div>
      
      <p><strong>Important:</strong> This document should be retained with your tax records and provided to your tax preparer.</p>
      
      <p>If you have questions about the compliance memo or need clarification on any points, please contact our support team.</p>
      
      <p>Best regards,<br>The SMB Tax Credits Team</p>
    </div>
    <div class="footer">
      <p>© {{currentYear}} SMB Tax Credits. All rights reserved.</p>
      <p><a href="{{unsubscribeUrl}}" class="unsubscribe">Unsubscribe</a> | <a href="{{supportUrl}}" class="unsubscribe">Support</a></p>
    </div>
  </div>
</body>
</html>`;
  }

  private getComplianceMemoTextTemplate(): string {
    return `Your IRS Compliance Memo is Ready

Hi {{recipientName}},

Your IRS compliance memo for {{companyName}} has been completed and is ready for download.

This memo provides:
- Legal justification for your R&D tax credit claim
- IRS Section 41 compliance analysis
- Supporting documentation references
- Risk assessment and mitigation strategies

Download your compliance memo: {{downloadUrl}}

IMPORTANT: This document should be retained with your tax records and provided to your tax preparer.

If you have questions about the compliance memo or need clarification on any points, please contact our support team at {{supportUrl}}.

Best regards,
The SMB Tax Credits Team

© {{currentYear}} SMB Tax Credits. All rights reserved.
Unsubscribe: {{unsubscribeUrl}}`;
  }

  private getDownloadReadyHtmlTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Download Ready - SMB Tax Credits</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { padding: 30px 20px; }
    .cta-button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #666; }
    .unsubscribe { color: #888; text-decoration: none; }
    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Download is Ready</h1>
    </div>
    <div class="content">
      <p>Hi {{recipientName}},</p>
      
      <p>Your requested documents are ready for download. Your package contains <strong>{{fileCount}}</strong> files.</p>
      
      <div style="text-align: center;">
        <a href="{{downloadUrl}}" class="cta-button">Download Files Now</a>
      </div>
      
      <div class="warning">
        <strong>⏰ Time Sensitive:</strong> This download link expires on {{expiresAt}}. Please download your files before this time.
      </div>
      
      <p>If you experience any issues with your download or if the link has expired, please contact our support team for assistance.</p>
      
      <p>Best regards,<br>The SMB Tax Credits Team</p>
    </div>
    <div class="footer">
      <p>© {{currentYear}} SMB Tax Credits. All rights reserved.</p>
      <p><a href="{{unsubscribeUrl}}" class="unsubscribe">Unsubscribe</a> | <a href="{{supportUrl}}" class="unsubscribe">Support</a></p>
    </div>
  </div>
</body>
</html>`;
  }

  private getDownloadReadyTextTemplate(): string {
    return `Your Download is Ready

Hi {{recipientName}},

Your requested documents are ready for download. Your package contains {{fileCount}} files.

Download your files: {{downloadUrl}}

⏰ TIME SENSITIVE: This download link expires on {{expiresAt}}. Please download your files before this time.

If you experience any issues with your download or if the link has expired, please contact our support team for assistance at {{supportUrl}}.

Best regards,
The SMB Tax Credits Team

© {{currentYear}} SMB Tax Credits. All rights reserved.
Unsubscribe: {{unsubscribeUrl}}`;
  }

  private getWelcomeHtmlTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to SMB Tax Credits</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: #2563eb; color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { padding: 30px 20px; }
    .cta-button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #666; }
    .unsubscribe { color: #888; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to SMB Tax Credits!</h1>
      <p>Your AI-powered R&D tax credit solution</p>
    </div>
    <div class="content">
      <p>Hi {{recipientName}},</p>
      
      <p>Welcome to SMB Tax Credits! We're excited to help you maximize your R&D tax credit opportunities.</p>
      
      <p><strong>What you can do:</strong></p>
      <ul>
        <li>Calculate your potential R&D tax credit</li>
        <li>Generate IRS-compliant documentation</li>
        <li>Track your AI experimentation activities</li>
        <li>Access expert guidance and support</li>
      </ul>
      
      <div style="text-align: center;">
        <a href="{{dashboardUrl}}" class="cta-button">Get Started Now</a>
      </div>
      
      <p><strong>Need help?</strong> Our support team is here to assist you every step of the way. Don't hesitate to reach out with any questions.</p>
      
      <p>Let's turn your AI experiments into tax savings!</p>
      
      <p>Best regards,<br>The SMB Tax Credits Team</p>
    </div>
    <div class="footer">
      <p>© {{currentYear}} SMB Tax Credits. All rights reserved.</p>
      <p><a href="{{unsubscribeUrl}}" class="unsubscribe">Unsubscribe</a> | <a href="{{supportUrl}}" class="unsubscribe">Support</a></p>
    </div>
  </div>
</body>
</html>`;
  }

  private getWelcomeTextTemplate(): string {
    return `Welcome to SMB Tax Credits!

Hi {{recipientName}},

Welcome to SMB Tax Credits! We're excited to help you maximize your R&D tax credit opportunities.

What you can do:
- Calculate your potential R&D tax credit
- Generate IRS-compliant documentation
- Track your AI experimentation activities
- Access expert guidance and support

Get started: {{dashboardUrl}}

Need help? Our support team is here to assist you every step of the way. Don't hesitate to reach out with any questions at {{supportUrl}}.

Let's turn your AI experiments into tax savings!

Best regards,
The SMB Tax Credits Team

© {{currentYear}} SMB Tax Credits. All rights reserved.
Unsubscribe: {{unsubscribeUrl}}`;
  }

  private getPaymentConfirmationHtmlTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Confirmed - SMB Tax Credits</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: #059669; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { padding: 30px 20px; }
    .cta-button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #666; }
    .unsubscribe { color: #888; text-decoration: none; }
    .success-box { background: #f0f9ff; border-left: 4px solid #059669; padding: 20px; margin: 20px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Payment Confirmed</h1>
    </div>
    <div class="content">
      <p>Hi {{recipientName}},</p>
      
      <p>Thank you! Your payment has been successfully processed.</p>
      
      <div class="success-box">
        <h3>Payment Details</h3>
        <p><strong>Company:</strong> {{companyName}}</p>
        <p><strong>Amount:</strong> {{amount}}</p>
        <p><strong>Transaction ID:</strong> {{transactionId}}</p>
      </div>
      
      <p><strong>What happens next:</strong></p>
      <ol>
        <li>Our team will begin processing your R&D documentation</li>
        <li>You'll receive email updates as each component is completed</li>
        <li>Your complete documentation package will be ready within 3-5 business days</li>
      </ol>
      
      <div style="text-align: center;">
        <a href="{{statusUrl}}" class="cta-button">Track Your Progress</a>
      </div>
      
      <p>Questions about your order? Our support team is standing by to help.</p>
      
      <p>Thank you for choosing SMB Tax Credits!</p>
      
      <p>Best regards,<br>The SMB Tax Credits Team</p>
    </div>
    <div class="footer">
      <p>© {{currentYear}} SMB Tax Credits. All rights reserved.</p>
      <p><a href="{{unsubscribeUrl}}" class="unsubscribe">Unsubscribe</a> | <a href="{{supportUrl}}" class="unsubscribe">Support</a></p>
    </div>
  </div>
</body>
</html>`;
  }

  private getPaymentConfirmationTextTemplate(): string {
    return `✅ Payment Confirmed

Hi {{recipientName}},

Thank you! Your payment has been successfully processed.

Payment Details:
- Company: {{companyName}}
- Amount: {{amount}}
- Transaction ID: {{transactionId}}

What happens next:
1. Our team will begin processing your R&D documentation
2. You'll receive email updates as each component is completed
3. Your complete documentation package will be ready within 3-5 business days

Track your progress: {{statusUrl}}

Questions about your order? Our support team is standing by to help at {{supportUrl}}.

Thank you for choosing SMB Tax Credits!

Best regards,
The SMB Tax Credits Team

© {{currentYear}} SMB Tax Credits. All rights reserved.
Unsubscribe: {{unsubscribeUrl}}`;
  }
}

// Singleton instance
let emailNotificationService: EmailNotificationService | null = null;

export function getEmailNotificationService(): EmailNotificationService {
  if (!emailNotificationService) {
    emailNotificationService = new EmailNotificationService();
  }
  return emailNotificationService;
}