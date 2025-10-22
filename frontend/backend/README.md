# Commitly Backend

Complete backend setup and database schema for the Commitly goal-tracking application.

## 📋 Overview

The Commitly backend is built on **Supabase** (PostgreSQL) and includes:

- **11 Database Tables** - Complete data model for goals, users, accountability, and more
- **Row Level Security (RLS)** - Secure, policy-based data access
- **Automated Triggers** - Streak tracking and notifications
- **Storage Buckets** - User avatars and media
- **50+ Indexes** - Optimized for performance
- **30+ Security Policies** - Granular access control

## 🚀 Quick Start

### 1. Setup Supabase Project

```bash
# Create a project at https://app.supabase.com
# Get your project URL and anon key
# Add to frontend/.env.local:
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Run Database Schema

```bash
# 1. Open Supabase SQL Editor
# 2. Copy contents of scripts/schema.sql
# 3. Paste and run
# 4. Wait ~30 seconds for completion
```

### 3. Verify Setup

```sql
SELECT 'Database schema created successfully!' AS status;
```

That's it! Your database is ready to use.

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** | Complete setup guide with schema details |
| **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** | Step-by-step verification checklist |
| **[scripts/QUICK_REFERENCE.md](./scripts/QUICK_REFERENCE.md)** | Common SQL queries and commands |
| **[scripts/schema.sql](./scripts/schema.sql)** | Complete database schema file |

## 🗄️ Database Schema

### Core Tables

```
users                    - User profiles and authentication
├── goals                - User goals (single, multi, recurring)
│   ├── activities       - Sub-tasks for multi-activity goals
│   ├── goal_members     - Shared goal participants
│   ├── streaks          - Streak tracking for recurring goals
│   ├── milestones       - Achievement tracking
│   ├── notes            - Encouragement and feedback
│   ├── goal_completions - Historical completion records
│   └── accountability_partners - Partner relationships
├── notifications        - User notifications
└── followers            - User follow relationships
```

### Table Count: 11
### Total Policies: 50+
### Total Indexes: 50+
### Storage Buckets: 1 (avatars)

## 🔐 Security Features

### Row Level Security (RLS)
Every table has RLS enabled with policies for:
- ✅ Read access (own data, public data, shared data)
- ✅ Write access (own data only)
- ✅ Update access (own data only)
- ✅ Delete access (own data only)

### Authentication
- Uses Supabase Auth (extends `auth.users`)
- JWT-based authentication
- Automatic user session management
- Support for email/password, OAuth, magic links

## ⚙️ Automated Features

### Triggers

1. **Auto-Update Timestamps**
   - Automatically updates `updated_at` on row changes
   - Applies to: users, goals, activities, partners, streaks

2. **Streak Tracking**
   - Automatically calculates streaks when goals complete
   - Creates milestone records for 7, 30, 100, 365-day streaks
   - Handles streak breaks and continuations

3. **Accountability Notifications**
   - Notifies partners when goals are completed
   - Automatic notification creation
   - Includes goal details and links

### Functions

```sql
update_updated_at_column()           -- Auto-update timestamps
update_streak()                      -- Calculate and update streaks
notify_accountability_partners()     -- Send partner notifications
```

## 📁 File Structure

```
backend/
├── api/                    # API route handlers (Next.js)
├── lib/                    # Shared utilities and helpers
├── scripts/
│   ├── schema.sql          # Complete database schema
│   ├── QUICK_REFERENCE.md  # Common SQL queries
│   ├── setup.js            # Legacy setup script
│   ├── setup-auto.js       # Automated setup
│   └── setup-simple.js     # Simple setup
├── DATABASE_SETUP.md       # Complete setup documentation
├── SETUP_CHECKLIST.md      # Verification checklist
└── README.md               # This file
```

## 🎯 Common Tasks

### Create a Goal

```javascript
const { data, error } = await supabase
  .from('goals')
  .insert({
    title: 'Morning Exercise',
    description: 'Exercise for 30 minutes',
    goal_type: 'recurring',
    visibility: 'public',
    category: 'fitness'
  });
