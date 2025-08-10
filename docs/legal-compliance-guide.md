# SMBTaxCredits.com - Legal & Compliance Guide

## Overview
This guide ensures all copywriting, marketing claims, and platform operations comply with legal requirements and ethical standards.

## Table of Contents
1. [Regulatory Compliance](#regulatory-compliance)
2. [Marketing Copy Compliance](#marketing-copy-compliance)
3. [Required Disclaimers](#required-disclaimers)
4. [Prohibited Claims](#prohibited-claims)
5. [Data Privacy & Security](#data-privacy--security)
6. [Terms of Service Guidelines](#terms-of-service-guidelines)
7. [Audit Defense Guidelines](#audit-defense-guidelines)

---

## Regulatory Compliance

### IRS Circular 230 Requirements
```
IMPORTANT: We are not a CPA firm, law firm, or Enrolled Agent. 
Our software generates documentation based on user inputs. 
Users should consult with a qualified tax professional before 
claiming R&D tax credits on their returns.
```

### Key Compliance Rules
1. **Cannot provide tax advice** - Only tax professionals can advise
2. **Cannot guarantee outcomes** - No promises of approval or specific amounts
3. **Must maintain accuracy** - All calculations must follow IRC Section 41
4. **Must protect user data** - Follow data security best practices

### Required Registrations
- [ ] Business license in state of operation
- [ ] Data processor registration (if applicable)
- [ ] Privacy policy filed with state AG (California)
- [ ] Terms of service legally reviewed

---

## Marketing Copy Compliance

### Approved Messaging Framework

#### ✅ ACCEPTABLE Claims
```
"Calculate your potential R&D tax credit"
"Generate IRS-compliant documentation"
"Based on current federal tax law"
"Many businesses qualify for credits"
"Streamline your documentation process"
"Save time on R&D credit paperwork"
```

#### ❌ PROHIBITED Claims
```
"Guaranteed tax savings"
"IRS-approved documentation"
"Maximize your refund"
"Risk-free tax credits"
"Certified by the IRS"
"Guaranteed audit protection"
```

### Claim Substantiation Requirements

For any marketing claim, we must have:
1. **Factual basis** - Data or law supporting the claim
2. **Typical results** - Not just best-case scenarios
3. **Clear disclaimers** - When results may vary
4. **Current information** - Updated for law changes

### Example Copy Templates

#### Hero Section
```
ACCEPTABLE:
"Turn Your AI Experiments into Tax Credits
Calculate your potential federal R&D tax credit in minutes.
Generate documentation to support your claim."

NOT ACCEPTABLE:
"Get Guaranteed Tax Refunds with AI
IRS-Approved R&D Credits Made Easy
Maximum Refunds with Zero Risk"
```

#### Value Proposition
```
ACCEPTABLE:
"Many businesses using AI tools qualify for R&D tax credits
worth 10-14% of their experimentation costs."

NOT ACCEPTABLE:
"Every business using ChatGPT qualifies for massive tax credits."
```

---

## Required Disclaimers

### Homepage Disclaimer
```html
<div class="disclaimer">
  <p>
    This tool provides estimates based on current federal tax law. 
    Actual credits depend on your specific circumstances and IRS 
    examination. Consult a tax professional before claiming credits.
  </p>
</div>
```

### Calculator Disclaimer
```html
<div class="calculator-disclaimer">
  <h4>Important Information:</h4>
  <ul>
    <li>Estimates are based on information you provide</li>
    <li>Not all activities may qualify upon IRS review</li>
    <li>Documentation requirements must be met</li>
    <li>For 2022-2025, Section 174 requires R&D expense capitalization</li>
  </ul>
  <p>
    <strong>This is not tax advice.</strong> Please consult with a 
    qualified tax professional regarding your specific situation.
  </p>
</div>
```

### Document Generation Disclaimer
```html
<div class="document-disclaimer">
  <p>
    <strong>NOTICE:</strong> These documents are generated based on 
    your inputs. You are responsible for:
  </p>
  <ul>
    <li>Verifying all information is accurate</li>
    <li>Maintaining supporting documentation</li>
    <li>Meeting all IRS requirements</li>
    <li>Consulting with a tax professional</li>
  </ul>
  <p>
    SMBTaxCredits.com does not guarantee IRS acceptance of these 
    documents and is not responsible for any tax liabilities, 
    penalties, or audit outcomes.
  </p>
</div>
```

### Email Footer Disclaimer
```
This email contains information about R&D tax credits but does not 
constitute tax advice. Tax laws are complex and change frequently. 
Please consult with a qualified tax professional before making any 
tax-related decisions.

SMBTaxCredits.com is a document preparation service. We are not a 
law firm or accounting firm and cannot provide legal or tax advice.
```

---

## Prohibited Claims

### Never Make These Statements

#### About Guarantees
- ❌ "Guaranteed approval"
- ❌ "Risk-free credits"
- ❌ "IRS-approved methods"
- ❌ "Audit-proof documentation"
- ❌ "Guaranteed refunds"

#### About Expertise
- ❌ "Tax experts"
- ❌ "IRS specialists"
- ❌ "Certified professionals"
- ❌ "Licensed advisors"

#### About Results
- ❌ "Maximum credits"
- ❌ "Largest possible refund"
- ❌ "Beat the IRS"
- ❌ "Loopholes"

### Required Qualifiers

When discussing benefits, always use qualifiers:
- "May qualify"
- "Potentially eligible"
- "Could receive"
- "Estimated credit"
- "Based on your inputs"

---

## Data Privacy & Security

### Privacy Policy Requirements

Must disclose:
1. **What we collect** - All data types
2. **How we use it** - All purposes
3. **Who we share with** - All third parties
4. **User rights** - Access, deletion, correction
5. **Security measures** - How we protect data
6. **Contact information** - Privacy officer

### CCPA Compliance (California)
```typescript
// Required user rights implementation
export const userPrivacyRights = {
  // Right to know
  async getUserData(userId: string) {
    return await collectAllUserData(userId);
  },
  
  // Right to delete
  async deleteUser(userId: string) {
    await deleteFromDatabase(userId);
    await deleteFromAirtable(userId);
    await deleteFromStripe(userId);
    await deleteFromS3(userId);
  },
  
  // Right to opt-out
  async optOutOfSale(userId: string) {
    // We don't sell data, but must offer option
    await markOptOut(userId);
  },
};
```

### Security Requirements
- Encrypt sensitive data at rest
- Use TLS for all transmissions
- Implement access controls
- Regular security audits
- Incident response plan
- Breach notification procedures

---

## Terms of Service Guidelines

### Essential Clauses

#### 1. Service Description
```
SMBTaxCredits.com provides software tools to help businesses 
calculate potential R&D tax credits and generate supporting 
documentation. We are not tax advisors and do not provide tax, 
legal, or accounting advice.
```

#### 2. User Responsibilities
```
Users are solely responsible for:
- Accuracy of all information provided
- Determining eligibility for credits
- Maintaining required documentation
- Filing accurate tax returns
- Compliance with all tax laws
```

#### 3. Limitation of Liability
```
IN NO EVENT SHALL SMBTAXCREDITS.COM BE LIABLE FOR:
- Tax penalties or interest
- Audit outcomes
- Denied credits
- Consequential damages
- Lost profits or savings

Our maximum liability is limited to the fees paid for our service.
```

#### 4. Indemnification
```
User agrees to indemnify and hold harmless SMBTaxCredits.com 
from any claims, losses, or damages arising from:
- User's tax filings
- Inaccurate information provided
- Misuse of generated documents
- Violation of these terms
```

#### 5. Disclaimer of Warranties
```
THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. 
WE DO NOT WARRANT THAT:
- Credits will be approved by IRS
- Documents will prevent audits
- Calculations are error-free
- Service will be uninterrupted
```

---

## Audit Defense Guidelines

### What We CAN Say
- "Documentation to support your position"
- "Organized records for IRS review"
- "Clear explanation of your R&D activities"
- "Substantiation for claimed expenses"

### What We CANNOT Say
- "Audit protection"
- "IRS-proof documentation"
- "Guaranteed to pass audit"
- "Bulletproof claims"

### If User Faces Audit

Template response:
```
We're sorry to hear about your audit. While we cannot provide 
representation or tax advice, the documentation package you 
generated includes:

- Technical narratives explaining your R&D
- Expense summaries with calculations
- Project descriptions and timelines

We recommend you:
1. Contact a tax professional immediately
2. Provide them with all documentation
3. Maintain all original records
4. Respond to IRS deadlines promptly

Please note that audit outcomes depend on many factors beyond 
our documentation.
```

---

## Compliance Monitoring

### Regular Reviews Needed

#### Monthly
- [ ] Review marketing copy for compliance
- [ ] Check for law changes
- [ ] Update disclaimers if needed
- [ ] Review customer complaints

#### Quarterly
- [ ] Legal review of terms
- [ ] Privacy policy updates
- [ ] Security audit
- [ ] Compliance training

#### Annually
- [ ] Full legal audit
- [ ] Update all documentation
- [ ] Review insurance coverage
- [ ] Renew registrations

### Red Flags to Monitor
1. Customer complaints about outcomes
2. Requests for tax advice
3. Claims of guaranteed results
4. Pressure to promise specific amounts
5. Attempts to position as tax professionals

### Response Templates

#### When asked for tax advice:
```
I understand you're looking for guidance on [topic]. While our 
platform helps with documentation, we're not able to provide tax 
advice. For questions about your specific tax situation, we 
recommend consulting with a CPA or tax attorney who can review 
your complete circumstances.
```

#### When asked about guarantees:
```
We cannot guarantee any specific outcome with the IRS. Our tool 
helps you calculate potential credits and create documentation, 
but the IRS makes final determinations based on their review of 
your specific facts and circumstances.
```

---

## Marketing Copy Checklist

Before publishing any marketing content:

- [ ] No guarantee language
- [ ] Includes appropriate disclaimers
- [ ] Uses "may" or "could" for benefits
- [ ] Doesn't position us as tax advisors
- [ ] Factually accurate
- [ ] Current with law changes
- [ ] Includes "not tax advice" where appropriate
- [ ] Avoids superlatives ("best", "maximum")
- [ ] Clear about what we do/don't do
- [ ] Reviewed by legal if significant