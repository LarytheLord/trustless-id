# TrustlessID - Decentralized Digital Identity Platform

A software-only platform that allows users to create, own, and verify digital identities using AI-based document validation, anomaly detection, and blockchain-backed credentials.

![TrustlessID](https://img.shields.io/badge/TrustlessID-Hackathon%20Demo-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-cyan)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## 📋 Features

### Core Platform
- **AI Document Verification** - Simulated document authenticity analysis
- **Fraud Detection** - Synthetic identity and deepfake pattern detection (mock)
- **Blockchain Credentials** - SHA-256 hashed, tamper-proof credential issuance
- **Zero Data Exposure** - Privacy-preserving public verification

### Pages
| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Hero, problem statement, features, tech stack |
| Login | `/login` | Email-based mock authentication |
| Dashboard | `/dashboard` | User profile, documents, credentials, activity |
| Create Identity | `/create-identity` | 5-step identity creation wizard |
| Verify | `/verify` | Public credential verification |

## 🏗️ Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Auth**: Mock email-based (no external provider)
- **Backend**: Next.js API Routes
- **Database**: In-memory mock data

## 📁 Project Structure

```
trustless-id/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication
│   │   │   ├── ai/            # AI verification endpoints
│   │   │   ├── documents/     # Document management
│   │   │   ├── credentials/   # Credential issuance
│   │   │   └── verify/        # Public verification
│   │   ├── login/             # Auth page
│   │   ├── dashboard/         # User dashboard
│   │   ├── create-identity/   # Identity wizard
│   │   └── verify/            # Public verification
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── landing/           # Landing page sections
│   │   └── shared/            # Navbar, Footer, Logo
│   ├── lib/
│   │   ├── auth.tsx           # Auth context & hooks
│   │   ├── crypto.ts          # SHA-256 hashing
│   │   ├── mock-data.ts       # Sample data
│   │   └── utils.ts           # Utilities
│   └── types/                 # TypeScript definitions
└── public/                    # Static assets
```

## 🎮 Demo Flow

### 1. Landing Page
Visit `http://localhost:3000` to see the product overview.

### 2. Create Account
- Click "Get Started" or go to `/login`
- Enter any email (demo mode accepts all)
- Use `demo@trustlessid.com` for a pre-populated account

### 3. Create Identity
- Go to `/create-identity`
- Complete the 5-step wizard:
  1. Basic Details
  2. Document Upload (simulated)
  3. AI Verification (mock processing)
  4. Fraud Analysis
  5. Credential Confirmation

### 4. Verify Credential
- Go to `/verify`
- Try these demo credential IDs:
  - `cred_a1b2c3d4e5f6`
  - `cred_g7h8i9j0k1l2`
  - `cred_m3n4o5p6q7r8`

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Mock authentication |
| `/api/documents` | GET/POST | Document management |
| `/api/credentials` | GET/POST | Credential issuance |
| `/api/verify` | GET | Public verification |
| `/api/ai/analyze` | POST | Document analysis (mock) |
| `/api/ai/fraud-detection` | POST | Fraud scoring (mock) |

## ⚠️ Demo Limitations

This is a **hackathon demo** with the following simulations:

- **AI Services**: Document analysis and fraud detection return mock results
- **Blockchain**: Credential hashes are generated but not stored on-chain
- **Authentication**: No real password validation
- **File Upload**: Files are not actually stored

## 🎨 Design System

- **Colors**: Deep navy background with electric blue/cyan accents
- **Effects**: Glassmorphism, gradient backgrounds, glow effects
- **Typography**: Inter font family
- **Animations**: Fade-in, float, shimmer effects

## 📝 Environment Variables

No environment variables required for demo mode.

## 📄 License

Built for hackathon demonstration purposes.
