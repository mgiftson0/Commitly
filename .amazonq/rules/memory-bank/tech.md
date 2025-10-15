# Technology Stack

## Core Technologies

### Frontend Framework
- **Next.js 15.5.3** - React framework with App Router
- **React 19.0.0** - UI library with latest features
- **TypeScript 5** - Type-safe JavaScript development
- **Node.js 18+** - Runtime environment

### UI & Styling
- **shadcn/ui** - Component library built on Radix UI primitives
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React 0.468.0** - Icon library
- **next-themes 0.4.4** - Theme management system

### Backend & Database
- **Supabase** - Backend-as-a-Service (PostgreSQL, Auth, Storage)
- **PostgreSQL** - Primary database with Row Level Security
- **Mock system** - Development environment without external dependencies

### Development Tools
- **Bun** - Package manager and runtime (recommended)
- **ESLint 9** - Code linting and quality
- **PostCSS 8.4.49** - CSS processing
- **Autoprefixer 10.4.20** - CSS vendor prefixing

## Package Dependencies

### Core Dependencies
```json
{
  "next": "15.5.3",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "typescript": "^5"
}
```

### UI Components
```json
{
  "@radix-ui/react-*": "^1.x.x - ^2.x.x",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^2.6.0",
  "tailwindcss-animate": "^1.0.7"
}
```

### Additional Libraries
```json
{
  "react-hook-form": "^7.65.0",
  "date-fns": "^4.1.0",
  "recharts": "^2.15.0",
  "sonner": "^1.7.3",
  "vaul": "^1.1.2"
}
```

## Development Commands

### Package Management
```bash
# Install dependencies
bun install

# Add new package
bun add <package-name>

# Add dev dependency
bun add -d <package-name>
```

### Development Server
```bash
# Start development server
bun run dev

# Alternative with npm
npm run dev

# Start on specific port
bun run dev -- -p 3001
```

### Build & Production
```bash
# Build for production
bun run build

# Start production server
bun run start

# Type checking
bun run type-check

# Linting
bun run lint
```

### Database Setup
```bash
# Interactive setup
node backend/scripts/setup.js

# Automated setup
node backend/scripts/setup-auto.js

# Test connection
node backend/scripts/test-supabase.js
```

## Configuration Files

### TypeScript Configuration
- **Target**: ES2017 for broad compatibility
- **Module**: ESNext with bundler resolution
- **Path mapping**: `@/*` → `frontend/*`, `@/backend/*` → `backend/*`
- **Strict mode**: Enabled for type safety

### Next.js Configuration
- **Dev indicators**: Disabled for cleaner development
- **App Router**: Enabled by default
- **TypeScript**: Integrated with Next.js plugin

### Tailwind Configuration
- **Content paths**: Configured for frontend directory
- **Theme**: Extended with custom colors and animations
- **Plugins**: Includes tailwindcss-animate

## Environment Setup

### Required Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Development vs Production
- **Development**: Mock auth system available
- **Production**: Full Supabase integration required
- **Environment detection**: Automatic based on configuration

## Browser Support
- **Modern browsers** with ES2017+ support
- **Mobile responsive** design
- **Progressive enhancement** approach
- **Accessibility** compliant components