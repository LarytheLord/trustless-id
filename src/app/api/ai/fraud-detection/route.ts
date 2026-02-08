import { NextResponse } from 'next/server';
import { generateMockFraudResult } from '@/lib/mock-data';
import { FraudResult } from '@/types';

/**
 * AI Fraud Detection API (Mock)
 * POST /api/ai/fraud-detection
 * 
 * Simulates AI-powered fraud and anomaly detection
 * Returns risk score, flags, and recommendations
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { documentId, userId, verificationData } = body;

        if (!documentId || !userId) {
            return NextResponse.json(
                { success: false, error: 'Document ID and User ID are required' },
                { status: 400 }
            );
        }

        // Simulate fraud analysis processing time (1-2 seconds)
        const processingTime = 1000 + Math.random() * 1000;
        await new Promise((resolve) => setTimeout(resolve, processingTime));

        // Generate mock fraud detection result
        const result: FraudResult = generateMockFraudResult();

        // Add verification-specific checks
        if (verificationData?.authenticity && verificationData.authenticity < 80) {
            result.riskScore = Math.max(result.riskScore, 40);
            result.riskLevel = 'medium';
            result.flags.push({
                type: 'document_reuse',
                confidence: 35,
                description: 'Document authenticity below threshold, manual review recommended',
            });
            result.recommendation = 'review';
        }

        // Check for synthetic identity patterns (mock)
        const syntheticCheck = Math.random();
        if (syntheticCheck > 0.95) {
            result.flags.push({
                type: 'synthetic_identity',
                confidence: 25,
                description: 'Pattern matching indicates possible synthetic identity - SIMULATED',
            });
        }

        // Deepfake detection (mock - always passes for demo)
        const deepfakeScore = Math.random() * 10; // Very low for demo
        if (deepfakeScore > 8) {
            result.flags.push({
                type: 'deepfake',
                confidence: deepfakeScore * 10,
                description: 'Potential image manipulation detected - SIMULATED',
            });
        }

        return NextResponse.json({
            success: true,
            data: result,
            processingTimeMs: Math.round(processingTime),
            message: `Fraud analysis complete. Risk level: ${result.riskLevel}`,
        });
    } catch (error) {
        console.error('Fraud detection error:', error);
        return NextResponse.json(
            { success: false, error: 'Fraud detection failed' },
            { status: 500 }
        );
    }
}
