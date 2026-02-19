-- Migration: Demo schema hotfix
-- Purpose: Ensure required tables/columns exist for the current app code.
-- Safe to run multiple times.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    verified BOOLEAN DEFAULT FALSE,
    supabase_user_id UUID
);

-- Documents table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT,
    status TEXT DEFAULT 'pending',
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    file_size BIGINT,
    mime_type TEXT,
    cloudinary_url TEXT,
    cloudinary_public_id TEXT
);

-- Credentials table (augment existing table if already present)
CREATE TABLE IF NOT EXISTS public.credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    hash TEXT,
    type TEXT,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    status TEXT DEFAULT 'active',
    verification_count INTEGER DEFAULT 0,
    blockchain_tx_hash TEXT,
    blockchain_network TEXT,
    ipfs_hash TEXT
);

ALTER TABLE public.credentials ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.credentials ADD COLUMN IF NOT EXISTS document_id UUID;
ALTER TABLE public.credentials ADD COLUMN IF NOT EXISTS hash TEXT;
ALTER TABLE public.credentials ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE public.credentials ADD COLUMN IF NOT EXISTS issued_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.credentials ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE public.credentials ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.credentials ADD COLUMN IF NOT EXISTS verification_count INTEGER DEFAULT 0;
ALTER TABLE public.credentials ADD COLUMN IF NOT EXISTS blockchain_tx_hash TEXT;
ALTER TABLE public.credentials ADD COLUMN IF NOT EXISTS blockchain_network TEXT;
ALTER TABLE public.credentials ADD COLUMN IF NOT EXISTS ipfs_hash TEXT;

-- Verification results
CREATE TABLE IF NOT EXISTS public.verification_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    authenticity INTEGER,
    confidence INTEGER,
    anomalies JSONB DEFAULT '[]'::jsonb,
    extracted_data JSONB,
    processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fraud results
CREATE TABLE IF NOT EXISTS public.fraud_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    risk_score INTEGER,
    risk_level TEXT,
    flags JSONB DEFAULT '[]'::jsonb,
    recommendation TEXT,
    analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    action TEXT,
    description TEXT,
    metadata JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_credentials_user_id ON public.credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_results_document_id ON public.verification_results(document_id);
CREATE INDEX IF NOT EXISTS idx_fraud_results_document_id ON public.fraud_results(document_id);
CREATE INDEX IF NOT EXISTS idx_credentials_ipfs_hash ON public.credentials(ipfs_hash);
