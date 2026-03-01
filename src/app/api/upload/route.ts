import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { createRequire } from 'module';
import { existsSync } from 'fs';
import path from 'path';
import { createWorker } from 'tesseract.js';

/**
 * File Upload Endpoint - Simplified for Demo
 * 
 * NOTE: This is a simplified implementation for hackathon demo.
 * The file is validated but NOT actually uploaded to any storage.
 * This reduces complexity and removes the need for Cloudinary setup.
 * 
 * In production, you would:
 * - Upload to Vercel Blob, S3, or similar
 * - Store the URL in the database
 * - Use signed URLs for secure access
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { success: false, error: 'Invalid file type. Allowed: PDF, JPEG, PNG' },
                { status: 400 }
            );
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { success: false, error: 'File size exceeds 10MB limit' },
                { status: 400 }
            );
        }

        // Generate a cryptographic fingerprint from the actual uploaded file bytes.
        // This lets us prove the credential issuance was derived from a real document artifact.
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const documentHash = `sha256:${createHash('sha256').update(fileBuffer).digest('hex')}`;

        // Run OCR only for images. PDFs are accepted but OCR is skipped in this MVP.
        const ocr = await runOCRIfImage(file.type, fileBuffer);

        // For demo purposes, we still return a mock URL (no persistent file storage).
        const mockUrl = `/documents/${file.name}`;
        const mockPublicId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        return NextResponse.json({
            success: true,
            data: {
                url: mockUrl,
                publicId: mockPublicId,
                documentHash,
                ocr,
                size: file.size,
                type: file.type,
                name: file.name,
            },
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { success: false, error: 'Upload failed' },
            { status: 500 }
        );
    }
}

async function runOCRIfImage(mimeType: string, fileBuffer: Buffer): Promise<{
    attempted: boolean;
    confidence?: number;
    textSample?: string;
    wordCount?: number;
    reason?: string;
}> {
    if (!mimeType.startsWith('image/')) {
        return {
            attempted: false,
            reason: 'OCR currently supported for image uploads only',
        };
    }

    const workerPath = resolveTesseractWorkerPath();
    const worker = await createWorker('eng', 1, workerPath ? { workerPath } : {});
    try {
        const {
            data: { text, confidence },
        } = await worker.recognize(fileBuffer);

        const cleanedText = text.replace(/\s+/g, ' ').trim();
        const words = cleanedText ? cleanedText.split(' ').length : 0;

        return {
            attempted: true,
            confidence,
            textSample: cleanedText.slice(0, 500),
            wordCount: words,
        };
    } catch {
        return {
            attempted: false,
            reason: 'OCR failed for this image',
        };
    } finally {
        await worker.terminate();
    }
}

function resolveTesseractWorkerPath(): string | null {
    // Prefer direct absolute path from project root in Next.js dev/prod runtime.
    const directPath = path.join(
        process.cwd(),
        'node_modules',
        'tesseract.js',
        'src',
        'worker-script',
        'node',
        'index.js'
    );
    if (existsSync(directPath)) {
        return directPath;
    }

    try {
        const require = createRequire(import.meta.url);
        const resolved = require.resolve('tesseract.js/src/worker-script/node/index.js');
        return sanitizeWorkerPath(resolved);
    } catch {
        return null;
    }
}

function sanitizeWorkerPath(inputPath: string): string | null {
    // Turbopack can decorate paths like:
    // [project]/node_modules/.../index.js [app-route] (ecmascript)
    let p = inputPath.trim();
    p = p.replace(/\s+\[app-route\].*$/i, '');
    p = p.replace(/^\[project\]/, process.cwd());

    if (!path.isAbsolute(p)) {
        return null;
    }
    return p;
}
