import { NextResponse } from 'next/server';
import { getDocumentsByUserId, mockDocuments } from '@/lib/mock-data';
import { Document } from '@/types';

/**
 * Documents API
 * GET /api/documents?userId=<user_id> - List user documents
 * POST /api/documents - Upload new document (mock)
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

        const documents = getDocumentsByUserId(userId);

        return NextResponse.json({
            success: true,
            data: documents,
            count: documents.length,
        });
    } catch (error) {
        console.error('Documents fetch error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch documents' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, name, type, fileSize, mimeType } = body;

        if (!userId || !name || !type) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Simulate upload processing
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Create new document entry
        const newDocument: Document = {
            id: `doc_${Date.now()}`,
            userId,
            name,
            type,
            status: 'pending',
            uploadedAt: new Date().toISOString(),
            fileSize: fileSize || 0,
            mimeType: mimeType || 'application/octet-stream',
        };

        // Add to mock database
        mockDocuments.push(newDocument);

        return NextResponse.json({
            success: true,
            data: newDocument,
            message: 'Document uploaded successfully',
        });
    } catch (error) {
        console.error('Document upload error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to upload document' },
            { status: 500 }
        );
    }
}
