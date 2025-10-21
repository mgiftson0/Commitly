# Commitly Project Structure

## 🎯 Overview

Commitly has been reorganized into a **clean, standalone architecture** where each application is completely independent with its own configuration, dependencies, and build system.

## 📁 Current Structure

```
Commitly/
├── frontend/              # Main user-facing application (Port 3000)
│   ├── app/              # Next.js pages
│   ├── backend/          # Backend logic (mock Supabase, API handlers)
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Frontend utilities
│   ├── public/           # Static assets
│   ├── .env.local        # Environment variables
│   ├── package.json      # Dependencies
│   ├── next.config.js    # Next.js config
│   ├── tsconfig.json     # TypeScript config
│   ├── tailwind.config.ts # Tailwind config
│   └── README.md         # Frontend documentation
│
├── admin/                # Admin dashboard (Port 3001)
│   ├── app/              # Next.js pages
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Admin utilities
│   ├── package.json      # Dependencies (independent)
│   ├── next.config.ts    # Next.js config
│   ├── tsconfig.json     # TypeScript config
│   ├── tailwind.config.ts # Tailwind config
│   └── README.md         # Admin documentation
│
├── docs/                 # Project documentation
│   ├── AUTHENTICATION_READY.md
│   ├── GOAL_SYSTEM_BLUEPRINT.md
│   ├── LOCAL_SETUP_GUIDE.md
│   └── [30+ other docs]
│
├── .git/                 # Git repository
├── .gitignore            # Git ignore rules
├── .env.example          # Environment template
├── .env.local            # Root environment (optional)
├── README.md             # Main project documentation
├── start-dev.ps1         # Start all apps script
└── PROJECT_STRUCTURE.md  # This file
```

## 🏗️ Architecture Principles

### 1. Complete Independence

Each application folder (`frontend`, `admin`) is **100% standalone**:

✅ Own `package.json` with all dependencies
✅ Own `node_modules` (not shared)
✅ Own configuration files (Next.js, TypeScript, Tailwind)
✅ Own build output (`.next` folders)
✅ Own development server
✅ Can be developed without other apps running
✅ Can be deployed independently

### 2. No Shared Dependencies

**Before (❌):**
```
Commitly/
├── node_modules/         # Shared by all
├── package.json          # Root dependencies
├── frontend/
│   └── (relies on parent)
└── admin/
    └── (relies on parent)
```

**After (✅):**
```
Commitly/
├── frontend/
│   ├── node_modules/     # Frontend only
│   └── package.json      # Frontend deps
└── admin/
    ├── node_modules/     # Admin only
    └── package.json      # Admin deps
```

### 3. Clean Separation

| Aspect | Frontend | Admin |
|--------|----------|-------|
| **Purpose** | User-facing app | Admin dashboard |
| **Port** | 3000 | 3001 |
| **Backend** | Included in `/frontend/backend` | None needed |
| **Data** | Mock Supabase + localStorage | Mock data |
| **Users** | End users | Administrators |
| **Auth** | Mock + Supabase ready | Not implemented yet |

## 📦 What's Where

### Frontend (`/frontend`)

**Contains Everything for the Main App:**
- ✅ User authentication (mock + Supabase)
- ✅ Goal tracking system
- ✅ User profiles
- ✅ Dashboard
- ✅ Backend logic (`/frontend/backend`)
- ✅ Mock Supabase client
- ✅ All UI components
- ✅ Static assets (`/frontend/public`)

**Why backend is inside frontend:**
The `backend` folder contains mock implementations and utilities that are imported directly by the frontend. It's not a separate service - it's part of the frontend codebase.

### Admin (`/admin`)

**Contains Everything for Admin Panel:**
- ✅ Admin dashboard
- ✅ System overview
- ✅ User management interface
- ✅ Analytics views
- ✅ All admin UI components
- ✅ Independent configuration

**Completely separate from frontend** - can be deployed to different servers, different domains, or not deployed at all.

### Docs (`/docs`)

**All Project Documentation:**
- Setup guides
- Architecture documents
- Testing guides
- Deployment instructions
- Configuration examples
- 30+ markdown files

Moved here to keep root clean and organized.

## 🚀 Working with This Structure

### Starting Development

**Option 1: Start All Apps**
```powershell
.\start-dev.ps1
```
Opens separate PowerShell windows for each app.

**Option 2: Start Individual Apps**
```powershell
# Terminal 1 - Frontend
cd frontend
npm run dev

# Terminal 2 - Admin
cd admin
npm run dev
```

### Installing Dependencies

Each app has its own dependencies:

```powershell
# Frontend dependencies
cd frontend
npm install

# Admin dependencies
cd admin
npm install
```

**Never run `npm install` at root** - there's no root package.json anymore!

### Building for Production

Build each app independently:

