import { NextRequest, NextResponse } from 'next/server';
import { getCredentialsByUserId, createCredential, createActivityLog } from '@/lib/db';
import { generateCredentialHash } from '@/lib/crypto';
import { storeCredentialOnIPFS } from '@/lib/ipfs';

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
                ipfsHash: cred.ipfs_hash,
                blockchainNetwork: cred.blockchain_network,
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
        const { userId, documentId, type, evidenceHash } = body;

        if (!userId || !type) {
            return NextResponse.json(
                { success: false, error: 'userId and type are required' },
                { status: 400 }
            );
        }

        if (evidenceHash && !/^sha256:[a-f0-9]{64}$/.test(evidenceHash)) {
            return NextResponse.json(
                { success: false, error: 'Invalid evidence hash format' },
                { status: 400 }
            );
        }

        // Generate credential hash
        const hash = await generateCredentialHash({
            userId,
            documentId: documentId || 'none',
            timestamp: new Date().toISOString(),
            evidenceHash,
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

        // 🌐 STORE ON IPFS - Decentralized storage
        const ipfsResult = await storeCredentialOnIPFS({
            credentialId: credential.id,
            userId: credential.user_id,
            hash: credential.hash,
            type: credential.type,
            issuedAt: credential.issued_at,
            expiresAt: credential.expires_at,
            sourceDocumentHash: evidenceHash,
        });

        // Update credential with IPFS hash if successful
        if (ipfsResult.success) {
            const { updateCredential } = await import('@/lib/db');
            await updateCredential(credential.id, {
                ipfs_hash: ipfsResult.ipfsHash,
                blockchain_network: 'ipfs',
            });
        }

        // Log activity
        await createActivityLog({
            user_id: userId,
            action: 'credential_issued',
            description: `${type.charAt(0).toUpperCase() + type.slice(1)} credential issued and stored on IPFS`,
            metadata: { 
                credentialId: credential.id,
                ipfsHash: ipfsResult.success ? ipfsResult.ipfsHash : null,
                sourceDocumentHash: evidenceHash || null,
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                id: credential.id,
                userId: credential.user_id,
                hash: credential.hash,
                sourceDocumentHash: evidenceHash,
                type: credential.type,
                issuedAt: credential.issued_at,
                expiresAt: credential.expires_at,
                status: credential.status,
                verificationCount: credential.verification_count,
                ipfsHash: ipfsResult.success ? ipfsResult.ipfsHash : undefined,
                blockchainNetwork: 'ipfs',
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
