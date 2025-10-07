# 🖥️ Setting Up Commitly on Your Local IDE

## Method 1: Quick Setup (Recommended)

### Step 1: Create Next.js Project
```bash
# Open your terminal and run:
npx create-next-app@latest commitly --typescript --tailwind --app --no-src-dir

# When prompted, choose:
# ✔ Would you like to use ESLint? Yes
# ✔ Would you like to use Turbopack? Yes
# ✔ Would you like to customize the import alias? No

cd commitly
```

### Step 2: Install Dependencies
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install @radix-ui/react-* lucide-react next-themes sonner
npm install -D tailwindcss-animate class-variance-authority clsx tailwind-merge
```

### Step 3: Initialize shadcn/ui
```bash
npx shadcn@latest init

# When prompted:
# ✔ Which style would you like to use? Default
# ✔ Which color would you like to use as base color? Slate
# ✔ Would you like to use CSS variables for colors? Yes
```

### Step 4: Add shadcn/ui Components
```bash
npx shadcn@latest add button card input label select textarea toast
```

### Step 5: Get the Project Files

I'll provide you with all the code files. You have two options:

**Option A: I'll share the code here**
- I can paste the contents of each file
- You copy and create them in your project

**Option B: GitHub Repository**
- Would you like me to help you create a GitHub repo?
- You can then clone it to your machine

---

## Method 2: Download Project Files

Since you're working with me here, the easiest way is:

1. **Tell me which method you prefer:**
   - Should I paste the code for each file here?
   - Or would you like step-by-step file creation?

2. **I'll provide:**
   - All page files (9 pages)
   - Configuration files
   - Database setup script
   - Documentation

---

## 📁 Files You'll Need

Here's what I'll help you create:

### Core Files:
- `.env.local` (your Supabase credentials)
- `lib/supabase.ts` (Supabase client)
- `components/theme-provider.tsx` (dark mode)

### Pages (in app/ directory):
- `page.tsx` (landing page)
- `layout.tsx` (root layout)
- `auth/login/page.tsx`
- `auth/signup/page.tsx`
- `auth/kyc/page.tsx`
- `dashboard/page.tsx`
- `goals/create/page.tsx`
- `goals/[id]/page.tsx`
- `profile/page.tsx`
- `notifications/page.tsx`
- `search/page.tsx`

### Setup:
- `setup-schema.sql` (database schema)
- `README.md` (documentation)

---

## 🎯 What Would You Like to Do?

**Option 1:** I paste the code for each file here, and you create them
**Option 2:** I guide you step-by-step to create each file
**Option 3:** I help you set up a GitHub repository

Let me know which option works best for you! 🚀
