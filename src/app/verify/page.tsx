'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Navbar, Footer } from '@/components/shared';
import { PublicVerification } from '@/types';

interface PolicyCheck {
    name: string;
    passed: boolean;
    detail: string;
}

interface TrustBreakdown {
    base: number;
    verificationPoints: number;
    agePoints: number;
    expiredPenalty: number;
    finalScore: number;
}

interface ExplainabilityData {
    policyChecks: PolicyCheck[];
    trustBreakdown: TrustBreakdown;
    summary: string;
}

export default function VerifyPage() {
    const [credentialId, setCredentialId] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [result, setResult] = useState<PublicVerification | null>(null);
    const [error, setError] = useState('');
    const [recentCredentialIds, setRecentCredentialIds] = useState<string[]>([]);
    const [verifierName, setVerifierName] = useState('Demo Bank');
    const [verifierDomain, setVerifierDomain] = useState('bank.example.com');
    const [purpose, setPurpose] = useState('KYC onboarding');
    const [requestId, setRequestId] = useState('');
    const [proofToken, setProofToken] = useState('');
    const [receiptHash, setReceiptHash] = useState('');
    const [flowStatus, setFlowStatus] = useState('');
    const [replayStatus, setReplayStatus] = useState('');
    const [explainability, setExplainability] = useState<ExplainabilityData | null>(null);
    const [timeline, setTimeline] = useState({
        requested: false,
        approved: false,
        consumed: false,
        replayBlocked: false,
    });

    useEffect(() => {
        const credentialIdFromUrl =
            typeof window !== 'undefined'
                ? new URLSearchParams(window.location.search).get('id')
                : null;
        const lastCredentialId = localStorage.getItem('trustlessid_last_credential_id');

        if (credentialIdFromUrl) {
            setCredentialId(credentialIdFromUrl);
            const ids = lastCredentialId ? [credentialIdFromUrl, lastCredentialId] : [credentialIdFromUrl];
            setRecentCredentialIds(ids.filter((id, index) => ids.indexOf(id) === index));
            return;
        }

        if (lastCredentialId) {
            setCredentialId(lastCredentialId);
            setRecentCredentialIds([lastCredentialId]);
        }
    }, []);

    const handleVerify = async () => {
        if (!credentialId.trim()) {
            setError('Please enter a credential ID');
            return;
        }

        setError('');
        setIsVerifying(true);
        setResult(null);

        try {
            const response = await fetch(`/api/verify?id=${encodeURIComponent(credentialId.trim())}`);
            const data = await response.json();

            if (data.success && data.data) {
                setResult(data.data);
            } else {
                setError(data.error || 'Credential not found');
            }
        } catch {
            setError('Verification failed. Please try again.');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleCreateVerificationRequest = async () => {
        if (!credentialId.trim()) {
            setError('Please enter a credential ID');
            return;
        }

        setError('');
        setFlowStatus('Creating request...');
        setReplayStatus('');
        setExplainability(null);
        setProofToken('');
        setReceiptHash('');
        setTimeline({
            requested: false,
            approved: false,
            consumed: false,
            replayBlocked: false,
        });

        try {
            const response = await fetch('/api/verify/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    credentialId: credentialId.trim(),
                    verifierName,
                    verifierDomain,
                    purpose,
                    policy: {
                        requiresActiveCredential: true,
                        maxRiskScore: 30,
                    },
                    requestedFields: ['credentialType', 'issueDate', 'isValid'],
                }),
            });

            const data = await response.json();
            if (!data.success) {
                setError(data.error || 'Failed to create verification request');
                setFlowStatus('');
                return;
            }

            setRequestId(data.data.requestId);
            setFlowStatus(`Request created: ${data.data.requestId}`);
            setTimeline((prev) => ({ ...prev, requested: true }));
        } catch {
            setError('Failed to create verification request');
            setFlowStatus('');
        }
    };

    const handleApproveRequest = async () => {
        if (!requestId) {
            setError('Create a verification request first');
            return;
        }

        setError('');
        setFlowStatus('Approving request...');

        try {
            const response = await fetch('/api/verify/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestId,
                    decision: 'approve',
                }),
            });

            const data = await response.json();
            if (!data.success) {
                setError(data.error || 'Failed to approve request');
                setFlowStatus('');
                return;
            }

            setProofToken(data.data.proofToken);
            setFlowStatus('Request approved. One-time proof token generated.');
            setTimeline((prev) => ({ ...prev, approved: true }));
        } catch {
            setError('Failed to approve request');
            setFlowStatus('');
        }
    };

    const handleConsumeProof = async () => {
        if (!proofToken) {
            setError('Approve request first to get a proof token');
            return;
        }

        setError('');
        setFlowStatus('Consuming one-time proof...');

        try {
            const response = await fetch('/api/verify/consume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    proofToken,
                    verifierName,
                    verifierDomain,
                }),
            });

            const data = await response.json();
            if (!data.success) {
                setError(data.error || 'Failed to consume proof');
                setFlowStatus('');
                return;
            }

            setResult({
                credentialId: data.data.credentialId,
                isValid: data.data.isValid,
                trustScore: data.data.trustScore,
                issueDate: data.data.issueDate,
                credentialType: data.data.credentialType,
                verifiedAt: data.data.verifiedAt,
            });
            setReceiptHash(data.data.receiptHash || '');
            setExplainability(data.data.explainability || null);
            setFlowStatus('Proof consumed successfully. Replay is blocked.');
            setTimeline((prev) => ({ ...prev, consumed: true }));
        } catch {
            setError('Failed to consume proof');
            setFlowStatus('');
        }
    };

    const handleReplayAttackSimulation = async () => {
        if (!proofToken) {
            setReplayStatus('No proof token available to replay.');
            return;
        }

        setReplayStatus('Attempting replay attack using same proof token...');

        try {
            const response = await fetch('/api/verify/consume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    proofToken,
                    verifierName,
                    verifierDomain,
                }),
            });

            const data = await response.json();
            if (!data.success) {
                setReplayStatus(`Replay blocked: ${data.error}`);
                setTimeline((prev) => ({ ...prev, replayBlocked: true }));
                return;
            }

            setReplayStatus('Replay unexpectedly succeeded (check backend constraints).');
        } catch {
            setReplayStatus('Replay blocked by server/network protection.');
            setTimeline((prev) => ({ ...prev, replayBlocked: true }));
        }
    };

    const getTrustScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-400';
        if (score >= 70) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getTrustScoreLabel = (score: number) => {
        if (score >= 90) return 'Excellent';
        if (score >= 80) return 'Very Good';
        if (score >= 70) return 'Good';
        if (score >= 50) return 'Fair';
        return 'Low';
    };

    return (
        <main className="min-h-screen bg-background">
            <Navbar />

            <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-sm text-muted-foreground">Public Verification</span>
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Verify a Credential</h1>
                        <p className="text-muted-foreground">
                            Enter a credential ID to verify its authenticity without exposing personal data
                        </p>
                    </div>

                    {/* Verification Form */}
                    <Card className="glass border-white/5 mb-6">
                        <CardHeader>
                            <CardTitle>Credential Verification</CardTitle>
                            <CardDescription>
                                Verify identity credentials issued by TrustlessID
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="credential-id">Credential ID</Label>
                                    <div className="flex gap-3">
                                        <Input
                                            id="credential-id"
                                            placeholder="e.g., 550e8400-e29b-41d4-a716-446655440000"
                                            value={credentialId}
                                            onChange={(e) => setCredentialId(e.target.value)}
                                            className="bg-background/50 font-mono"
                                        />
                                        <Button
                                            onClick={handleVerify}
                                            disabled={isVerifying}
                                            className="gradient-primary text-white border-0 px-8"
                                        >
                                            {isVerifying ? (
                                                <span className="flex items-center gap-2">
                                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Verifying
                                                </span>
                                            ) : (
                                                'Verify'
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                        <p className="text-sm text-red-400">{error}</p>
                                    </div>
                                )}

                                {/* Most recent credential hint */}
                                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                                    <p className="text-xs text-muted-foreground">
                                        <strong>Tip:</strong> Verify the credential you most recently issued.
                                    </p>
                                    {recentCredentialIds.length > 0 ? (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {recentCredentialIds.map((id) => (
                                                <button
                                                    key={id}
                                                    onClick={() => setCredentialId(id)}
                                                    className="px-2 py-1 rounded bg-background/50 text-xs font-mono hover:bg-background/80 transition-colors"
                                                >
                                                    {id}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground mt-2">
                                            No recent credential found in this browser. Issue one from Create Identity.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass border-white/5 mb-6">
                            <CardHeader>
                            <CardTitle>Consent-Bound One-Time Verification</CardTitle>
                            <CardDescription>
                                Out-of-box flow: request {'->'} holder approval {'->'} single-use proof (anti-copy/replay)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="verifier-name">Verifier Name</Label>
                                        <Input
                                            id="verifier-name"
                                            value={verifierName}
                                            onChange={(e) => setVerifierName(e.target.value)}
                                            className="bg-background/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="verifier-domain">Verifier Domain</Label>
                                        <Input
                                            id="verifier-domain"
                                            value={verifierDomain}
                                            onChange={(e) => setVerifierDomain(e.target.value)}
                                            className="bg-background/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="purpose">Purpose</Label>
                                        <Input
                                            id="purpose"
                                            value={purpose}
                                            onChange={(e) => setPurpose(e.target.value)}
                                            className="bg-background/50"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <Button variant="outline" onClick={handleCreateVerificationRequest}>
                                        1. Create Request
                                    </Button>
                                    <Button variant="outline" onClick={handleApproveRequest} disabled={!requestId}>
                                        2. Approve Request
                                    </Button>
                                    <Button className="gradient-primary text-white border-0" onClick={handleConsumeProof} disabled={!proofToken}>
                                        3. Consume One-Time Proof
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleReplayAttackSimulation}
                                        disabled={!timeline.consumed}
                                    >
                                        Simulate Replay Attack
                                    </Button>
                                </div>

                                {flowStatus && (
                                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                        <p className="text-sm text-green-400">{flowStatus}</p>
                                    </div>
                                )}

                                {replayStatus && (
                                    <div className={`p-3 rounded-lg border ${
                                        replayStatus.toLowerCase().includes('blocked')
                                            ? 'bg-green-500/10 border-green-500/20'
                                            : 'bg-yellow-500/10 border-yellow-500/20'
                                    }`}>
                                        <p className="text-sm">{replayStatus}</p>
                                    </div>
                                )}

                                <div className="p-3 rounded-lg bg-background/50">
                                    <p className="text-xs text-muted-foreground mb-2">Consent Timeline</p>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge className={timeline.requested ? 'bg-green-500/10 text-green-400' : 'bg-muted text-muted-foreground'}>
                                            1. Request Created
                                        </Badge>
                                        <span className="text-muted-foreground">{'->'}</span>
                                        <Badge className={timeline.approved ? 'bg-green-500/10 text-green-400' : 'bg-muted text-muted-foreground'}>
                                            2. Holder Approved
                                        </Badge>
                                        <span className="text-muted-foreground">{'->'}</span>
                                        <Badge className={timeline.consumed ? 'bg-green-500/10 text-green-400' : 'bg-muted text-muted-foreground'}>
                                            3. Proof Consumed
                                        </Badge>
                                        <span className="text-muted-foreground">{'->'}</span>
                                        <Badge className={timeline.replayBlocked ? 'bg-green-500/10 text-green-400' : 'bg-muted text-muted-foreground'}>
                                            4. Replay Blocked
                                        </Badge>
                                    </div>
                                </div>

                                {requestId && (
                                    <div className="p-3 rounded-lg bg-background/50">
                                        <p className="text-xs text-muted-foreground">Request ID</p>
                                        <p className="font-mono text-sm">{requestId}</p>
                                    </div>
                                )}

                                {receiptHash && (
                                    <div className="p-3 rounded-lg bg-background/50">
                                        <p className="text-xs text-muted-foreground">Verification Receipt Hash</p>
                                        <p className="font-mono text-sm text-primary">{receiptHash}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Verification Result */}
                    {result && (
                        <Card className={`border-2 ${result.isValid ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                            <CardContent className="pt-6">
                                {/* Status Header */}
                                <div className="text-center mb-8">
                                    <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${result.isValid ? 'bg-green-500/20' : 'bg-red-500/20'
                                        }`}>
                                        {result.isValid ? (
                                            <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                        )}
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2">
                                        {result.isValid ? 'Credential Verified' : 'Verification Failed'}
                                    </h2>
                                    <Badge className={result.isValid ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}>
                                        {result.isValid ? 'VALID' : 'INVALID'}
                                    </Badge>
                                </div>

                                {result.isValid && (
                                    <>
                                        {/* Trust Score */}
                                        <div className="mb-8">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-muted-foreground">Trust Score</span>
                                                <span className={`font-bold ${getTrustScoreColor(result.trustScore)}`}>
                                                    {result.trustScore}/100 - {getTrustScoreLabel(result.trustScore)}
                                                </span>
                                            </div>
                                            <Progress value={result.trustScore} className="h-3" />
                                        </div>

                                        {/* Credential Details */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-4 rounded-lg bg-background/50">
                                                <p className="text-xs text-muted-foreground mb-1">Credential ID</p>
                                                <p className="font-mono text-sm">{result.credentialId}</p>
                                            </div>
                                            <div className="p-4 rounded-lg bg-background/50">
                                                <p className="text-xs text-muted-foreground mb-1">Credential Type</p>
                                                <p className="capitalize">{result.credentialType}</p>
                                            </div>
                                            <div className="p-4 rounded-lg bg-background/50">
                                                <p className="text-xs text-muted-foreground mb-1">Issue Date</p>
                                                <p>{new Date(result.issueDate).toLocaleDateString()}</p>
                                            </div>
                                            <div className="p-4 rounded-lg bg-background/50">
                                                <p className="text-xs text-muted-foreground mb-1">Verified At</p>
                                                <p>{new Date(result.verifiedAt).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        {explainability && (
                                            <div className="mt-6 p-4 rounded-lg bg-background/50 border border-white/10 space-y-3">
                                                <p className="font-medium text-sm">Why This Decision Was Made</p>
                                                <p className="text-xs text-muted-foreground">{explainability.summary}</p>

                                                <div className="space-y-2">
                                                    {explainability.policyChecks.map((check, index) => (
                                                        <div key={index} className="flex items-start justify-between gap-3 text-xs">
                                                            <div>
                                                                <p className="font-medium">{check.name}</p>
                                                                <p className="text-muted-foreground">{check.detail}</p>
                                                            </div>
                                                            <Badge className={check.passed ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}>
                                                                {check.passed ? 'PASS' : 'FAIL'}
                                                            </Badge>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="pt-2 border-t border-white/10 text-xs text-muted-foreground">
                                                    Trust score breakdown: base {explainability.trustBreakdown.base}
                                                    {' + '}
                                                    verifications {explainability.trustBreakdown.verificationPoints}
                                                    {' + '}
                                                    age {explainability.trustBreakdown.agePoints}
                                                    {' - '}
                                                    expired penalty {explainability.trustBreakdown.expiredPenalty}
                                                    {' = '}
                                                    {explainability.trustBreakdown.finalScore}
                                                </div>
                                            </div>
                                        )}

                                        {/* Privacy Notice */}
                                        <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
                                            <div className="flex items-start gap-3">
                                                <svg className="w-5 h-5 text-primary mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                                <div>
                                                    <p className="font-medium text-sm">Privacy Protected</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        No personal information was exposed during this verification.
                                                        Only the credential validity and trust score are shown.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* QR Code Scanner Placeholder */}
                    <Card className="glass border-white/5 mt-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                </svg>
                                QR Code Scanner
                            </CardTitle>
                            <CardDescription>Scan a credential QR code for instant verification</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="aspect-square max-w-xs mx-auto rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center bg-background/30">
                                <div className="text-center p-6">
                                    <svg className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <p className="text-sm text-muted-foreground">
                                        Camera access would be requested here in production.
                                        <br />
                                        <span className="text-xs">(Demo placeholder)</span>
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Footer />
        </main>
    );
}
