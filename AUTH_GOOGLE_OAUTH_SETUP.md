# Google OAuth Setup for TPC Global

This document provides step-by-step instructions to configure Google OAuth with Supabase for the TPC Global authentication system.

## 🎯 Overview

- **Provider**: Google OAuth 2.0
- **Authentication Flow**: PKCE (Proof Key for Code Exchange)
- **Callback Routes**: `/:lang/auth/callback` (supports `/en/auth/callback` and `/id/auth/callback`)
- **Fallback**: Magic Link email authentication

## 📋 Prerequisites

1. Access to Google Cloud Console
2. Access to Supabase Dashboard
3. Project domain: `tpcglobal.io`
4. Supabase project URL and keys

---

## 🔧 STEP 1: Google Cloud Console Setup

### 1.1 Create OAuth 2.0 Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **+ CREATE CREDENTIALS** → **OAuth 2.0 Client IDs**
5. Select **Web application** as application type
6. Configure:
   - **Name**: `TPC Global Web App`
   - **Authorized JavaScript origins**:
     ```
     https://tpcglobal.io
     http://localhost:8080
     ```
   - **Authorized redirect URIs** (CRITICAL - must include ALL):
     ```
     https://<SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback
     http://localhost:8080/id/auth/callback
     http://localhost:8080/en/auth/callback
     https://tpcglobal.io/id/auth/callback
     https://tpcglobal.io/en/auth/callback
     ```

### 1.2 Get Credentials

After creating the OAuth client:
1. Copy **Client ID** 
2. Copy **Client Secret**
3. Save these securely - you'll need them for Supabase

---

## 🔧 STEP 2: Supabase Dashboard Setup

### 2.1 Enable Google Provider

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** in the list
5. Click to expand and configure:
   - **Enable**: Toggle ON
   - **Client ID**: Paste from Google Cloud Console
   - **Client Secret**: Paste from Google Cloud Console
   - **Save** the configuration

### 2.2 Configure Site URL

1. In Supabase Dashboard → **Authentication** → **URL Configuration**
2. Set **Site URL**: `https://tpcglobal.io`
3. Add **Redirect URLs** (comma-separated):
   ```
   http://localhost:8080/*
   https://tpcglobal.io/*
   ```
4. **Save** the configuration

---

## 🔧 STEP 3: Environment Variables (Already Configured)

Ensure these are in your `.env` file:

```env
VITE_SUPABASE_URL=https://<SUPABASE_PROJECT_REF>.supabase.co
VITE_SUPABASE_ANON_KEY=<SUPABASE_ANON_KEY>
```

---

## 🧪 STEP 4: Testing

### 4.1 Local Testing

1. Start development server: `npm run dev`
2. Navigate to: `http://localhost:8080/id/login`
3. Click **"Masuk dengan Google"** button
4. Expected flow:
   - Redirect to Google OAuth consent screen
   - After approval, redirect to `http://localhost:8080/id/auth/callback`
   - Process authentication and redirect to dashboard

### 4.2 Production Testing

1. Deploy to production
2. Navigate to: `https://tpcglobal.io/id/login`
3. Click **"Masuk dengan Google"** button
4. Expected flow:
   - Redirect to Google OAuth consent screen
   - After approval, redirect to `https://tpcglobal.io/id/auth/callback`
   - Process authentication and redirect to dashboard

---

## 🚨 Troubleshooting

### Error: "Unsupported provider: provider is not enabled"

**Cause**: Google provider not enabled in Supabase
**Solution**: Complete STEP 2.1 - Enable Google Provider in Supabase Dashboard

### Error: "redirect_uri_mismatch"

**Cause**: Redirect URI not configured in Google Cloud Console
**Solution**: 
1. Check the exact URL in the error message
2. Add it to **Authorized redirect URIs** in Google Cloud Console
3. Ensure Supabase redirect URL is included

### Error: "invalid_client"

**Cause**: Invalid Client ID or Client Secret
**Solution**: 
1. Verify credentials in Google Cloud Console
2. Update Supabase provider configuration
3. Ensure no extra spaces or characters

### Error: "access_denied"

**Cause**: User denied consent or OAuth app not verified
**Solution**: 
1. User needs to grant consent
2. For production, ensure OAuth app is verified by Google

---

## 🔄 Callback Flow Technical Details

### OAuth Flow

1. **Initiation**: User clicks Google login
2. **Redirect**: Browser redirects to Google OAuth
3. **Consent**: User grants permission
4. **Callback**: Google redirects to Supabase callback URL
5. **Exchange**: Supabase exchanges code for tokens
6. **Session**: Supabase creates user session
7. **Redirect**: App redirects to callback page
8. **PKCE**: App exchanges code for session
9. **Complete**: User is logged in and redirected to dashboard

### Magic Link Fallback

1. **Initiation**: User submits email
2. **Send**: Supabase sends magic link email
3. **Click**: User clicks link in email
4. **Callback**: Redirect to auth callback page
5. **Session**: Supabase establishes session
6. **Complete**: User is logged in and redirected

---

## 📝 Security Notes

- **HTTPS Required**: Google OAuth requires HTTPS in production
- **Domain Verification**: Ensure `tpcglobal.io` is verified in Google Cloud Console
- **Secret Management**: Never expose Client Secret in frontend code
- **Redirect Validation**: Always validate redirect URLs to prevent open redirects
- **Rate Limiting**: Magic link has built-in rate limiting for security

---

## 🎯 Final Verification Checklist

- [ ] Google OAuth 2.0 Client ID created
- [ ] Redirect URIs configured (including Supabase callback)
- [ ] Supabase Google provider enabled
- [ ] Client ID and Secret correctly entered in Supabase
- [ ] Site URL configured in Supabase
- [ ] Redirect URLs configured in Supabase
- [ ] Local testing successful
- [ ] Production testing successful
- [ ] Error handling works correctly
- [ ] Magic link fallback functional

---

## 📞 Support

If you encounter issues:

1. Check browser console for detailed error messages
2. Verify all URLs match exactly (no trailing slashes)
3. Ensure environment variables are correctly set
4. Check Supabase logs for authentication attempts
5. Review Google Cloud Console OAuth consent screen settings

---

**Last Updated**: January 31, 2026  
**Version**: 1.0  
**Compatible**: Supabase Auth + Google OAuth 2.0
