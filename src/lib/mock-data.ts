import { User, Document, Credential, ActivityLog, VerificationResult, FraudResult } from '@/types';

// ============================================
// MOCK USERS DATABASE
// ============================================
export const mockUsers: User[] = [
    {
        id: 'user_001',
        email: 'demo@trustlessid.com',
        name: 'Alex Thompson',
        avatarUrl: undefined,
        createdAt: '2024-01-15T10:30:00Z',
        verified: true,
    },
    {
        id: 'user_002',
        email: 'jane@example.com',
        name: 'Jane Smith',
        avatarUrl: undefined,
        createdAt: '2024-02-20T14:45:00Z',
        verified: false,
    },
];

// ============================================
// MOCK DOCUMENTS DATABASE
// ============================================
export const mockDocuments: Document[] = [
    {
        id: 'doc_001',
        userId: 'user_001',
        name: 'passport_scan.pdf',
        type: 'passport',
        status: 'verified',
        uploadedAt: '2024-01-16T09:00:00Z',
        fileSize: 2450000,
        mimeType: 'application/pdf',
    },
    {
        id: 'doc_002',
        userId: 'user_001',
        name: 'drivers_license.jpg',
        type: 'drivers_license',
        status: 'verified',
        uploadedAt: '2024-01-17T11:30:00Z',
        fileSize: 1200000,
        mimeType: 'image/jpeg',
    },
    {
        id: 'doc_003',
        userId: 'user_001',
        name: 'utility_bill.pdf',
        type: 'utility_bill',
        status: 'pending',
        uploadedAt: '2024-02-01T16:20:00Z',
        fileSize: 890000,
        mimeType: 'application/pdf',
    },
];

// ============================================
// MOCK CREDENTIALS DATABASE
// ============================================
export const mockCredentials: Credential[] = [
    {
        id: 'cred_a1b2c3d4e5f6',
        userId: 'user_001',
        hash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
        type: 'identity',
        issuedAt: '2024-01-16T10:00:00Z',
        expiresAt: '2025-01-16T10:00:00Z',
        status: 'active',
        verificationCount: 12,
    },
    {
        id: 'cred_g7h8i9j0k1l2',
        userId: 'user_001',
        hash: 'sha256:ef2d127de37b942baaa3d4f1f9b0f1b7e5c8f1a2e3d4c5b6a7908172635445566',
        type: 'address',
        issuedAt: '2024-01-17T12:00:00Z',
        expiresAt: '2025-01-17T12:00:00Z',
        status: 'active',
        verificationCount: 5,
    },
    {
        id: 'cred_m3n4o5p6q7r8',
        userId: 'user_001',
        hash: 'sha256:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        type: 'age',
        issuedAt: '2024-01-18T14:00:00Z',
        expiresAt: '2025-01-18T14:00:00Z',
        status: 'active',
        verificationCount: 8,
    },
];

// ============================================
// MOCK ACTIVITY LOGS
// ============================================
export const mockActivityLogs: ActivityLog[] = [
    {
        id: 'log_001',
        userId: 'user_001',
        action: 'credential_verified',
        description: 'Identity credential verified by Bank of Innovation',
        timestamp: '2024-02-05T09:30:00Z',
    },
    {
        id: 'log_002',
        userId: 'user_001',
        action: 'document_upload',
        description: 'Uploaded utility_bill.pdf for address verification',
        timestamp: '2024-02-01T16:20:00Z',
    },
    {
        id: 'log_003',
        userId: 'user_001',
        action: 'credential_verified',
        description: 'Age credential verified by SecureAccess Inc',
        timestamp: '2024-01-30T14:15:00Z',
    },
    {
        id: 'log_004',
        userId: 'user_001',
        action: 'credential_issued',
        description: 'Age verification credential issued',
        timestamp: '2024-01-18T14:00:00Z',
    },
    {
        id: 'log_005',
        userId: 'user_001',
        action: 'verification',
        description: 'Drivers license verified successfully',
        timestamp: '2024-01-17T12:00:00Z',
    },
    {
        id: 'log_006',
        userId: 'user_001',
        action: 'credential_issued',
        description: 'Address verification credential issued',
        timestamp: '2024-01-17T12:00:00Z',
    },
    {
        id: 'log_007',
        userId: 'user_001',
        action: 'verification',
        description: 'Passport verified successfully',
        timestamp: '2024-01-16T10:00:00Z',
    },
    {
        id: 'log_008',
        userId: 'user_001',
        action: 'credential_issued',
        description: 'Identity credential issued',
        timestamp: '2024-01-16T10:00:00Z',
    },
    {
        id: 'log_009',
        userId: 'user_001',
        action: 'document_upload',
        description: 'Uploaded passport_scan.pdf',
        timestamp: '2024-01-16T09:00:00Z',
    },
    {
        id: 'log_010',
        userId: 'user_001',
        action: 'login',
        description: 'Account created and logged in',
        timestamp: '2024-01-15T10:30:00Z',
    },
];

