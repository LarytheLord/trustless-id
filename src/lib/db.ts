'use server';

import { createClient } from './supabase/server';
import { revalidatePath } from 'next/cache';

// ============================================
// USER OPERATIONS
// ============================================

export async function getUserByEmail(email: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

    if (error) return null;
    return data;
}

export async function getUserById(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return null;
    return data;
}

export async function createUser(email: string, name: string, supabaseUserId?: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('users')
        .insert({
            email: email.toLowerCase(),
            name,
            supabase_user_id: supabaseUserId,
            verified: false,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateUser(id: string, updates: Partial<{ name: string; avatar_url: string; verified: boolean }>) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ============================================
// DOCUMENT OPERATIONS
// ============================================

export async function getDocumentsByUserId(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false });

    if (error) return [];
    return data;
}

export async function createDocument(document: {
    user_id: string;
    name: string;
    type: string;
    file_size?: number;
    mime_type?: string;
}) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('documents')
        .insert({
            ...document,
            status: 'pending',
        })
        .select()
        .single();

    if (error) throw error;
    revalidatePath('/dashboard');
    return data;
}

export async function updateDocumentStatus(id: string, status: 'pending' | 'processing' | 'verified' | 'rejected') {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('documents')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    revalidatePath('/dashboard');
    return data;
}

// ============================================
// CREDENTIAL OPERATIONS
// ============================================

export async function getCredentialsByUserId(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('credentials')
        .select('*')
        .eq('user_id', userId)
        .order('issued_at', { ascending: false });

    if (error) return [];
    return data;
}

export async function getCredentialById(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('credentials')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return null;
    return data;
}

export async function createCredential(credential: {
    user_id: string;
    document_id?: string;
    hash: string;
    type: 'identity' | 'address' | 'age';
    expires_at?: string;
    blockchain_tx_hash?: string;
    blockchain_network?: string;
}) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('credentials')
        .insert({
            ...credential,
            status: 'active',
            verification_count: 0,
        })
        .select()
        .single();

    if (error) throw error;
    revalidatePath('/dashboard');
    return data;
}

export async function updateCredential(id: string, updates: {
    ipfs_hash?: string;
    blockchain_network?: string;
    status?: string;
    verification_count?: number;
}) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('credentials')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    revalidatePath('/dashboard');
    return data;
}

export async function incrementCredentialVerificationCount(id: string) {
    const supabase = await createClient();
    const { data: rpcData, error } = await supabase
        .rpc('increment_verification_count', { cred_id: id });

    if (error) {
        // Fallback if RPC doesn't exist - do a simple increment
        const { data: credData } = await supabase
            .from('credentials')
            .select('verification_count')
            .eq('id', id)
            .single();
        
        const newCount = (credData?.verification_count || 0) + 1;
        
        const { data: fallbackData, error: fallbackError } = await supabase
            .from('credentials')
            .update({ verification_count: newCount })
            .eq('id', id)
            .select()
            .single();
        
        if (fallbackError) throw fallbackError;
        return fallbackData;
    }
    
    return rpcData;
}

// ============================================
// ACTIVITY LOG OPERATIONS
// ============================================

export async function getActivityLogsByUserId(userId: string, limit = 10) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

    if (error) return [];
    return data;
}

export async function createActivityLog(log: {
    user_id: string;
    action: string;
    description: string;
    metadata?: Record<string, unknown>;
}) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('activity_logs')
        .insert(log)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ============================================
// VERIFICATION & FRAUD RESULTS
// ============================================

export async function createVerificationResult(result: {
    document_id: string;
    authenticity: number;
    confidence: number;
    anomalies?: unknown[];
    extracted_data?: Record<string, unknown>;
}) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('verification_results')
        .insert(result)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function createFraudResult(result: {
    document_id: string;
    risk_score: number;
    risk_level: string;
    flags?: unknown[];
    recommendation: string;
}) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('fraud_results')
        .insert(result)
        .select()
        .single();

    if (error) throw error;
    return data;
}
