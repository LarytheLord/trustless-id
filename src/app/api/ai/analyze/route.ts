import { NextRequest, NextResponse } from 'next/server';
import { createVerificationResult, updateDocumentStatus, createActivityLog } from '@/lib/db';
import { generateMockVerification } from '@/lib/mock-data';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { documentId, documentType, userId } = body;

        if (!documentId) {
            return NextResponse.json(
                { success: false, error: 'documentId is required' },
                { status: 400 }
            );
        }

        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Generate mock verification result (replace with real AI API later)
        const verificationData = generateMockVerification();
        verificationData.documentId = documentId;

        // Save to database
        await createVerificationResult({
            document_id: documentId,
            authenticity: verificationData.authenticity,
            confidence: verificationData.confidence,
            anomalies: verificationData.anomalies,
            extracted_data: verificationData.extractedData as Record<string, unknown>,
        });

        // Update document status
        await updateDocumentStatus(documentId, 'verified');

        // Log activity only when userId is a valid UUID
        if (typeof userId === 'string' && isUUID(userId)) {
            await createActivityLog({
                user_id: userId,
                action: 'verification',
                description: `Document ${documentId} verified with ${verificationData.authenticity}% authenticity`,
                metadata: { documentId, authenticity: verificationData.authenticity },
            });
        }

        return NextResponse.json({
            success: true,
            data: verificationData,
        });
    } catch (error) {
        console.error('AI analysis error:', error);
        return NextResponse.json(
            { success: false, error: 'AI analysis failed' },
            { status: 500 }
        );
    }
}

function isUUID(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
