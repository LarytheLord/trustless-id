'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Navbar, Footer } from '@/components/shared';
import { useAuth } from '@/lib/auth';
import { formatHash } from '@/lib/crypto';
import { Document, Credential, ActivityLog, DashboardStats } from '@/types';
import {
    getDocumentsByUserId,
    getCredentialsByUserId,
    getActivityLogsByUserId,
} from '@/lib/db';

export default function DashboardPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuth();

    const [documents, setDocuments] = useState<Document[]>([]);
    const [credentials, setCredentials] = useState<Credential[]>([]);
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [stats, setStats] = useState<DashboardStats>({
        totalDocuments: 0,
        verifiedDocuments: 0,
        activeCredentials: 0,
        recentVerifications: 0,
    });

    // Redirect if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    // Load user data
    useEffect(() => {
        async function loadData() {
            if (user) {
                const userDocs = await getDocumentsByUserId(user.id);
                const userCreds = await getCredentialsByUserId(user.id);
                const userLogs = await getActivityLogsByUserId(user.id);

                setDocuments(userDocs);
                setCredentials(userCreds);
                setActivities(userLogs.slice(0, 5));

                setStats({
                    totalDocuments: userDocs.length,
                    verifiedDocuments: userDocs.filter(d => d.status === 'verified').length,
                    activeCredentials: userCreds.filter(c => c.status === 'active').length,
                    recentVerifications: userCreds.reduce((acc, c) => acc + (c.verificationCount || 0), 0),
                });
            }
        }
        loadData();
    }, [user]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'verified':
            case 'active':
                return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'pending':
            case 'processing':
                return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'rejected':
            case 'revoked':
                return 'bg-red-500/10 text-red-400 border-red-500/20';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    const getActivityIcon = (action: ActivityLog['action']) => {
        switch (action) {
            case 'login':
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                );
            case 'document_upload':
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                );
            case 'verification':
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'credential_issued':
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                );
            case 'credential_verified':
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    return (
        <main className="min-h-screen bg-background">
            <Navbar />

            <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                        <div className="flex items-center gap-4">
                            <Avatar className="w-16 h-16 border-2 border-primary/20">
                                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                                    {user.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-2xl font-bold">{user.name}</h1>
                                <p className="text-muted-foreground">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge className={user.verified ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}>
                                {user.verified ? 'Verified' : 'Unverified'}
                            </Badge>
                            <Link href="/create-identity">
                                <Button className="gradient-primary text-white border-0">
                                    Create New Identity
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: 'Documents', value: stats.totalDocuments, icon: '📄' },
                            { label: 'Verified', value: stats.verifiedDocuments, icon: '✅' },
                            { label: 'Credentials', value: stats.activeCredentials, icon: '🔐' },
                            { label: 'Verifications', value: stats.recentVerifications, icon: '🔍' },
                        ].map((stat, index) => (
                            <Card key={index} className="glass border-white/5">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                                            <p className="text-2xl font-bold">{stat.value}</p>
                                        </div>
                                        <span className="text-2xl">{stat.icon}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Documents */}
                        <Card className="glass border-white/5 lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Documents</CardTitle>
                                <CardDescription>Your uploaded identity documents</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {documents.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-muted-foreground mb-4">No documents uploaded yet</p>
                                        <Link href="/create-identity">
                                            <Button variant="outline">Upload Document</Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {documents.map((doc) => (
                                            <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{doc.name}</p>
                                                        <p className="text-xs text-muted-foreground capitalize">
                                                            {doc.type.replace('_', ' ')} • {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge className={getStatusColor(doc.status)}>
                                                    {doc.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Activity Log */}
                        <Card className="glass border-white/5">
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>Your latest actions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {activities.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-4">No recent activity</p>
                                ) : (
                                    <div className="space-y-4">
                                        {activities.map((activity) => (
                                            <div key={activity.id} className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                                    {getActivityIcon(activity.action)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm">{activity.description}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(activity.timestamp).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Credentials */}
                    <Card className="glass border-white/5 mt-6">
                        <CardHeader>
                            <CardTitle>Credentials</CardTitle>
                            <CardDescription>Your blockchain-backed identity credentials</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {credentials.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground mb-4">No credentials issued yet</p>
                                    <Link href="/create-identity">
                                        <Button variant="outline">Create Identity</Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {credentials.map((cred) => (
                                        <div key={cred.id} className="p-4 rounded-xl bg-background/50 border border-white/5">
                                            <div className="flex items-center justify-between mb-3">
                                                <Badge className={getStatusColor(cred.status)}>
                                                    {cred.status}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground capitalize">
                                                    {cred.type}
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Credential ID</p>
                                                    <p className="font-mono text-sm">{cred.id}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Hash</p>
                                                    <p className="font-mono text-sm text-primary">{formatHash(cred.hash)}</p>
                                                </div>
                                                <Separator className="my-2" />
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>Issued: {new Date(cred.issuedAt).toLocaleDateString()}</span>
                                                    <span>{cred.verificationCount} verifications</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Footer />
        </main>
    );
}
