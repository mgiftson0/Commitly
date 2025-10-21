# Commitly - Quick Reference

## 🚀 Getting Started (5 Minutes)

### 1. Setup Supabase
```bash
1. Create account at supabase.com
2. Create new project
3. Copy Project URL and API keys
```

### 2. Configure Environment
```bash
# Edit .env.local
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### 3. Setup Database
```bash
node setup.js
```

### 4. Run Application
```bash
bun run dev
```

Visit: http://localhost:3000

---

## 📁 Project Structure

```
commitly/
├── app/
│   ├── page.tsx              # Landing page
│   ├── auth/
│   │   ├── login/            # Login
│   │   ├── signup/           # Registration
│   │   ├── kyc/              # User profile setup
│   │   └── callback/         # Auth callback
│   ├── dashboard/            # Main dashboard
│   ├── goals/
│   │   ├── create/           # Create goal
│   │   └── [id]/             # Goal details
│   ├── profile/              # User profile
│   ├── notifications/        # Notifications
│   └── search/               # Search users
├── components/ui/            # shadcn/ui components
├── lib/supabase.ts           # Supabase client
├── setup.js                  # Database setup script
└── .env.local                # Environment variables
```

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| users | User profiles (KYC data) |
| goals | Goal records |
| activities | Multi-activity tasks |
| goal_members | Group goal members |
| accountability_partners | Partner relationships |
| streaks | Progress tracking |
| milestones | Achievements |
| notes | Encouragement & feedback |
| notifications | User notifications |
| goal_completions | Completion history |
| followers | Follow relationships |

---

## 🔐 Authentication Flow

1. **Sign Up** → Email verification → KYC form → Dashboard
2. **Login** → Dashboard
3. **Password Reset** → Email link → New password

---

## 🎯 Goal Types

### Single Activity
- One-off task
- Example: "Workout today"

### Multi-Activity
- Daily checklist
- Multiple tasks
- Progress percentage
- Example: "Morning routine: workout, meditate, journal"

### Recurring
- Repeats on schedule
- Daily, weekly, monthly, yearly, or custom days
- Example: "Workout every Monday, Wednesday, Friday"

---

## 🔑 Key Features

### ✅ Goal Management
- Create, update, delete goals
- Suspend/resume goals
- Mark as complete
- Track time spent

### 👥 Accountability Partners
- Search users
- Send requests
- Accept/decline
- Receive partner updates

### 🔥 Streak Tracking
- Current streak
- Longest streak
- Total completions
- Automatic updates

### 🔔 Notifications
- Goal created/completed/missed
- Partner updates
- Accountability requests
- Reminders

### 🎨 UI Features
- Light/Dark mode
- Responsive design
- Toast notifications
- Loading states

---

## 🛠️ Common Commands

```bash
# Development
bun run dev

# Build for production
bun run build

# Start production server
bun start

# Setup database
node setup.js

# Clear cache
rm -rf .next node_modules && bun install
```

---

## 🔧 Supabase Configuration

### Required Settings

**Authentication > URL Configuration:**
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`

**Authentication > Providers:**
- Email provider enabled
- Email confirmation required

---

## 📊 API Examples

### Create Goal
```typescript
const { data, error } = await supabase
  .from("goals")
  .insert({
    user_id: user.id,
    title: "My Goal",
    goal_type: "single",
    visibility: "private"
  })
```

### Get User Goals
```typescript
const { data, error } = await supabase
  .from("goals")
  .select("*")
  .eq("user_id", user.id)
```

### Update Activity
```typescript
const { error } = await supabase
  .from("activities")
  .update({ is_completed: true })
  .eq("id", activityId)
```

### Send Notification
```typescript
await supabase.from("notifications").insert({
  user_id: userId,
  title: "Goal Completed",
  message: "Great job!",
  notification_type: "goal_completed"
})
```

---

## 🎨 Styling

### Theme Colors
- Primary: Blue (#2563eb)
- Success: Green (#16a34a)
- Warning: Orange (#ea580c)
- Error: Red (#dc2626)

### Typography
- Font: Inter
- Headings: Bold, -0.5px letter spacing
- Body: Regular, 16px

### Components
All shadcn/ui components pre-installed:
- Button, Card, Input, Select, etc.
- Fully customizable with Tailwind

---

## 🐛 Troubleshooting

### Database Issues
```bash
# Re-run setup
node setup.js

# Or manually in Supabase SQL Editor
# Use supabase-schema.sql file
```

### Auth Issues
- Clear cookies
- Check email verification
- Verify .env.local credentials

### Build Errors
```bash
rm -rf .next node_modules
bun install
bun run dev
```

---

## 📦 Deployment Checklist

- [ ] Create Supabase project
- [ ] Run setup.js
- [ ] Update .env.local
- [ ] Test locally
- [ ] Deploy to Vercel
- [ ] Add environment variables
- [ ] Update Supabase redirect URLs
- [ ] Test production site

---

## 🔗 Useful Links

- **Live Demo**: https://commitly.lindy.site
- **Supabase**: https://supabase.com
- **Next.js**: https://nextjs.org
- **shadcn/ui**: https://ui.shadcn.com

---

## 💡 Tips

1. **Always use RLS policies** - Data is secure by default
2. **Test with multiple users** - Create test accounts
3. **Check Supabase logs** - Debug database issues
4. **Use TypeScript** - Catch errors early
5. **Customize UI** - All components are editable

---

**Need more help?** Check README.md and SETUP_GUIDE.md
