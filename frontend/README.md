# Commitly Frontend

The main user-facing application for goal tracking and accountability.

## 📋 Overview

Commitly Frontend is a Next.js application that allows users to create, track, and manage their goals with accountability features. It includes authentication, goal management, streak tracking, and social accountability features.

## 🎯 Features

- ✅ **User Authentication** - Mock authentication with Supabase support
- ✅ **Goal Management** - Create, edit, and track goals
- ✅ **Streak Tracking** - Monitor daily progress and streaks
- ✅ **Activity Logging** - Log activities within goals
- ✅ **Profile Management** - Customize user profiles
- ✅ **Dashboard** - Overview of all goals and progress
- ✅ **Responsive Design** - Works on desktop and mobile
- ✅ **Dark Mode** - Theme support
- ✅ **Accountability Partners** - Connect with others for support

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

### Installation

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration (see Environment Variables section)

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── (protected)/       # Protected routes (require auth)
│   │   ├── dashboard/
│   │   ├── goals/
│   │   ├── profile/
│   │   └── settings/
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── backend/               # Backend logic (imported by frontend)
│   ├── api/              # API route handlers
│   ├── lib/              # Backend utilities
│   │   ├── supabase.ts   # Mock Supabase client
│   │   ├── mock-auth.ts  # Mock authentication
│   │   └── mock-store.ts # Mock data storage
│   └── scripts/          # Database setup scripts
├── components/            # React components
│   ├── ui/               # Reusable UI components (Radix UI)
│   ├── goals/            # Goal-related components
│   ├── profile/          # Profile components
│   └── layout/           # Layout components
├── hooks/                # Custom React hooks
├── lib/                  # Frontend utilities
│   └── utils.ts          # Helper functions (cn, etc.)
├── public/               # Static assets
├── .env.example          # Environment variables template
├── .env.local            # Local environment variables (not in git)
├── next.config.js        # Next.js configuration
├── package.json          # Dependencies and scripts
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## 🔧 Environment Variables

Create a `.env.local` file in the frontend directory:

```env
# Mock Authentication (set to 'false' to use real Supabase)
NEXT_PUBLIC_MOCK_AUTH=true

# Supabase Configuration (optional when using mock auth)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# API Configuration (if using external API)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Mock Auth vs Real Supabase

**Mock Auth (Default):**
- Uses localStorage for data persistence
- No external dependencies
- Perfect for development and testing
- Set `NEXT_PUBLIC_MOCK_AUTH=true`

**Real Supabase:**
- Requires Supabase project setup
- Provides production-ready authentication
- Set `NEXT_PUBLIC_MOCK_AUTH=false`
- Add your Supabase credentials

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Check TypeScript types |

## 🎨 Tech Stack

### Core
- **Framework:** Next.js 15.5.3 (App Router)
- **React:** 19.0.0
- **TypeScript:** 5.9.3
- **Styling:** Tailwind CSS 3.4.17

### UI Components
- **Radix UI:** Accessible component primitives
- **Lucide React:** Icon library
- **Sonner:** Toast notifications
- **Recharts:** Charts and visualizations

### State & Data
- **React Hook Form:** Form management
- **date-fns:** Date utilities
- **Mock Supabase:** Database abstraction

### Development
- **ESLint:** Code linting
- **PostCSS:** CSS processing
- **Autoprefixer:** CSS vendor prefixes

## 🏗️ Backend Integration

The `backend/` folder contains all backend logic:

### Mock Supabase Client (`backend/lib/supabase.ts`)

A complete mock implementation of Supabase that uses localStorage:

```typescript
import { getSupabaseClient } from '@/backend/lib/supabase'

// Get client
const supabase = getSupabaseClient()

// Query data
const { data, error } = await supabase
  .from('goals')
  .select('*')
  .eq('user_id', userId)

// Insert data
const { data, error } = await supabase
  .from('goals')
  .insert({ title: 'My Goal', user_id: userId })

// Authentication
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})
```

### Mock Data Store (`backend/lib/mock-store.ts`)

Helper functions for common operations:

```typescript
import { getGoals, addGoal, updateGoal } from '@/backend/lib/mock-store'

// Get user's goals
const goals = await getGoals(userId)

// Add new goal
const newGoal = await addGoal(userId, goalData)

// Update goal
const updated = await updateGoal(goalId, updates)
```

### Database Types

TypeScript types for all database entities are defined in `backend/lib/supabase.ts`:

- `User` - User accounts
- `Goal` - Goal records
- `Activity` - Activity items within goals
- `Streak` - Streak tracking data
- `Notification` - User notifications
- `AccountabilityPartner` - Accountability partnerships

## 🔐 Authentication

### Mock Authentication

The app uses mock authentication by default:

**Features:**
- Email/password signup and login
- User session management
- Profile data storage
- Works offline

**Usage:**
```typescript
import { getSupabaseClient } from '@/backend/lib/supabase'

