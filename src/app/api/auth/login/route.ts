import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/db';
import { signJWT } from '@/lib/jwt';
import { loginSchema } from '@/lib/validators/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input with Zod
        const parsed = loginSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: 'Invalid input: ' + parsed.error.message },
                { status: 400 }
            );
        }

        const { email, name } = parsed.data;

        // Check if user exists
        let user = await getUserByEmail(email);

        if (!user) {
            // Create new user
            user = await createUser(email, name || email.split('@')[0]);
        }

        // Generate JWT token
        const token = await signJWT({
            userId: user.id,
            email: user.email,
        });

        // Create response with cookie
        const response = NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                verified: user.verified,
                createdAt: user.created_at,
            },
            message: user.created_at ? 'Account created' : 'Login successful',
        });

        // Set JWT cookie
        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Auth error:', error);
        return NextResponse.json(
            { success: false, error: 'Authentication failed' },
            { status: 500 }
        );
    }
}
