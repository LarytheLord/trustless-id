# TrustlessID Web3/Crypto Handoff Guide

**Audience**: Teammate implementing Web3/crypto layer  
**Date**: February 18, 2026  
**Project Stage**: MVP with IPFS-backed credential anchoring

---

## 1) What This Project Means by "Web3"

In this MVP, Web3 is currently implemented as **decentralized credential anchoring on IPFS** (via Pinata), not a smart contract yet.

- User uploads/creates identity data in app flow
- Credential hash is generated with SHA-256
- Credential metadata is pinned to IPFS
- IPFS CID is stored in Supabase for reference
- Public verification endpoint still verifies from DB status/trust score

So today’s architecture is: **Web2 app + crypto hashing + decentralized storage proof**.

---

## 2) Current Architecture (What Is Already Built)

### Core crypto/data flow

1. `POST /api/credentials` issues a credential
2. `src/lib/crypto.ts` generates:
- Credential ID (`cred_xxxxxxxxxxxx`)
- SHA-256 hash (`sha256:<64-hex>`)
3. `src/lib/ipfs.ts` pins credential JSON to IPFS via Pinata
4. Supabase `credentials` row is updated with:
- `ipfs_hash`
- `blockchain_network = 'ipfs'`
5. UI displays CID links in dashboard and confirmation screen

### Key files

- `src/lib/crypto.ts`: hash + credential-id utilities
- `src/lib/ipfs.ts`: Pinata/IPFS pin + retrieval helpers
- `src/app/api/credentials/route.ts`: issuance + IPFS persistence
- `src/lib/db.ts`: credential update helper (`updateCredential`)
- `src/app/dashboard/page.tsx`: displays IPFS link
- `src/app/create-identity/page.tsx`: displays IPFS link after issuance
- `supabase/migrations/001_add_ipfs_support.sql`: DB migration for IPFS columns

---

## 3) Web3 Concepts You Need (Minimal, Practical)

### Credential hash

- The hash is a tamper-evident fingerprint.
- If credential source data changes, the hash changes.
- Format used here: `sha256:<64 hex chars>`.

### IPFS CID

- A CID is a content-addressed identifier.
- CID changes if content changes.
- This gives immutability-like behavior for the pinned payload.

### "Blockchain" in this MVP

- Current implementation uses IPFS as decentralized proof layer.
- No EVM transaction hash is produced yet.
- `blockchain_network` is currently set to `ipfs`.

---

## 4) Data Model Relevant to Web3

### Credentials table (relevant columns)

- `id`: current credential identifier used by app
- `hash`: SHA-256 proof value
- `type`: identity/address/age
- `status`: active/revoked/expired
- `verification_count`: public verification usage
- `ipfs_hash`: CID for pinned credential payload
- `blockchain_network`: currently `'ipfs'`

### Migration

Run:
- `supabase/migrations/001_add_ipfs_support.sql`

This adds:
- `credentials.ipfs_hash`
- `credentials.blockchain_network`
- index `idx_credentials_ipfs_hash`

---

## 5) API Behavior You Must Preserve

### `POST /api/credentials`

Must continue to:
- create DB credential row
- generate SHA-256 hash
- pin to IPFS
- update DB row with CID/network
- return credential payload for UI

Current implementation in `src/app/api/credentials/route.ts` already does this.

### `GET /api/verify?id=...`

Current behavior:
- checks credential by ID
- computes trust score from DB fields
- does not currently validate CID on every request

If you enhance this endpoint, keep response privacy-preserving (no PII).

---

## 6) What Is Not Yet Implemented (Web3 Gaps)

1. No smart contract write/read
2. No on-chain transaction hash storage
3. No automatic IPFS payload integrity re-check in verify endpoint
4. No signature layer (issuer signing, verifier signature checks)

---

## 7) Recommended Work Plan for You (Teammate)

### Phase A (MVP-safe, low risk)