const supabase = getSupabaseClient()

// Sign up
await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})

// Sign in
await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

// Sign out
await supabase.auth.signOut()

// Get current user
const { data: { user } } = await supabase.auth.getUser()
```

### Switching to Real Supabase

1. Set up a Supabase project at https://supabase.com
2. Run the database setup scripts:
   ```bash
   node backend/scripts/setup.js
   ```
3. Update `.env.local`:
   ```env
   NEXT_PUBLIC_MOCK_AUTH=false
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```

## 🎨 Styling

### Tailwind CSS

Custom configuration with CSS variables for theming:

```tsx
// Using utility classes
<div className="bg-primary text-primary-foreground">

// Using cn() utility for conditional classes
import { cn } from '@/lib/utils'

<div className={cn(
  "base-class",
  isActive && "active-class",
  variant === "primary" && "primary-class"
)}>
```

### Dark Mode

Dark mode is supported via CSS variables:

```tsx
import { useTheme } from 'next-themes'

const { theme, setTheme } = useTheme()

// Toggle theme
<button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
  Toggle Theme
</button>
```

## 🧩 Components

### UI Components (`components/ui/`)

Pre-built Radix UI components with Tailwind styling:
- Buttons, Cards, Dialogs, Dropdowns
- Forms, Inputs, Selects
- Tooltips, Toasts, Modals
- And 40+ more...

### Custom Components

**Goal Components (`components/goals/`):**
- `GoalCard` - Display goal information
- `GoalForm` - Create/edit goals
- `GoalList` - List of goals
- `StreakDisplay` - Show streak information

**Profile Components (`components/profile/`):**
- `ProfileCard` - User profile display
- `ProfileForm` - Edit profile
- `ProfileStats` - User statistics

## 🔨 Development

### Adding a New Page

1. Create page in `app/`:
   ```tsx
   // app/new-feature/page.tsx
   export default function NewFeaturePage() {
     return <div>New Feature</div>
   }
   ```

2. Add to navigation if needed

3. Create components in `components/new-feature/`

### Adding a New Component

1. Create component file:
   ```tsx
   // components/my-component.tsx
   import { cn } from '@/lib/utils'

   export function MyComponent({ className, ...props }) {
     return <div className={cn("base-styles", className)} {...props} />
   }
   ```

2. Export from index if needed

### Adding Backend Logic

1. Add to `backend/lib/`:
   ```typescript
   // backend/lib/my-service.ts
   export async function myFunction() {
     // Implementation
   }
   ```

2. Import in frontend:
   ```typescript
   import { myFunction } from '@/backend/lib/my-service'
   ```

## 🐛 Troubleshooting

### "Module not found" Errors

**Solution:**
```bash
# Clean install
rm -rf node_modules .next
npm install
```

### TypeScript Errors

**Solution:**
1. Check `tsconfig.json` path mappings
2. Restart TypeScript server (VSCode: Ctrl+Shift+P → "TypeScript: Restart TS Server")
3. Run type check: `npm run type-check`

### Port Already in Use

**Solution:**
```bash
# Use different port
npm run dev -- -p 3002
```

### Styles Not Updating

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### localStorage Not Persisting

**Solution:**
- Check browser settings (localStorage enabled?)
- Clear browser cache
- Check console for errors

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy

### Deploy to Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Deploy to Node.js Server

```bash
npm run build
npm start
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Sign up new user
- [ ] Log in existing user
- [ ] Create goal
- [ ] Edit goal
- [ ] Mark activity complete
- [ ] View streak
- [ ] Update profile
- [ ] Test responsive design
- [ ] Test dark mode

### Testing Mock Auth

Use any email/password combination:
- Email: `test@example.com`
- Password: `anything`

Data persists in browser localStorage.

## 📝 Code Style

- Use TypeScript for all new files
- Follow existing component structure
- Use Tailwind CSS for styling
- Use `cn()` utility for conditional classes
- Prefer functional components with hooks
- Keep components small and focused

## 🔄 Data Flow

```
User Action
    ↓
React Component
    ↓
Backend Function (backend/lib/)
    ↓
Mock Supabase Client (backend/lib/supabase.ts)
    ↓
localStorage
    ↓
Response to Component
    ↓
UI Update
```

## 📚 Resources

- **Next.js Docs:** https://nextjs.org/docs
- **React Docs:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Radix UI:** https://www.radix-ui.com/docs
- **TypeScript:** https://www.typescriptlang.org/docs

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## 📄 License

[Your License Here]

---

## 🎯 Quick Reference

**Start Development:**
```bash
npm run dev
```

**Build Production:**
```bash
npm run build
```

**Run Tests:**
```bash
npm run type-check
npm run lint
```

**Access App:**
- Development: http://localhost:3000
- Production: Your deployed URL

---

**Need help? Check the `/docs` folder in the project root for more documentation!**