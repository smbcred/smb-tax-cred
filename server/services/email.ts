import sgMail from '@sendgrid/mail';

// Initialize SendGrid if API key is available
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface WelcomeEmailData {
  email: string;
  firstName?: string;
  orderNumber: string;
  estimatedCredit: number;
  tierName: string;
  dashboardUrl: string;
}

export interface OrderConfirmationEmailData {
  email: string;
  firstName?: string;
  orderNumber: string;
  amount: number;
  tierName: string;
  estimatedCredit: number;
  nextSteps: string[];
}

export class EmailService {
  private static readonly FROM_EMAIL = 'noreply@smbtaxcredits.com';
  private static readonly FROM_NAME = 'SMB Tax Credits';

  static async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('SendGrid API key not configured - welcome email not sent');
      return false;
    }

    try {
      const msg = {
        to: data.email,
        from: {
          email: this.FROM_EMAIL,
          name: this.FROM_NAME,
        },
        subject: `Welcome to SMB Tax Credits - Your ${data.tierName} Package is Ready!`,
        html: this.generateWelcomeEmailHTML(data),
        text: this.generateWelcomeEmailText(data),
      };

      await sgMail.send(msg);
      console.log(`Welcome email sent to ${data.email} for order ${data.orderNumber}`);
      return true;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }
  }

  static async sendOrderConfirmationEmail(data: OrderConfirmationEmailData): Promise<boolean> {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('SendGrid API key not configured - order confirmation email not sent');
      return false;
    }

    try {
      const msg = {
        to: data.email,
        from: {
          email: this.FROM_EMAIL,
          name: this.FROM_NAME,
        },
        subject: `Order Confirmation #${data.orderNumber} - R&D Tax Credit Documentation`,
        html: this.generateOrderConfirmationHTML(data),
        text: this.generateOrderConfirmationText(data),
      };

      await sgMail.send(msg);
      console.log(`Order confirmation email sent to ${data.email} for order ${data.orderNumber}`);
      return true;
    } catch (error) {
      console.error('Failed to send order confirmation email:', error);
      return false;
    }
  }

  private static generateWelcomeEmailHTML(data: WelcomeEmailData): string {
    const displayName = data.firstName ? `, ${data.firstName}` : '';
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to SMB Tax Credits</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
    .btn { display: inline-block; background: #3B82F6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; }
    .highlight { background: #fef3c7; padding: 16px; border-radius: 6px; border-left: 4px solid #f59e0b; }
    .steps { list-style: none; padding: 0; }
    .steps li { padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
    .steps li:last-child { border-bottom: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to SMB Tax Credits${displayName}!</h1>
      <p>Your R&D tax credit documentation is being prepared</p>
    </div>
    
    <div class="content">
      <div class="highlight">
        <h3>🎉 Order Confirmed: #${data.orderNumber}</h3>
        <p><strong>Package:</strong> ${data.tierName} ($${data.estimatedCredit.toLocaleString()} estimated credit)</p>
      </div>
      
      <h3>What happens next?</h3>
      <ul class="steps">
        <li><strong>Step 1:</strong> Our team reviews your calculation and business information</li>
        <li><strong>Step 2:</strong> We prepare your IRS-compliant documentation package</li>
        <li><strong>Step 3:</strong> You receive download links within 48 hours</li>
        <li><strong>Step 4:</strong> File your amended return with confidence</li>
      </ul>
      
      <p style="margin-top: 30px;">
        <a href="${data.dashboardUrl}" class="btn">Access Your Dashboard</a>
      </p>
      
      <h3>Questions?</h3>
      <p>Reply to this email or visit our help center. We're here to help you maximize your R&D tax credits!</p>
    </div>
    
    <div class="footer">
      <p>SMB Tax Credits - Turning AI experiments into tax savings</p>
      <p style="font-size: 12px; color: #6b7280;">This is an automated message. Please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>`;
  }

  private static generateWelcomeEmailText(data: WelcomeEmailData): string {
    const displayName = data.firstName ? `, ${data.firstName}` : '';
    
    return `Welcome to SMB Tax Credits${displayName}!

Order Confirmed: #${data.orderNumber}
Package: ${data.tierName} ($${data.estimatedCredit.toLocaleString()} estimated credit)

What happens next?

1. Our team reviews your calculation and business information
2. We prepare your IRS-compliant documentation package  
3. You receive download links within 48 hours
4. File your amended return with confidence

Access your dashboard: ${data.dashboardUrl}

Questions? Reply to this email or visit our help center. We're here to help you maximize your R&D tax credits!

SMB Tax Credits - Turning AI experiments into tax savings`;
  }

  private static generateOrderConfirmationHTML(data: OrderConfirmationEmailData): string {
    const displayName = data.firstName ? `, ${data.firstName}` : '';
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #059669; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
    .order-details { background: #f0f9ff; padding: 20px; border-radius: 6px; border: 1px solid #bae6fd; }
    .amount { font-size: 24px; font-weight: bold; color: #059669; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Payment Successful${displayName}!</h1>
      <p>Your order has been confirmed</p>
    </div>
    
    <div class="content">
      <div class="order-details">
        <h3>Order #${data.orderNumber}</h3>
        <p><strong>Package:</strong> ${data.tierName}</p>
        <p><strong>Estimated Credit:</strong> $${data.estimatedCredit.toLocaleString()}</p>
        <p><strong>Amount Paid:</strong> <span class="amount">$${data.amount.toLocaleString()}</span></p>
      </div>
      
      <h3>Next Steps:</h3>
      <ol>
        ${data.nextSteps.map(step => `<li>${step}</li>`).join('')}
      </ol>
      
      <p><strong>Timeline:</strong> You'll receive your documentation package within 48 hours.</p>
    </div>
    
    <div class="footer">
      <p>Thank you for choosing SMB Tax Credits!</p>
    </div>
  </div>
</body>
</html>`;
  }

  private static generateOrderConfirmationText(data: OrderConfirmationEmailData): string {
    const displayName = data.firstName ? `, ${data.firstName}` : '';
    
    return `Payment Successful${displayName}!

Order #${data.orderNumber}
Package: ${data.tierName}
Estimated Credit: $${data.estimatedCredit.toLocaleString()}
Amount Paid: $${data.amount.toLocaleString()}

Next Steps:
${data.nextSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

Timeline: You'll receive your documentation package within 48 hours.

Thank you for choosing SMB Tax Credits!`;
  }
}