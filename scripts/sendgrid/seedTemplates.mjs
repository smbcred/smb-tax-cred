// scripts/sendgrid/seedTemplates.mjs
// Usage: node scripts/sendgrid/seedTemplates.mjs
import sg from '@sendgrid/client';

if (!process.env.SENDGRID_API_KEY) {
  console.error('Missing SENDGRID_API_KEY in env');
  process.exit(1);
}
sg.setApiKey(process.env.SENDGRID_API_KEY);

const BRAND = {
  companyName: 'SMBTaxCredits',
  primary: '#2E5AAC',
  primaryDark: '#1E3A7A',
  secondary: '#1E8E5A',
  secondaryLight: '#34D399',
  neutral: '#6B7280',
  neutralLight: '#F3F4F6',
  success: '#10B981',
  warning: '#F59E0B',
};

// Helper: upsert a dynamic template by name, then add a published version
async function upsertTemplate({ name, subject, html }) {
  // 1) List existing dynamic templates
  const [resp, body] = await sg.request({
    method: 'GET',
    url: '/v3/templates?generations=dynamic',
  });
  const existing = (body?.result || []).find(t => t.name === name);

  let templateId = existing?.id;
  if (!templateId) {
    // 2) Create the template
    const [, created] = await sg.request({
      method: 'POST',
      url: '/v3/templates',
      body: { name, generation: 'dynamic' },
    });
    templateId = created.id;
  }

  // 3) Add a new version (active=1 publishes it)
  await sg.request({
    method: 'POST',
    url: `/v3/templates/${templateId}/versions`,
    body: {
      name: 'v1',
      active: 1,
      subject,
      html_content: html,
      plain_content: 'This email requires an HTML-capable client.',
    },
  });

  return templateId;
}

// ---- Enhanced HTML blocks with professional styling ----
const sharedFooter = `
<div style="margin:32px 0 0;padding:24px 0 0;border-top:2px solid ${BRAND.neutralLight};">
  <table width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td style="text-align:center;padding-bottom:16px;">
        <div style="background:linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%);color:#fff;padding:8px 16px;border-radius:20px;display:inline-block;font-size:14px;font-weight:600;">
          ${BRAND.companyName}.com
        </div>
      </td>
    </tr>
    <tr>
      <td style="text-align:center;">
        <p style="font-size:13px;color:${BRAND.neutral};line-height:1.6;margin:0 0 8px;">
          💡 <strong>Important:</strong> This email contains estimates for informational purposes only and is not tax advice.
        </p>
        <p style="font-size:13px;color:${BRAND.neutral};margin:0 0 16px;">
          Questions? <a href="{{supportUrl}}" style="color:${BRAND.primary};text-decoration:none;font-weight:600;">Contact our tax credit specialists →</a>
        </p>
        <div style="border-top:1px solid #E5E7EB;padding-top:16px;">
          <p style="font-size:12px;color:#9CA3AF;margin:0;">
            © {{year}} SMBTaxCredits.com • Helping businesses maximize R&D tax credits
            <br>{{companyAddress}}
          </p>
        </div>
      </td>
    </tr>
  </table>
</div>
`;

