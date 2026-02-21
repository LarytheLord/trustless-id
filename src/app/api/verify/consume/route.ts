import { NextRequest, NextResponse } from 'next/server';
import {
    createVerificationReceipt,
    getCredentialById,
    getVerificationRequestById,
    incrementCredentialVerificationCount,
    markVerificationRequestConsumed,
} from '@/lib/db';
import { generateSHA256 } from '@/lib/crypto';
import { verifyVerificationProof } from '@/lib/jwt';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { proofToken, verifierName, verifierDomain } = body;

        if (!proofToken || !verifierName || !verifierDomain) {
            return NextResponse.json(
                { success: false, error: 'proofToken, verifierName, and verifierDomain are required' },
                { status: 400 }
            );
        }

        const payload = await verifyVerificationProof(proofToken);
        if (!payload) {
            return NextResponse.json({ success: false, error: 'Invalid or expired proof token' }, { status: 401 });
        }

        if (
            payload.verifierName.toLowerCase() !== verifierName.toLowerCase() ||
            payload.verifierDomain.toLowerCase() !== verifierDomain.toLowerCase()
        ) {
            return NextResponse.json({ success: false, error: 'Proof token does not match verifier identity' }, { status: 403 });
        }

        const verificationRequest = await getVerificationRequestById(payload.requestId);
        if (!verificationRequest) {
            return NextResponse.json({ success: false, error: 'Verification request not found' }, { status: 404 });
        }

        if (verificationRequest.status !== 'approved') {
            return NextResponse.json({ success: false, error: 'Verification request already used or not approved' }, { status: 400 });
        }

        if (new Date(verificationRequest.expires_at).getTime() < Date.now()) {
            return NextResponse.json({ success: false, error: 'Verification request expired' }, { status: 400 });
        }

        const consumedAt = new Date().toISOString();
        const consumedRequest = await markVerificationRequestConsumed(verificationRequest.id, consumedAt);
        if (!consumedRequest) {
            return NextResponse.json({ success: false, error: 'Verification request already consumed' }, { status: 409 });
        }

        const credential = await getCredentialById(verificationRequest.credential_id);
        if (!credential) {
            return NextResponse.json({ success: false, error: 'Credential not found' }, { status: 404 });
        }

        const trustBreakdown = calculateTrustBreakdown(credential);
        const trustScore = trustBreakdown.finalScore;
        await incrementCredentialVerificationCount(credential.id);

        const disclosedData = {
            credentialType: credential.type,
            issueDate: credential.issued_at,
            isValid: credential.status === 'active',
        };

        const receiptMaterial = `${verificationRequest.id}:${credential.id}:${verifierDomain}:${consumedAt}:${trustScore}`;
        const receiptHash = `sha256:${await generateSHA256(receiptMaterial)}`;

        const receipt = await createVerificationReceipt({
            verification_request_id: verificationRequest.id,
            credential_id: credential.id,
            verifier_name: verifierName,
            verifier_domain: verifierDomain,
            purpose: verificationRequest.purpose,
            decision: credential.status === 'active' ? 'pass' : 'fail',
            disclosed_data: disclosedData,
            trust_score: trustScore,
            receipt_hash: receiptHash,
        });

        const policyChecks = [
            {
                name: 'Credential is active',
                passed: credential.status === 'active',
                detail: `status=${credential.status}`,
            },
            {
                name: 'Request approved by holder',
                passed: verificationRequest.status === 'approved',
                detail: `request_status=${verificationRequest.status}`,
            },
            {
                name: 'Request not expired',
                passed: new Date(verificationRequest.expires_at).getTime() >= Date.now(),
                detail: `expires_at=${verificationRequest.expires_at}`,
            },
            {
                name: 'Verifier identity matches token',
                passed: true,
                detail: `${verifierName} (${verifierDomain})`,
            },
            {
                name: 'Replay protection',
                passed: true,
                detail: 'Proof consumed exactly once and request marked as consumed',
            },
        ];

        return NextResponse.json({
            success: true,
            data: {
                requestId: verificationRequest.id,
                credentialId: credential.id,
                isValid: credential.status === 'active',
                trustScore,
                credentialType: credential.type,
                issueDate: credential.issued_at,
                verifiedAt: consumedAt,
                receiptId: receipt.id,
                receiptHash: receipt.receipt_hash,
                explainability: {
                    policyChecks,
                    trustBreakdown,
                    summary: credential.status === 'active'
                        ? 'Verification passed with consent-bound one-time proof.'
                        : 'Verification failed because credential is not active.',
                },
            },
        });
    } catch (error) {
        console.error('Error consuming verification proof:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to consume verification proof' },
            { status: 500 }
        );
    }
}

function calculateTrustBreakdown(credential: {
    status: string;
    verification_count: number;
    issued_at: string;
}): { base: number; verificationPoints: number; agePoints: number; expiredPenalty: number; finalScore: number } {
    const base = 70;
    const verificationPoints = Math.min(credential.verification_count, 10);

    const daysSinceIssuance = Math.floor(
        (Date.now() - new Date(credential.issued_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    const agePoints = Math.min(daysSinceIssuance, 20);
    const expiredPenalty = credential.status === 'expired' ? 50 : 0;

    const finalScore = Math.min(100, Math.max(0, base + verificationPoints + agePoints - expiredPenalty));

    return { base, verificationPoints, agePoints, expiredPenalty, finalScore };
}
