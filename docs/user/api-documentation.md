# API Documentation

## Overview

SMBTaxCredits.com provides a RESTful API for developers who want to integrate our R&D tax credit documentation services into their own applications. The API supports calculation estimates, lead capture, and status tracking.

**Base URL**: `https://smbtaxcredits.com/api`

**Authentication**: Bearer token (JWT)

**Content Type**: `application/json`

## Authentication

### Get Access Token
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "user@example.com"
  }
}
```

### Using the Token
Include the token in the Authorization header for authenticated requests:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Calculator API

### Calculate R&D Tax Credit
Calculate estimated R&D tax credit based on expenses.

```http
POST /api/calculator/calculate
Content-Type: application/json

{
  "businessType": "technology",
  "employees": 5,
  "isFirstTime": true,
  "expenses": {
    "wages": 100000,
    "contractors": 50000,
    "supplies": 10000,
    "other": 5000,
    "total": 165000
  }
}
```

**Response**:
```json
{
  "eligibleExpenses": 157500,
  "creditRate": 0.06,
  "estimatedCredit": 9450,
  "breakdown": {
    "wages": 100000,
    "contractors": 32500,
    "supplies": 10000,
    "other": 5000,
    "contractorLimitApplied": true
  },
  "tier": "professional",
  "recommendedService": {
    "name": "Professional",
    "price": 599,
    "features": ["Complete documentation", "AI-generated memo", "Email support"]
  }
}
```

**Parameters**:
- `businessType` (string): One of `technology`, `healthcare`, `manufacturing`, `professional_services`, `retail`, `other`
- `employees` (number): Number of employees
- `isFirstTime` (boolean): Whether this is first-time filing for R&D credits
- `expenses` (object): Expense breakdown
  - `wages` (number): Employee wages for R&D activities
  - `contractors` (number): Contractor costs for R&D work
  - `supplies` (number): Supplies and materials
  - `other` (number): Other qualifying expenses
  - `total` (number): Total expenses (for validation)

## Lead Capture API

### Submit Lead
Capture lead information from calculator results.

```http
POST /api/leads
Content-Type: application/json

{
  "email": "prospect@example.com",
  "name": "John Smith",
  "company": "Smith Consulting",
  "phone": "+1-555-123-4567",
  "businessType": "technology",
  "estimatedCredit": 9450,
  "calculationData": {
    "expenses": {
      "wages": 100000,
      "contractors": 50000,
      "supplies": 10000,
      "other": 5000
    },
    "employees": 5
  },
  "source": "calculator",
  "metadata": {
    "userAgent": "Mozilla/5.0...",
    "referrer": "https://google.com",
    "utmSource": "google",
    "utmMedium": "cpc"
  }
}
```

**Response**:
```json
{
  "success": true,
  "leadId": "lead_abc123",
  "message": "Lead captured successfully",
  "nextSteps": {
    "description": "Check your email for next steps",
    "checkoutUrl": "https://smbtaxcredits.com/checkout?tier=professional"
  }
}
```

### Get Lead Status
```http
GET /api/leads/:leadId
Authorization: Bearer <token>
```

**Response**:
```json
{
  "id": "lead_abc123",
  "email": "prospect@example.com",
  "status": "converted",
  "estimatedCredit": 9450,
  "createdAt": "2024-01-15T10:30:00Z",
  "convertedAt": "2024-01-15T14:22:00Z"
}
```

## User Management API

### Get User Profile
```http
GET /api/auth/user
Authorization: Bearer <token>
```

**Response**:
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "accountStatus": "active",
  "subscription": {
    "tier": "professional",
    "status": "active",
    "purchaseDate": "2024-01-15T14:22:00Z"
  }
}
```

### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "securepassword"
}
```

## Document API

### Get Document Status
```http
GET /api/documents/:documentId
Authorization: Bearer <token>
```

**Response**:
```json
{
  "id": "doc_xyz789",
  "type": "compliance_memo",
  "status": "completed",
  "downloadUrl": "https://s3.amazonaws.com/...",
  "expiresAt": "2024-02-15T10:30:00Z",
  "generatedAt": "2024-01-20T15:45:00Z"
}
```

### List User Documents
```http
GET /api/documents
Authorization: Bearer <token>
```

**Response**:
```json
{
  "documents": [
    {
      "id": "doc_xyz789",
      "type": "compliance_memo",
      "status": "completed",
      "downloadUrl": "https://s3.amazonaws.com/...",
      "expiresAt": "2024-02-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1
  }
}
```

## Webhook Events

### Document Generation Complete
When document generation is complete, we can send a webhook to your specified endpoint.

**Setup**: Contact support to configure webhook endpoints.

**Payload**:
```json
{
  "event": "document.completed",
  "timestamp": "2024-01-20T15:45:00Z",
  "data": {
    "documentId": "doc_xyz789",
    "userId": "user_123",
    "type": "compliance_memo",
    "downloadUrl": "https://s3.amazonaws.com/...",
    "expiresAt": "2024-02-15T10:30:00Z"
  }
}
```

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": "invalid_request",
  "message": "Validation failed",
  "details": {
    "field": "email",
    "issue": "Invalid email format"
  }
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created successfully
- `400` - Bad request (validation errors)
- `401` - Unauthorized (invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `429` - Rate limit exceeded
- `500` - Internal server error

### Common Error Codes
- `invalid_request` - Request validation failed
- `unauthorized` - Authentication required
- `forbidden` - Access denied
- `not_found` - Resource not found
- `rate_limit_exceeded` - Too many requests
- `calculation_error` - Calculator computation failed
- `document_not_ready` - Document still processing

## Rate Limits

- **Authentication**: 5 requests per IP per 15 minutes
- **Calculator**: 10 requests per IP per hour
- **Lead Capture**: 5 requests per IP per hour
- **Authenticated API**: 100 requests per user per hour

Rate limit headers included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## SDKs and Libraries

### JavaScript/Node.js
```bash
npm install @smbtaxcredits/sdk
```

```javascript
import SMBTaxCredits from '@smbtaxcredits/sdk';

const client = new SMBTaxCredits({
  apiKey: 'your_api_key',
  environment: 'production' // or 'sandbox'
});

// Calculate R&D credit
const result = await client.calculator.calculate({
  businessType: 'technology',
  employees: 5,
  isFirstTime: true,
  expenses: {
    wages: 100000,
    contractors: 50000,
    supplies: 10000,
    other: 5000,
    total: 165000
  }
});
```

### Python
```bash
pip install smbtaxcredits
```

```python
from smbtaxcredits import SMBTaxCredits

client = SMBTaxCredits(
    api_key='your_api_key',
    environment='production'
)

# Calculate R&D credit
result = client.calculator.calculate({
    'businessType': 'technology',
    'employees': 5,
    'isFirstTime': True,
    'expenses': {
        'wages': 100000,
        'contractors': 50000,
        'supplies': 10000,
        'other': 5000,
        'total': 165000
    }
})
```

## Testing

### Sandbox Environment
Use `https://sandbox.smbtaxcredits.com/api` for testing.

### Test Credentials
```
Email: test@example.com
Password: testpassword123
```

### Sample Data
Use these test values for consistent results:
- Test business: "technology" type with 5 employees
- Test expenses: $100k wages, $50k contractors, $10k supplies
- Expected credit: $9,450 (first-time filer)

## Support

### API Support
- **Email**: api@smbtaxcredits.com
- **Documentation**: https://smbtaxcredits.com/docs/api
- **Status Page**: https://status.smbtaxcredits.com

### Request API Access
To get API credentials:
1. Email api@smbtaxcredits.com with your use case
2. Complete API agreement
3. Receive sandbox credentials for testing
4. Request production access after testing

---

**Need integration help?** Contact our API support team at api@smbtaxcredits.com.