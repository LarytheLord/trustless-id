import { NextResponse } from 'next/server';
import { mockCredentials } from '@/lib/mock-data';
import { generateCredentialId, generateCredentialHash } from '@/lib/crypto';
import { Credential } from '@/types';

/**
 * Credentials API
 * GET /api/credentials?userId=<user_id> - List user credentials
 * POST /api/credentials - Issue new credential
 */

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'User ID is required' },
                { status: 400 }
            );
        }

        const credentials = mockCredentials.filter((c) => c.userId === userId);

        return NextResponse.json({
            success: true,
            data: credentials,
            count: credentials.length,
        });
    } catch (error) {
        console.error('Credentials fetch error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch credentials' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, documentId, type } = body;

        if (!userId || !documentId || !type) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Simulate blockchain transaction delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Generate credential
        const credentialId = generateCredentialId();
        const timestamp = new Date().toISOString();
        const hash = await generateCredentialHash({
            userId,
            documentId,
            timestamp,
        });

        // Create credential entry
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);

        const newCredential: Credential = {
            id: credentialId,
            userId,
            hash,
            type,
            issuedAt: timestamp,
            expiresAt: expiryDate.toISOString(),
            status: 'active',
            verificationCount: 0,
        };

        // Add to mock database
        mockCredentials.push(newCredential);

        return NextResponse.json({
            success: true,
            data: newCredential,
            message: 'Credential issued and recorded on blockchain (simulated)',
        });
    } catch (error) {
        console.error('Credential issue error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to issue credential' },
            { status: 500 }
        );
    }
}
