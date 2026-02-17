# TrustlessID - Decentralized Digital Identity Platform

A production-ready MVP for AI-powered decentralized digital identity verification with blockchain-backed credentials.

![TrustlessID](https://img.shields.io/badge/TrustlessID-MVP%20Ready-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Database-PostgreSQL-green)
![Cloudinary](https://img.shields.io/badge/Storage-Cloudinary-orange)

---

## 🚀 Quick Start

### Option 1: Demo Mode (No Setup)
```bash
npm install
npm run dev
# Visit http://localhost:3000
# Use demo@trustlessid.com for pre-populated account
```

### Option 2: Full MVP (With Real Database & Storage)
See **[MVP_SETUP_GUIDE.md](./MVP_SETUP_GUIDE.md)** for complete setup with:
- ✅ PostgreSQL database (Supabase)
- ✅ File uploads (Cloudinary)
- ✅ JWT authentication
- ✅ Persistent data

**TL;DR**:
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase + Cloudinary credentials
npm install
npm run dev
```

---

## 📋 Features

### Core Platform
- **AI Document Verification** - Authenticity analysis with confidence scoring
- **Fraud Detection** - Risk assessment with synthetic identity detection
- **Blockchain Credentials** - SHA-256 hashed, tamper-proof credentials
- **Zero Data Exposure** - Privacy-preserving public verification
- **Real File Uploads** - PDF, JPEG, PNG support via Cloudinary
- **Persistent Storage** - PostgreSQL database via Supabase

### Pages
| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Hero, problem statement, features, tech stack |
| Login | `/login` | Email-based authentication with JWT |
| Dashboard | `/dashboard` | User profile, documents, credentials, activity |
| Create Identity | `/create-identity` | 5-step wizard with file upload |
| Verify | `/verify` | Public credential verification |

---

## 🏗️ Tech Stack

### Frontend
- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS** + shadcn/ui components
- **Framer Motion** (animations)
- **React Context** (state management)

### Backend
- **Next.js API Routes** (serverless functions)
- **Supabase** (PostgreSQL database + auth)
- **Cloudinary** (file storage + CDN)
- **JWT** (authentication tokens)

### Security
- Row Level Security (RLS) policies
- JWT token-based authentication
- Input validation and sanitization
- Environment variable protection

---

## 📁 Project Structure

```
trustless-id/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/
│   │   │   ├── auth/          # JWT authentication
│   │   │   ├── ai/            # AI verification endpoints
│   │   │   ├── documents/     # Document CRUD
│   │   │   ├── credentials/   # Credential issuance
│   │   │   ├── verify/        # Public verification
│   │   │   └── upload/        # File upload to Cloudinary
│   │   ├── login/             # Auth page
│   │   ├── dashboard/         # User dashboard
│   │   ├── create-identity/   # Identity wizard
│   │   └── verify/            # Public verification
│   ├── components/
│   │   ├── ui/                # shadcn/ui primitives
│   │   ├── landing/           # Landing page sections
│   │   └── shared/            # Navbar, Footer, Logo
│   ├── lib/
│   │   ├── supabase/          # Supabase client (browser + server)
│   │   ├── db.ts              # Database operations
│   │   ├── auth.tsx           # Auth context & hooks
│   │   ├── jwt.ts             # JWT utilities
│   │   ├── crypto.ts          # SHA-256 hashing
│   │   ├── cloudinary.ts      # File upload utilities
│   │   └── mock-data.ts       # Mock data for demo mode
│   └── types/                 # TypeScript definitions
├── supabase-schema.sql        # Database schema
├── MVP_SETUP_GUIDE.md         # Detailed setup instructions
├── TEAM_TASKS.md              # Team task assignments
└── .env.example               # Environment variables template
```

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | JWT authentication |
| `/api/documents` | GET/POST | Document management |
| `/api/credentials` | GET/POST | Credential issuance |
| `/api/verify` | GET | Public verification |
| `/api/ai/analyze` | POST | Document analysis |
| `/api/ai/fraud-detection` | POST | Fraud scoring |
| `/api/upload` | POST | File upload to Cloudinary |

---

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
  2. Document Upload (real file upload with Cloudinary)
  3. AI Verification (mock processing with database storage)
  4. Fraud Analysis
  5. Credential Confirmation (with blockchain hash)

### 4. Verify Credential
- Go to `/verify`
- Try these demo credential IDs:
  - `cred_a1b2c3d4e5f6`
  - `cred_g7h8i9j0k1l2`
  - `cred_m3n4o5p6q7r8`

---

## ⚙️ Environment Variables

Required for full MVP mode:

```env
# Supabase (get from https://app.supabase.com)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Cloudinary (get from https://cloudinary.com)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# JWT Secret (generate random 32+ chars)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

See **[MVP_SETUP_GUIDE.md](./MVP_SETUP_GUIDE.md)** for detailed setup.

---

## 📝 Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Build for production
npm run start    # Run production build
npm run lint     # Check for code issues
```

---

## 🗄️ Database Setup

The PostgreSQL schema is in `supabase-schema.sql`. It includes:

- **6 tables**: users, documents, credentials, verification_results, fraud_results, activity_logs
- **Row Level Security (RLS)** policies for data protection
- **Indexes** for query performance
- **Auto-generated UUIDs** and timestamps
- **Foreign key relationships** with cascading deletes

To set up:
1. Create a Supabase project
2. Run the SQL schema in the SQL Editor
3. Copy your API keys to `.env.local`

---

## 🚀 Deployment

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables in Vercel
Add these in Vercel dashboard → Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `JWT_SECRET`

---

## ⚠️ Demo Limitations

This is an **MVP demo** with some simulated services:

- **AI Services**: Document analysis returns mock results (architecture ready for real API)
- **Blockchain**: Credential hashes are generated but not yet on-chain (ready for integration)
- **Authentication**: Email-only, no password required (JWT-secured)

All data is stored in **real PostgreSQL** and files in **real Cloudinary storage**.

---

## 📄 License

Built for hackathon demonstration purposes.

---

## 🙏 Credits

- **UI Components**: [shadcn/ui](https://ui.shadcn.com)
- **Icons**: [Lucide React](https://lucide.dev)
- **Database**: [Supabase](https://supabase.com)
- **Storage**: [Cloudinary](https://cloudinary.com)
- **Framework**: [Next.js](https://nextjs.org)

---

**Ready to build the future of digital identity! 🚀**
