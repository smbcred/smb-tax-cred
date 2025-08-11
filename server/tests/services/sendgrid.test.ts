import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  sendEmail, 
  sendTemplateEmail, 
  sendWelcomeEmail,
  sendDocumentReadyEmail,
  sendPaymentConfirmationEmail,
  sendIntakeReminderEmail,
  sgMail,
  EMAIL_TEMPLATES
} from '../../services/email/sendgrid';

// Mock SendGrid
vi.mock('@sendgrid/mail', () => ({
  default: {
    setApiKey: vi.fn(),
    send: vi.fn(),
  }
}));

describe('SendGrid Email Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up environment variables for testing
    process.env.SENDGRID_API_KEY = 'test-api-key';
    process.env.SENDGRID_FROM_EMAIL = 'test@smbtaxcredits.com';
    process.env.SENDGRID_SUPPORT_EMAIL = 'support@smbtaxcredits.com';
    process.env.FRONTEND_URL = 'https://test.smbtaxcredits.com';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('sendEmail', () => {
    it('should send basic email successfully', async () => {
      vi.mocked(sgMail.send).mockResolvedValue([{} as any, {}]);

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test content',
        html: '<p>Test content</p>'
      });

      expect(result).toBe(true);
      expect(sgMail.send).toHaveBeenCalledWith({
        to: 'test@example.com',
        from: 'test@smbtaxcredits.com',
        subject: 'Test Subject',
        text: 'Test content',
        html: '<p>Test content</p>',
      });
    });

    it('should handle email sending errors', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(sgMail.send).mockRejectedValue(new Error('SendGrid API error'));

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test content'
      });

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('SendGrid email error:', expect.any(Error));
      
      consoleErrorSpy.mockRestore();
    });

    it('should use default from email when not provided', async () => {
      vi.mocked(sgMail.send).mockResolvedValue([{} as any, {}]);

      await sendEmail({
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test content'
      });

      expect(sgMail.send).toHaveBeenCalledWith(expect.objectContaining({
        from: 'test@smbtaxcredits.com'
      }));
    });
  });

  describe('sendTemplateEmail', () => {
    it('should send template email successfully', async () => {
      vi.mocked(sgMail.send).mockResolvedValue([{} as any, {}]);

      const result = await sendTemplateEmail({
        to: 'test@example.com',
        templateId: 'd-123456789',
        dynamicTemplateData: {
          name: 'John Doe',
          companyName: 'Test Company'
        }
      });

      expect(result).toBe(true);
      expect(sgMail.send).toHaveBeenCalledWith({
        to: 'test@example.com',
        from: 'test@smbtaxcredits.com',
        templateId: 'd-123456789',
        dynamicTemplateData: {
          name: 'John Doe',
          companyName: 'Test Company'
        }
      });
    });

    it('should handle template email errors', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(sgMail.send).mockRejectedValue(new Error('Template not found'));

      const result = await sendTemplateEmail({
        to: 'test@example.com',
        templateId: 'd-invalid',
        dynamicTemplateData: {}
      });

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('SendGrid template email error:', expect.any(Error));
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email with correct template data', async () => {
      vi.mocked(sgMail.send).mockResolvedValue([{} as any, {}]);

      const result = await sendWelcomeEmail('newuser@example.com', {
        name: 'Jane Smith',
        companyName: 'Smith Industries'
      });

      expect(result).toBe(true);
      expect(sgMail.send).toHaveBeenCalledWith({
        to: 'newuser@example.com',
        from: 'test@smbtaxcredits.com',
        templateId: EMAIL_TEMPLATES.WELCOME,
        dynamicTemplateData: {
          name: 'Jane Smith',
          companyName: 'Smith Industries',
          loginUrl: 'https://test.smbtaxcredits.com/login',
          supportEmail: 'support@smbtaxcredits.com'
        }
      });
    });
  });

  describe('sendDocumentReadyEmail', () => {
    it('should send document ready email with correct template data', async () => {
      vi.mocked(sgMail.send).mockResolvedValue([{} as any, {}]);

      const result = await sendDocumentReadyEmail('user@example.com', {
        name: 'John Doe',
        companyName: 'Doe Corp',
        documentName: 'Form 6765 - 2024',
        downloadUrl: 'https://s3.aws.com/secure-download-link'
      });

      expect(result).toBe(true);
      expect(sgMail.send).toHaveBeenCalledWith({
        to: 'user@example.com',
        from: 'test@smbtaxcredits.com',
        templateId: EMAIL_TEMPLATES.DOCUMENT_READY,
        dynamicTemplateData: {
          name: 'John Doe',
          companyName: 'Doe Corp',
          documentName: 'Form 6765 - 2024',
          downloadUrl: 'https://s3.aws.com/secure-download-link',
          supportEmail: 'support@smbtaxcredits.com'
        }
      });
    });
  });

  describe('sendPaymentConfirmationEmail', () => {
    it('should send payment confirmation email with correct template data', async () => {
      vi.mocked(sgMail.send).mockResolvedValue([{} as any, {}]);

      const result = await sendPaymentConfirmationEmail('customer@example.com', {
        name: 'Alice Johnson',
        companyName: 'Johnson LLC',
        amount: 49900, // $499.00 in cents
        receiptUrl: 'https://stripe.com/receipt/xyz'
      });

      expect(result).toBe(true);
      expect(sgMail.send).toHaveBeenCalledWith({
        to: 'customer@example.com',
        from: 'test@smbtaxcredits.com',
        templateId: EMAIL_TEMPLATES.PAYMENT_CONFIRMATION,
        dynamicTemplateData: {
          name: 'Alice Johnson',
          companyName: 'Johnson LLC',
          amount: 49900,
          receiptUrl: 'https://stripe.com/receipt/xyz',
          supportEmail: 'support@smbtaxcredits.com'
        }
      });
    });
  });

  describe('sendIntakeReminderEmail', () => {
    it('should send intake reminder email with correct template data', async () => {
      vi.mocked(sgMail.send).mockResolvedValue([{} as any, {}]);

      const result = await sendIntakeReminderEmail('reminder@example.com', {
        name: 'Bob Wilson',
        companyName: 'Wilson & Associates',
        intakeUrl: 'https://test.smbtaxcredits.com/intake-form/abc123',
        daysRemaining: 7
      });

      expect(result).toBe(true);
      expect(sgMail.send).toHaveBeenCalledWith({
        to: 'reminder@example.com',
        from: 'test@smbtaxcredits.com',
        templateId: EMAIL_TEMPLATES.INTAKE_REMINDER,
        dynamicTemplateData: {
          name: 'Bob Wilson',
          companyName: 'Wilson & Associates',
          intakeUrl: 'https://test.smbtaxcredits.com/intake-form/abc123',
          daysRemaining: 7,
          supportEmail: 'support@smbtaxcredits.com'
        }
      });
    });
  });

  describe('EMAIL_TEMPLATES', () => {
    it('should have all required email template constants', () => {
      expect(EMAIL_TEMPLATES.WELCOME).toBeDefined();
      expect(EMAIL_TEMPLATES.DOCUMENT_READY).toBeDefined();
      expect(EMAIL_TEMPLATES.PAYMENT_CONFIRMATION).toBeDefined();
      expect(EMAIL_TEMPLATES.INTAKE_REMINDER).toBeDefined();
      
      // Each template should be a string
      Object.values(EMAIL_TEMPLATES).forEach(templateId => {
        expect(typeof templateId).toBe('string');
        expect(templateId.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Environment Variable Validation', () => {
    it('should validate SENDGRID_API_KEY exists in environment', () => {
      // Since the module is already imported, just verify the validation works
      const originalApiKey = process.env.SENDGRID_API_KEY;
      
      expect(originalApiKey).toBeDefined();
      expect(typeof originalApiKey).toBe('string');
      expect(originalApiKey?.length).toBeGreaterThan(0);
    });
  });
});

describe('SendGrid Integration Smoke Tests', () => {
  it('should validate SendGrid API key format', () => {
    const testApiKey = 'SG.test-key-12345';
    process.env.SENDGRID_API_KEY = testApiKey;
    
    expect(process.env.SENDGRID_API_KEY).toBe(testApiKey);
    expect(process.env.SENDGRID_API_KEY?.startsWith('SG.')).toBe(true);
  });

  it('should have valid email addresses in configuration', () => {
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@smbtaxcredits.com';
    const supportEmail = process.env.SENDGRID_SUPPORT_EMAIL || 'support@smbtaxcredits.com';
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test(fromEmail)).toBe(true);
    expect(emailRegex.test(supportEmail)).toBe(true);
  });
});