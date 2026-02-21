-- Migration: Consent-bound one-time verification flow
-- Adds verification_requests and verification_receipts to prevent replay/copy abuse.

CREATE TABLE IF NOT EXISTS public.verification_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    credential_id UUID REFERENCES public.credentials(id) ON DELETE CASCADE NOT NULL,
    verifier_name TEXT NOT NULL,
    verifier_domain TEXT NOT NULL,
    purpose TEXT NOT NULL,
    policy JSONB DEFAULT '{}'::jsonb,
    requested_fields JSONB DEFAULT '[]'::jsonb,
    nonce TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'consumed', 'expired')),
    expires_at TIMESTAMPTZ NOT NULL,
    approved_at TIMESTAMPTZ,
    consumed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.verification_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verification_request_id UUID REFERENCES public.verification_requests(id) ON DELETE CASCADE NOT NULL,
    credential_id UUID REFERENCES public.credentials(id) ON DELETE CASCADE NOT NULL,
    verifier_name TEXT NOT NULL,
    verifier_domain TEXT NOT NULL,
    purpose TEXT NOT NULL,
    decision TEXT NOT NULL CHECK (decision IN ('pass', 'fail')),
    disclosed_data JSONB DEFAULT '{}'::jsonb,
    trust_score INTEGER,
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    receipt_hash TEXT
);

CREATE INDEX IF NOT EXISTS idx_verification_requests_credential_id ON public.verification_requests(credential_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON public.verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_verification_requests_expires_at ON public.verification_requests(expires_at);
CREATE INDEX IF NOT EXISTS idx_verification_receipts_credential_id ON public.verification_receipts(credential_id);

