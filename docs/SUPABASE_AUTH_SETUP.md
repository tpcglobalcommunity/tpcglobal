# Supabase Auth Configuration - TPC Global

## 📋 SETUP CHECKLIST

### 1. URL Configuration (Authentication → URL Configuration)

**Site URL:**
- Production: `https://tpcglobal.io`
- Development: `http://localhost:8080`

**Redirect URLs (Add all):**
```
https://tpcglobal.io/auth/callback
https://tpcglobal.io/id/auth/callback
https://tpcglobal.io/en/auth/callback
http://localhost:8080/auth/callback
http://localhost:8080/id/auth/callback
http://localhost:8080/en/auth/callback
```

### 2. Email Templates (Authentication → Email Templates)

#### Magic Link Template
1. Copy content from: `docs/SUPABASE_MAGIC_LINK_TEMPLATE.html`
2. Paste into Magic Link template editor
3. Subject: `🔐 Masuk ke TPC Global - Link Magic`

#### Confirm Signup Template
1. Copy content from: `docs/SUPABASE_CONFIRM_SIGNUP_TEMPLATE.html`
2. Paste into Confirm Signup template editor
3. Subject: `✅ Konfirmasi Pendaftaran TPC Global`

#### Reset Password Template
1. Copy content from: `docs/SUPABASE_RESET_PASSWORD_TEMPLATE.html`
2. Paste into Reset Password template editor
3. Subject: `🔑 Reset Password TPC Global`

### 3. Optional: Custom SMTP (Authentication → SMTP Settings)

**If you want custom sender domain (noreply@tpcglobal.io):**

**SendGrid Setup:**
1. Sign up for SendGrid account
2. Verify your domain: `tpcglobal.io`
3. Create API Key
4. Configure in Supabase:
   - SMTP Host: `smtp.sendgrid.net`
   - SMTP Port: `587`
   - SMTP User: `apikey`
   - SMTP Password: `your-sendgrid-api-key`
   - Sender Email: `noreply@tpcglobal.io`
   - Sender Name: `TPC Global`

**Alternative: Mailgun/SES**
- Similar setup process with respective SMTP settings

## 🔄 AUTH FLOW CONFIRMATION

### Current Implementation:
✅ **Magic Link Login** (Passwordless)
- Uses `supabase.auth.signInWithOtp()`
- Redirects to: `{{SITE_URL}}/{{lang}}/auth/callback`
- No password required - email only

### Auth Callback Flow:
1. User clicks magic link
2. Lands on `/id/auth/callback` or `/en/auth/callback`
3. `AuthCallback` component processes session
4. Redirects to:
   - Admin users: `/id/admin`
   - Regular users: `/id/dashboard`

## 📧 EMAIL TEMPLATES FEATURES

### Premium Design:
- **Dark background**: `#0B0F14` (premium black)
- **Gold accent**: `#F0B90B` (TPC brand color)
- **TPC branding**: Consistent with website
- **Mobile responsive**: Works on all devices

### Security Features:
- **Anti-scam warnings**: Never share links, admin won't DM first
- **Domain verification**: Only use tpcglobal.io
- **Time limits**: Links expire (24h magic link, 1h password reset)

### Bilingual Support:
- **Primary**: Indonesian (ID)
- **Secondary**: English (EN) section
- **Consistent messaging**: Both languages included

### Trust Elements:
- **Education disclaimer**: No profit guarantee
- **Risk warning**: Invest at your own risk
- **Professional tone**: Trust-first approach

## 🚀 TESTING INSTRUCTIONS

### Development (localhost:8080):
1. Go to `/id/login`
2. Enter email
3. Check email for magic link (TPC branded)
4. Click link → should land on `/id/auth/callback`
5. Should redirect to `/id/dashboard`

### Production (tpcglobal.io):
1. Same flow with production URLs
2. Verify all redirect URLs work
3. Test both `/id/login` and `/en/login`

### Email Verification:
- ✅ No default Supabase templates
- ✅ TPC branding visible
- ✅ Links point to correct domain
- ✅ Security warnings included
- ✅ Bilingual content present

## 🔧 TROUBLESHOOTING

### Common Issues:

**"Confirm your signup" instead of magic link:**
- Ensure you're using `signInWithOtp()` not `signUp()`
- Check email template is Magic Link, not Confirm Signup

**Link doesn't work:**
- Verify redirect URLs in Supabase dashboard
- Check callback route exists in your app
- Ensure `SITE_URL` is correct in config

**Still default emails:**
- Verify templates are saved in Supabase
- Check SMTP settings if using custom sender
- Test with different email providers

### Debug Mode:
Add console logging to `AuthCallback.tsx` to see session data:
```javascript
console.log('Session:', session);
console.log('User email:', session.user?.email);
```

## 📞 SUPPORT

If you encounter issues:
1. Check Supabase logs (Authentication → Logs)
2. Verify all URLs are correctly configured
3. Test with different email providers
4. Ensure templates are properly saved

## 🎯 SUCCESS METRICS

✅ **Working:**
- Magic link emails with TPC branding
- Correct redirect URLs
- Auth callback processing
- Admin/user routing

✅ **Verified:**
- No default Supabase emails
- Mobile responsive design
- Security warnings included
- Bilingual content

🚀 **Ready for production deployment!**
