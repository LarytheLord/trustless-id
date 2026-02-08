import { NextResponse } from 'next/server';
import { generateMockVerification } from '@/lib/mock-data';
import { VerificationResult } from '@/types';

/**
 * AI Document Analysis API (Mock)
 * POST /api/ai/analyze
 * 
 * Simulates AI-powered document verification
 * Returns authenticity score, confidence level, and extracted data
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { documentId, documentType } = body;

        if (!documentId) {
            return NextResponse.json(
                { success: false, error: 'Document ID is required' },
                { status: 400 }
            );
        }

        // Simulate AI processing time (1-3 seconds)
        const processingTime = 1000 + Math.random() * 2000;
        await new Promise((resolve) => setTimeout(resolve, processingTime));

        // Generate mock verification result
        const result: VerificationResult = generateMockVerification();
        result.documentId = documentId;

        // Customize extracted data based on document type
        if (documentType === 'passport') {
            result.extractedData = {
                ...result.extractedData,
                documentNumber: `P${Math.random().toString().substring(2, 10)}`,
                issuingCountry: 'United States',
            };
        } else if (documentType === 'drivers_license') {
            result.extractedData = {
                ...result.extractedData,
                documentNumber: `DL${Math.random().toString().substring(2, 10)}`,
                address: '123 Demo Street, Tech City, TC 12345',
            };
        }

        return NextResponse.json({
            success: true,
            data: result,
            processingTimeMs: Math.round(processingTime),
            message: 'Document analysis complete',
        });
    } catch (error) {
        console.error('AI analysis error:', error);
        return NextResponse.json(
            { success: false, error: 'Document analysis failed' },
            { status: 500 }
        );
    }
}
