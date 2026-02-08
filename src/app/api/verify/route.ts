import { NextResponse } from 'next/server';
import { getCredentialById, mockCredentials } from '@/lib/mock-data';
import { PublicVerification } from '@/types';

/**
 * Public Credential Verification API
 * GET /api/verify?id=<credential_id>
 * 
 * Returns verification result without exposing personal data
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const credentialId = searchParams.get('id');

        if (!credentialId) {
            return NextResponse.json(
                { success: false, error: 'Credential ID is required' },
                { status: 400 }
            );
        }

        // Simulate verification delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Look up credential
        const credential = getCredentialById(credentialId);

        if (!credential) {
            return NextResponse.json({
                success: false,
                error: 'Credential not found',
                verified: false,
            });
        }

        // Check if credential is valid
        const now = new Date();
        const expiryDate = new Date(credential.expiresAt);
        const isExpired = now > expiryDate;
        const isRevoked = credential.status === 'revoked';
        const isValid = !isExpired && !isRevoked && credential.status === 'active';

        // Calculate trust score based on verification count and status
        const baseScore = isValid ? 85 : 0;
        const verificationBonus = Math.min(credential.verificationCount * 2, 15);
        const trustScore = isValid ? baseScore + verificationBonus : 0;

        const result: PublicVerification = {
            credentialId: credential.id,
            isValid,
            trustScore,
            issueDate: credential.issuedAt,
            credentialType: credential.type,
            verifiedAt: new Date().toISOString(),
        };

        // Increment verification count (in real app, this would update database)
        const credIndex = mockCredentials.findIndex((c) => c.id === credentialId);
        if (credIndex !== -1) {
            mockCredentials[credIndex].verificationCount += 1;
        }

        return NextResponse.json({
            success: true,
            data: result,
            message: isValid ? 'Credential verified successfully' : 'Credential is not valid',
        });
    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.json(
            { success: false, error: 'Verification failed' },
            { status: 500 }
        );
    }
}
