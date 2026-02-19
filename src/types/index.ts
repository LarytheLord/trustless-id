// User type representing an authenticated user
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
  verified: boolean;
}

// Document upload type
export interface Document {
  id: string;
  userId: string;
  name: string;
  type: 'passport' | 'drivers_license' | 'national_id' | 'utility_bill' | 'other';
  status: 'pending' | 'processing' | 'verified' | 'rejected';
  uploadedAt: string;
  fileSize: number;
  mimeType: string;
}

// AI Verification result
export interface VerificationResult {
  documentId: string;
  authenticity: number; // 0-100 score
  confidence: number; // 0-100 confidence level
  anomalies: Anomaly[];
  extractedData: ExtractedData;
  processedAt: string;
}

// Anomaly detected by AI
export interface Anomaly {
  type: 'tampering' | 'inconsistency' | 'quality' | 'format' | 'expiration';
  severity: 'low' | 'medium' | 'high';
  description: string;
  location?: string;
}

// Data extracted from document
export interface ExtractedData {
  fullName?: string;
  dateOfBirth?: string;
  documentNumber?: string;
  expiryDate?: string;
  issuingCountry?: string;
  address?: string;
}

// Fraud detection result
export interface FraudResult {
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  flags: FraudFlag[];
  recommendation: 'approve' | 'review' | 'reject';
  analyzedAt: string;
}

// Fraud flag
export interface FraudFlag {
  type: 'synthetic_identity' | 'deepfake' | 'document_reuse' | 'velocity' | 'pattern';
  confidence: number;
  description: string;
}

// Credential issued after successful verification
export interface Credential {
  id: string;
  userId: string;
  hash: string; // SHA-256 hash
  sourceDocumentHash?: string; // SHA-256 fingerprint of the uploaded government ID artifact
  type: 'identity' | 'address' | 'age';
  issuedAt: string;
  expiresAt: string;
  status: 'active' | 'revoked' | 'expired';
  verificationCount: number;
  ipfsHash?: string; // IPFS CID for decentralized storage
  blockchainNetwork?: string; // Network where stored (ipfs, polygon, etc.)
}

// Public verification result (no PII)
export interface PublicVerification {
  credentialId: string;
  isValid: boolean;
  trustScore: number;
  issueDate: string;
  credentialType: string;
  verifiedAt: string;
}

// Activity log entry
export interface ActivityLog {
  id: string;
  userId: string;
  action: 'login' | 'document_upload' | 'verification' | 'credential_issued' | 'credential_verified';
  description: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

// Identity creation step data
export interface IdentityFormData {
  // Step 1: Basic details
  fullName: string;
  email: string;
  dateOfBirth: string;
  nationality: string;
  
  // Step 2: Document upload
  documentType: Document['type'];
  documentFile?: File;
  
  // Step 3-5: Populated by system
  verificationResult?: VerificationResult;
  fraudResult?: FraudResult;
  credential?: Credential;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Dashboard statistics
export interface DashboardStats {
  totalDocuments: number;
  verifiedDocuments: number;
  activeCredentials: number;
  recentVerifications: number;
}
