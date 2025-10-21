# Commitly

A goal tracking and accountability platform with three standalone applications.

## 📁 Project Structure

This project consists of **3 independent applications**:

```
Commitly/
├── frontend/          # Main user-facing Next.js application
├── admin/            # Admin dashboard (Next.js standalone)
├── docs/             # Project documentation
├── .env.example      # Environment variables template
├── .env.local        # Local environment variables (not in git)
├── .gitignore        # Git ignore rules
└── start-dev.ps1     # Quick start script (all apps)
```

Each folder (`frontend`, `admin`) is a **completely standalone application** with its own:
- ✅ `package.json` - Dependencies
- ✅ `next.config` - Configuration
- ✅ `tsconfig.json` - TypeScript settings
- ✅ Build system and dev server
- ✅ Documentation

---

## 🚀 Quick Start

### Option 1: Start All Apps (Recommended)

Use the automated script to start everything:

```powershell
.\start-dev.ps1
```

This will start:
- **Frontend** on `http://localhost:3000`
- **Admin** on `http://localhost:3001`

### Option 2: Start Individual Apps

#### Frontend (Main App)
```powershell
cd frontend
npm install
npm run dev
```
Open: http://localhost:3000

#### Admin Panel
```powershell
cd admin
npm install
npm run dev
```
Open: http://localhost:3001

---

## 📦 Applications

### 🎯 Frontend (`/frontend`)

The main user-facing application for goal tracking and accountability.

**Features:**
- User authentication (mock + Supabase ready)
- Goal creation and management
- Streak tracking
- Activity logging
- Profile management
- Dashboard and analytics

**Tech Stack:**
- Next.js 15.5.3 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Radix UI Components
- Mock Supabase client (in `/frontend/backend`)

**Quick Commands:**
```bash
cd frontend
npm run dev      # Start dev server (port 3000)
npm run build    # Build for production
npm start        # Run production server
```

**Documentation:**
- See `frontend/README.md` for detailed setup
- Backend logic is in `frontend/backend/`

---

### 🛡️ Admin (`/admin`)

Administrative dashboard for managing the platform.

**Features:**
- System overview dashboard
- User management
- Analytics and insights
- Security monitoring
- System configuration

**Tech Stack:**
- Next.js 15.5.3 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Radix UI Components
- Recharts for visualizations

**Quick Commands:**
```bash
cd admin
npm run dev      # Start dev server (port 3001)
npm run build    # Build for production
npm start        # Run production server
```

**Documentation:**
- See `admin/README.md` for full documentation
- See `admin/QUICK_START.md` for quick reference
- See `admin/STANDALONE_SETUP.md` for setup details

---

## 📚 Documentation (`/docs`)

Contains all project documentation including:
- Setup guides
- Authentication documentation
- Goal system blueprints
- Testing guides
- Deployment checklists
- Configuration instructions

**Key Documents:**
- `LOCAL_SETUP_GUIDE.md` - Complete setup instructions
- `AUTHENTICATION_READY.md` - Auth system documentation
- `GOAL_SYSTEM_BLUEPRINT.md` - Goal system architecture
- `PROJECT_SUMMARY.md` - Project overview

---

## 🔧 Environment Variables

### Root Level
- `.env.example` - Template with all required variables
- `.env.local` - Your local configuration (not in git)

### Frontend
Environment variables are copied to `frontend/.env.local` for the frontend app.

**Required Variables:**
```env
# Supabase Configuration (optional - mock auth works without it)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Mock Auth (set to 'false' to use real Supabase)
NEXT_PUBLIC_MOCK_AUTH=true
```

**Setup:**
1. Copy `.env.example` to `.env.local`
2. Fill in your values
3. Copy to frontend: `cp .env.local frontend/.env.local`

---

## 🏗️ Architecture

### Standalone Design

Each application is **completely independent**:

