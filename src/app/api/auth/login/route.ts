import { NextResponse } from 'next/server';
import { mockUsers, getUserByEmail } from '@/lib/mock-data';
import { User } from '@/types';
import { loginSchema } from '@/lib/validators/auth';

/**
 * Mock Authentication API
 * POST /api/auth/login
 *
 * For demo purposes: any email will work
 * - Known emails return existing user data
 * - Unknown emails create a new mock user
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // ✅ Zod validation
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if user exists
    let user = getUserByEmail(email);

    // Create user if not exists (demo behavior)
    if (!user) {
      const newUser: User = {
        id: `user_${Date.now()}`,
        email: email.toLowerCase(),
        name: email
          .split('@')[0]
          .replace(/[._]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        createdAt: new Date().toISOString(),
        verified: false,
      };

      mockUsers.push(newUser);
      user = newUser;
import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/db';
import { signJWT } from '@/lib/jwt';

export async function POST(request: NextRequest) {
    try {
        const { email, name } = await request.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json(
                { success: false, error: 'Valid email is required' },
                { status: 400 }
            );
        }

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

    return NextResponse.json({
      success: true,
      user,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
