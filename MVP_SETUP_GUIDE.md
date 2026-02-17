# TrustlessID - MVP Setup Guide

This guide will get you from zero to a fully functional MVP with real database, file uploads, and authentication.

---

## 🚀 Quick Start (15 minutes)

### Step 1: Set Up Supabase Database (5 min)

1. **Create a Supabase account** at https://supabase.com

2. **Create a new project**:
   - Click "New Project"
   - Choose a project name (e.g., "trustlessid")
   - Set a strong database password (save it!)
   - Choose a region close to you
   - Click "Create new project"

3. **Run the schema**:
   - Wait for project to finish setup (~2 min)
   - Go to **SQL Editor** in the left sidebar
   - Click "New Query"
   - Copy the entire contents of `supabase-schema.sql` from this project
   - Paste and click "Run"
   - You should see "Success. No rows returned"

4. **Get your API keys**:
   - Go to **Settings** → **API**
   - Copy these two values:
     - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
     - `anon/public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Go to **Settings** → **API** → **Service Role Key** (click "Reveal")
     - Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
     - ⚠️ **Never share this key publicly!**

---

### Step 2: Set Up Cloudinary for File Uploads (3 min)

1. **Create a Cloudinary account** at https://cloudinary.com
   - Sign up for free (no credit card required)

2. **Get your API credentials**:
   - Go to **Settings** → **Account**
   - Copy these three values:
     - `Cloud Name` → `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
     - `API Key` → `CLOUDINARY_API_KEY`
     - `API Secret` → `CLOUDINARY_API_SECRET`

---

### Step 3: Configure Environment Variables (2 min)

1. **Copy the example env file**:
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local`** with your credentials:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # Cloudinary
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # JWT Secret (generate a random 32+ character string)
   JWT_SECRET=your-super-secret-random-string-min-32-chars

   # App URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Generate a JWT secret**:
   - Run this in your terminal:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - Copy the output and paste it as `JWT_SECRET`

---

### Step 4: Install & Run (5 min)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open the app**:
   - Visit http://localhost:3000
   - You should see the landing page!

4. **Test the flow**:
   - Click "Get Started"
   - Sign up with any email (e.g., `test@example.com`)
   - Upload a test document (PDF or image)
   - Complete the identity creation wizard
   - Verify your credential on the `/verify` page

---

## ✅ Verification Checklist

After setup, verify everything is working:

- [ ] Landing page loads at http://localhost:3000
- [ ] Can create account with email
- [ ] Dashboard shows user profile
- [ ] Can upload a document file
- [ ] AI verification completes successfully
- [ ] Fraud detection runs
- [ ] Credential is issued with hash
- [ ] Can verify credential on `/verify` page
- [ ] Data persists in Supabase (check the dashboard)

---

## 🗄️ Database Schema Overview

The following tables are created in Supabase:

| Table | Purpose |
|-------|---------|
| `users` | User profiles (linked to Supabase auth) |
| `documents` | Uploaded identity documents |
| `credentials` | Issued blockchain credentials |
| `verification_results` | AI verification results |
| `fraud_results` | Fraud detection results |
| `activity_logs` | User activity timeline |

### View Your Data

To see your data in Supabase:
1. Go to **Table Editor** in Supabase dashboard
2. Select any table (e.g., `users`)
3. You'll see all records created through the app

---

## 🔧 Troubleshooting

### "Failed to create user" error
- Check that your Supabase schema was run successfully
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `ANON_KEY` are correct
- Check Supabase **Logs** for errors

### "Upload failed" error
- Verify Cloudinary credentials in `.env.local`
- Check file size (max 10MB) and type (PDF, JPEG, PNG)
- Check Cloudinary dashboard for upload logs

### "JWT verification failed" error
- Ensure `JWT_SECRET` is at least 32 characters
- Restart the dev server after changing `.env.local`

### Port already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Then restart: npm run dev
```

---

## 📦 What's Been Implemented

### ✅ Backend Services
- [x] Supabase database integration
- [x] JWT-based authentication
- [x] Cloudinary file upload
- [x] PostgreSQL schema with RLS policies
- [x] Database CRUD operations

### ✅ API Routes (Updated)
- [x] `POST /api/auth/login` - JWT auth
- [x] `GET/POST /api/documents` - Document management
- [x] `GET/POST /api/credentials` - Credential issuance
- [x] `GET /api/verify` - Public verification
- [x] `POST /api/ai/analyze` - AI verification (mock, ready for real API)
- [x] `POST /api/ai/fraud-detection` - Fraud detection (mock, ready for real API)
- [x] `POST /api/upload` - File upload to Cloudinary

### ✅ Frontend Pages (Updated)
- [x] Login/Signup with loading states
- [x] Dashboard with real data
- [x] Create Identity with file upload
- [x] Public Verification page

---

## 🚀 Next Steps (Post-MVP)

### Priority 1: Real AI Integration
Replace mock AI with real APIs:
- **Google Cloud Vision API** for document analysis
- **AWS Rekognition** for text extraction
- **Onfido** for identity verification

### Priority 2: Blockchain Integration
- Deploy smart contract to Polygon Mumbai testnet
- Store credential hashes on-chain
- Update `/api/credentials` to write to blockchain

### Priority 3: Production Hardening
- Add rate limiting
- Implement proper error boundaries
- Add monitoring/logging (Sentry, LogRocket)
- Set up CI/CD pipeline

---

## 📞 Need Help?

### Supabase Issues
- Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com

### Cloudinary Issues
- Docs: https://cloudinary.com/documentation
- Support: https://support.cloudinary.com

### Next.js Issues
- Docs: https://nextjs.org/docs
- Discord: https://discord.gg/nextjs

---

## 🎯 MVP Demo Flow

Once setup is complete, here's the demo flow:

1. **Landing Page** (http://localhost:3000)
   - Show hero section
   - Scroll through features

2. **Create Account**
   - Use `demo@example.com`
   - Instant signup

3. **Create Identity**
   - Fill basic details
   - Upload a test document (any PDF/image)
   - Watch AI verification (1.5s delay)
   - Watch fraud detection (2s delay)
   - Get credential with blockchain hash

4. **Verify Credential**
   - Go to `/verify`
   - Enter the credential ID
   - Show trust score and privacy notice

**Total time**: ~3 minutes

---

**Good luck with your MVP! 🚀**

If you run into any issues, check the troubleshooting section or reach out to the team.
