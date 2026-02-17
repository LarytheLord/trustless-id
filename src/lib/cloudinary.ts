import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
    success: boolean;
    url?: string;
    publicId?: string;
    error?: string;
}

export async function uploadToCloudinary(
    file: Buffer,
    folder: string = 'trustlessid/documents'
): Promise<UploadResult> {
    try {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type: 'auto',
                    transformation: [
                        { quality: 'auto:good' },
                        { fetch_format: 'auto' }
                    ]
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve({
                            success: true,
                            url: result?.secure_url,
                            publicId: result?.public_id,
                        });
                    }
                }
            );

            uploadStream.end(file);
        });
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Upload failed',
        };
    }
}

export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result.result === 'ok';
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        return false;
    }
}

export function getCloudinaryUrl(publicId: string, transformations?: string): string {
    const baseUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/`;
    const transforms = transformations ? `${transformations}/` : '';
    return `${baseUrl}${transforms}${publicId}`;
}
