'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';

// ============================================
// AUTH CONTEXT TYPES
// ============================================
interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, name?: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// SESSION STORAGE KEY
// ============================================
const SESSION_KEY = 'trustlessid_session';

// ============================================
// AUTH PROVIDER COMPONENT
// ============================================
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const checkSession = () => {
            try {
                const sessionData = localStorage.getItem(SESSION_KEY);
                if (sessionData) {
                    const parsedUser = JSON.parse(sessionData) as User;
                    setUser(parsedUser);
                }
            } catch (error) {
                console.error('Failed to restore session:', error);
                localStorage.removeItem(SESSION_KEY);
            } finally {
                setIsLoading(false);
            }
        };

        checkSession();
    }, []);

    // Login function
    const login = async (
        email: string,
        name?: string
    ): Promise<{ success: boolean; error?: string }> => {
        setIsLoading(true);

        try {
            // Call auth API
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name }),
            });

            const data = await response.json();

            if (data.success && data.user) {
                setUser(data.user);
                localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
                return { success: true };
            }

            console.error('Login failed:', data.error);
            return { success: false, error: data.error || 'Authentication failed' };
        } catch (error) {
            console.error('Login failed:', error);
            return { success: false, error: 'Network error. Please try again.' };
        } finally {
            setIsLoading(false);
        }
    };

    // Logout function
    const logout = () => {
        setUser(null);
        localStorage.removeItem(SESSION_KEY);
    };

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================
// HOOK TO USE AUTH CONTEXT
// ============================================
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// ============================================
// PROTECTED ROUTE WRAPPER
// ============================================
interface ProtectedRouteProps {
    children: ReactNode;
    fallback?: ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return fallback || null;
    }

    return <>{children}</>;
}
