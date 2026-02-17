# Quick Reference Card - TrustlessID MVP

## 🚀 Current Status
**✅ MVP Backend Complete** - Production-ready with real database & file uploads

---

## 🎯 What Works Right Now

### Without Configuration (Demo Mode)
```bash
npm run dev
# Visit http://localhost:3000
# Use demo@trustlessid.com
```
- ✅ Landing page
- ✅ Mock authentication
- ✅ Mock data display
- ✅ All pages functional

### With Configuration (Full MVP)
```bash
cp .env.example .env.local
# Add Supabase + Cloudinary credentials
npm run dev
```
- ✅ Real PostgreSQL database
- ✅ JWT authentication
- ✅ Real file uploads
- ✅ Persistent data
- ✅ Activity logging

---

## 📁 Key Files to Know

| File | Purpose |
|------|---------|
| `MVP_SETUP_GUIDE.md` | **Start here** - Complete setup instructions |
| `TEAM_TASKS.md` | Team task assignments |
| `.env.example` | Environment variables template |
| `supabase-schema.sql` | Database schema to run in Supabase |
| `src/lib/db.ts` | All database operations |
| `src/lib/auth.tsx` | Authentication context |
| `src/app/api/` | All API endpoints |

---

## 🔧 Quick Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Build for production
npm run start    # Run production build
npm run lint     # Check code quality
```

---

## 🌐 Page Routes

| Page | URL | Status |
|------|-----|--------|
| Landing | `/` | ✅ Working |
| Login | `/login` | ✅ Working |
| Dashboard | `/dashboard` | ✅ Working |
| Create Identity | `/create-identity` | ✅ Working |
| Verify | `/verify` | ✅ Working |

---

## 🔌 API Endpoints

| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/auth/login` | POST | ✅ JWT auth |
| `/api/documents` | GET/POST | ✅ DB-backed |
| `/api/credentials` | GET/POST | ✅ DB-backed |
| `/api/verify` | GET | ✅ DB-backed |
| `/api/ai/analyze` | POST | ✅ Mock + DB |
| `/api/ai/fraud-detection` | POST | ✅ Mock + DB |
| `/api/upload` | POST | ✅ Cloudinary |

---

## 📊 Demo Credential IDs

Use these on `/verify` page:
- `cred_a1b2c3d4e5f6`
- `cred_g7h8i9j0k1l2`
- `cred_m3n4o5p6q7r8`

---

## 🎯 3-Minute Demo Flow

1. **Landing** → Show hero, features (30s)
2. **Signup** → Use `demo@example.com` (20s)
3. **Dashboard** → Show stats, credentials (20s)
4. **Create Identity** → Upload file, complete wizard (60s)
5. **Verify** → Enter credential ID, show trust score (30s)

**Total**: ~3 minutes

---

## ⚡ Setup Checklist (Full MVP)

- [ ] Create Supabase account (supabase.com)
- [ ] Run `supabase-schema.sql` in SQL Editor
- [ ] Copy API keys to `.env.local`
- [ ] Create Cloudinary account (cloudinary.com)
- [ ] Copy Cloudinary keys to `.env.local`
- [ ] Generate JWT secret (32+ chars)
- [ ] Run `npm run dev`
- [ ] Test full flow

**Time**: ~10 minutes  
**Guide**: See `MVP_SETUP_GUIDE.md`

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check `.env.local` exists |
| Upload fails | Verify Cloudinary credentials |
| DB errors | Check Supabase schema ran |
| Auth fails | Verify JWT secret is 32+ chars |
| Port in use | `lsof -ti:3000 | xargs kill -9` |

---

## 📞 Team Tasks

### You (Lead)
- ✅ Backend complete
- Next: Real AI API, Blockchain

### Teammate 1 (Frontend)
- Start: `TEAM_TASKS.md` Task 1.1
- Add loading states, animations

### Teammate 2 (QA/Docs)
- Start: `TEAM_TASKS.md` Task 2.1
- Create test results, demo script

---

## 🎉 What's Done

- ✅ Database (Supabase + PostgreSQL)
- ✅ Authentication (JWT)
- ✅ File Upload (Cloudinary)
- ✅ All API Routes
- ✅ Frontend Integration
- ✅ TypeScript Build
- ✅ Documentation

**Status**: Ready for Demo! 🚀

---

## 📚 Documentation Links

- [README.md](./README.md) - Project overview
- [MVP_SETUP_GUIDE.md](./MVP_SETUP_GUIDE.md) - Setup instructions
- [TEAM_TASKS.md](./TEAM_TASKS.md) - Team assignments
- [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) - Full technical docs
- [MVP_SUMMARY.md](./MVP_SUMMARY.md) - Development summary

---

**Happy Coding! 🚀**
