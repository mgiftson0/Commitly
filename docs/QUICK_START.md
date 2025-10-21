# Quick Start - Commitly App

## 🚀 Start the App

### Option 1: Using the Startup Script (Recommended)
```powershell
cd C:\Users\mgift\OneDrive\Desktop\Commitly\Commitly
.\start-dev.ps1
```

### Option 2: Manual Start
```powershell
cd C:\Users\mgift\OneDrive\Desktop\Commitly\Commitly
Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
npm run dev
```

Then open: **http://localhost:3000**

## ✅ What's Fixed

- ✅ **500 Error** - Resolved
- ✅ **Supabase Authentication** - Fully working
- ✅ **Login/Signup** - Functional
- ✅ **Google OAuth** - Enabled
- ✅ **Client-side rendering** - Fixed

## 🎯 Test These Routes

- **Home**: http://localhost:3000
- **Login**: http://localhost:3000/auth/login
- **Signup**: http://localhost:3000/auth/signup

## 🔧 If You See Errors

### Clear cache and restart:
```powershell
Remove-Item -Path ".next" -Recurse -Force
npm run dev
```

### Then hard refresh browser:
Press `Ctrl + Shift + R`

## 📚 Documentation

- **Full Fix Details**: See `FIX_SUMMARY.md`
- **Original Setup**: See `SETUP_GUIDE.md`

## 🎉 Ready to Go!

Your authentication is fully functional. Try creating an account!
