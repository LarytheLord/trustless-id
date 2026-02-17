# TrustlessID - Demo Script (3 Minutes)

## Pre-Demo Setup (2 minutes before)
1. Open Chrome in incognito mode
2. Run `npm run dev` if not already running
3. Open http://localhost:3000
4. Have browser console open (F12)

---

## Demo Flow

### Scene 1: Landing Page (30 seconds)
**Narration**: "TrustlessID solves the $52 billion identity fraud problem..."

**Actions**:
1. Show hero section - "Own Your Identity. Trust No One."
2. Scroll to Problem Statement - point out "5B+ affected by data breaches"
3. Scroll to How It Works - highlight 3-step process
4. Click "Get Started" button

---

### Scene 2: Create Account (20 seconds)
**Narration**: "Let me create an account..."

**Actions**:
1. Click "Sign Up" tab
2. Enter email: `demo@example.com`
3. Enter name: `Demo User`
4. Click "Create Account"
5. Wait for redirect to Dashboard

---

### Scene 3: Dashboard Overview (20 seconds)
**Narration**: "Here's the user dashboard..."

**Actions**:
1. Point to stats: "4 documents, 2 verified, 3 credentials"
2. Show documents list
3. Show credentials with blockchain hashes
4. Show activity timeline

---

### Scene 4: Create New Identity (60 seconds)
**Narration**: "Let me create a new identity credential..."

**Actions**:
1. Click "Create New Identity" button
2. **Step 1**: Fill form (use pre-filled data), click Continue
3. **Step 2**: Select "Passport", click upload (any file), click Continue
4. **Step 3**: Watch AI verification animation, point out authenticity score
5. **Step 4**: Show fraud detection results, risk score
6. **Step 5**: Click "Issue Credential", show credential ID and hash

**Key Point**: "Each credential gets a unique SHA-256 hash stored on-chain"

---

### Scene 5: Public Verification (30 seconds)
**Narration**: "Anyone can verify a credential without seeing personal data..."

**Actions**:
1. Navigate to `/verify`
2. Enter credential ID: `cred_a1b2c3d4e5f6`
3. Click "Verify Credential"
4. Point out:
   - Valid badge with checkmark
   - Trust Score (e.g., 87/100)
   - "No personal information exposed" notice

---

### Closing (20 seconds)
**Narration**: "TrustlessID gives users control over their identity..."

**Key Points**:
- ✅ AI-powered document verification
- ✅ Blockchain-backed credentials
- ✅ Zero-knowledge public verification
- ✅ Privacy-first design

**End on**: Landing page or dashboard

---

## Backup Demo Credential IDs
- `cred_a1b2c3d4e5f6` (identity, 12 verifications)
- `cred_g7h8i9j0k1l2` (address, 5 verifications)
- `cred_m3n4o5p6q7r8` (age, 8 verifications)

---

## Troubleshooting
- **If login fails**: Clear localStorage, refresh
- **If page blank**: Check console for errors, restart dev server
- **If animation stuck**: Refresh page


---