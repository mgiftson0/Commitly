# Server Folder

This folder contains all backend-related code, keeping it separate from the frontend code.

## Structure

```
server/
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

The actual Next.js API routes are still in `app/auth/callback/` for proper routing, but they now import from `server/api/` to keep the backend logic separated.

## Importing from Server

Use the `@/server/` alias to import backend modules:

```typescript
// Import backend utilities
import { getSupabaseClient } from '@/server/lib/supabase'
import { isMockAuthEnabled } from '@/server/lib/mock-auth'
import { getGoals, addGoal } from '@/server/lib/mock-store'
```

## Frontend Utilities

Frontend-only utilities remain in the `/lib` folder:
- `lib/utils.ts` - UI utility functions (e.g., `cn()` for className merging)

## Running Setup Scripts

To run the database setup scripts:

```bash
# Interactive setup
node server/scripts/setup.js

# Automated setup (requires .env.local)
node server/scripts/setup-auto.js

# Simple setup (generates SQL file)
node server/scripts/setup-simple.js

# Test Supabase connection
node server/scripts/test-supabase.js
```
