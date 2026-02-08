import { NextResponse } from 'next/server';
import { mockUsers, getUserByEmail } from '@/lib/mock-data';
import { User } from '@/types';

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
        const { email } = body;

        if (!email || typeof email !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Email is required' },
                { status: 400 }
            );
        }

        // Simulate network delay for realism
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Check if user exists in mock database
        let user = getUserByEmail(email);

        // For demo: create a new user if doesn't exist
        if (!user) {
            const newUser: User = {
                id: `user_${Date.now()}`,
                email: email.toLowerCase(),
                name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
                createdAt: new Date().toISOString(),
                verified: false,
            };

            // In a real app, this would save to database
            // For demo, we just return the new user
            user = newUser;
            mockUsers.push(newUser);
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
