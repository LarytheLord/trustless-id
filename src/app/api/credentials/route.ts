import { NextRequest, NextResponse } from 'next/server';
import { getCredentialsByUserId, getCredentialById, createCredential, createActivityLog } from '@/lib/db';
import { generateCredentialId, generateCredentialHash } from '@/lib/crypto';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'userId is required' },
                { status: 400 }
            );
        }

        const credentials = await getCredentialsByUserId(userId);

        return NextResponse.json({
            success: true,
            data: credentials.map(cred => ({
                id: cred.id,
                userId: cred.user_id,
                hash: cred.hash,
                type: cred.type,
                issuedAt: cred.issued_at,
                expiresAt: cred.expires_at,
                status: cred.status,
                verificationCount: cred.verification_count,
            })),
        });
    } catch (error) {
        console.error('Error fetching credentials:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch credentials' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, documentId, type } = body;

        if (!userId || !type) {
            return NextResponse.json(
                { success: false, error: 'userId and type are required' },
                { status: 400 }
            );
        }

        // Generate credential ID and hash
        const credentialId = generateCredentialId();
        const hash = await generateCredentialHash({
            userId,
            documentId: documentId || 'none',
            timestamp: new Date().toISOString(),
        });

        // Calculate expiry (1 year from now)
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);

        const credential = await createCredential({
            user_id: userId,
            document_id: documentId,
            hash,
            type: type as 'identity' | 'address' | 'age',
            expires_at: expiresAt.toISOString(),
        });

        // Log activity
        await createActivityLog({
            user_id: userId,
            action: 'credential_issued',
            description: `${type.charAt(0).toUpperCase() + type.slice(1)} credential issued`,
            metadata: { credentialId: credential.id },
        });

        return NextResponse.json({
            success: true,
            data: {
                id: credentialId,
                userId: credential.user_id,
                hash: credential.hash,
                type: credential.type,
                issuedAt: credential.issued_at,
                expiresAt: credential.expires_at,
                status: credential.status,
                verificationCount: credential.verification_count,
            },
        });
    } catch (error) {
        console.error('Error creating credential:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create credential' },
            { status: 500 }
        );
    }
}
