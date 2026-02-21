import { NextRequest, NextResponse } from 'next/server';
import { createVerificationRequest, getCredentialById } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { credentialId, verifierName, verifierDomain, purpose, policy, requestedFields } = body;

        if (!credentialId || !verifierName || !verifierDomain || !purpose) {
            return NextResponse.json(
                { success: false, error: 'credentialId, verifierName, verifierDomain, and purpose are required' },
                { status: 400 }
            );
        }

        const credential = await getCredentialById(credentialId);
        if (!credential) {
            return NextResponse.json({ success: false, error: 'Credential not found' }, { status: 404 });
        }

        const expiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString();
        const nonce = crypto.randomUUID();

        const verificationRequest = await createVerificationRequest({
            credential_id: credential.id,
            verifier_name: verifierName,
            verifier_domain: verifierDomain,
            purpose,
            policy: policy || {},
            requested_fields: Array.isArray(requestedFields) ? requestedFields : [],
            nonce,
            expires_at: expiresAt,
        });

        return NextResponse.json({
            success: true,
            data: {
                requestId: verificationRequest.id,
                credentialId: verificationRequest.credential_id,
                verifierName: verificationRequest.verifier_name,
                verifierDomain: verificationRequest.verifier_domain,
                purpose: verificationRequest.purpose,
                nonce: verificationRequest.nonce,
                expiresAt: verificationRequest.expires_at,
                status: verificationRequest.status,
            },
        });
    } catch (error) {
        console.error('Error creating verification request:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create verification request' },
            { status: 500 }
        );
    }
}

