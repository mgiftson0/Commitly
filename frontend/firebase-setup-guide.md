# Firebase Setup Guide

## Step 1: Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Create a project"
3. Project name: `commitly-app`
4. Disable Google Analytics
5. Click "Create project"

## Step 2: Enable Cloud Messaging
1. Project Settings (gear icon) → Cloud Messaging tab
2. Click "Generate key pair" under Web Push certificates
3. Copy VAPID key: `BH4dXcs...` (save this)

## Step 3: Add Web App
1. Project Settings → General tab
2. Click Web icon `</>`
3. App nickname: `commitly-web`
4. Register app
5. Copy config values:

```
apiKey: "AIzaSyC..."
authDomain: "commitly-app.firebaseapp.com"
projectId: "commitly-app"
storageBucket: "commitly-app.appspot.com"
messagingSenderId: "123456789"
appId: "1:123456789:web:abc123"
```

## Step 4: Generate Service Account
1. Project Settings → Service accounts tab
2. Click "Generate new private key"
3. Download JSON file
4. Extract: project_id, client_email, private_key

## Step 5: Update .env.local
Replace these values in your .env.local file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=commitly-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=commitly-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=commitly-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BH4dXcs...

FIREBASE_PROJECT_ID=commitly-app
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@commitly-app.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

## Step 6: Update Service Worker
Replace config in `/public/firebase-messaging-sw.js`:

```javascript
firebase.initializeApp({
  apiKey: "AIzaSyC...",
  authDomain: "commitly-app.firebaseapp.com",
  projectId: "commitly-app",
  storageBucket: "commitly-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
});
```

## Step 7: Run Database Migration
Execute the push_tokens migration in Supabase SQL editor.

## Step 8: Test
1. Start dev server: `npm run dev`
2. Go to Settings → Notifications
3. Click "Enable Notifications"
4. Allow browser permission
5. Check Supabase push_tokens table for saved token