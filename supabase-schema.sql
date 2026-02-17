-- TrustlessID Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    verified BOOLEAN DEFAULT FALSE,
    supabase_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Documents table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('passport', 'drivers_license', 'national_id', 'utility_bill', 'other')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'verified', 'rejected')),
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    file_size BIGINT,
    mime_type TEXT,
    cloudinary_url TEXT,
    cloudinary_public_id TEXT
);

-- Credentials table
CREATE TABLE IF NOT EXISTS public.credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    hash TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('identity', 'address', 'age')),
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
    verification_count INTEGER DEFAULT 0,
    blockchain_tx_hash TEXT,
    blockchain_network TEXT
);

-- Verification Results table
CREATE TABLE IF NOT EXISTS public.verification_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
    authenticity INTEGER NOT NULL CHECK (authenticity BETWEEN 0 AND 100),
    confidence INTEGER NOT NULL CHECK (confidence BETWEEN 0 AND 100),
    anomalies JSONB DEFAULT '[]'::jsonb,
    extracted_data JSONB,
    processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fraud Results table
CREATE TABLE IF NOT EXISTS public.fraud_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
    risk_score INTEGER NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    flags JSONB DEFAULT '[]'::jsonb,
    recommendation TEXT NOT NULL CHECK (recommendation IN ('approve', 'review', 'reject')),
    analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_credentials_user_id ON public.credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_results_document_id ON public.verification_results(document_id);
CREATE INDEX IF NOT EXISTS idx_fraud_results_document_id ON public.fraud_results(document_id);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own data"
    ON public.users FOR SELECT
    USING (auth.uid() = supabase_user_id);

CREATE POLICY "Users can insert their own data"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = supabase_user_id);

-- Documents policies
CREATE POLICY "Users can view their own documents"
    ON public.documents FOR SELECT
    USING (auth.uid() IN (SELECT supabase_user_id FROM public.users WHERE id = user_id));

CREATE POLICY "Users can insert their own documents"
    ON public.documents FOR INSERT
    WITH CHECK (auth.uid() IN (SELECT supabase_user_id FROM public.users WHERE id = user_id));

-- Credentials policies
CREATE POLICY "Users can view their own credentials"
    ON public.credentials FOR SELECT
    USING (auth.uid() IN (SELECT supabase_user_id FROM public.users WHERE id = user_id));

CREATE POLICY "Users can insert their own credentials"
    ON public.credentials FOR INSERT
    WITH CHECK (auth.uid() IN (SELECT supabase_user_id FROM public.users WHERE id = user_id));

-- Activity logs policies
CREATE POLICY "Users can view their own activity logs"
    ON public.activity_logs FOR SELECT
    USING (auth.uid() IN (SELECT supabase_user_id FROM public.users WHERE id = user_id));

CREATE POLICY "Users can insert their own activity logs"
    ON public.activity_logs FOR INSERT
    WITH CHECK (auth.uid() IN (SELECT supabase_user_id FROM public.users WHERE id = user_id));

-- Verification results policies
CREATE POLICY "Users can view their own verification results"
    ON public.verification_results FOR SELECT
    USING (auth.uid() IN (
        SELECT u.supabase_user_id 
        FROM public.users u
        JOIN public.documents d ON d.user_id = u.id
        WHERE d.id = document_id
    ));

-- Fraud results policies
CREATE POLICY "Users can view their own fraud results"
    ON public.fraud_results FOR SELECT
    USING (auth.uid() IN (
        SELECT u.supabase_user_id 
        FROM public.users u
        JOIN public.documents d ON d.user_id = u.id
        WHERE d.id = document_id
    ));

-- Function to create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (email, name, supabase_user_id, created_at)
    VALUES (NEW.email, NEW.raw_user_meta_data->>'name', NEW.id, NEW.created_at);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert seed data for demo (optional - comment out in production)
-- This creates a demo user with sample data
DO $$
DECLARE
    demo_user_id UUID;
    demo_doc_id UUID;
BEGIN
    -- Only insert if no users exist
    IF NOT EXISTS (SELECT 1 FROM public.users) THEN
        -- Create demo user
        INSERT INTO public.users (id, email, name, verified, supabase_user_id)
        VALUES (uuid_generate_v4(), 'demo@trustlessid.com', 'Alex Thompson', true, NULL)
        RETURNING id INTO demo_user_id;
        
        -- Create demo document
        INSERT INTO public.documents (id, user_id, name, type, status, file_size, mime_type)
        VALUES (uuid_generate_v4(), demo_user_id, 'passport_scan.pdf', 'passport', 'verified', 2450000, 'application/pdf')
        RETURNING id INTO demo_doc_id;
        
        -- Create demo credential
        INSERT INTO public.credentials (id, user_id, document_id, hash, type, status, verification_count)
        VALUES (uuid_generate_v4(), demo_user_id, demo_doc_id, 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069', 'identity', 'active', 12);
    END IF;
END $$;
