# Eddy — Setup Guide

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project** → name it `eddy` (or whatever you like)
3. Disable Google Analytics (not needed) → **Create project**

## 2. Enable Google Auth

1. In Firebase Console → **Authentication** → **Get started**
2. Click **Google** under Sign-in providers → **Enable**
3. Set your support email to `brhnyc1970@gmail.com`
4. **Save**

## 3. Create Firestore Database

1. In Firebase Console → **Firestore Database** → **Create database**
2. Choose **Start in production mode**
3. Select a region close to you (e.g., `us-east1`)
4. Once created, go to **Rules** tab
5. Replace the default rules with the contents of `firestore.rules` from this project
6. **Publish**

## 4. Register Web App

1. In Firebase Console → **Project Settings** (gear icon) → **General**
2. Scroll down → click **Add app** → choose **Web** (`</>`)
3. Register app name: `eddy`
4. Copy the `firebaseConfig` object values

## 5. Configure Environment

1. Copy `.env.example` to `.env`:
   ```
   cp .env.example .env
   ```
2. Fill in the values from step 4:
   ```
   VITE_FIREBASE_API_KEY=AIza...
   VITE_FIREBASE_AUTH_DOMAIN=eddy-xxxxx.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=eddy-xxxxx
   VITE_FIREBASE_STORAGE_BUCKET=eddy-xxxxx.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   ```

## 6. Add Authorized Domains

1. In Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. Add your Vercel domain (e.g., `eddy-xyz.vercel.app`)
3. `localhost` is already there for dev

## 7. Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:5173 — sign in with your Google account.

## 8. Deploy to Vercel

```bash
npm install -g vercel   # if not already installed
vercel                  # follow prompts
```

In Vercel dashboard → **Settings** → **Environment Variables** → add all `VITE_*` vars from your `.env`.

Redeploy after adding env vars:
```bash
vercel --prod
```

## Access Control

Only these emails can sign in:
- `brhnyc1970@gmail.com` (Brian)
- `nico@humbleconviction.com` (Nico)

This is enforced both client-side (Auth.jsx) and server-side (Firestore rules).
To add someone, update both `src/Auth.jsx` and `firestore.rules`.
