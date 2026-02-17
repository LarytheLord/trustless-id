'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Logo } from '@/components/shared/Logo';
import { useAuth } from '@/lib/auth';

function LoginForm() {
    const router = useRouter();
    const { login, isLoading, isAuthenticated } = useAuth();

    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('login');

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Please enter your email');
            return;
        }

        const success = await login(email, activeTab === 'signup' ? name : undefined);
        if (success) {
            router.push('/dashboard');
        } else {
            setError('Authentication failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 gradient-hero">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
            </div>

            <Card className="w-full max-w-md glass border-white/10 relative z-10">
                <CardHeader className="text-center">
                    <Link href="/" className="flex items-center justify-center gap-2 mb-4">
                        <Logo className="w-10 h-10" />
                    </Link>
                    <CardTitle className="text-2xl">Welcome to TrustlessID</CardTitle>
                    <CardDescription>
                        Secure, decentralized identity verification
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="login">Sign In</TabsTrigger>
                            <TabsTrigger value="signup">Sign Up</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email-login">Email</Label>
                                    <Input
                                        id="email-login"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-background/50"
                                        autoComplete="email"
                                    />
                                </div>

                                {error && (
                                    <p className="text-sm text-destructive">{error}</p>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full gradient-primary text-white border-0"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Signing in...
                                        </span>
                                    ) : (
                                        'Sign In'
                                    )}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="signup">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name-signup">Full Name</Label>
                                    <Input
                                        id="name-signup"
                                        type="text"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="bg-background/50"
                                        autoComplete="name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email-signup">Email</Label>
                                    <Input
                                        id="email-signup"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-background/50"
                                        autoComplete="email"
                                    />
                                </div>

                                {error && (
                                    <p className="text-sm text-destructive">{error}</p>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full gradient-primary text-white border-0"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Creating account...
                                        </span>
                                    ) : (
                                        'Create Account'
                                    )}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>

                    {/* Demo hint */}
                    <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
                        <p className="text-xs text-muted-foreground text-center">
                            <strong>Demo Mode:</strong> Use <code className="px-1 py-0.5 rounded bg-background/50">demo@trustlessid.com</code> for a pre-populated account, or any email to create a new one.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center gradient-hero">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
