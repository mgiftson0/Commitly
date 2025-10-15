# Backend Folder

This folder contains all backend-related code, keeping it separate from the frontend code.

## Structure

```
backend/
├── api/            # API route handlers
│   └── auth-callback.ts
├── lib/            # Backend utilities and configurations
│   ├── mock-auth.ts
│   ├── mock-store.ts
│   └── supabase.ts
└── scripts/        # Database setup and utility scripts
    ├── setup.js
    ├── setup-auto.js
    ├── setup-simple.js
    ├── setup-schema.sql
    └── test-supabase.js
```

## API Routes

The actual Next.js API routes are still in `frontend/app/auth/callback/` for proper routing, but they now import from `backend/api/` to keep the backend logic separated.

## Importing from Backend

Use the `@/backend/` alias to import backend modules:

```typescript
// Import backend utilities
import { getSupabaseClient } from '@/backend/lib/supabase'
import { isMockAuthEnabled } from '@/backend/lib/mock-auth'
import { getGoals, addGoal } from '@/backend/lib/mock-store'
```

## Frontend Utilities

Frontend-only utilities remain in the `frontend/lib` folder:
- `frontend/lib/utils.ts` - UI utility functions (e.g., `cn()` for className merging)

## Running Setup Scripts

To run the database setup scripts:

```bash
# Interactive setup
node backend/scripts/setup.js

# Automated setup (requires .env.local)
node backend/scripts/setup-auto.js

# Simple setup (generates SQL file)
node backend/scripts/setup-simple.js

# Test Supabase connection
node backend/scripts/test-supabase.js
```
