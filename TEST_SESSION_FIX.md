# Session Expiry Fix - Testing Guide

## Changes Made

### ✅ **Fixed 3 Critical Session Issues**

1. **KYC Initial Check** (Line 72)
   - Changed `.single()` to `.maybeSingle()`
   - Prevents error when checking if profile exists
   - Now gracefully handles new users without profiles

2. **KYC Error Handling** (Line 79-84)
   - Removed aggressive session clearing
   - Allows user to proceed even if profile check fails
   - Only redirects if there's a real session issue

3. **KYC Submit Check** (Line 157-173)
   - Added debug logging to track session state
   - Changed redirect method to `window.location.href`
   - Gives session time to load before deciding it's expired

4. **Login Profile Check** (Line 104)
   - Changed `.single()` to `.maybeSingle()`
   - Prevents errors for new users without profiles

5. **Login Redirect** (Line 111)
   - Added 300ms delay after login
   - Ensures session is fully established before redirecting
   - Prevents race condition with cookies

---

## Testing Instructions

### **IMPORTANT: Clear Everything First**

```bash
1. Stop dev server (Ctrl + C)
2. Clear browser completely:
   - Cookies for localhost:3000
   - Local Storage
   - Session Storage
   - Cache
   
3. OR use Incognito/Private browsing mode

4. Restart dev server: npm run dev
```

---

### **Test 1: Fresh Signup & Login**

```bash
Step 1: Clear Session
→ Visit: http://localhost:3000/auth/clear-session
→ Wait for redirect to login

Step 2: Create New Account
→ Go to: /auth/signup
→ Use a NEW email you haven't used before
→ Fill form and submit
→ Should redirect to login

Step 3: Login
→ Enter credentials from Step 2
→ Click login
→ Should see "Welcome back!"
→ Should redirect to /auth/kyc after ~300ms

Step 4: Fill KYC Form
→ Should NOT see "Session expired" error
→ Fill all required fields:
  - Username (check availability)
  - Display name
  - Phone number
→ Submit

Step 5: Verify Success
→ Should see "Profile completed successfully!"
→ Should redirect to /dashboard
→ Should NOT be kicked back to login
→ Should NOT see session expired error
```

---

### **Test 2: Debug Session State**

```bash
1. Open Browser DevTools (F12)
2. Go to Console tab
3. Login and go to KYC
4. Fill form and click submit
5. Look for debug log:

   KYC Submit - Session check: {
     hasSession: true,          ← Should be TRUE
     userId: "xxx-xxx-xxx",     ← Should have user ID
     email: "your@email.com"    ← Should have email
   }

6. If hasSession is FALSE:
   - Session is not being stored correctly
   - Check Network tab for failed requests
   - Check cookies are being set
```

---

### **Test 3: Existing User Login**

```bash
1. Logout (or clear session)
2. Login with account that already completed KYC
3. Should redirect directly to /dashboard
4. Should NOT see KYC page
5. Should NOT see session expired
```

---

## What Should Happen Now

### ✅ **Expected Behavior**

```
Login → (300ms delay) → KYC Page
         ↓
    Session established
         ↓
    Fill KYC form
         ↓
    Submit (session check passes)
         ↓
    Profile saved
         ↓
    Dashboard ✅
```

### ❌ **Old Broken Behavior**

```
Login → KYC Page
         ↓
    Fill KYC form
         ↓
    Submit → .single() throws error
         ↓
    Catch block clears session
         ↓
    "Session expired" error
         ↓
    Kicked to login ❌
```

---

## If Still Getting "Session Expired"

### **Check 1: Browser Console**

```
F12 → Console tab
Look for the debug log:

"KYC Submit - Session check: { hasSession: false }"

If hasSession is false, the problem is:
→ Session is not being stored after login
→ Cookies are not being set
→ Supabase client issue
```

### **Check 2: Network Tab**

```
F12 → Network tab
Filter: Fetch/XHR

After login, you should see:
✅ POST to /api/auth/set-session (200 OK)
✅ GET to Supabase auth endpoint (200 OK)

If you see errors:
→ 401: Authentication failed
→ 403: Permission denied
→ 500: Server error
```

### **Check 3: Application Tab**

```
F12 → Application tab (Chrome) or Storage tab (Firefox)

Check Cookies for localhost:3000:
Should see cookies like:
- sb-{project}-auth-token
- sb-{project}-auth-token-code-verifier

If no cookies:
→ Supabase client not storing session
→ Check .env.local configuration
→ Verify Supabase URL and keys
```

### **Check 4: Supabase Dashboard**

```
1. Go to Supabase Dashboard
2. Authentication → Users
3. Find your user
4. Check:
   - User exists ✅
   - Email confirmed (if required)
   - Last sign in time (should be recent)
```

---

## Common Issues & Solutions

### **Issue 1: Debug log shows hasSession: false**

**Solution**:
```
1. Check if login actually succeeded
2. Verify cookies are being set (Application tab)
3. Try logging in again with hard refresh
4. Check .env.local has correct Supabase credentials
```

### **Issue 2: Still redirecting to login**

**Solution**:
```
1. Clear ALL browser data
2. Use incognito mode
3. Check middleware.ts isn't blocking
4. Verify no browser extensions blocking cookies
```

### **Issue 3: Profile not saving**

**Solution**:
```
1. Check database RLS policies
2. Verify profiles table exists
3. Check Supabase logs for errors
4. Ensure user ID matches session user ID
```

### **Issue 4: Username check still showing 406**

**Solution**:
```
Already fixed with maybeSingle()
If still happening:
1. Hard refresh browser
2. Check if dev server restarted
3. Verify code changes were saved
```

---

## Expected Console Output

### ✅ **Good Output**

```javascript
// After login:
✓ Supabase connection successful
POST /api/auth/set-session 200 OK

// On KYC page load:
No errors

// Username check:
No 406 errors

// On KYC submit:
KYC Submit - Session check: {
  hasSession: true,
  userId: "abc-123-def",
  email: "user@example.com"
}

Profile completed successfully!
```

### ❌ **Bad Output**

```javascript
// If you see this, there's still an issue:
KYC Submit - Session check: {
  hasSession: false,  ← Problem!
  userId: undefined,
  email: undefined
}

No session found during KYC submit
Session expired. Please log in again.
```

---

## Files Changed

1. ✅ `app/auth/kyc/page.tsx`
   - Line 72: `.single()` → `.maybeSingle()`
   - Lines 79-84: Removed aggressive session clearing
   - Lines 157-173: Added debug logging, improved error handling

2. ✅ `app/auth/login/page.tsx`
   - Line 104: `.single()` → `.maybeSingle()`
   - Line 111: Added 300ms delay before redirect

---

## Summary

### Problems Fixed:
- ✅ Session no longer clears on profile check errors
- ✅ `.single()` errors don't break the flow
- ✅ 300ms delay ensures session is established
- ✅ Debug logging helps identify issues
- ✅ Graceful error handling throughout

### What You Should See:
- ✅ No "Session expired" errors
- ✅ No 406 errors in console
- ✅ Smooth login → KYC → dashboard flow
- ✅ Profile saves successfully
- ✅ No unexpected logouts

---

**Try the complete flow now with a fresh browser session!**

If you still get "Session expired", check the console debug log and let me know what `hasSession` value shows.
