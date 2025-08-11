# Document Generation & S3 Storage Integration - User Acceptance Testing

## Overview
Testing the complete document generation workflow that integrates Claude AI, Documint PDF generation, and AWS S3 secure storage to produce and deliver IRS-compliant R&D tax credit documentation.

## Success Criteria
- [ ] Document generation API accepts valid requests and returns document metadata
- [ ] S3 storage integration successfully uploads generated PDFs with proper security
- [ ] Secure download URLs are generated with appropriate expiration times
- [ ] Database properly tracks document metadata and access logs
- [ ] Error handling works for invalid requests and service failures
- [ ] Authentication protects sensitive document operations

## Test Scenarios

### Test 1: Document Generation API
**Endpoint:** `POST /api/docs/generate`

**Test Data:**
```json
{
  "customerId": "test-customer-123",
  "taxYear": 2024,
  "docType": "form_6765",
  "payload": {
    "companyName": "Test Corporation",
    "wages": 150000,
    "contractors": 50000,
    "supplies": 25000
  },
  "companyId": "comp-123",
  "intakeFormId": "intake-456"
}
```

**Expected Response:**
```json
{
  "success": true,
  "documentId": "doc-abc123",
  "s3Key": "customers/test-customer-123/2024/form_6765/2024-08-11T12-00-00-000Z.pdf",
  "bucket": "smbtax-docs-prod",
  "size": 125000,
  "sha256Hash": "a1b2c3d4e5f6..."
}
```

**Verification Steps:**
1. API returns 200 status code
2. Response contains all required fields
3. S3 key follows correct naming convention
4. SHA256 hash is 64 characters hex
5. Database record is created with metadata

### Test 2: Secure Document Access
**Endpoint:** `GET /api/docs/:id/url`

**Prerequisites:**
- Valid document ID from Test 1
- User authentication token

**Expected Response:**
```json
{
  "success": true,
  "url": "https://smbtax-docs-prod.s3.us-east-2.amazonaws.com/...",
  "expiresIn": 300,
  "documentName": "Form 6765 - R&D Tax Credit - 2024",
  "documentType": "form_6765",
  "size": 125000
}
```

**Verification Steps:**
1. Presigned URL is generated successfully
2. URL expires in 5 minutes (300 seconds)
3. Database tracks access attempt
4. Download count increments
5. URL allows direct PDF download

### Test 3: Authentication & Authorization
**Test Cases:**
- Unauthenticated request returns 401
- User accessing another user's document returns 403
- Valid user accessing own document returns 200

### Test 4: Error Handling
**Scenarios:**
- Invalid document type returns 400 with validation errors
- Missing required fields returns 400 with field errors
- Non-existent document ID returns 404
- S3 service failure returns 500 with appropriate error message

### Test 5: S3 Integration Smoke Test
**Endpoint:** `POST /api/dev/s3-smoke` (dev only)

**Expected Response:**
```json
{
  "success": true,
  "key": "customers/smoke-test/2025/test-doc-xxx.pdf",
  "url": "https://smbtax-docs-prod.s3.us-east-2.amazonaws.com/...",
  "size": 328,
  "timestamp": "2025-08-11T03:26:53.294Z"
}
```

## Manual Testing Checklist

### Prerequisites
- [ ] AWS S3 credentials configured
- [ ] PostgreSQL database accessible
- [ ] Application server running
- [ ] Valid authentication token available

### Core Functionality
- [ ] Generate Form 6765 document successfully
- [ ] Generate Technical Narrative document successfully
- [ ] Generate Compliance Memo document successfully
- [ ] Retrieve secure download URL
- [ ] Access document via presigned URL
- [ ] Verify PDF content is readable

### Security & Access Control
- [ ] Unauthenticated requests blocked
- [ ] Cross-user document access blocked
- [ ] Presigned URLs expire after 5 minutes
- [ ] Database logs all document access attempts

### Error Scenarios
- [ ] Invalid request data handled gracefully
- [ ] Missing document returns appropriate error
- [ ] Service failures don't expose sensitive information
- [ ] Rate limiting prevents abuse

## Performance Benchmarks
- Document generation: < 10 seconds
- S3 upload: < 5 seconds
- Presigned URL generation: < 1 second
- Database operations: < 500ms

## Security Validation
- [ ] S3 objects encrypted at rest (AES256)
- [ ] Presigned URLs use proper signatures
- [ ] Database stores SHA256 hash for integrity
- [ ] Access logging includes IP and user agent
- [ ] No sensitive data in error messages

## Production Readiness
- [ ] Environment variables properly configured
- [ ] Error monitoring captures failures
- [ ] Performance metrics tracked
- [ ] Database migrations applied successfully
- [ ] All tests pass consistently

## Known Issues & Limitations
- Documint API integration uses placeholder PDF for testing
- Real PDF generation requires valid Documint API key
- S3 bucket must exist and have proper permissions
- File size limited to reasonable PDF document sizes (< 50MB)

## Next Steps
1. Integrate real Documint API for production PDF generation
2. Add document preview functionality
3. Implement batch document generation
4. Add document versioning and history
5. Enhance metadata and search capabilities