import { NextRequest, NextResponse } from 'next/server';
import { createVerificationResult, updateDocumentStatus, createActivityLog } from '@/lib/db';
import { VerificationResult } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { documentId, userId, ocr } = body;

        if (!documentId) {
            return NextResponse.json(
                { success: false, error: 'documentId is required' },
                { status: 400 }
            );
        }

        // OCR-driven analysis output
        const verificationData = buildVerificationFromOCR({
            documentId,
            ocr,
        });

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

function buildVerificationFromOCR(params: {
    documentId: string;
    ocr?: {
        attempted?: boolean;
        confidence?: number;
        textSample?: string;
        wordCount?: number;
        reason?: string;
    };
}): VerificationResult {
    const { documentId, ocr } = params;
    const confidenceRaw = typeof ocr?.confidence === 'number' ? ocr.confidence : 0;
    const confidence = Math.max(0, Math.min(100, Math.round(confidenceRaw)));
    const textSample = (ocr?.textSample || '').trim();
    const wordCount = typeof ocr?.wordCount === 'number' ? ocr.wordCount : (textSample ? textSample.split(/\s+/).length : 0);
    const attempted = !!ocr?.attempted;

    let authenticity = 45;
    if (attempted) {
        authenticity = Math.max(55, Math.min(99, Math.round(confidence * 0.85 + Math.min(wordCount, 60) * 0.25)));
    }

    const anomalies: VerificationResult['anomalies'] = [];
    if (!attempted) {
        anomalies.push({
            type: 'quality',
            severity: 'medium',
            description: ocr?.reason || 'OCR was not run for this file type',
        });
    }
    if (attempted && confidence < 65) {
        anomalies.push({
            type: 'quality',
            severity: 'medium',
            description: `Low OCR confidence (${confidence}%)`,
        });
    }
    if (attempted && wordCount < 8) {
        anomalies.push({
            type: 'format',
            severity: 'low',
            description: 'Limited readable text extracted from document',
        });
    }

    return {
        documentId,
        authenticity,
        confidence: attempted ? confidence : 0,
        anomalies,
        extractedData: extractDocumentFields(textSample),
        processedAt: new Date().toISOString(),
    };
}

function extractDocumentFields(text: string) {
    const upper = text.toUpperCase();
    const docNumber = upper.match(/\b[A-Z0-9]{6,12}\b/)?.[0];
    const dob = text.match(/\b(\d{2}[\/\-]\d{2}[\/\-]\d{4}|\d{4}[\/\-]\d{2}[\/\-]\d{2})\b/)?.[0];
    const expiry = text.match(/\b(?:EXP|EXPIRES|VALID\s*TILL)\s*[:\-]?\s*(\d{2}[\/\-]\d{2}[\/\-]\d{4}|\d{4}[\/\-]\d{2}[\/\-]\d{2})/i)?.[1];
    const country = ['INDIA', 'UNITED STATES', 'USA', 'CANADA', 'UAE', 'UK'].find((c) => upper.includes(c));
    const nameLine = text
        .split('\n')
        .map((line) => line.trim())
        .find((line) => /^[A-Za-z][A-Za-z\s]{4,}$/.test(line) && !/PASSPORT|LICENSE|NATIONAL|IDENTITY|REPUBLIC/i.test(line));

    return {
        fullName: nameLine || undefined,
        dateOfBirth: dob || undefined,
        documentNumber: docNumber || undefined,
        expiryDate: expiry || undefined,
        issuingCountry: country || undefined,
        address: undefined,
    };
}