```
┌─────────────────┐  ┌─────────────────┐
│    Frontend     │  │     Admin       │
│   (Port 3000)   │  │   (Port 3001)   │
│                 │  │                 │
│ - Own config    │  │ - Own config    │
│ - Own deps      │  │ - Own deps      │
│ - Own build     │  │ - Own build     │
│ - Backend code  │  │ - Dashboard     │
│   included      │  │                 │
└─────────────────┘  └─────────────────┘
```

**Benefits:**
- ✅ Each app can be developed independently
- ✅ No shared dependencies or conflicts
- ✅ Separate deployment pipelines
- ✅ Clear separation of concerns
- ✅ Easy to scale individual parts

### Backend Location

The "backend" folder is **inside the frontend** (`frontend/backend/`) because it contains:
- Mock Supabase client
- Database type definitions
- API route handlers
- Backend utilities

This is **not a separate service** - it's imported by the frontend app.

---

## 📋 Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **Git** (for version control)

---

## 🛠️ Development Workflow

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Commitly
```

### 2. Setup Environment
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your values
```

### 3. Install Dependencies
```bash
# Frontend
cd frontend
npm install

# Admin
cd ../admin
npm install
```

### 4. Start Development
```bash
# From root directory
.\start-dev.ps1

# Or manually start each app
cd frontend && npm run dev  # Terminal 1
cd admin && npm run dev     # Terminal 2
```

---

## 📦 Building for Production

### Build All
```bash
# Frontend
cd frontend
npm run build

# Admin
cd admin
npm run build
```

### Run Production
```bash
# Frontend
cd frontend
npm start

# Admin
cd admin
npm start
```

---

## 🚢 Deployment

Each application can be deployed independently:

### Frontend
```bash
cd frontend
npm run build
# Deploy to Vercel, Docker, or Node.js server
```

### Admin
```bash
cd admin
npm run build
# Deploy to Vercel, Docker, or Node.js server
```

**Deployment Options:**
- Vercel (recommended for Next.js)
- Docker containers
- Node.js servers
- Static hosting with ISR

---

## 🧪 Testing

### Frontend
```bash
cd frontend
npm run lint        # Lint code
npm run type-check  # Check TypeScript
```

### Admin
```bash
cd admin
npm run lint        # Lint code
npm run build       # Verify build works
```

---

## 📝 Adding New Features

### Frontend Feature
1. Navigate to `frontend/app/`
2. Create new page: `frontend/app/feature/page.tsx`
3. Add components: `frontend/components/feature/`
4. Add backend logic: `frontend/backend/lib/`

### Admin Feature
1. Navigate to `admin/app/`
2. Create new page: `admin/app/feature/page.tsx`
3. Add components: `admin/components/feature/`

---

## 🐛 Troubleshooting

### Port Conflicts
If ports 3000 or 3001 are in use:
```bash
# Frontend
cd frontend
npm run dev -- -p 3002

# Admin
cd admin
npm run dev -- -p 3003
```

### Module Not Found
```bash
# Clean install
rm -rf node_modules .next
npm install
```

### TypeScript Errors
1. Restart TypeScript server in VSCode
2. Check `tsconfig.json` paths
3. Run `npm run type-check`

---

## 📖 Documentation

- **Frontend**: `frontend/README.md`
- **Admin**: `admin/README.md`, `admin/QUICK_START.md`
- **Project Docs**: `docs/` folder
- **Setup Guide**: `docs/LOCAL_SETUP_GUIDE.md`

---

## 🤝 Contributing

1. Each application is independent
2. Make changes in the appropriate folder
3. Test locally before committing
4. Follow existing code structure

---

## 📄 License

[Your License Here]

---

## 🎯 Summary

**3 Standalone Applications:**

| Application | Port | Purpose | Location |
|------------|------|---------|----------|
| Frontend | 3000 | User-facing app | `/frontend` |
| Admin | 3001 | Admin dashboard | `/admin` |

**Quick Start:**
```bash
.\start-dev.ps1
```

**Everything you need is in its respective folder!** 🚀