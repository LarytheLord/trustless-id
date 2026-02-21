import { NextRequest, NextResponse } from 'next/server';
import { getVerificationRequestById, updateVerificationRequest } from '@/lib/db';
import { signVerificationProof } from '@/lib/jwt';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { requestId, decision } = body;

        if (!requestId || !decision || !['approve', 'reject'].includes(decision)) {
            return NextResponse.json(
                { success: false, error: 'requestId and decision (approve|reject) are required' },
                { status: 400 }
            );
        }

        const verificationRequest = await getVerificationRequestById(requestId);
        if (!verificationRequest) {
            return NextResponse.json({ success: false, error: 'Verification request not found' }, { status: 404 });
        }

        if (verificationRequest.status !== 'pending') {
            return NextResponse.json({ success: false, error: 'Verification request is not pending' }, { status: 400 });
        }

        if (new Date(verificationRequest.expires_at).getTime() < Date.now()) {
            await updateVerificationRequest(verificationRequest.id, { status: 'expired' });
            return NextResponse.json({ success: false, error: 'Verification request expired' }, { status: 400 });
        }

        if (decision === 'reject') {
            const rejected = await updateVerificationRequest(verificationRequest.id, { status: 'rejected' });
            return NextResponse.json({
                success: true,
                data: {
                    requestId: rejected.id,
                    status: rejected.status,
                },
            });
        }

        const approvedAt = new Date().toISOString();
        const approved = await updateVerificationRequest(verificationRequest.id, {
            status: 'approved',
            approved_at: approvedAt,
        });

        const proofToken = await signVerificationProof({
            type: 'verification_proof',
            requestId: approved.id,
            credentialId: approved.credential_id,
            verifierName: approved.verifier_name,
            verifierDomain: approved.verifier_domain,
            purpose: approved.purpose,
            nonce: approved.nonce,
        });

        return NextResponse.json({
            success: true,
            data: {
                requestId: approved.id,
                status: approved.status,
                approvedAt: approved.approved_at,
                proofToken,
            },
        });
    } catch (error) {
        console.error('Error approving verification request:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to approve verification request' },
            { status: 500 }
        );
    }
}

