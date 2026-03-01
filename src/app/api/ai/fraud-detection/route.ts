import { NextRequest, NextResponse } from 'next/server';
import { createFraudResult, createActivityLog } from '@/lib/db';
import { FraudResult, VerificationResult } from '@/types';

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

        const fraudData = buildFraudResult(verificationData);

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

function buildFraudResult(verificationData?: VerificationResult): FraudResult {
    const confidence = verificationData?.confidence ?? 0;
    const authenticity = verificationData?.authenticity ?? 0;
    const anomalyCount = verificationData?.anomalies?.length ?? 0;

    // Heuristic risk model based on OCR confidence + extracted quality signals.
    let riskScore = 20;
    riskScore += Math.max(0, 75 - confidence) * 0.5;
    riskScore += Math.max(0, 80 - authenticity) * 0.4;
    riskScore += anomalyCount * 8;
    riskScore = Math.round(Math.max(0, Math.min(100, riskScore)));

    const flags: FraudResult['flags'] = [];
    if (confidence < 60) {
        flags.push({
            type: 'pattern',
            confidence: 0.72,
            description: 'Low OCR confidence indicates possible poor-quality or manipulated image',
        });
    }
    if (anomalyCount > 0) {
        flags.push({
            type: 'document_reuse',
            confidence: Math.min(0.95, 0.55 + anomalyCount * 0.1),
            description: `Verification detected ${anomalyCount} anomaly signal(s)`,
        });
    }
    if (authenticity < 65) {
        flags.push({
            type: 'synthetic_identity',
            confidence: 0.61,
            description: 'Low authenticity score may indicate synthetic or altered identity artifact',
        });
    }

    let riskLevel: FraudResult['riskLevel'] = 'low';
    let recommendation: FraudResult['recommendation'] = 'approve';

    if (riskScore >= 75) {
        riskLevel = 'critical';
        recommendation = 'reject';
    } else if (riskScore >= 55) {
        riskLevel = 'high';
        recommendation = 'review';
    } else if (riskScore >= 35) {
        riskLevel = 'medium';
        recommendation = 'review';
    }

    return {
        riskScore,
        riskLevel,
        flags,
        recommendation,
        analyzedAt: new Date().toISOString(),
    };
}
