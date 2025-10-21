# Quick Start Guide - Commitly Admin Panel

## ⚡ TL;DR

```powershell
cd Commitly\Commitly\admin
npm install
npm run dev
```

Open http://localhost:3001 🎉

---

## 📋 Prerequisites

- ✅ Node.js 18.x or higher
- ✅ npm (comes with Node.js)

---

## 🚀 First Time Setup

### Step 1: Navigate to Admin Directory
```powershell
cd Commitly\Commitly\admin
```

### Step 2: Install Dependencies
```powershell
npm install
```
⏱️ This takes ~2-4 minutes

### Step 3: Start Development Server
```powershell
npm run dev
```

### Step 4: Open in Browser
```
http://localhost:3001
```

**Done! Your admin panel is running! 🎉**

---

## 🎯 Using the Quick Start Script (Windows)

Instead of manual steps, use the automated script:

```powershell
cd Commitly\Commitly\admin
.\start-admin.ps1
```

This script will:
- ✅ Check Node.js installation
- ✅ Install dependencies if needed
- ✅ Start the dev server
- ✅ Show you the URL

---

## 📝 Common Commands

| Command | What It Does |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm run lint` | Check code quality |

---

## 🌐 URLs

- **Development**: http://localhost:3001
- **Production**: http://localhost:3001 (after `npm start`)

---

## 🔥 Hot Tips

### Restart Dev Server
```powershell
Ctrl + C    # Stop server
npm run dev # Start again
```

### Use Different Port
```powershell
npm run dev -- -p 3002
```

### Clean Install
```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

### Clean Build
```powershell
Remove-Item -Recurse -Force .next
npm run build
```

---

## 🐛 Troubleshooting

### "npm: command not found"
**Fix**: Install Node.js from https://nodejs.org/

### "Port 3001 is already in use"
**Fix**: Server will auto-use next available port (3002, 3003, etc.)

### Components not loading
**Fix**: 
```powershell
Remove-Item -Recurse -Force .next, node_modules
npm install
```

### TypeScript errors
**Fix**: Restart TypeScript server in VSCode:
1. Open Command Palette (Ctrl+Shift+P)
2. Type "TypeScript: Restart TS Server"
3. Press Enter

---

## 📂 Project Structure

```
admin/
├── app/              # Pages
│   ├── page.tsx     # Dashboard (home)
│   └── layout.tsx   # Root layout
├── components/      # UI components
├── lib/             # Utilities
├── hooks/           # React hooks
└── package.json     # Dependencies
```

---

## 🎨 What's Included

- ✅ Admin Dashboard
- ✅ Responsive Sidebar Navigation
- ✅ 50+ UI Components (Radix UI)
- ✅ Dark Mode Ready
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ Lucide Icons

---

## 📖 Need More Help?

- **Full Setup Guide**: See `STANDALONE_SETUP.md`
- **Usage Documentation**: See `README.md`
- **Comparison**: See `BEFORE_AND_AFTER.md`

---

## ✨ Next Steps

1. ✅ Start dev server
2. 📱 Test responsive design (resize browser)
3. 🎨 Explore the dashboard at `/`
4. 🔧 Add your own pages in `app/` directory
5. 🎯 Connect to your backend API

---

## 🎯 Ready to Go!

Your admin panel is now running at:

```
http://localhost:3001
```

Happy coding! 🚀