# TrustlessID — Complete Project Documentation

> **Purpose**: This document is designed so that any developer, AI session, or teammate can fully understand the entire project and start contributing immediately — without reading every line of code.

---

## Table of Contents

1. [What Is TrustlessID](#1-what-is-trustlessid)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure (Full File Map)](#3-project-structure-full-file-map)
4. [Architecture & Data Flow](#4-architecture--data-flow)
5. [Design System](#5-design-system)
6. [Pages — What Each Page Does](#6-pages--what-each-page-does)
7. [API Endpoints — Complete Reference](#7-api-endpoints--complete-reference)
8. [Data Models (TypeScript Types)](#8-data-models-typescript-types)
9. [Authentication System](#9-authentication-system)
10. [Mock Data Layer](#10-mock-data-layer)
11. [Cryptographic Utilities](#11-cryptographic-utilities)
12. [UI Component Library](#12-ui-component-library)
13. [How to Run & Develop](#13-how-to-run--develop)
14. [Known Limitations (MVP)](#14-known-limitations-mvp)
15. [Future Roadmap (Post-Hackathon)](#15-future-roadmap-post-hackathon)

---

## 1. What Is TrustlessID

TrustlessID is a **software-only decentralized digital identity platform**. It lets users:

1. **Upload** identity documents (passport, driver's license, national ID).
2. **Verify** them with AI-powered authenticity analysis and fraud detection.
3. **Receive** a blockchain-backed credential (SHA-256 hash) proving their identity.
4. **Share** that credential for public verification — _without exposing personal data_.

The platform is built for a **hackathon demo**. All AI analysis, fraud detection, and blockchain storage are **simulated (mocked)** — the UI, user flows, and data models are real and production-architected.

### Core Value Proposition

> "Own your identity. Trust no one."

- **Problem**: 5 billion+ people affected by data breaches; identity fraud costs $52B annually.
- **Solution**: Self-sovereign identity where users control their own credentials, verified by AI, anchored on-chain.

---

## 2. Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js (App Router) | 16.1.6 | Full-stack React framework |
| Language | TypeScript | 5.x | Type safety |
| Styling | Tailwind CSS | 4.x | Utility-first CSS |
| UI Library | shadcn/ui (Radix) | latest | Accessible component primitives |
| Animations | tw-animate-css + custom keyframes | — | Micro-interactions |
| Fonts | Inter (Google Fonts) | — | Primary typeface |
| Crypto | Web Crypto API (browser-native) | — | SHA-256 hashing |
| State | React Context API | — | Auth state management |
| Storage | localStorage | — | Session persistence |
| Package Manager | npm | — | Dependency management |

### Key Dependencies (from `package.json`)

```
react: 19.2.3
next: 16.1.6
radix-ui: 1.4.3        (component primitives)
lucide-react: 0.563.0  (icon library)
class-variance-authority (component variants)
clsx + tailwind-merge   (class merging)
sonner                  (toast notifications)
next-themes             (theme switching)
```

---

## 3. Project Structure (Full File Map)

```
trustless-id/
├── package.json                    # Dependencies & scripts
├── next.config.ts                  # Next.js configuration
├── tailwind.config.ts              # Tailwind theme extensions
├── tsconfig.json                   # TypeScript settings
├── components.json                 # shadcn/ui configuration
├── README.md                       # Quick start guide
├── TEAM_TASKS.md                   # Task assignments for teammates
├── PROJECT_DOCUMENTATION.md        # THIS FILE
│
├── public/                         # Static assets (favicon, images)
│
└── src/
    ├── app/                        # ─── PAGES & API ROUTES ───
    │   ├── layout.tsx              # Root layout: AuthProvider, fonts, dark mode
    │   ├── page.tsx                # Landing page (assembles all sections)
    │   ├── globals.css             # Global styles, theme, animations
    │   │
    │   ├── login/
    │   │   └── page.tsx            # Login/Signup page (tabbed UI)
    │   │
    │   ├── dashboard/
    │   │   └── page.tsx            # User dashboard (stats, docs, credentials)
    │   │
    │   ├── create-identity/
    │   │   └── page.tsx            # 5-step identity creation wizard
    │   │
    │   ├── verify/
    │   │   └── page.tsx            # Public credential verification
    │   │
    │   └── api/                    # ─── MOCK API ROUTES ───
    │       ├── auth/login/
    │       │   └── route.ts        # POST: mock email auth
    │       ├── documents/
    │       │   └── route.ts        # GET/POST: document management
    │       ├── credentials/
    │       │   └── route.ts        # GET/POST: credential issuance
    │       ├── verify/
    │       │   └── route.ts        # GET: public credential verification
    │       └── ai/
    │           ├── analyze/
    │           │   └── route.ts    # POST: mock document AI analysis
    │           └── fraud-detection/
    │               └── route.ts    # POST: mock fraud scoring
    │
    ├── components/                 # ─── UI COMPONENTS ───
    │   ├── ui/                     # shadcn/ui primitives (13 components)
    │   │   ├── alert.tsx
    │   │   ├── avatar.tsx
    │   │   ├── badge.tsx
    │   │   ├── button.tsx          # Variants: default, destructive, outline, ghost
    │   │   ├── card.tsx            # Card, CardHeader, CardTitle, CardContent
    │   │   ├── dialog.tsx
    │   │   ├── dropdown-menu.tsx
    │   │   ├── input.tsx
    │   │   ├── label.tsx
    │   │   ├── progress.tsx
    │   │   ├── separator.tsx
    │   │   ├── sonner.tsx          # Toast notifications
    │   │   └── tabs.tsx
    │   │
    │   ├── landing/                # Landing page sections
    │   │   ├── Hero.tsx            # Headline, animated badge, CTAs
    │   │   ├── ProblemStatement.tsx # Identity fraud stats & pain points
    │   │   ├── HowItWorks.tsx      # 3-step process visualization
    │   │   ├── Features.tsx        # Feature grid with gradient icons
    │   │   ├── TechStack.tsx       # Tech categories display
    │   │   ├── CallToAction.tsx    # Final CTA with buttons
    │   │   └── index.ts           # Barrel export
    │   │
    │   └── shared/                 # Shared layout components
    │       ├── Navbar.tsx          # Fixed glassmorphism navbar (auth-aware)
    │       ├── Footer.tsx          # Footer with links + hackathon badge
    │       ├── Logo.tsx            # Custom SVG logo (shield + checkmark)
    │       └── index.ts           # Barrel export
    │
    ├── lib/                        # ─── UTILITIES & SERVICES ───
    │   ├── auth.tsx                # AuthProvider context, useAuth hook, ProtectedRoute
    │   ├── crypto.ts               # SHA-256 hashing, credential ID generation
    │   ├── mock-data.ts            # In-memory mock database + helper functions
    │   └── utils.ts                # General utilities (cn class merger)
    │
    └── types/
        └── index.ts                # All TypeScript interfaces
```

---

## 4. Architecture & Data Flow

### Application Architecture

```
┌──────────────────────────────────────────────────┐
│                   Browser (Client)                │
│                                                   │
│  ┌─────────┐  ┌──────────┐  ┌────────────────┐  │
│  │ Landing  │  │  Login   │  │   Dashboard    │  │
│  │  Page    │  │  Page    │  │     Page       │  │
│  └─────────┘  └────┬─────┘  └───────┬────────┘  │
│                     │                │            │
│              ┌──────┴────────────────┴──────┐     │
│              │    AuthProvider (Context)     │     │
│              │  ┌───────────────────────┐   │     │
│              │  │   localStorage        │   │     │
│              │  │ (session persistence) │   │     │
│              │  └───────────────────────┘   │     │
│              └──────────┬──────────────┘     │
│                         │ fetch()            │
└─────────────────────────┼────────────────────┘
                          ▼
┌──────────────────────────────────────────────────┐
│               Next.js API Routes (Server)         │
│                                                   │
│  /api/auth/login       → mock user creation       │
│  /api/documents        → GET/POST docs            │
│  /api/credentials      → GET/POST creds           │
│  /api/verify           → public verification      │
│  /api/ai/analyze       → mock AI analysis         │
│  /api/ai/fraud-detect  → mock fraud scoring       │
│                                                   │
│  ┌────────────────────────────────────────────┐   │
│  │     mock-data.ts (In-Memory Database)      │   │
│  │  mockUsers | mockDocuments | mockCredentials│   │
│  └────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

### Identity Creation Data Flow

```
User Input → Step 1 (Details) → Step 2 (Upload) 
    → POST /api/ai/analyze (returns VerificationResult)
    → Step 3 (AI Verification display)
    → POST /api/ai/fraud-detection (returns FraudResult)
    → Step 4 (Fraud Analysis display)
    → POST /api/credentials (creates Credential with SHA-256 hash)
    → Step 5 (Success + credential details)
```

### Public Verification Flow

```
Verifier enters Credential ID
    → GET /api/verify?id=cred_xxx
    → Server looks up credential in mockCredentials array
    → Returns: { isValid, trustScore, issueDate, credentialType }
    → UI displays result (NO personal data exposed)
```

---

## 5. Design System

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `oklch(0.12 0.02 250)` | Deep navy page background |
| `--card` | `oklch(0.16 0.02 250)` | Card/panel backgrounds |
| `--primary` | `oklch(0.65 0.2 250)` | Electric blue (buttons, links) |
| `--accent` | `oklch(0.75 0.15 195)` | Cyan (secondary actions) |
| `--muted-foreground` | `oklch(0.65 0.02 250)` | Body text (subdued) |
| `--destructive` | `oklch(0.60 0.22 25)` | Error states (red) |

### Custom CSS Utilities (defined in `globals.css`)

| Class | Effect |
|-------|--------|
| `.glass` | Glassmorphism: `bg-card/80 backdrop-blur-xl border border-white/10` |
| `.glass-strong` | Stronger glassmorphism: `bg-card/90 backdrop-blur-2xl` |
| `.gradient-primary` | Linear gradient from blue to cyan |
| `.gradient-hero` | Radial gradient for hero background |
| `.glow-primary` | Blue glow box-shadow |
| `.glow-accent` | Cyan glow box-shadow |
| `.text-gradient` | Gradient text (blue → cyan) |
| `.animate-float` | 6s vertical floating animation |
| `.animate-pulse-slow` | 4s gentle pulse |
| `.animate-shimmer` | Loading shimmer effect |
| `.animate-fade-in` | 0.5s fade in |
| `.animate-fade-in-up` | 0.6s fade in + slide up |
| `.delay-100` to `.delay-500` | Staggered animation delays |

### Typography

- **Font**: Inter (loaded via Google Fonts `@import`)
- **Font features**: `cv11`, `ss01`, `ss03` (ligatures and alternates)
- **Dark mode** is the default (applied via `.dark` class on `<html>`)

---

## 6. Pages — What Each Page Does

### 6.1 Landing Page (`src/app/page.tsx`)

**Route**: `/`  
**Auth Required**: No  
**Components Used**: Navbar, Hero, ProblemStatement, HowItWorks, Features, TechStack, CallToAction, Footer

The page is a simple composition of 6 sections:

```tsx
<Navbar />
<Hero />                // "Own Your Identity. Trust No One." + CTAs
<ProblemStatement />    // 3 pain point cards with stats
<HowItWorks />          // 3-step process: Upload → AI Verify → Credential
<Features />            // 6 feature cards in a grid
<TechStack />           // Tech stack with category grouping
<CallToAction />        // "Start building your digital identity" + buttons
<Footer />
```

Each section is a standalone component in `src/components/landing/`.

---

### 6.2 Login Page (`src/app/login/page.tsx`)

**Route**: `/login`  
**Auth Required**: No  
**Key Behavior**:
- **Tabs**: "Sign In" and "Sign Up"
- **Sign In**: Email-only (demo mode, any email works)
- **Sign Up**: Email + Name fields
- On success: calls `auth.login(email)` → redirects to `/dashboard`
- Demo hint at bottom: `demo@trustlessid.com`
- If already authenticated: auto-redirects to `/dashboard`

**How auth works**:
1. User enters email → `login(email)` called on AuthContext
2. `login()` POSTs to `/api/auth/login` with `{ email }`
3. API finds or creates mock user → returns `{ success: true, user: {...} }`
4. AuthContext stores user in state + `localStorage` under key `trustlessid_session`
5. Subsequent page loads restore session from localStorage

---

### 6.3 Dashboard (`src/app/dashboard/page.tsx`)

**Route**: `/dashboard`  
**Auth Required**: Yes (redirects to `/login` if not authenticated)  
**Layout Sections**:

1. **Profile Header**: Avatar (initials fallback), name, email, verification badge
2. **Stats Grid** (4 cards):
   - Total Documents (count of `mockDocuments` for user)
   - Verified Documents (status === 'verified')
   - Active Credentials (status === 'active')
   - Recent Verifications (credentials with verificationCount > 0)
3. **Documents Table**: Lists uploaded docs with type icons, status badges, dates
4. **Credentials List**: Shows credential IDs, truncated hashes, expiry dates
5. **Activity Log**: Chronological timeline of user actions
6. **Quick Actions**: "Create New Identity" → `/create-identity`, "Verify Credential" → `/verify`

Data is fetched client-side by calling helper functions from `mock-data.ts` (filtered by `user.id`).

---

### 6.4 Identity Creation Wizard (`src/app/create-identity/page.tsx`)

**Route**: `/create-identity`  
**Auth Required**: Yes  
**State Machine**: 5 steps tracked by `currentStep` state (type `1 | 2 | 3 | 4 | 5`)

| Step | UI | Backend Call |
|------|------|-------------|
| 1: Basic Details | Name, email, DOB, nationality form | None |
| 2: Upload Document | Document type selector (passport/DL/ID) + file drop zone | None |
| 3: AI Verification | Spinner → results (authenticity %, confidence %, anomalies) | `POST /api/ai/analyze` |
| 4: Fraud Analysis | Spinner → risk level badge + risk score + flags | `POST /api/ai/fraud-detection` |
| 5: Confirmation | Success animation + credential ID + SHA-256 hash + dates | `POST /api/credentials` |

**Key implementation detail**: Steps 3 and 4 auto-progress. When user clicks "Continue" on Step 2, the code:
1. Sets `currentStep = 3`, starts spinner
2. Calls `/api/ai/analyze`, waits for mock response
3. Sets `currentStep = 4`, starts spinner
4. Calls `/api/ai/fraud-detection`, waits for mock response
5. User manually clicks "Issue Credential" to proceed to Step 5

**Document type**: Stored as `'passport' | 'drivers_license' | 'national_id'` (union type, not const assertion — this was a bug fix).

**File upload**: The file is captured in state but **never actually sent** to the server — it's purely client-side for the UI. The demo note says "file upload is simulated."

---

### 6.5 Public Verification (`src/app/verify/page.tsx`)

**Route**: `/verify`  
**Auth Required**: No (this is intentionally public)  
**Key Features**:

1. **Input**: Credential ID text field (`font-mono` styled)
2. **Demo Hints**: 3 clickable example credential IDs
   - `cred_a1b2c3d4e5f6`
   - `cred_g7h8i9j0k1l2`
   - `cred_m3n4o5p6q7r8`
3. **Result Display**:
   - Valid/Invalid badge with shield icon
   - Trust Score (0–100) with progress bar
   - Credential type, issue date, verified-at timestamp
   - Privacy notice: "No personal information was exposed"
4. **QR Code Scanner**: Visual placeholder only (camera-permission box with "Demo placeholder" text)

---

## 7. API Endpoints — Complete Reference

### `POST /api/auth/login`

**File**: `src/app/api/auth/login/route.ts`

| | Detail |
|---|---|
| **Input** | `{ email: string }` |
| **Behavior** | Looks up user in `mockUsers` by email. If not found, creates a new user with generated ID. |
| **Output** | `{ success: true, user: User, message: "..." }` |
| **Simulated delay** | ~800ms (in the client-side `auth.tsx` before calling API) |

### `GET /api/documents`

**File**: `src/app/api/documents/route.ts`

| | Detail |
|---|---|
| **Query** | `?userId=user_001` |
| **Output** | `{ success: true, data: Document[] }` |
| **Note** | Filters `mockDocuments` by userId |

### `POST /api/documents`

| | Detail |
|---|---|
| **Input** | `{ userId, name, type, fileSize, mimeType }` |
| **Behavior** | Creates a new document entry in `mockDocuments` with status `'pending'` |
| **Output** | `{ success: true, data: Document }` |

### `GET /api/credentials`

**File**: `src/app/api/credentials/route.ts`

| | Detail |
|---|---|
| **Query** | `?userId=user_001` |
| **Output** | `{ success: true, data: Credential[] }` |

### `POST /api/credentials`

| | Detail |
|---|---|
| **Input** | `{ userId, documentId, type }` |
| **Behavior** | Generates credential ID + SHA-256 hash via `crypto.ts`, pushes to `mockCredentials` |
| **Output** | `{ success: true, data: Credential }` |

### `GET /api/verify`

**File**: `src/app/api/verify/route.ts`

| | Detail |
|---|---|
| **Query** | `?id=cred_a1b2c3d4e5f6` |
| **Behavior** | Finds credential in `mockCredentials`, calculates trust score |
| **Trust Score Formula** | Base 70 + (verificationCount capped at 10) + (days since issuance capped at 20) |
| **Output** | `{ success: true, data: PublicVerification }` — no PII included |
| **Not Found** | `{ success: false, error: "Credential not found" }` |

### `POST /api/ai/analyze`

**File**: `src/app/api/ai/analyze/route.ts`

| | Detail |
|---|---|
| **Input** | `{ documentId, documentType }` |
| **Behavior** | Calls `generateMockVerification()` after 1.5s delay |
| **Output** | `{ success: true, data: VerificationResult }` |
| **Mock data** | Authenticity 85–100, confidence 90–100, 30% chance of anomaly |

### `POST /api/ai/fraud-detection`

**File**: `src/app/api/ai/fraud-detection/route.ts`

| | Detail |
|---|---|
| **Input** | `{ documentId, userId, verificationData }` |
| **Behavior** | Calls `generateMockFraudResult()` after 2s delay |
| **Output** | `{ success: true, data: FraudResult }` |
| **Mock data** | Risk score 0–25, mostly "low" risk, "approve" recommendation |

---

## 8. Data Models (TypeScript Types)

All types are in `src/types/index.ts`. Here's the complete reference:

### `User`
```typescript
{ id, email, name, avatarUrl?, createdAt, verified }
```

### `Document`
```typescript
{ id, userId, name,
  type: 'passport' | 'drivers_license' | 'national_id' | 'utility_bill' | 'other',
  status: 'pending' | 'processing' | 'verified' | 'rejected',
  uploadedAt, fileSize, mimeType }
```

### `VerificationResult`
```typescript
{ documentId, authenticity (0-100), confidence (0-100),
  anomalies: Anomaly[], extractedData: ExtractedData, processedAt }
```

### `FraudResult`
```typescript
{ riskScore (0-100),
  riskLevel: 'low' | 'medium' | 'high' | 'critical',
  flags: FraudFlag[],
  recommendation: 'approve' | 'review' | 'reject', analyzedAt }
```

### `Credential`
```typescript
{ id, userId, hash (sha256:...), type: 'identity' | 'address' | 'age',
  issuedAt, expiresAt, status: 'active' | 'revoked' | 'expired',
  verificationCount }
```

### `PublicVerification`
```typescript
{ credentialId, isValid, trustScore, issueDate, credentialType, verifiedAt }
// NOTE: No personal data (name, email, DOB) — intentionally privacy-preserving
```

### `ActivityLog`
```typescript
{ id, userId,
  action: 'login' | 'document_upload' | 'verification' | 'credential_issued' | 'credential_verified',
  description, metadata?, timestamp }
```

### `ApiResponse<T>`
```typescript
{ success: boolean, data?: T, error?: string, message?: string }
```

---

## 9. Authentication System

**File**: `src/lib/auth.tsx`

### Components Provided

| Export | Type | Purpose |
|--------|------|---------|
| `AuthProvider` | Component | Wraps app in `layout.tsx`, provides auth context |
| `useAuth()` | Hook | Returns `{ user, isLoading, isAuthenticated, login, logout }` |
| `ProtectedRoute` | Component | Wrapper that shows children only if authenticated |

### How Sessions Work

1. **Login**: `useAuth().login(email)` → POST to `/api/auth/login` → stores `User` in React state + `localStorage` key `trustlessid_session`
2. **Page Refresh**: `AuthProvider`'s `useEffect` on mount reads `localStorage`, restores user to state
3. **Logout**: clears state + removes from `localStorage`
4. **Protected Pages**: Dashboard and Create Identity check `isAuthenticated` in a `useEffect` and redirect to `/login` if false

### Important: No Real Security

This is a mock system. There are no tokens, no password hashing, no server-side sessions. Any email creates/retrieves a user. This is intentional for the hackathon demo.

---

## 10. Mock Data Layer

**File**: `src/lib/mock-data.ts`

### Pre-populated Data

| Collection | Count | Details |
|-----------|-------|---------|
| `mockUsers` | 2 | `demo@trustlessid.com` (verified) + `jane@example.com` (unverified) |
| `mockDocuments` | 3 | Passport (verified), DL (verified), utility bill (pending) — all owned by user_001 |
| `mockCredentials` | 3 | identity, address, age — all active, owned by user_001 |
| `mockActivityLogs` | 10 | Chronological history for user_001 |
| `mockVerificationResults` | 2 | For doc_001 (98% auth) and doc_002 (96% auth) |
| `mockFraudResults` | 2 | For doc_001 (score 5, low) and doc_002 (score 12, low) |

### Helper Functions

| Function | Purpose |
|---------|---------|
| `getUserByEmail(email)` | Find user by email (case-insensitive) |
| `getUserById(id)` | Find user by ID |
| `getDocumentsByUserId(userId)` | Get all documents for a user |
| `getCredentialsByUserId(userId)` | Get all credentials for a user |
| `getCredentialById(id)` | Find a single credential |
| `getActivityLogsByUserId(userId)` | Get activity logs (sorted by timestamp desc) |
| `generateMockVerification()` | Random VerificationResult (85–100 auth score) |
| `generateMockFraudResult()` | Random FraudResult (0–25 risk, mostly "approve") |

### Important: In-Memory Storage

All data lives in JS module-level arrays. New documents and credentials pushed via API routes are stored in those arrays — but **everything resets when the server restarts**. There is no persistence layer.

---

## 11. Cryptographic Utilities

**File**: `src/lib/crypto.ts`

| Function | Input | Output | Notes |
|---------|-------|--------|-------|
| `generateSHA256(data)` | String | Hex hash string | Uses `crypto.subtle.digest` (browser Web Crypto API) |
| `generateCredentialHash(data)` | `{ userId, documentId, timestamp, salt? }` | `sha256:abcdef...` | Combines fields with separator, auto-generates salt |
| `generateCredentialId()` | None | `cred_xxxxxxxxxxxx` | 12 random alphanumeric chars |
| `formatHash(hash, length?)` | Hash string | `7f83b165...9069` | Truncated display (default 12 chars) |
| `isValidHash(hash)` | String | Boolean | Validates `sha256:[64 hex chars]` format |
| `generateTimestamp()` | None | ISO 8601 string | `new Date().toISOString()` |

---

## 12. UI Component Library

### shadcn/ui Components (13 installed)

All in `src/components/ui/`. These are unstyled Radix UI primitives with Tailwind styling:

| Component | File | Usage |
|-----------|------|-------|
| Button | `button.tsx` | CTA buttons (variants: default, outline, ghost, destructive) |
| Card | `card.tsx` | Content containers (Card, CardHeader, CardTitle, CardContent, CardDescription) |
| Input | `input.tsx` | Text inputs |
| Label | `label.tsx` | Form labels |
| Tabs | `tabs.tsx` | Login page Sign In / Sign Up tabs |
| Badge | `badge.tsx` | Status labels (verified, pending, etc.) |
| Progress | `progress.tsx` | Trust score bar, wizard progress |
| Avatar | `avatar.tsx` | User profile images (with fallback) |
| Alert | `alert.tsx` | Warning/info messages |
| Dialog | `dialog.tsx` | Modal dialogs |
| Separator | `separator.tsx` | Visual dividers |
| Dropdown Menu | `dropdown-menu.tsx` | Context menus |
| Sonner | `sonner.tsx` | Toast notifications |

### Shared Components

| Component | File | Props | Purpose |
|-----------|------|-------|---------|
| `Navbar` | `shared/Navbar.tsx` | None | Fixed top nav. Shows Dashboard + Sign Out when auth'd, Sign In + Get Started when not |
| `Footer` | `shared/Footer.tsx` | None | Site footer with nav links and hackathon badge |
| `Logo` | `shared/Logo.tsx` | `className?` | Custom SVG: shield shape + checkmark + blockchain nodes |

### Landing Components

| Component | File | Key Content |
|-----------|------|-------------|
| `Hero` | `landing/Hero.tsx` | Animated gradient bg, "Hackathon 2024" badge, headline, 2 CTA buttons |
| `ProblemStatement` | `landing/ProblemStatement.tsx` | 3 stat cards (5B+ breaches, $52B fraud, 1.1B excluded) |
| `HowItWorks` | `landing/HowItWorks.tsx` | 3-step flow: Upload → AI Verify → Credential |
| `Features` | `landing/Features.tsx` | 6-card grid: Privacy, AI, Blockchain, Fraud, Portable, Instant |
| `TechStack` | `landing/TechStack.tsx` | Tech categories with icon groups |
| `CallToAction` | `landing/CallToAction.tsx` | Final CTA with "Get Started" + "Learn More" buttons |

---

## 13. How to Run & Develop

### Prerequisites

- Node.js 18+ (recommended: 20+)
- npm 9+

### Quick Start

```bash
cd /Users/abi/Documents/innovation/trustless-id

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Available Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server with Turbopack (hot reload) |
| `npm run build` | Production build (TypeScript check + optimization) |
| `npm run start` | Run production build locally |
| `npm run lint` | ESLint check |

### Demo Walkthrough

1. **Landing**: Visit `/` — scroll through all sections
2. **Sign Up**: Click "Get Started" → enter any email → "Create Account"
3. **Dashboard**: View stats, documents, credentials
4. **Create Identity**: Click action card → complete 5 steps (upload any file for step 2)
5. **Verify**: Visit `/verify` → paste `cred_a1b2c3d4e5f6` → click Verify

### Making Changes

- **Pages**: Edit files in `src/app/[route]/page.tsx`
- **Components**: Add/edit in `src/components/`
- **API Routes**: Add/edit in `src/app/api/[endpoint]/route.ts`
- **Types**: Edit `src/types/index.ts`
- **Mock Data**: Edit `src/lib/mock-data.ts`
- **Styles**: Edit `src/app/globals.css` (custom utilities at bottom)
- **Add shadcn component**: `npx -y shadcn@latest add [component-name]`

---

## 14. Known Limitations (MVP)

| Limitation | Impact | Workaround |
|-----------|--------|------------|
| In-memory storage | Data resets on server restart | Pre-populated mock data provides consistent demo |
| No real auth | Anyone can log in with any email | Acceptable for hackathon demo |
| File upload is fake | Files never leave the browser | UI shows file name/size for realism |
| AI is mocked | Returns random scores (biased toward "good") | Consistent enough for demo flow |
| Blockchain is mocked | Hashes generated but not stored on-chain | SHA-256 hashes are real, just not anchored |
| No QR scanning | Camera placeholder only | Users type credential IDs manually |
| No database | No PostgreSQL/Supabase connected | All data in `mock-data.ts` |
| Session = localStorage | Not secure, no expiry | Fine for demo purposes |

---

## 15. Future Roadmap (Post-Hackathon)

### Phase 1: Real Backend
- [ ] Connect to Supabase/PostgreSQL for persistent storage
- [ ] Implement proper JWT-based authentication
- [ ] Add real file upload with S3/Supabase Storage

### Phase 2: AI Integration
- [ ] Connect to OpenAI Vision or Google Document AI for real document analysis
- [ ] Implement actual fraud detection with risk scoring models
- [ ] Add liveness detection for selfie verification

### Phase 3: Blockchain
- [ ] Deploy credential anchoring smart contract (Ethereum/Polygon)
- [ ] Implement DID (Decentralized Identifier) standards
- [ ] Add verifiable credential (VC) W3C compliance

### Phase 4: Production
- [ ] Add real QR code generation and scanning
- [ ] Implement credential revocation
- [ ] Add multi-factor authentication
- [ ] Deploy to Vercel with environment variables

---

> **Last updated**: February 17, 2026
