import { NextRequest, NextResponse } from 'next/server';
import { getDocumentsByUserId, createDocument, createActivityLog } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'userId is required' },
                { status: 400 }
            );
        }

        const documents = await getDocumentsByUserId(userId);

        return NextResponse.json({
            success: true,
            data: documents.map(doc => ({
                id: doc.id,
                userId: doc.user_id,
                name: doc.name,
                type: doc.type,
                status: doc.status,
                uploadedAt: doc.uploaded_at,
                fileSize: doc.file_size,
                mimeType: doc.mime_type,
            })),
        });
    } catch (error) {
        console.error('Error fetching documents:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch documents' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, name, type, fileSize, mimeType, cloudinaryUrl, cloudinaryPublicId } = body;

        if (!userId || !name || !type) {
            return NextResponse.json(
                { success: false, error: 'userId, name, and type are required' },
                { status: 400 }
            );
        }

        const document = await createDocument({
            user_id: userId,
            name,
            type,
            file_size: fileSize,
            mime_type: mimeType,
            cloudinary_url: cloudinaryUrl,
            cloudinary_public_id: cloudinaryPublicId,
        });

        // Log activity
        await createActivityLog({
            user_id: userId,
            action: 'document_upload',
            description: `Uploaded ${name} for ${type.replace('_', ' ')}`,
            metadata: { documentId: document.id },
        });

        return NextResponse.json({
            success: true,
            data: {
                id: document.id,
                userId: document.user_id,
                name: document.name,
                type: document.type,
                status: document.status,
                uploadedAt: document.uploaded_at,
                fileSize: document.file_size,
                mimeType: document.mime_type,
            },
        });
    } catch (error) {
        console.error('Error creating document:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create document' },
            { status: 500 }
        );
    }
}
