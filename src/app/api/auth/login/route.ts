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
