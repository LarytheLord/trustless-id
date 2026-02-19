/**
 * Cryptographic utilities for TrustlessID
 * Uses SHA-256 for credential hash generation
 */

/**
 * Generate SHA-256 hash of input data
 * Works in browser environment using Web Crypto API
 */
export async function generateSHA256(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

/**
 * Generate a credential hash from user data
 * Combines multiple data points for unique identification
 */
export async function generateCredentialHash(data: {
    userId: string;
    documentId: string;
    timestamp: string;
    evidenceHash?: string;
    salt?: string;
}): Promise<string> {
    const salt = data.salt || crypto.randomUUID();
    const evidenceSegment = data.evidenceHash || 'no-evidence';
    const payload = `${data.userId}:${data.documentId}:${data.timestamp}:${evidenceSegment}:${salt}`;
    const hash = await generateSHA256(payload);
    return `sha256:${hash}`;
}

/**
 * Generate a unique credential ID
 * Format: cred_[12 alphanumeric characters]
 */
export function generateCredentialId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'cred_';
    for (let i = 0; i < 12; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Format a hash for display (truncated)
 */
export function formatHash(hash: string, length: number = 12): string {
    if (hash.startsWith('sha256:')) {
        const actualHash = hash.substring(7);
        return `${actualHash.substring(0, length)}...${actualHash.substring(actualHash.length - 4)}`;
    }
    return `${hash.substring(0, length)}...${hash.substring(hash.length - 4)}`;
}

/**
 * Verify a hash matches the expected format
 */
export function isValidHash(hash: string): boolean {
    const sha256Regex = /^sha256:[a-f0-9]{64}$/;
    return sha256Regex.test(hash);
}

/**
 * Generate a verification timestamp in ISO format
 */
export function generateTimestamp(): string {
    return new Date().toISOString();
}
