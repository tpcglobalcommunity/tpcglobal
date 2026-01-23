# TPC Email Templates Setup Guide

This guide explains how to configure email templates in Supabase Auth for TPC's premium authentication emails.

## 📧 Email Templates Overview

TPC uses 4 email templates for user authentication:

1. **Verify Email** - Email verification after signup
2. **Reset Password** - Password reset requests  
3. **Invite User** - Invitation emails for new members
4. **Magic Link** - Passwordless sign-in links

## 🔧 Setup Instructions

### 1. Access Supabase Dashboard

1. Go to [supabase.com](https://supabase.com)
2. Select your TPC project
3. Navigate to **Authentication** → **Email Templates**

### 2. Configure Each Template

#### A) Confirm Signup Template
1. Click **Confirm signup** template
2. **Subject (EN):** "Verify your TPC account"
3. **Subject (ID):** "Verifikasi akun TPC Anda"
4. **Body:** Copy contents from `emails/verify.html`
5. **Variables:** `{{ .ConfirmationURL }}`

#### B) Reset Password Template  
1. Click **Reset password** template
2. **Subject (EN):** "Reset your TPC password"
3. **Subject (ID):** "Reset kata sandi TPC Anda"
4. **Body:** Copy contents from `emails/reset.html`
5. **Variables:** `{{ .RecoveryURL }}`

#### C) Invite User Template
1. Click **Invite user** template  
2. **Subject (EN):** "You're invited to join TPC"
3. **Subject (ID):** "Anda diundang ke TPC"
4. **Body:** Copy contents from `emails/invite.html`
5. **Variables:** `{{ .InvitationURL }}`

#### D) Magic Link Template
1. Click **Magic link** template
2. **Subject (EN):** "Sign in to TPC"
3. **Subject (ID):** "Masuk ke TPC"  
4. **Body:** Copy contents from `emails/magic-link.html`
5. **Variables:** `{{ .MagicLinkURL }}`

## ✅ Testing Checklist

### Test Email Verification Flow
1. Sign up with a new account
2. Check email for verification link
3. Click verification link
4. Confirm successful account activation

### Test Password Reset Flow  
1. Request password reset from sign-in page
2. Check email for reset link
3. Click reset link
4. Create new password
5. Confirm successful sign-in

### Test Invitation Flow
1. Generate invitation code from admin panel
2. Send invitation to test email
3. Click invitation link
4. Complete signup process
5. Confirm successful account creation

### Test Magic Link Flow
1. Request magic link from sign-in page
2. Check email for sign-in link
3. Click magic link
4. Confirm automatic sign-in

## 🎨 Template Features

### Design Elements
- **Dark theme** with gold accent colors (#F0B90B)
- **Responsive** design for mobile and desktop
- **Bilingual** support (English + Indonesian)
- **Premium** branding consistent with TPC website
- **Security notices** for link expiration warnings

### Security Features
- **Link expiration** times:
  - Verification: 24 hours
  - Password reset: 1 hour  
  - Invitation: 7 days
  - Magic link: 1 hour
- **Security warnings** for unauthorized requests
- **No sensitive data** in email content

## 🚀 Deployment Notes

- Templates are **production-ready** with inline CSS
- **No external dependencies** required
- **Supabase variables** automatically populated:
  - `{{ .ConfirmationURL }}` - Email verification link
  - `{{ .RecoveryURL }}` - Password reset link  
  - `{{ .InvitationURL }}` - Invitation signup link
  - `{{ .MagicLinkURL }}` - Magic sign-in link

## 📞 Support

If you encounter issues with email template setup:

1. **Check Supabase Auth settings** are enabled
2. **Verify email provider** is configured in Supabase
3. **Test with different email providers** (Gmail, Outlook, etc.)
4. **Check spam folders** for missing emails
5. **Contact TPC support** for assistance

---

**Note:** These templates are designed specifically for TPC's premium authentication experience and should not be modified without understanding the impact on user experience.
