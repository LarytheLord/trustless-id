import { NextRequest, NextResponse } from 'next/server';
import { createFraudResult, createActivityLog } from '@/lib/db';
import { generateMockFraudResult } from '@/lib/mock-data';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { documentId, userId, verificationData } = body;

        if (!documentId) {
            return NextResponse.json(
                { success: false, error: 'documentId is required' },
                { status: 400 }
            );
        }

        // Simulate fraud detection delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Generate mock fraud result (replace with real fraud detection API later)
        const fraudData = generateMockFraudResult();

        // Save to database
        await createFraudResult({
            document_id: documentId,
            risk_score: fraudData.riskScore,
            risk_level: fraudData.riskLevel,
            flags: fraudData.flags,
            recommendation: fraudData.recommendation,
        });

        // Log activity only when userId is a valid UUID.
        if (typeof userId === 'string' && isUUID(userId)) {
            await createActivityLog({
                user_id: userId,
                action: 'verification',
                description: `Fraud analysis completed: ${fraudData.riskLevel} risk (${fraudData.riskScore}/100)`,
                metadata: { documentId, riskScore: fraudData.riskScore },
            });
        }

        return NextResponse.json({
            success: true,
            data: fraudData,
        });
    } catch (error) {
        console.error('Fraud detection error:', error);
        return NextResponse.json(
            { success: false, error: 'Fraud detection failed' },
            { status: 500 }
        );
    }
}

function isUUID(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
