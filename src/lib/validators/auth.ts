import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

export const documentSchema = z.object({
    userId: z.string(),
    name: z.string().min(1),
    type: z.enum(['passport', 'drivers_license', 'national_id', 'utility_bill', 'other']),
    fileSize: z.number().optional(),
    mimeType: z.string().optional(),
});

export const credentialSchema = z.object({
    userId: z.string(),
    documentId: z.string().optional(),
    type: z.enum(['identity', 'address', 'age']),
});
