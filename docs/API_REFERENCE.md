# TrustlessID API Reference

Complete API documentation for all backend endpoints.

---

## Authentication

### `POST /api/auth/login`

Authenticate user with email (passwordless).

**Request Body**:
```json
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "user": {
    "id": "user_123abc",
    "email": "user@example.com",
    "name": "John Doe",
    "verified": false,
    "createdAt": "2026-02-17T10:30:00Z"
  },
  "message": "Login successful"
}
```

**Error Response** (400):
```json
{
  "success": false,
  "error": "Valid email is required"
}
```

**Cookies Set**:
- `auth_token` (HTTP-only, 7 days expiry)

---

## Documents

### `GET /api/documents?userId={userId}`

Get all documents for a user.

**Query Parameters**:
- `userId` (required): User ID

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "doc_abc123",
      "userId": "user_123abc",
      "name": "passport_scan.pdf",
      "type": "passport",
      "status": "verified",
      "uploadedAt": "2026-02-17T10:30:00Z",
      "fileSize": 2450000,
      "mimeType": "application/pdf"
    }
  ]
}
```

---

### `POST /api/documents`

Create a new document record.

**Request Body**:
```json
{
  "userId": "user_123abc",
  "name": "passport_scan.pdf",
  "type": "passport",
  "fileSize": 2450000,
  "mimeType": "application/pdf",
  "cloudinaryUrl": "https://res.cloudinary.com/...",
  "cloudinaryPublicId": "trustlessid/documents/..."
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "doc_abc123",
    "userId": "user_123abc",
    "name": "passport_scan.pdf",
    "type": "passport",
    "status": "pending",
    "uploadedAt": "2026-02-17T10:30:00Z"
  }
}
```

---

## Credentials

### `GET /api/credentials?userId={userId}`

Get all credentials for a user.

**Query Parameters**:
- `userId` (required): User ID

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "cred_a1b2c3d4e5f6",
      "userId": "user_123abc",
      "hash": "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
      "type": "identity",
      "issuedAt": "2026-02-17T10:30:00Z",
      "expiresAt": "2027-02-17T10:30:00Z",
      "status": "active",
      "verificationCount": 12
    }
  ]
}
```

---

### `POST /api/credentials`

Issue a new credential.

**Request Body**:
```json
{
  "userId": "user_123abc",
  "documentId": "doc_abc123",
  "type": "identity"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "cred_a1b2c3d4e5f6",
    "userId": "user_123abc",
    "hash": "sha256:7f83b165...",
    "type": "identity",
    "issuedAt": "2026-02-17T10:30:00Z",
    "expiresAt": "2027-02-17T10:30:00Z",
    "status": "active",
    "verificationCount": 0
  }
}
```

---

## Verification

### `GET /api/verify?id={credentialId}`

Publicly verify a credential (no authentication required).

**Query Parameters**:
- `id` (required): Credential ID

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "credentialId": "cred_a1b2c3d4e5f6",
    "isValid": true,
    "trustScore": 87,
    "issueDate": "2026-02-17T10:30:00Z",
    "credentialType": "identity",
    "verifiedAt": "2026-02-17T14:30:00Z"
  }
}
```

**Not Found Response** (404):
```json
{
  "success": false,
  "error": "Credential not found"
}
```

**Note**: No personal information (PII) is exposed in verification responses.

---

## AI Services

### `POST /api/ai/analyze`

Analyze document authenticity (mock implementation).

**Request Body**:
```json
{
  "documentId": "doc_abc123",
  "documentType": "passport"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "documentId": "doc_abc123",
    "authenticity": 98,
    "confidence": 95,
    "anomalies": [],
    "extractedData": {
      "fullName": "John Doe",
      "documentNumber": "AB1234567"
    },
    "processedAt": "2026-02-17T10:30:00Z"
  }
}
```

---

### `POST /api/ai/fraud-detection`

Run fraud detection analysis (mock implementation).

**Request Body**:
```json
{
  "documentId": "doc_abc123",
  "userId": "user_123abc",
  "verificationData": {
    "authenticity": 98,
    "confidence": 95
  }
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "riskScore": 5,
    "riskLevel": "low",
    "flags": [],
    "recommendation": "approve",
    "analyzedAt": "2026-02-17T10:30:00Z"
  }
}
```

---

## File Upload

### `POST /api/upload`

Upload file to Cloudinary storage.

**Request Type**: `multipart/form-data`

**Form Data**:
- `file` (required): File to upload (PDF, JPEG, PNG, max 10MB)

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "trustlessid/documents/abc123",
    "size": 2450000,
    "type": "application/pdf",
    "name": "passport_scan.pdf"
  }
}
```

**Error Response** (400):
```json
{
  "success": false,
  "error": "Invalid file type. Allowed: PDF, JPEG, PNG"
}
```

---

## Rate Limiting

All API endpoints are subject to rate limiting:
- **Default**: 100 requests per 15 minutes per IP
- **Auth endpoints**: 10 requests per minute per IP

---

## Error Codes

| HTTP Status | Meaning |
|-------------|---------|
| 200 | Success |
| 400 | Bad Request (invalid input) |
| 401 | Unauthorized (invalid/missing token) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Demo Credential IDs

Use these for testing the `/api/verify` endpoint:
- `cred_a1b2c3d4e5f6`
- `cred_g7h8i9j0k1l2`
- `cred_m3n4o5p6q7r8`
