import { NextRequest, NextResponse } from 'next/server';
import { getCredentialById, incrementCredentialVerificationCount } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Credential ID is required' },
                { status: 400 }
            );
        }

        const credential = await getCredentialById(id);

        if (!credential) {
            return NextResponse.json(
                { success: false, error: 'Credential not found' },
                { status: 404 }
            );
        }

        // Calculate trust score
        const trustScore = calculateTrustScore(credential);

        // Increment verification count
        await incrementCredentialVerificationCount(id);

        return NextResponse.json({
            success: true,
            data: {
                credentialId: credential.id,
                isValid: credential.status === 'active',
                trustScore,
                issueDate: credential.issued_at,
                credentialType: credential.type,
                verifiedAt: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error('Error verifying credential:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to verify credential' },
            { status: 500 }
        );
    }
}

function calculateTrustScore(credential: {
    status: string;
    verification_count: number;
    issued_at: string;
}): number {
    // Base score: 70
    let score = 70;

    // Add points for verification count (max 10)
    score += Math.min(credential.verification_count, 10);

    // Add points for age (max 20)
    const daysSinceIssuance = Math.floor(
        (Date.now() - new Date(credential.issued_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    score += Math.min(daysSinceIssuance, 20);

    // Deduct if expired
    if (credential.status === 'expired') {
        score = Math.max(0, score - 50);
    }

    return Math.min(100, Math.max(0, score));
}
