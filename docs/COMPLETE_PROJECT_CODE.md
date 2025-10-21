# 🚀 Commitly - Complete Project Code

Copy these files to set up Commitly on your local machine.

---

## 📋 Setup Instructions

### 1. Create Next.js Project
```bash
npx create-next-app@latest commitly --typescript --tailwind --app
cd commitly
```

### 2. Install Dependencies
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install lucide-react next-themes sonner dotenv
npm install class-variance-authority clsx tailwind-merge
```

### 3. Initialize shadcn/ui
```bash
npx shadcn@latest init -d
npx shadcn@latest add button card input label select textarea toast
```

---

## 📁 File Structure

Create these files in your project:

```
commitly/
├── .env.local
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── lib/
│   ├── supabase.ts
│   └── utils.ts
├── components/
│   └── theme-provider.tsx
└── setup-schema.sql
```

---

## 🔐 .env.local

Create this file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://wfjspkyptjipolxnlzya.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmanNwa3lwdGppcG9seG5senlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NjQyNDUsImV4cCI6MjA3NTQ0MDI0NX0.-6yXGwfikK3BZd0VGDTx0rYBGA28wJs0_OKoAvu7Pjo
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmanNwa3lwdGppcG9seG5senlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTg2NDI0NSwiZXhwIjoyMDc1NDQwMjQ1fQ.uCZaCANDmu-vbYYdSbzmonvN34tH0K50PJjl3rFxu-8
```

---

## 📄 Key Files to Create

I'll provide the code for each file in separate messages.
Let me know when you're ready and I'll share:

1. ✅ lib/supabase.ts (Supabase client)
2. ✅ components/theme-provider.tsx (Dark mode)
3. ✅ app/layout.tsx (Root layout)
4. ✅ app/page.tsx (Landing page)
5. ✅ setup-schema.sql (Database schema)

---

## 🎯 After Creating Files

1. Run the SQL in Supabase SQL Editor
2. Configure Auth URLs in Supabase
3. Run: `npm run dev`
4. Visit: http://localhost:3000

---

Ready to get the code? Let me know and I'll share each file! 🚀
