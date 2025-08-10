# SMBTaxCredits.com - API Documentation

## Overview
RESTful API for the R&D Tax Credit documentation platform. All endpoints return JSON and use standard HTTP status codes.

## Authentication
Most endpoints require JWT authentication:
```
Authorization: Bearer <token>
```

## Base URL
- Development: `http://localhost:5000/api`
- Production: `https://api.smbtaxcredits.com/api`

---

## Endpoints

### Calculator

#### POST `/api/calculator/estimate`
Calculate potential R&D tax credit based on AI experimentation activities.

**Request Body:**
```json
{
  "businessType": "agency",
  "qualifyingActivities": ["custom_gpt", "prompt_engineering", "chatbot_tuning"],
  "employees": {
    "total": 25,
    "rdAllocation": 0.4
  },
  "wages": {
    "w2Wages": 500000,
    "rdAllocation": 0.4
  },
  "contractors": {
    "total": 50000,
    "rdAllocation": 0.8
  },
  "supplies": {
    "total": 20000,
    "rdAllocation": 0.6
  },
  "software": {
    "total": 30000,
    "rdAllocation": 1.0
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "federalCredit": 35420,
    "qualifiedWages": 200000,
    "qualifiedContractors": 26000,
    "qualifiedSupplies": 12000,
    "qualifiedSoftware": 30000,
    "totalQREs": 268000,
    "creditRate": 0.14,
    "pricingTier": 4,
    "serviceFee": 1200,
    "roi": {
      "netBenefit": 34220,
      "roiPercentage": 2851.67,
      "paybackDays": 12.37
    }
  }
}
```

### Lead Capture

#### POST `/api/leads/capture`
Save lead information from calculator results.

**Request Body:**
```json
{
  "email": "owner@agency.com",
  "companyName": "Creative Agency LLC",
  "phone": "555-0123",
  "calculationId": "calc_123",
  "calculationData": {
    "federalCredit": 35420,
    "businessType": "agency"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "leadId": "lead_456",
    "message": "Lead captured successfully"
  }
}
```

### Authentication

#### POST `/api/auth/register`
Create new user account (typically after Stripe payment).

**Request Body:**
```json
{
  "email": "owner@agency.com",
  "password": "SecurePassword123!",
  "stripeCustomerId": "cus_789",
  "companyName": "Creative Agency LLC"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user_123",
      "email": "owner@agency.com",
      "company": {
        "id": "company_456",
        "name": "Creative Agency LLC"
      }
    }
  }
}
```

#### POST `/api/auth/login`
Authenticate existing user.

**Request Body:**
```json
{
  "email": "owner@agency.com",
  "password": "SecurePassword123!"
}
```

#### POST `/api/auth/refresh`
Refresh authentication token.

**Headers:** `Authorization: Bearer <old_token>`

### Intake Forms

#### GET `/api/intake/sections`
Get intake form structure and user's progress.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "sections": [
      {
        "id": "company_info",
        "title": "Company Information",
        "status": "completed",
        "fields": [...]
      },
      {
        "id": "rd_activities",
        "title": "R&D Activities",
        "status": "in_progress",
        "fields": [...]
      }
    ],
    "overallProgress": 45
  }
}
```

#### POST `/api/intake/save`
Save intake form section data.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "sectionId": "rd_activities",
  "data": {
    "projects": [
      {
        "name": "Customer Service Chatbot",
        "description": "Developed custom GPT for handling FAQs",
        "startDate": "2024-01-15",
        "endDate": "2024-03-30",
        "activities": ["prompt_engineering", "custom_gpt", "testing"],
        "challenges": "Reducing wrong answer rate from 30% to 5%",
        "iterations": 12,
        "metrics": {
          "before": { "errorRate": 0.3, "avgResponseTime": 45 },
          "after": { "errorRate": 0.05, "avgResponseTime": 15 }
        }
      }
    ]
  }
}
```

#### POST `/api/intake/submit`
Submit completed intake form for processing.

**Headers:** `Authorization: Bearer <token>`

### Documents

#### GET `/api/documents`
List all generated documents for user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": "doc_123",
        "type": "form_6765",
        "name": "Form 6765 - 2024.pdf",
        "generatedAt": "2024-12-20T15:30:00Z",
        "downloadUrl": "https://...",
        "expiresAt": "2024-12-27T15:30:00Z"
      }
    ]
  }
}
```

#### GET `/api/documents/:id/download`
Get temporary download URL for document.

**Headers:** `Authorization: Bearer <token>`

### Webhooks

#### POST `/api/webhooks/stripe`
Handle Stripe webhook events.

**Headers:** `Stripe-Signature: <signature>`

**Events Handled:**
- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.failed`

#### POST `/api/webhooks/make`
Handle Make.com workflow callbacks.

**Headers:** `X-Make-Signature: <signature>`

**Request Body:**
```json
{
  "intakeFormId": "intake_123",
  "status": "completed",
  "documents": [
    {
      "type": "form_6765",
      "url": "https://..."
    }
  ]
}
```

### Admin

#### GET `/api/admin/stats`
Get platform statistics (requires admin role).

**Headers:** `Authorization: Bearer <admin_token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 523,
    "totalCalculations": 2341,
    "conversionRate": 0.223,
    "averageCredit": 42350,
    "documentsGenerated": 467
  }
}
```

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  }
}
```

### Common Error Codes
- `AUTHENTICATION_REQUIRED` - 401
- `FORBIDDEN` - 403
- `NOT_FOUND` - 404
- `VALIDATION_ERROR` - 422
- `RATE_LIMIT_EXCEEDED` - 429
- `INTERNAL_ERROR` - 500

## Rate Limiting
- Default: 100 requests per 15 minutes per IP
- Authenticated: 200 requests per 15 minutes per user
- Calculator: 20 requests per hour per IP

## Webhooks Security
All webhooks use signature verification:
- Stripe: Uses `Stripe-Signature` header
- Make.com: Uses HMAC-SHA256 with shared secret
- Airtable: IP whitelist verification