```

### Get User's Active Goals

```javascript
const { data, error } = await supabase
  .from('goals')
  .select('*')
  .eq('user_id', user.id)
  .eq('is_completed', false)
  .order('created_at', { ascending: false });
```

### Track a Streak

```javascript
// Just mark the goal as complete - trigger handles the rest!
const { data, error } = await supabase
  .from('goals')
  .update({ 
    is_completed: true,
    completed_at: new Date().toISOString()
  })
  .eq('id', goalId)
  .eq('user_id', user.id);

// Streak is automatically calculated by the database trigger
```

### Get Notifications

```javascript
const { data, error } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', user.id)
  .eq('is_read', false)
  .order('created_at', { ascending: false });
```

## 🔍 Query Examples

See [scripts/QUICK_REFERENCE.md](./scripts/QUICK_REFERENCE.md) for 50+ common queries including:
- User management
- Goal CRUD operations
- Accountability partners
- Streak tracking
- Statistics and analytics
- Search functionality

## 🧪 Testing

### Run Tests

```bash
# Test Supabase connection
node scripts/test-supabase.js

# Test database setup
node scripts/setup-simple.js
```

### Verify Setup

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check policies exist
SELECT COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public';
```

## 📊 Performance

### Optimizations

- **Indexed Columns**: All foreign keys, commonly queried fields
- **Composite Indexes**: User + completion status, goal + activities
- **Partial Indexes**: End date (when not null), unread notifications
- **Query Optimization**: Minimized joins, efficient RLS policies

### Monitoring

Check query performance in Supabase Dashboard:
1. Go to Database → Query Performance
2. Review slow queries
3. Optimize with EXPLAIN ANALYZE

## 🚨 Troubleshooting

### Common Issues

**Can't create user profile**
- Ensure user is authenticated (`auth.uid()` has value)
- Check RLS policies are enabled
- Verify `users_insert_own` policy exists

**Triggers not firing**
- Verify triggers exist in Database → Functions
- Check trigger functions are created
- Review logs in Supabase Dashboard

**Storage upload fails**
- Check `avatars` bucket exists
- Verify storage policies are created
- Ensure file path: `{user_id}/filename.ext`

**Can't query public goals**
- Verify `goals_select_public` policy exists
- Check goal `visibility = 'public'`
- Ensure RLS is enabled

See [DATABASE_SETUP.md](./DATABASE_SETUP.md#troubleshooting) for more solutions.

## 🔄 Migrations

### Apply Schema Updates

```bash
# 1. Backup your data first!
# 2. Run new schema in SQL Editor
# 3. Verify with checklist
```

### Rollback (if needed)

```sql
-- Drop all tables (WARNING: Data loss!)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Then re-run schema.sql
```

## 📦 Dependencies

- **Supabase** - Backend as a Service (PostgreSQL)
- **PostgreSQL 15+** - Database
- **uuid-ossp** - UUID generation
- **pgcrypto** - Encryption functions

## 🛠️ Development

### Local Development

```bash
# Use Supabase hosted database (recommended)
# Or run local Supabase:
npx supabase init
npx supabase start
npx supabase db reset
```

### Environment Variables

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Optional (for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

## 🚀 Deployment

### Production Checklist

- [ ] Run schema on production Supabase project
- [ ] Update environment variables
- [ ] Configure Site URL and redirect URLs
- [ ] Enable email confirmations
- [ ] Set up custom SMTP (optional)
- [ ] Configure database backups
- [ ] Set up monitoring

### Scaling

For high traffic:
- Enable connection pooling
- Set up read replicas
- Configure CDN for storage
- Monitor query performance
- Optimize slow queries

## 📖 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Manual](https://www.postgresql.org/docs/)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)

## 🤝 Support

Need help?
1. Check [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed docs
2. Review [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md) for verification
3. See [QUICK_REFERENCE.md](./scripts/QUICK_REFERENCE.md) for queries
4. Check Supabase logs in dashboard
5. Consult Supabase community

## 📄 License

Part of the Commitly project.

---

**Last Updated:** 2024  
**Schema Version:** 2.0  
**Documentation Version:** 1.0