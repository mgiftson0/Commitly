# Project Structure

## Directory Organization

### Root Level
```
commitly/
├── frontend/              # Frontend application code
├── backend/               # Backend services and utilities
├── public/                # Static assets
├── .amazonq/              # Amazon Q configuration
├── .next/                 # Next.js build artifacts
└── [config files]         # Root configuration files
```

### Frontend Structure (`frontend/`)
```
frontend/
├── app/                   # Next.js App Router pages
│   ├── auth/             # Authentication pages (login, signup, reset)
│   ├── dashboard/        # Main dashboard
│   ├── goals/            # Goal management pages
│   │   ├── [id]/         # Dynamic goal detail pages
│   │   └── create/       # Goal creation
│   ├── notifications/    # Notification center
│   ├── partners/         # Accountability partner management
│   ├── profile/          # User profile management
│   ├── search/           # User search functionality
│   └── settings/         # Application settings
├── components/           # React components
│   ├── ui/              # shadcn/ui component library
│   ├── layout/          # Layout components (header, sidebar)
│   └── goals/           # Goal-specific components
├── hooks/               # Custom React hooks
└── lib/                 # Frontend utilities and configurations
```

### Backend Structure (`backend/`)
```
backend/
├── api/                 # API route handlers
├── lib/                 # Backend utilities and configurations
│   ├── supabase.ts     # Supabase client and type definitions
│   ├── mock-auth.ts    # Mock authentication system
│   └── mock-store.ts   # Mock data store for development
└── scripts/            # Database setup and utility scripts
    ├── setup.js        # Interactive database setup
    ├── setup-auto.js   # Automated setup script
    └── test-supabase.js # Connection testing
```

## Core Components

### Application Architecture
- **Next.js 15** with App Router for modern React development
- **Client-side rendering** with server-side capabilities
- **Component-based architecture** using React functional components
- **TypeScript** for type safety throughout the application

### Data Layer
- **Supabase** as primary backend service (PostgreSQL, Auth, Storage)
- **Mock system** for development without Supabase dependency
- **Row Level Security (RLS)** for data protection
- **Real-time subscriptions** for live updates

### UI Architecture
- **shadcn/ui** component library built on Radix UI primitives
- **Tailwind CSS** for styling and responsive design
- **Lucide React** for consistent iconography
- **Theme system** supporting light/dark modes

## Key Relationships

### Import Patterns
- **Frontend imports**: Use `@/` prefix mapping to `frontend/`
- **Backend imports**: Use `@/backend/` prefix mapping to `backend/`
- **Component imports**: Organized by feature and UI hierarchy

### Data Flow
1. **User interactions** trigger component state changes
2. **API calls** through Supabase client or mock system
3. **Real-time updates** via Supabase subscriptions
4. **State management** through React hooks and context

### Authentication Flow
- **Supabase Auth** for production authentication
- **Mock auth system** for development and testing
- **Route protection** through middleware and guards
- **User session management** across application

## Architectural Patterns

### Page Structure
- **Layout components** provide consistent structure
- **Page components** handle route-specific logic
- **Feature components** encapsulate business logic
- **UI components** provide reusable interface elements

### State Management
- **Local state** with React useState and useEffect
- **Form state** managed by react-hook-form
- **Global state** through React Context when needed
- **Server state** synchronized with Supabase

### Error Handling
- **Try-catch blocks** for async operations
- **Toast notifications** for user feedback
- **Fallback UI** for error states
- **Development logging** for debugging