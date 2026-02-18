-- Migration: Add IPFS support to credentials table
-- Created: 2026-02-18
-- Purpose: Store IPFS hashes for decentralized credential verification

-- Add IPFS hash column to credentials table
ALTER TABLE credentials ADD COLUMN IF NOT EXISTS ipfs_hash TEXT;

-- Add blockchain network column (defaults to 'ipfs')
ALTER TABLE credentials ADD COLUMN IF NOT EXISTS blockchain_network TEXT DEFAULT 'ipfs';

-- Add index for faster IPFS hash lookups
CREATE INDEX IF NOT EXISTS idx_credentials_ipfs_hash ON credentials(ipfs_hash);

-- Add comment for documentation
COMMENT ON COLUMN credentials.ipfs_hash IS 'IPFS CID (Content Identifier) for decentralized credential storage';
COMMENT ON COLUMN credentials.blockchain_network IS 'Network where credential is stored (ipfs, polygon, ethereum, etc.)';
