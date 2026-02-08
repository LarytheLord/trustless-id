'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { Logo } from './Logo';

export function Navbar() {
    const pathname = usePathname();
    const { isAuthenticated, logout } = useAuth();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <Logo className="w-8 h-8" />
                        <span className="font-semibold text-lg">TrustlessID</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link
                            href="/"
                            className={`text-sm transition-colors ${isActive('/') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Home
                        </Link>
                        <Link
                            href="/verify"
                            className={`text-sm transition-colors ${isActive('/verify') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Verify
                        </Link>
                        {isAuthenticated && (
                            <Link
                                href="/dashboard"
                                className={`text-sm transition-colors ${isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Dashboard
                            </Link>
                        )}
                    </div>

                    {/* Auth Buttons */}
                    <div className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                <Link href="/dashboard">
                                    <Button variant="ghost" size="sm">
                                        Dashboard
                                    </Button>
                                </Link>
                                <Button variant="outline" size="sm" onClick={logout}>
                                    Sign Out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" size="sm">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/login?mode=signup">
                                    <Button size="sm" className="gradient-primary text-white border-0">
                                        Get Started
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