1. Keep IPFS flow stable and add stronger validation:
- Validate `PINATA_JWT` presence at startup
- Add retries/timeouts around IPFS pin calls
- Add graceful fallback logging when IPFS pin fails

2. Improve verify endpoint trust guarantees:
- If `ipfs_hash` exists, fetch CID payload and check expected fields
- Confirm DB hash matches IPFS hash payload
- If mismatch, mark result invalid or flagged

3. Add observability:
- Structured logs for issuance + CID pin result
- Include CID in activity metadata everywhere relevant

### Phase B (Optional upgrade to actual chain)

1. Add EVM contract (Polygon Amoy or Mumbai depending availability)
2. Store `credential hash -> block timestamp` on chain
3. Save `blockchain_tx_hash` and EVM network name
4. Extend verify API to optionally verify on-chain existence

---

## 8) Security & Privacy Guardrails

1. Never pin raw PII documents to IPFS.
2. Pin only minimal credential proof metadata.
3. Keep `PINATA_JWT` server-only (never expose to client).
4. Continue returning no PII from `/api/verify`.
5. Do not include secrets in committed docs or code.

---

## 9) Known Project Realities (Important)

1. Upload endpoint is currently simplified and does not persist files:
- `src/app/api/upload/route.ts` validates file but returns mock URL.
2. Some legacy docs still mention Cloudinary setup; current code path no longer depends on Cloudinary package.
3. `.env.example` may still contain outdated Cloudinary variables and should be updated in a follow-up cleanup.

---

## 10) Quick Testing Checklist for Web3/IPFS

1. Issue new credential from `/create-identity` flow.
2. Confirm API response includes `ipfsHash` and `blockchainNetwork`.
3. Confirm `credentials.ipfs_hash` populated in Supabase.
4. Open CID in gateway and verify payload format.
5. Verify dashboard and confirmation UI show CID links.
6. Run public verify flow and ensure no PII is exposed.

---

## 11) Troubleshooting

### Pinata pin fails

- Check `PINATA_JWT` in `.env.local`
- Restart dev server after env changes
- Verify JWT is valid and not expired

### Credential created but no CID

- DB insert succeeded but IPFS pin/update failed
- Check server logs in `POST /api/credentials`
- Re-issue credential after fixing JWT

### Verify works but no IPFS check yet

- Expected in current MVP
- Implement Phase A verify enhancement if required

---

## 12) Final Section: Steps To Make MVP Work Correctly

Follow these exactly on a fresh setup.

### 1. Install dependencies

```bash
npm install
```

### 2. Configure `.env.local`

Minimum required values:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
JWT_SECRET=... # 32+ chars
NEXT_PUBLIC_APP_URL=http://localhost:3000
PINATA_JWT=... # from Pinata API keys
```

### 3. Apply base Supabase schema

- Open Supabase SQL Editor
- Run `supabase-schema.sql`

### 4. Apply IPFS migration

- Run `supabase/migrations/001_add_ipfs_support.sql`

### 5. Start app

```bash
npm run dev
```

### 6. Execute end-to-end flow

1. Login/create account (`/login`)
2. Create identity (`/create-identity`)
3. Complete steps and issue credential
4. Confirm CID appears in UI
5. Verify credential on `/verify`

### 7. Validate DB state

In Supabase, confirm in `credentials`:
- `hash` is present
- `ipfs_hash` is present
- `blockchain_network = ipfs`

### 8. Production sanity check

```bash
npm run build
npm run start
```

If all the above passes, the MVP is working correctly with current Web3/IPFS scope.

---

## 13) Suggested Next Deliverable From Teammate

Ship a PR that adds:

1. IPFS integrity check inside `/api/verify`
2. Better error handling/retry in `src/lib/ipfs.ts`
3. Updated `.env.example` and README to reflect current non-Cloudinary flow

This is the cleanest path before attempting smart contracts.