// ============================================
// MOCK VERIFICATION RESULTS
// ============================================
export const mockVerificationResults: Record<string, VerificationResult> = {
    doc_001: {
        documentId: 'doc_001',
        authenticity: 98,
        confidence: 95,
        anomalies: [],
        extractedData: {
            fullName: 'Alex Thompson',
            dateOfBirth: '1990-05-15',
            documentNumber: 'AB1234567',
            expiryDate: '2029-05-14',
            issuingCountry: 'United States',
        },
        processedAt: '2024-01-16T09:30:00Z',
    },
    doc_002: {
        documentId: 'doc_002',
        authenticity: 96,
        confidence: 92,
        anomalies: [
            {
                type: 'quality',
                severity: 'low',
                description: 'Minor image compression artifacts detected',
            },
        ],
        extractedData: {
            fullName: 'Alex Thompson',
            dateOfBirth: '1990-05-15',
            documentNumber: 'DL98765432',
            expiryDate: '2027-05-15',
            address: '123 Innovation Drive, Tech City, TC 12345',
        },
        processedAt: '2024-01-17T11:45:00Z',
    },
};

// ============================================
// MOCK FRAUD DETECTION RESULTS
// ============================================
export const mockFraudResults: Record<string, FraudResult> = {
    doc_001: {
        riskScore: 5,
        riskLevel: 'low',
        flags: [],
        recommendation: 'approve',
        analyzedAt: '2024-01-16T09:35:00Z',
    },
    doc_002: {
        riskScore: 12,
        riskLevel: 'low',
        flags: [
            {
                type: 'velocity',
                confidence: 15,
                description: 'Multiple documents uploaded in short timeframe (normal for new user)',
            },
        ],
        recommendation: 'approve',
        analyzedAt: '2024-01-17T11:50:00Z',
    },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getUserByEmail(email: string): User | undefined {
    return mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function getUserById(id: string): User | undefined {
    return mockUsers.find((u) => u.id === id);
}

export function getDocumentsByUserId(userId: string): Document[] {
    return mockDocuments.filter((d) => d.userId === userId);
}

export function getCredentialsByUserId(userId: string): Credential[] {
    return mockCredentials.filter((c) => c.userId === userId);
}

export function getCredentialById(id: string): Credential | undefined {
    return mockCredentials.find((c) => c.id === id);
}

export function getActivityLogsByUserId(userId: string): ActivityLog[] {
    return mockActivityLogs
        .filter((l) => l.userId === userId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function generateMockVerification(): VerificationResult {
    const anomalyTypes = ['tampering', 'inconsistency', 'quality', 'format', 'expiration'] as const;
    const hasAnomalies = Math.random() > 0.7;

    return {
        documentId: `doc_${Date.now()}`,
        authenticity: Math.floor(Math.random() * 15) + 85, // 85-100
        confidence: Math.floor(Math.random() * 10) + 90, // 90-100
        anomalies: hasAnomalies
            ? [
                {
                    type: anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)],
                    severity: 'low',
                    description: 'Minor inconsistency detected, within acceptable threshold',
                },
            ]
            : [],
        extractedData: {
            fullName: 'Extracted Name',
            dateOfBirth: '1990-01-01',
            documentNumber: `DOC${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        },
        processedAt: new Date().toISOString(),
    };
}

export function generateMockFraudResult(): FraudResult {
    const riskScore = Math.floor(Math.random() * 25); // 0-25 (mostly low risk for demo)

    return {
        riskScore,
        riskLevel: riskScore < 20 ? 'low' : riskScore < 50 ? 'medium' : 'high',
        flags: riskScore > 15
            ? [
                {
                    type: 'velocity',
                    confidence: riskScore,
                    description: 'Activity pattern analysis in progress',
                },
            ]
            : [],
        recommendation: riskScore < 30 ? 'approve' : riskScore < 60 ? 'review' : 'reject',
        analyzedAt: new Date().toISOString(),
    };
}