```powershell
# Build frontend
cd frontend
npm run build

# Build admin
cd admin
npm run build
```

### Environment Variables

**Frontend needs `.env.local`:**
```env
NEXT_PUBLIC_MOCK_AUTH=true
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Copy from root if needed:
```powershell
cp .env.local frontend/.env.local
```

**Admin doesn't need env vars yet** (unless you add backend features)

## 🔄 Migration Summary

### What Was Moved

| Item | From | To |
|------|------|-----|
| Public assets | `/public` | `/frontend/public` |
| Backend code | `/backend` | `/frontend/backend` |
| Documentation | Root `*.md` files | `/docs/*.md` |
| Frontend env | Root `.env.local` | `/frontend/.env.local` |

### What Was Removed

- ❌ Root `node_modules`
- ❌ Root `.next`
- ❌ Root `package.json`
- ❌ Root `next.config.ts`
- ❌ Root `tsconfig.json`
- ❌ Root `tailwind.config.ts`
- ❌ Root `eslint.config.mjs`
- ❌ Root `components.json`
- ❌ Root `yarn.lock` / `bun.lock`

**Why?** Each app has its own versions of these files. Root configs were causing conflicts and confusion.

### What Was Created

- ✅ `frontend/README.md` - Complete frontend docs
- ✅ `admin/README.md` - Complete admin docs
- ✅ Root `README.md` - Project overview
- ✅ `PROJECT_STRUCTURE.md` - This file
- ✅ Updated `start-dev.ps1` - Multi-app launcher

## 🎯 Benefits of This Structure

### 1. Clear Boundaries
```
Each folder = One complete application
No confusion about what belongs where
```

### 2. Independent Development
```
Work on frontend → Don't need admin running
Work on admin → Don't need frontend running
No shared state or dependencies
```

### 3. Flexible Deployment
```
Deploy frontend to Vercel
Deploy admin to separate server
Different domains, different scaling
```

### 4. Easy Onboarding
```
New developer:
1. cd frontend
2. npm install
3. npm run dev
Done!
```

### 5. No Dependency Conflicts
```
Frontend uses React 19? ✓
Admin uses React 19? ✓
They don't interfere with each other
```

## 📝 Development Workflow

### Typical Day

1. **Start apps you need:**
   ```powershell
   cd frontend && npm run dev
   # Only start admin if you need it
   ```

2. **Work in one folder at a time:**
   ```
   frontend/
     ├── app/new-feature/
     ├── components/new-component/
     └── (stay in frontend folder)
   ```

3. **Install dependencies where needed:**
   ```powershell
   cd frontend
   npm install new-package
   # Stays in frontend/package.json
   ```

4. **Build and test independently:**
   ```powershell
   cd frontend && npm run build
   cd admin && npm run build
   ```

### Adding Features

**Frontend Feature:**
```
1. cd frontend
2. Create pages in app/
3. Add components in components/
4. Add backend logic in backend/lib/
5. Test with npm run dev
```

**Admin Feature:**
```
1. cd admin
2. Create pages in app/
3. Add components in components/
4. Test with npm run dev
```

## 🚫 Common Mistakes to Avoid

### ❌ Don't Do This

```powershell
# Running npm install at root (no package.json there!)
npm install

# Trying to run dev server from root
npm run dev

# Expecting shared node_modules
import something from '../../admin/components'
```

### ✅ Do This

```powershell
# Install in specific app
cd frontend
npm install

# Run dev server from app folder
cd frontend
npm run dev

# Keep imports within same app
import something from '@/components/something'
```

## 🔧 Troubleshooting

### "npm command not found"
```powershell
# You're in wrong directory
# Navigate to frontend or admin first
cd frontend
```

### "Module not found"
```powershell
# Install dependencies in that app
cd frontend
npm install
```

### "Port already in use"
```powershell
# Each app uses different port
# Frontend: 3000
# Admin: 3001
# Or specify custom port:
npm run dev -- -p 3002
```

### "Can't import from ../admin"
```
This is by design - apps are independent
Each app should be self-contained
```

## 📖 Documentation

- **Root README.md** - Project overview, quick start for all apps
- **frontend/README.md** - Complete frontend documentation
- **admin/README.md** - Complete admin documentation
- **docs/** - Historical project documentation

## 🎉 Summary

**Before:** Monolithic structure with shared dependencies and configs
**After:** 3 independent applications with clear boundaries

**Apps:**
1. **frontend** (3000) - User-facing app with backend included
2. **admin** (3001) - Admin dashboard
3. **docs** - All documentation in one place

**Key Points:**
- Each app is completely standalone
- No shared dependencies
- Independent deployment
- Clear separation of concerns
- Easy to understand and maintain

**To get started:**
```powershell
.\start-dev.ps1
```

That's it! 🚀