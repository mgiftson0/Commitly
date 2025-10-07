# Commitly - Goal Tracking Platform

A comprehensive goal tracking platform built with Next.js and Supabase where users can set, track, and complete goals with accountability partners.

## Features

- **Multiple Goal Types**: Single activity, multi-activity checklists, and recurring goals
- **Accountability Partners**: Connect with partners to stay motivated
- **Streak Tracking**: Build momentum with daily streaks
- **Progress Monitoring**: Track completion rates and time spent
- **Notifications**: Stay updated on goal progress and partner activities
- **Light/Dark Mode**: Full theme support
- **Responsive Design**: Works on all devices

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **UI**: shadcn/ui, Tailwind CSS, Radix UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Package Manager**: Bun

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ or Bun
- A Supabase account (free tier works)

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned
3. Go to Project Settings > API
4. Copy your Project URL and anon key

### 3. Configure Environment Variables

Edit `.env.local` and add your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Setup Database

Run the setup script to create all database tables, policies, and functions:

```bash
node setup.js
```

The script will:
- Create all necessary tables
- Set up Row Level Security (RLS) policies
- Create database functions and triggers
- Configure storage buckets

### 5. Install Dependencies & Run

```bash
# Install dependencies
bun install

# Run development server
bun run dev
```

Visit `http://localhost:3000` to see your app!

## Database Schema

### Tables

- **users** - User profiles (extends Supabase auth)
- **goals** - Goal records with type, visibility, and recurrence
- **activities** - Individual activities for multi-activity goals
- **goal_members** - Group/patterned goal memberships
- **accountability_partners** - Partner relationships and requests
- **streaks** - Streak tracking per goal
- **milestones** - Achievement records
- **notes** - Encouragement and feedback
- **notifications** - User notifications
- **goal_completions** - Completion history with time tracking
- **followers** - User follow relationships

### Key Features

- **Row Level Security (RLS)**: All tables have security policies
- **Real-time subscriptions**: Live updates for goals and notifications
- **Automatic triggers**: Streak updates, notifications, timestamps
- **Storage**: Profile picture uploads

## Project Structure

```
commitly/
├── app/
│   ├── auth/
│   │   ├── login/          # Login page
│   │   ├── signup/         # Registration page
│   │   └── reset-password/ # Password reset
│   ├── dashboard/          # Main dashboard
│   ├── goals/
│   │   ├── create/         # Create new goal
│   │   └── [id]/           # Goal detail page
│   ├── profile/            # User profile
│   ├── notifications/      # Notifications center
│   └── search/             # Search users
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── theme-provider.tsx  # Dark mode provider
├── lib/
│   ├── supabase.ts         # Supabase client & types
│   └── utils.ts            # Utility functions
├── setup.js                # Database setup script
└── .env.local              # Environment variables
```

## Usage Guide

### Creating Goals

1. Click "Create New Goal" from dashboard
2. Choose goal type:
   - **Single**: One-time task
   - **Multi**: Daily checklist with multiple activities
   - **Recurring**: Repeats on schedule
3. Set visibility (public/private/restricted)
4. Add accountability partners (optional)

### Tracking Progress

- Mark activities complete in goal detail page
- View streaks and completion stats
- Add personal notes and encouragement
- Monitor time spent vs allocated

### Accountability Partners

1. Search for users by username/phone
2. Send accountability request
3. Partner accepts/declines
4. Receive updates on partner's goals

## API Routes (Future Enhancement)

The current setup uses Supabase client-side. For production, consider:
- Server-side API routes for sensitive operations
- Edge functions for email notifications
- Scheduled functions for reminders

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Add environment variables in Vercel dashboard.

### Other Platforms

Works on any platform supporting Next.js:
- Netlify
- Railway
- AWS Amplify
- Self-hosted

## Security Notes

- Never commit `.env.local` to version control
- Use service role key only in secure server environments
- RLS policies protect all data access
- Email verification required for signup

## Troubleshooting

### Database Setup Issues

If `setup.js` fails, manually run the SQL:
1. The script saves SQL to `supabase-schema.sql`
2. Open Supabase SQL Editor
3. Paste and run the SQL

### Authentication Issues

- Check Supabase Auth settings
- Verify email templates are configured
- Ensure redirect URLs are whitelisted

### Build Errors

```bash
# Clear cache and reinstall
rm -rf .next node_modules
bun install
bun run dev
```

## Contributing

This is a complete starter template. Feel free to:
- Add more features
- Customize the UI
- Extend the database schema
- Add integrations

## License

MIT License - feel free to use for personal or commercial projects.

## Support

For issues or questions:
- Check Supabase documentation
- Review Next.js docs
- Check shadcn/ui components

---

Built with ❤️ using Next.js and Supabase
