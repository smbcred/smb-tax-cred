# SendGrid Email Service Integration

## Overview
Complete SendGrid integration with dynamic templates for SMBTaxCredits.com email notifications.

## Features
- ✅ SendGrid API integration with error handling
- ✅ Dynamic template support for personalized emails
- ✅ Multiple email types (welcome, document ready, payment confirmation, intake reminders)
- ✅ Environment variable validation
- ✅ Development smoke test endpoint
- ✅ Comprehensive unit test suite (13/13 tests passing)

## Email Templates

### Welcome Email (`SENDGRID_TEMPLATE_WELCOME`)
- Sent to new users after registration
- Variables: `name`, `companyName`, `loginUrl`, `supportEmail`

### Document Ready (`SENDGRID_TEMPLATE_DOCUMENT_READY`)
- Sent when generated documents are available for download
- Variables: `name`, `companyName`, `documentName`, `downloadUrl`, `supportEmail`

### Payment Confirmation (`SENDGRID_TEMPLATE_PAYMENT_CONFIRMATION`)
- Sent after successful payment processing
- Variables: `name`, `companyName`, `amount`, `receiptUrl`, `supportEmail`

### Intake Reminder (`SENDGRID_TEMPLATE_INTAKE_REMINDER`)
- Sent to remind users to complete intake forms
- Variables: `name`, `companyName`, `intakeUrl`, `daysRemaining`, `supportEmail`

## Environment Variables

Required:
- `SENDGRID_API_KEY`: SendGrid API key (format: SG.xxx)

Optional (with defaults):
- `SENDGRID_FROM_EMAIL`: Default sender email (default: noreply@smbtaxcredits.com)
- `SENDGRID_SUPPORT_EMAIL`: Support contact email (default: support@smbtaxcredits.com)
- `FRONTEND_URL`: Base URL for links in emails (default: https://smbtaxcredits.com)

Template IDs (with fallback defaults):
- `SENDGRID_TEMPLATE_WELCOME`
- `SENDGRID_TEMPLATE_DOCUMENT_READY`
- `SENDGRID_TEMPLATE_PAYMENT_CONFIRMATION`
- `SENDGRID_TEMPLATE_INTAKE_REMINDER`

## Development Testing

### Smoke Test Endpoint
```bash
curl -X POST http://localhost:5000/api/dev/email-smoke \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com"}'
```

This endpoint:
- Only available in development mode
- No authentication required
- Sends a test welcome email using SENDGRID_TEMPLATE_WELCOME
- Returns detailed success/error information

### Unit Tests
Run the comprehensive test suite:
```bash
npx vitest --run server/tests/services/sendgrid.test.ts
```

Tests cover:
- Basic email sending
- Template email functionality
- Error handling scenarios
- Environment variable validation
- All email template functions
- SendGrid configuration validation

## Usage Examples

```typescript
import { sendWelcomeEmail, sendDocumentReadyEmail } from './services/email/sendgrid';

// Send welcome email
await sendWelcomeEmail('user@example.com', {
  name: 'John Smith',
  companyName: 'Smith Industries'
});

// Send document ready notification
await sendDocumentReadyEmail('user@example.com', {
  name: 'John Smith',
  companyName: 'Smith Industries',
  documentName: 'Form 6765 - 2024',
  downloadUrl: 'https://secure-s3-download-link'
});
```

## Integration Status
- ✅ SendGrid package installed (@sendgrid/mail)
- ✅ Service layer implemented with error handling
- ✅ Development smoke test endpoint configured
- ✅ Unit tests created and passing (13/13)
- ✅ Environment variables validated
- ✅ Authentication bypass configured for dev routes
- ✅ Ready for production template configuration

## Next Steps
1. Set up actual SendGrid dynamic templates in SendGrid dashboard
2. Configure real template IDs in environment variables
3. Test with real email addresses using smoke test endpoint
4. Integrate email notifications into user workflows (registration, document generation, payments)

## Troubleshooting

### "Bad Request" Error with Template
This is expected when using placeholder template IDs. Configure real SendGrid dynamic templates and update the environment variables with actual template IDs.

### Authentication Required Error
Ensure the development route `/api/dev/email-smoke` is included in the public routes list in `server/middleware/dataProtection.ts`.

### Import Errors in Tests
Verify the import paths use the correct relative path structure: `../../services/email/sendgrid`