# Quick Start Guide

## 🚀 Get Started in 60 Seconds

### 1. Start All Applications

```powershell
.\start-dev.ps1
```

This automatically:
- ✅ Checks Node.js installation
- ✅ Installs dependencies if needed
- ✅ Starts **Frontend** on http://localhost:3000
- ✅ Starts **Admin** on http://localhost:3001

---

## 📦 The 3 Applications

### 🎯 Frontend (Port 3000)
Main user-facing application for goal tracking
```powershell
cd frontend
npm install
npm run dev
```
**Access:** http://localhost:3000

### 🛡️ Admin (Port 3001)
Administrative dashboard for system management
```powershell
cd admin
npm install
npm run dev
```
**Access:** http://localhost:3001

### 📚 Docs
All project documentation organized in one place
```powershell
cd docs
# Browse markdown files
```

---

## ⚡ Quick Commands

### First Time Setup
```powershell
# Frontend
cd frontend
npm install

# Admin
cd admin
npm install
```

### Development
```powershell
# All apps at once
.\start-dev.ps1

# Or individually
cd frontend && npm run dev  # Port 3000
cd admin && npm run dev     # Port 3001
```

### Production Build
```powershell
# Frontend
cd frontend
npm run build
npm start

# Admin
cd admin
npm run build
npm start
```

---

## 📁 Project Structure

```
Commitly/
├── frontend/       # User-facing app (Port 3000)
│   ├── backend/   # Backend logic included
│   └── public/    # Static assets
├── admin/         # Admin dashboard (Port 3001)
└── docs/          # All documentation
```

**Key Point:** Each app is **100% standalone** with its own:
- ✅ `package.json` (dependencies)
- ✅ `node_modules` (installed packages)
- ✅ Configuration files
- ✅ Build output

---

## 🔧 Environment Setup

### Frontend Environment Variables

1. **Copy template:**
   ```powershell
   cd frontend
   cp .env.example .env.local
   ```

2. **Edit `.env.local`:**
   ```env
   NEXT_PUBLIC_MOCK_AUTH=true
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Optional (for real Supabase):**
   ```env
   NEXT_PUBLIC_MOCK_AUTH=false
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```

**Admin doesn't need env vars** (add when implementing backend features)

---

## 🎯 Common Tasks

### Adding a Feature

**Frontend feature:**
```powershell
cd frontend
# Create page: app/new-feature/page.tsx
# Add component: components/new-feature/
# Add backend: backend/lib/
```

**Admin feature:**
```powershell
cd admin
# Create page: app/new-feature/page.tsx
# Add component: components/new-feature/
```

### Installing a Package

**For frontend:**
```powershell
cd frontend
npm install package-name
```

**For admin:**
```powershell
cd admin
npm install package-name
```

### Fixing Issues

**Clean reinstall:**
```powershell
cd frontend  # or admin
rm -rf node_modules .next
npm install
```

**Port conflict:**
```powershell
npm run dev -- -p 3002  # Use different port
```

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| `README.md` | Complete project overview |
| `PROJECT_STRUCTURE.md` | Architecture explanation |
| `BEFORE_AFTER_COMPARISON.md` | What changed and why |
| `frontend/README.md` | Frontend guide (549 lines!) |
| `admin/README.md` | Admin guide |
| `docs/` | 29 historical documentation files |

---

## 🐛 Troubleshooting

### "npm: command not found"
**Fix:** Install Node.js from https://nodejs.org/

### "Module not found"
**Fix:** 
```powershell
cd frontend  # or admin
npm install
```

### "Port already in use"
**Fix:** Apps auto-use next available port, or specify manually:
```powershell
npm run dev -- -p 3002
```

### Can't import from other app
**This is intentional!** Apps are independent. Each app should be self-contained.

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] `cd frontend && npm run dev` → Works on port 3000
- [ ] `cd admin && npm run dev` → Works on port 3001
- [ ] Can access http://localhost:3000 (frontend)
- [ ] Can access http://localhost:3001 (admin)
- [ ] Both apps have their own `node_modules/`
- [ ] No errors in console

---

## 🎉 You're Ready!

**Start developing:**
```powershell
.\start-dev.ps1
```

**Frontend:** http://localhost:3000  
**Admin:** http://localhost:3001  

**Need more help?** Check the detailed documentation:
- `README.md` - Project overview
- `frontend/README.md` - Frontend guide
- `admin/README.md` - Admin guide

---

## 🚀 Next Steps

1. **Explore the frontend** - Login with any email/password (mock auth)
2. **Create a goal** - Try the goal tracking features
3. **Check the admin panel** - View the dashboard
4. **Read the docs** - Understand the architecture
5. **Start coding!** - Add your features

Happy coding! 🎊