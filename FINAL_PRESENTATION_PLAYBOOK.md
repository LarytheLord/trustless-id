# TrustlessID Final Presentation Playbook

This playbook is optimized for a live mentor demo where reliability matters more than breadth.

## 1. What Makes This Version Stand Out

Use this exact framing:

1. Consent-bound verification (not just static hash checks)
2. One-time proof consumption (replay/copy misuse blocked)
3. Verifier identity binding (`verifierName + verifierDomain`)
4. Verification receipts with cryptographic hash trail
5. Explainable trust score (clear policy checks + score breakdown)

## 2. Hard Requirements Before Demo (Must Pass)

1. Apply DB migrations in order:
   - `supabase/migrations/003_fix_credentials_user_fk_to_users.sql`
   - `supabase/migrations/004_add_consent_bound_verification.sql`
2. Ensure `.env.local` has:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `JWT_SECRET`
   - `PINATA_JWT`
3. Start app:
   - `npm run dev`
4. Smoke checks:
   - `npm run lint` (warnings allowed)
   - `npm run build` (must pass)

## 3. 3-Minute Demo Flow (High Impact)

### Scene A (45s): Real ID -> Credential
1. Login with real email domain (non-placeholder).
2. Go to `Create Identity`.
3. Upload a real government ID image/PDF.
4. Show that a source document fingerprint (`sha256`) is derived from the uploaded bytes.
5. Issue credential.

Narration:
"We cryptographically fingerprint the actual uploaded document and bind credential issuance to that evidence."

### Scene B (45s): Trustless Verification
1. Go to `Verify` page.
2. Use the newly issued credential ID (auto-saved from browser local state).
3. Run normal verification and show no PII exposure.

Narration:
"Verifier learns validity and trust score without seeing raw identity data."

### Scene C (75s): Out-of-Box Feature (Consent + Replay Protection)
1. In `Consent-Bound One-Time Verification`:
   - Click `Create Request`
   - Click `Approve Request`
   - Click `Consume One-Time Proof`
2. Show `Verification Receipt Hash`.
3. Click `Simulate Replay Attack`.
4. Show it gets blocked.

Narration:
"A copied token cannot be reused. Proof is single-consumption and verifier-bound."

### Scene D (15s): Explainability
1. Show policy checks and trust-score breakdown panel.

Narration:
"Decision transparency is built in, which helps for compliance and audit review."

## 4. Mentor Q&A Answers (Short)

### Q: "If someone copies the hash, can they misuse it?"
Answer:
"Not with our consent-bound flow. Verification needs a short-lived, verifier-bound proof token and is single-use. Replay attempts fail and are logged with receipts."

### Q: "How is this different from a typical credential check?"
Answer:
"Typical checks validate static artifacts. We validate dynamic consent, verifier binding, one-time consumption, and produce auditable receipts."

### Q: "What is AI doing right now?"
Answer:
"AI verification and fraud scoring are integrated in the workflow today; model quality can be upgraded without changing the credentialing and verification contract."

## 5. Live Demo Failure Fallbacks

### If credential issuance fails
1. Verify migration `003` has been applied (FK must target `users`).
2. Retry with a newly logged-in user.

### If consent flow fails
1. Create a fresh verification request (tokens are short-lived).
2. Re-run approve -> consume.

### If UI state looks stale
1. Hard refresh browser.
2. Re-issue one credential and continue from verify page.

## 6. Last 10-Minute Checklist

1. Open these tabs before presenting:
   - `/create-identity`
   - `/verify`
   - Supabase SQL editor (for confidence backup)
2. Keep one fresh credential already issued as backup.
3. Verify replay simulation once privately before stage.
4. Close unrelated apps/tabs and disable auto-updates.

## 7. "Done" Definition for Final Readiness

The project is final-demo-ready when all are true:

1. You can issue a credential from uploaded document bytes.
2. You can verify that exact newly issued credential.
3. Consent-bound flow completes end-to-end.
4. Replay simulation is blocked.
5. Receipt hash is generated and displayed.
6. Build passes (`npm run build`).