const wrap = (inner) => `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SMBTaxCredits.com</title>
    <style>
      @media only screen and (max-width: 640px) {
        .container { width: 100% !important; margin: 8px !important; padding: 16px !important; }
        .mobile-hide { display: none !important; }
        h1 { font-size: 24px !important; }
        .button { padding: 14px 20px !important; font-size: 16px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%);font-family:'Inter',Arial,sans-serif;line-height:1.6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%);min-height:100vh;">
      <tr><td align="center" style="padding:20px 0;">
        <table class="container" width="640" style="background:#fff;margin:20px;padding:32px;border-radius:16px;box-shadow:0 10px 25px rgba(0,0,0,0.1);border:1px solid #E5E7EB;">
          <tr><td>
            <!-- Header -->
            <div style="text-align:center;margin-bottom:32px;padding-bottom:24px;border-bottom:3px solid ${BRAND.neutralLight};">
              <div style="background:linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%);color:#fff;padding:12px 24px;border-radius:25px;display:inline-block;margin-bottom:16px;">
                <span style="font-size:20px;font-weight:700;">${BRAND.companyName}</span>
              </div>
              <p style="color:${BRAND.neutral};font-size:14px;margin:0;">Your R&D Tax Credit Specialists</p>
            </div>
            <!-- Content -->
            ${inner}
            <!-- Footer -->
            ${sharedFooter}
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

// 1) Welcome
const welcome = {
  name: 'Welcome',
  subject: '🎉 Welcome to {{companyName}}, {{name}}! Your R&D credits await',
  html: wrap(`
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="margin:0 0 12px;color:#111827;font-size:32px;font-weight:700;">
        Welcome, {{name}}! 🎉
      </h1>
      <p style="margin:0 0 24px;color:${BRAND.neutral};font-size:18px;font-weight:500;">
        You're all set with <span style="color:${BRAND.primary};font-weight:700;">{{companyName}}</span>
      </p>
    </div>
    
    <div style="background:linear-gradient(135deg, ${BRAND.neutralLight} 0%, #fff 100%);padding:24px;border-radius:12px;margin-bottom:24px;border-left:4px solid ${BRAND.secondary};">
      <h3 style="margin:0 0 12px;color:#111827;font-size:18px;">🚀 Ready to maximize your R&D tax credits?</h3>
      <p style="margin:0 0 16px;color:${BRAND.neutral};line-height:1.7;">
        Complete your business intake to unlock your personalized R&D credit estimate. Our platform converts your everyday AI experiments and innovation activities into IRS-compliant documentation.
      </p>
      <div style="background:${BRAND.success};color:#fff;padding:12px 16px;border-radius:8px;font-size:14px;font-weight:600;">
        💰 Average credit: $15,000 - $50,000 for small businesses
      </div>
    </div>
    
    <div style="text-align:center;margin:32px 0;">
      <a href="{{dashboardUrl}}" class="button" style="display:inline-block;background:linear-gradient(135deg, ${BRAND.secondary} 0%, ${BRAND.secondaryLight} 100%);color:#fff;padding:16px 32px;border-radius:12px;text-decoration:none;font-size:18px;font-weight:600;box-shadow:0 4px 12px rgba(30,142,90,0.3);transition:all 0.3s ease;">
        🏁 Start Your Assessment →
      </a>
    </div>
    
    <div style="margin-top:24px;padding:16px;background:#FEF7E0;border-radius:8px;border-left:4px solid ${BRAND.warning};">
      <p style="margin:0;color:#92400E;font-size:14px;"><strong>⏰ Time-sensitive:</strong> R&D credits for 2024 must be claimed by your tax filing deadline. Start now to maximize your savings!</p>
    </div>
  `),
};

// 2) Lead Credit Report (after lead capture)
// NOTE: pass preformatted strings for amounts/rates in your data.
const leadReport = {
  name: 'Lead Credit Report',
  subject: 'Your estimated R&D credit: ${{credit.estimate}} for {{taxYear}}',
  html: wrap(`
    <h1 style="margin:0 0 4px;color:#111827;">Your R&D Credit Estimate</h1>
    <p style="margin:0 0 16px;color:#6B7280;">Tax Year {{taxYear}} • Method: {{method}}</p>

    <div style="background:#F3F4F6;border-radius:10px;padding:16px;margin-bottom:16px;">
      <p style="margin:0;color:#111827;font-size:18px;">
        Estimated Credit: <strong>$` + `{{credit.estimate}}</strong>
        <span style="color:#6B7280;font-size:14px;">(effective rate ~ {{credit.effectiveRatePct}}%)</span>
      </p>
      {{#if pricing.tierLabel}}
      <p style="margin:6px 0 0;color:#374151;">
        Service Fee: <strong>{{pricing.tierLabel}}</strong> — $` + `{{pricing.fee}}
      </p>
      {{/if}}
    </div>

    <h3 style="margin:16px 0 8px;color:#111827;">Qualified Research Expenses (QRE) — Draft</h3>
    <table width="100%" cellpadding="6" cellspacing="0" style="border-collapse:collapse;border:1px solid #E5E7EB;">
      <tr style="background:#F9FAFB;">
        <th align="left" style="border-bottom:1px solid #E5E7EB;">Category</th>
        <th align="right" style="border-bottom:1px solid #E5E7EB;">Amount</th>
      </tr>
      {{#if qres.wages}}<tr><td>Wages (allocated)</td><td align="right">$` + `{{qres.wages}}</td></tr>{{/if}}
      {{#if qres.contractors}}<tr><td>Contractors (65% eligible)</td><td align="right">$` + `{{qres.contractors}}</td></tr>{{/if}}
      {{#if qres.supplies}}<tr><td>Supplies</td><td align="right">$` + `{{qres.supplies}}</td></tr>{{/if}}
      {{#if qres.software}}<tr><td>Software Licenses</td><td align="right">$` + `{{qres.software}}</td></tr>{{/if}}
      {{#if qres.cloud}}<tr><td>Cloud Computing</td><td align="right">$` + `{{qres.cloud}}</td></tr>{{/if}}
    </table>

    {{#if isQSB}}
    <div style="background:#ECFDF5;border:1px solid #D1FAE5;border-radius:10px;padding:12px;margin:16px 0;">
      <strong style="color:#065F46;">QSB Payroll Offset:</strong>
      You may apply up to $` + `{{qsb.maxOffset}} of the credit against payroll taxes (Form 8974), subject to eligibility.
    </div>
    {{/if}}

    <p style="margin:16px 0;color:#374151;">
      Next, complete your intake so we can generate your IRS package (Form 6765 + narrative) and finalize numbers.
    </p>

    <p>
      <a href="{{next.intakeUrl}}" style="display:inline-block;background:` + BRAND.secondary + `;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;margin-right:8px;">
        Complete Intake
      </a>
      <a href="{{next.dashboardUrl}}" style="display:inline-block;background:` + BRAND.primary + `;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;">
        View Dashboard
      </a>
    </p>

    <p style="margin:16px 0 0;color:#6B7280;font-size:13px;line-height:1.6;">
      This estimate uses ASC by default. If there were no QREs in the prior three years, ASC is 6% of current-year QREs; otherwise it's 14% of the excess over 50% of the 3-year average.
      Contractor costs are counted at 65% of the qualifying portion.
    </p>
  `),
};

// 3) Docs Ready
const docsReady = {
  name: 'Docs Ready',
  subject: '📄 Your {{taxYear}} R&D documents are ready for download!',
  html: wrap(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="background:linear-gradient(135deg, ${BRAND.success} 0%, ${BRAND.secondaryLight} 100%);color:#fff;padding:16px;border-radius:50%;display:inline-block;margin-bottom:16px;width:60px;height:60px;line-height:60px;font-size:30px;">📄</div>
      <h1 style="margin:0 0 8px;color:#111827;font-size:28px;font-weight:700;">
        Your documents are ready!
      </h1>
      <p style="margin:0;color:${BRAND.neutral};font-size:16px;">
        Hi {{name}}, your <strong>{{taxYear}} R&D credit package</strong> is complete
      </p>
    </div>
    
    <div style="background:linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);padding:24px;border-radius:12px;margin-bottom:24px;border:2px solid ${BRAND.success};">
      <h3 style="margin:0 0 12px;color:#065F46;font-size:18px;display:flex;align-items:center;">
        <span style="margin-right:8px;">✅</span> Package Contents
      </h3>
      <ul style="margin:0;padding-left:20px;color:#047857;line-height:1.8;">
        <li>Form 6765 - Research Credit</li>
        <li>IRS-compliant supporting documentation</li>
        <li>Detailed expense breakdown</li>
        <li>Filing instructions and recommendations</li>
      </ul>
    </div>
    
    <div style="text-align:center;margin:24px 0;">
      <a href="{{downloadUrl}}" class="button" style="display:inline-block;background:linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%);color:#fff;padding:16px 32px;border-radius:12px;text-decoration:none;font-size:18px;font-weight:600;box-shadow:0 4px 12px rgba(46,90,172,0.3);">
        📥 Download Your Package
      </a>
    </div>
    
    <div style="background:#FEF7E0;padding:16px;border-radius:8px;border-left:4px solid ${BRAND.warning};text-align:center;">
      <p style="margin:0 0 8px;color:#92400E;font-weight:600;">⚡ Secure Download Link</p>
      <p style="margin:0;color:#92400E;font-size:14px;">
        Link expires in <strong>{{expiresInMinutes}} minutes</strong> for security
        <br><span style="font-size:12px;">Need a new link? Get one from your dashboard</span>
      </p>
    </div>
  `),
};

// 4) Receipt
const receipt = {
  name: 'Receipt',
  subject: '💳 Payment confirmed: ${{amount}} — {{tierName}}',
  html: wrap(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="background:linear-gradient(135deg, ${BRAND.success} 0%, ${BRAND.secondaryLight} 100%);color:#fff;padding:16px;border-radius:50%;display:inline-block;margin-bottom:16px;width:60px;height:60px;line-height:60px;font-size:30px;">✅</div>
      <h1 style="margin:0 0 8px;color:#111827;font-size:28px;font-weight:700;">
        Payment Confirmed!
      </h1>
      <p style="margin:0;color:${BRAND.neutral};font-size:16px;">
        Thank you for investing in your R&D tax credits
      </p>
    </div>
    
    <div style="background:linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%);padding:24px;border-radius:12px;margin-bottom:24px;border:2px solid ${BRAND.primary};">
      <table width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td style="padding-bottom:16px;">
            <h3 style="margin:0 0 16px;color:#1E3A8A;font-size:20px;text-align:center;">Payment Summary</h3>
          </td>
        </tr>
        <tr>
          <td>
            <table width="100%" cellspacing="0" cellpadding="8" style="background:#fff;border-radius:8px;border:1px solid #E5E7EB;">
              <tr>
                <td style="font-weight:600;color:#374151;border-bottom:1px solid #F3F4F6;">Service Package:</td>
                <td style="text-align:right;font-weight:700;color:${BRAND.primary};border-bottom:1px solid #F3F4F6;">{{tierName}}</td>
              </tr>
              <tr>
                <td style="font-weight:600;color:#374151;border-bottom:1px solid #F3F4F6;">Amount Paid:</td>
                <td style="text-align:right;font-weight:700;font-size:18px;color:${BRAND.success};border-bottom:1px solid #F3F4F6;">$` + `{{amount}}</td>
              </tr>
              <tr>
                <td style="font-weight:600;color:#374151;border-bottom:1px solid #F3F4F6;">Payment Date:</td>
                <td style="text-align:right;color:#6B7280;border-bottom:1px solid #F3F4F6;">{{paymentDate}}</td>
              </tr>
              <tr>
                <td style="font-weight:600;color:#374151;">Card:</td>
                <td style="text-align:right;color:#6B7280;">•••• •••• •••• {{last4}}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
    
    <div style="text-align:center;margin:24px 0;">
      <a href="{{invoiceUrl}}" class="button" style="display:inline-block;background:linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%);color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:600;box-shadow:0 4px 12px rgba(46,90,172,0.2);">
        📄 View Full Invoice
      </a>
    </div>
    
    <div style="background:#F0FDF4;padding:20px;border-radius:8px;border-left:4px solid ${BRAND.success};text-align:center;">
      <h4 style="margin:0 0 8px;color:#166534;font-size:16px;">🚀 What's Next?</h4>
      <p style="margin:0;color:#166534;font-size:14px;line-height:1.6;">
        Our team will now begin processing your R&D credit documentation. 
        <br>You'll receive your completed package within 5-7 business days.
      </p>
    </div>
  `),
};

// 5) Password Reset
const reset = {
  name: 'Password Reset',
  subject: '🔐 Reset your password (expires in {{expiresInMinutes}} minutes)',
  html: wrap(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="background:linear-gradient(135deg, ${BRAND.warning} 0%, #FCD34D 100%);color:#fff;padding:16px;border-radius:50%;display:inline-block;margin-bottom:16px;width:60px;height:60px;line-height:60px;font-size:30px;">🔐</div>
      <h1 style="margin:0 0 8px;color:#111827;font-size:28px;font-weight:700;">
        Reset Your Password
      </h1>
      <p style="margin:0;color:${BRAND.neutral};font-size:16px;">
        Hi {{name}}, we received a request to reset your password
      </p>
    </div>
    
    <div style="background:#FEF7E0;padding:20px;border-radius:12px;margin-bottom:24px;border-left:4px solid ${BRAND.warning};">
      <h3 style="margin:0 0 12px;color:#92400E;font-size:16px;">⚡ Security Notice</h3>
      <p style="margin:0 0 12px;color:#92400E;font-size:14px;line-height:1.6;">
        This password reset link is valid for <strong>{{expiresInMinutes}} minutes</strong> for your security.
      </p>
      <p style="margin:0;color:#92400E;font-size:13px;">
        If you didn't request this reset, please ignore this email and your password will remain unchanged.
      </p>
    </div>
    
    <div style="text-align:center;margin:32px 0;">
      <a href="{{resetUrl}}" class="button" style="display:inline-block;background:linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%);color:#fff;padding:16px 32px;border-radius:12px;text-decoration:none;font-size:18px;font-weight:600;box-shadow:0 4px 12px rgba(46,90,172,0.3);">
        🔑 Reset My Password
      </a>
    </div>
    
    <div style="background:#F8FAFC;padding:16px;border-radius:8px;text-align:center;border:1px solid #E2E8F0;">
      <p style="margin:0;color:#64748B;font-size:13px;">
        <strong>Need help?</strong> Contact our support team if you're having trouble accessing your account.
      </p>
    </div>
  `),
};

async function main() {
  const items = [welcome, leadReport, docsReady, receipt, reset];
  const results = {};
  for (const t of items) {
    const id = await upsertTemplate(t);
    results[t.name] = id;
    console.log(`✔ ${t.name}: ${id}`);
  }
  console.log('\nAdd these to your secrets:');
  console.log(`SENDGRID_TEMPLATE_WELCOME=${results['Welcome']}`);
  console.log(`SENDGRID_TEMPLATE_LEAD_REPORT=${results['Lead Credit Report']}`);
  console.log(`SENDGRID_TEMPLATE_DOCS_READY=${results['Docs Ready']}`);
  console.log(`SENDGRID_TEMPLATE_RECEIPT=${results['Receipt']}`);
  console.log(`SENDGRID_TEMPLATE_RESET=${results['Password Reset']}`);
}

main().catch(e => {
  console.error('Seed failed:', e?.response?.body || e.message);
  process.exit(1);
});