'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Navbar, Footer } from '@/components/shared';
import { useAuth } from '@/lib/auth';
import { formatHash } from '@/lib/crypto';
import { VerificationResult, FraudResult, Credential } from '@/types';

type Step = 1 | 2 | 3 | 4 | 5;

const steps = [
    { number: 1, title: 'Basic Details', description: 'Your personal information' },
    { number: 2, title: 'Upload Document', description: 'Identity document' },
    { number: 3, title: 'AI Verification', description: 'Processing your document' },
    { number: 4, title: 'Fraud Analysis', description: 'Security check' },
    { number: 5, title: 'Confirmation', description: 'Your new credential' },
];

export default function CreateIdentityPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuth();

    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        dateOfBirth: '',
        nationality: '',
        documentType: 'passport' as 'passport' | 'drivers_license' | 'national_id',
        documentFile: null as File | null,
    });
    const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
    const [fraudResult, setFraudResult] = useState<FraudResult | null>(null);
    const [credential, setCredential] = useState<Credential | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    // Pre-fill form with user data
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                fullName: user.name,
                email: user.email,
            }));
        }
    }, [user]);

    const handleNext = async () => {
        if (currentStep === 2) {
            // Start AI verification
            setCurrentStep(3);
            setIsProcessing(true);

            try {
                const response = await fetch('/api/ai/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        documentId: `doc_${Date.now()}`,
                        documentType: formData.documentType,
                    }),
                });
                const data = await response.json();
                if (data.success) {
                    setVerificationResult(data.data);
                }
            } catch (error) {
                console.error('Verification error:', error);
            }

            setIsProcessing(false);
            setCurrentStep(4);

            // Start fraud detection
            setIsProcessing(true);
            try {
                const response = await fetch('/api/ai/fraud-detection', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        documentId: `doc_${Date.now()}`,
                        userId: user?.id,
                        verificationData: verificationResult,
                    }),
                });
                const data = await response.json();
                if (data.success) {
                    setFraudResult(data.data);
                }
            } catch (error) {
                console.error('Fraud detection error:', error);
            }
            setIsProcessing(false);
        } else if (currentStep === 4) {
            // Issue credential
            setCurrentStep(5);
            setIsProcessing(true);

            try {
                const response = await fetch('/api/credentials', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user?.id,
                        documentId: `doc_${Date.now()}`,
                        type: 'identity',
                    }),
                });
                const data = await response.json();
                if (data.success) {
                    setCredential(data.data);
                }
            } catch (error) {
                console.error('Credential issue error:', error);
            }
            setIsProcessing(false);
        } else {
            setCurrentStep((prev) => Math.min(prev + 1, 5) as Step);
        }
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1) as Step);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, documentFile: file }));
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    const progress = (currentStep / 5) * 100;

    return (
        <main className="min-h-screen bg-background">
            <Navbar />

            <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">Create Your Identity</h1>
                        <p className="text-muted-foreground">
                            Complete the steps below to create your decentralized identity credential
                        </p>
                    </div>

                    {/* Progress */}
                    <div className="mb-8">
                        <Progress value={progress} className="h-2 mb-4" />
                        <div className="flex justify-between">
                            {steps.map((step) => (
                                <div
                                    key={step.number}
                                    className={`flex flex-col items-center ${currentStep >= step.number ? 'text-primary' : 'text-muted-foreground'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-1 ${currentStep >= step.number ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                        }`}>
                                        {currentStep > step.number ? '✓' : step.number}
                                    </div>
                                    <span className="text-xs hidden sm:block">{step.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Step Content */}
                    <Card className="glass border-white/5">
                        <CardHeader>
                            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
                            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Step 1: Basic Details */}
                            {currentStep === 1 && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="fullName">Full Name</Label>
                                            <Input
                                                id="fullName"
                                                value={formData.fullName}
                                                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                                className="bg-background/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                className="bg-background/50"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="dob">Date of Birth</Label>
                                            <Input
                                                id="dob"
                                                type="date"
                                                value={formData.dateOfBirth}
                                                onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                                                className="bg-background/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="nationality">Nationality</Label>
                                            <Input
                                                id="nationality"
                                                placeholder="e.g., United States"
                                                value={formData.nationality}
                                                onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                                                className="bg-background/50"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Document Upload */}
                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label>Document Type</Label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {(['passport', 'drivers_license', 'national_id'] as const).map((type) => (
                                                <button
                                                    key={type}
                                                    onClick={() => setFormData(prev => ({ ...prev, documentType: type }))}
                                                    className={`p-4 rounded-lg border text-center transition-all ${formData.documentType === type
                                                        ? 'border-primary bg-primary/10 text-primary'
                                                        : 'border-white/10 hover:border-white/20'
                                                        }`}
                                                >
                                                    <span className="text-2xl mb-2 block">
                                                        {type === 'passport' ? '🛂' : type === 'drivers_license' ? '🪪' : '🆔'}
                                                    </span>
                                                    <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Upload Document</Label>
                                        <div
                                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${formData.documentFile ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-white/20'
                                                }`}
                                        >
                                            <input
                                                type="file"
                                                accept="image/*,.pdf"
                                                onChange={handleFileChange}
                                                className="hidden"
                                                id="document-upload"
                                            />
                                            <label htmlFor="document-upload" className="cursor-pointer">
                                                {formData.documentFile ? (
                                                    <div className="space-y-2">
                                                        <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                                                            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                        <p className="font-medium">{formData.documentFile.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {(formData.documentFile.size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center">
                                                            <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                            </svg>
                                                        </div>
                                                        <p className="font-medium">Drop your document here</p>
                                                        <p className="text-sm text-muted-foreground">or click to browse (PDF, JPG, PNG)</p>
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Demo mode: file upload is simulated. No actual files are stored.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: AI Verification */}
                            {currentStep === 3 && (
                                <div className="py-8 text-center">
                                    {isProcessing ? (
                                        <div className="space-y-4">
                                            <div className="w-16 h-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                            <p className="font-medium">Analyzing document...</p>
                                            <p className="text-sm text-muted-foreground">
                                                Our AI is checking authenticity and extracting data
                                            </p>
                                        </div>
                                    ) : verificationResult ? (
                                        <div className="space-y-6">
                                            <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
                                                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-medium text-lg">Document Verified</p>
                                                <p className="text-muted-foreground">Authenticity score: {verificationResult.authenticity}%</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-left">
                                                <div className="p-3 rounded-lg bg-background/50">
                                                    <p className="text-xs text-muted-foreground">Confidence</p>
                                                    <p className="font-medium">{verificationResult.confidence}%</p>
                                                </div>
                                                <div className="p-3 rounded-lg bg-background/50">
                                                    <p className="text-xs text-muted-foreground">Anomalies</p>
                                                    <p className="font-medium">{verificationResult.anomalies.length} detected</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            )}

                            {/* Step 4: Fraud Analysis */}
                            {currentStep === 4 && (
                                <div className="py-8 text-center">
                                    {isProcessing ? (
                                        <div className="space-y-4">
                                            <div className="w-16 h-16 mx-auto border-4 border-accent border-t-transparent rounded-full animate-spin" />
                                            <p className="font-medium">Running fraud detection...</p>
                                            <p className="text-sm text-muted-foreground">
                                                Checking for synthetic identity and deepfake patterns
                                            </p>
                                        </div>
                                    ) : fraudResult ? (
                                        <div className="space-y-6">
                                            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${fraudResult.riskLevel === 'low' ? 'bg-green-500/10' :
                                                fraudResult.riskLevel === 'medium' ? 'bg-yellow-500/10' : 'bg-red-500/10'
                                                }`}>
                                                <svg className={`w-8 h-8 ${fraudResult.riskLevel === 'low' ? 'text-green-400' :
                                                    fraudResult.riskLevel === 'medium' ? 'text-yellow-400' : 'text-red-400'
                                                    }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-medium text-lg">Fraud Analysis Complete</p>
                                                <Badge className={
                                                    fraudResult.riskLevel === 'low' ? 'bg-green-500/10 text-green-400' :
                                                        fraudResult.riskLevel === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                                                            'bg-red-500/10 text-red-400'
                                                }>
                                                    Risk Level: {fraudResult.riskLevel.toUpperCase()}
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-left">
                                                <div className="p-3 rounded-lg bg-background/50">
                                                    <p className="text-xs text-muted-foreground">Risk Score</p>
                                                    <p className="font-medium">{fraudResult.riskScore}/100</p>
                                                </div>
                                                <div className="p-3 rounded-lg bg-background/50">
                                                    <p className="text-xs text-muted-foreground">Recommendation</p>
                                                    <p className="font-medium capitalize">{fraudResult.recommendation}</p>
                                                </div>
                                            </div>
                                            {fraudResult.flags.length > 0 && (
                                                <div className="text-left p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                                                    <p className="text-sm font-medium text-yellow-400 mb-2">Flags Detected</p>
                                                    {fraudResult.flags.map((flag, i) => (
                                                        <p key={i} className="text-sm text-muted-foreground">
                                                            • {flag.description}
                                                        </p>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : null}
                                </div>
                            )}

                            {/* Step 5: Confirmation */}
                            {currentStep === 5 && (
                                <div className="py-8 text-center">
                                    {isProcessing ? (
                                        <div className="space-y-4">
                                            <div className="w-16 h-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                            <p className="font-medium">Issuing credential...</p>
                                            <p className="text-sm text-muted-foreground">
                                                Recording to blockchain (simulated)
                                            </p>
                                        </div>
                                    ) : credential ? (
                                        <div className="space-y-6">
                                            <div className="w-20 h-20 mx-auto rounded-full gradient-primary flex items-center justify-center">
                                                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-bold text-2xl mb-2">Identity Created!</p>
                                                <p className="text-muted-foreground">
                                                    Your credential has been issued and recorded on the blockchain.
                                                </p>
                                            </div>
                                            <div className="p-6 rounded-xl bg-background/50 border border-white/5 text-left space-y-4">
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Credential ID</p>
                                                    <p className="font-mono text-lg text-primary">{credential.id}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">SHA-256 Hash</p>
                                                    <p className="font-mono text-sm break-all">{credential.hash}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Issued</p>
                                                        <p className="text-sm">{new Date(credential.issuedAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Expires</p>
                                                        <p className="text-sm">{new Date(credential.expiresAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-3 justify-center">
                                                <Link href="/dashboard">
                                                    <Button className="gradient-primary text-white border-0">
                                                        Go to Dashboard
                                                    </Button>
                                                </Link>
                                                <Link href="/verify">
                                                    <Button variant="outline">
                                                        Verify Credential
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            )}

                            {/* Navigation */}
                            {currentStep < 5 && !isProcessing && (
                                <div className="flex justify-between mt-8 pt-6 border-t border-white/5">
                                    <Button
                                        variant="ghost"
                                        onClick={handleBack}
                                        disabled={currentStep === 1}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        onClick={handleNext}
                                        className="gradient-primary text-white border-0"
                                        disabled={
                                            (currentStep === 1 && !formData.fullName) ||
                                            (currentStep === 2 && !formData.documentFile)
                                        }
                                    >
                                        {currentStep === 4 ? 'Issue Credential' : 'Continue'}
                                    </Button>
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
