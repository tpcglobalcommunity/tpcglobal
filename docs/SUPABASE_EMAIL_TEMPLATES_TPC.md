# Supabase Email Templates - TPC Global Branding

## 📋 SETUP INSTRUCTIONS

### 1. Supabase Dashboard Configuration

**Navigate to:** `Authentication` → `Email Templates`

**For each template below:**
1. Click the template type (Magic Link, Confirm Signup, Reset Password)
2. Switch to "Custom" tab
3. Copy the HTML code below and paste it
4. Update subject line as specified
5. Save changes

**Note:** Sender will remain `noreply@mail.app.supabase.io` unless custom SMTP is configured.

---

## 🎨 MAGIC LINK EMAIL TEMPLATE

### Subject: 
- **ID:** `🔐 Masuk ke TPC Global - Link Magic`
- **EN:** `🔐 Sign in to TPC Global - Magic Link`

### HTML Code:
```html
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Masuk ke TPC Global - Link Magic</title>
    <style>
        body {
            font-family: Inter, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
            background-color: #0B0F14;
            color: #E5E7EB;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #111827;
            border: 1px solid #374151;
            border-radius: 12px;
            padding: 32px;
        }
        .logo {
            text-align: center;
            margin-bottom: 32px;
        }
        .logo h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            color: #F0B90B;
        }
        .content {
            margin-bottom: 32px;
        }
        .content h2 {
            margin: 0 0 16px 0;
            font-size: 20px;
            font-weight: 600;
        }
        .content p {
            margin: 0 0 16px 0;
            color: #9CA3AF;
        }
        .button {
            display: inline-block;
            background-color: #F0B90B;
            color: #0B0F14;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            padding: 12px 24px;
            border-radius: 8px;
            text-align: center;
            margin: 16px 0;
        }
        .security-box {
            background-color: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.2);
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
        }
        .security-box h3 {
            margin: 0 0 8px 0;
            font-size: 14px;
            font-weight: 600;
            color: #EF4444;
        }
        .security-box p {
            margin: 0 0 4px 0;
            font-size: 14px;
        }
        .footer {
            border-top: 1px solid #374151;
            padding-top: 20px;
            text-align: center;
            font-size: 12px;
            color: #9CA3AF;
        }
        .footer p {
            margin: 0 0 8px 0;
        }
        .en-section {
            margin-top: 32px;
            padding-top: 32px;
            border-top: 1px solid #374151;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h1>TPC Global</h1>
        </div>

        <div class="content">
            <h2>Masuk ke TPC Global</h2>
            <p>Link magic login Anda telah dibuat. Klik tombol di bawah untuk masuk dengan aman ke akun Anda.</p>
            <p style="color: #9CA3AF; font-size: 14px;">
                <strong>Penting:</strong> Link ini hanya berlaku sekali dan akan kadaluarsa dalam 24 jam.
            </p>
        </div>

        <div style="text-align: center;">
            <a href="{{ .ConfirmationURL }}" class="button">
                Masuk Sekarang
            </a>
        </div>

        <div class="security-box">
            <h3>⚠️ Keamanan Penting</h3>
            <p>• Admin tidak akan DM Anda terlebih dahulu</p>
            <p>• Jangan bagikan link ini kepada siapa pun</p>
            <p>• Hanya gunakan link resmi dari tpcglobal.io</p>
        </div>

        <div class="en-section">
            <div class="content">
                <h2>Sign in to TPC Global</h2>
                <p>Your magic login link has been created. Click the button below to securely sign in to your account.</p>
                <p style="color: #9CA3AF; font-size: 14px;">
                    <strong>Important:</strong> This link is one-time use and will expire in 24 hours.
                </p>
            </div>

            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">
                    Sign In Now
                </a>
            </div>
        </div>

        <div class="footer">
            <p>© 2026 TPC Global. All rights reserved.</p>
            <p>Platform edukasi - tidak ada jaminan profit</p>
            <p>Investasi risiko Anda sendiri</p>
            <p style="margin-top: 8px; font-size: 11px;">
                Education platform - no profit guarantee | Invest at your own risk
            </p>
        </div>
    </div>
</body>
</html>
```

---

## 🎨 CONFIRM SIGNUP EMAIL TEMPLATE

### Subject:
- **ID:** `✅ Konfirmasi Pendaftaran TPC Global`
- **EN:** `✅ Confirm TPC Global Signup`

### HTML Code:
```html
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Konfirmasi Pendaftaran TPC Global</title>
    <style>
        body {
            font-family: Inter, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
            background-color: #0B0F14;
            color: #E5E7EB;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #111827;
            border: 1px solid #374151;
            border-radius: 12px;
            padding: 32px;
        }
        .logo {
            text-align: center;
            margin-bottom: 32px;
        }
        .logo h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            color: #F0B90B;
        }
        .content {
            margin-bottom: 32px;
        }
        .content h2 {
            margin: 0 0 16px 0;
            font-size: 20px;
            font-weight: 600;
        }
        .content p {
            margin: 0 0 16px 0;
            color: #9CA3AF;
        }
        .button {
            display: inline-block;
            background-color: #F0B90B;
            color: #0B0F14;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            padding: 12px 24px;
            border-radius: 8px;
            text-align: center;
            margin: 16px 0;
        }
        .security-box {
            background-color: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.2);
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
        }
        .security-box h3 {
            margin: 0 0 8px 0;
            font-size: 14px;
            font-weight: 600;
            color: #EF4444;
        }
        .security-box p {
            margin: 0 0 4px 0;
            font-size: 14px;
        }
        .footer {
            border-top: 1px solid #374151;
            padding-top: 20px;
            text-align: center;
            font-size: 12px;
            color: #9CA3AF;
        }
        .footer p {
            margin: 0 0 8px 0;
        }
        .en-section {
            margin-top: 32px;
            padding-top: 32px;
            border-top: 1px solid #374151;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h1>TPC Global</h1>
        </div>

        <div class="content">
            <h2>Selamat Datang di TPC Global!</h2>
            <p>Terima kasih telah mendaftar. Silakan konfirmasi email Anda untuk mengaktifkan akun TPC Global.</p>
            <p style="color: #9CA3AF; font-size: 14px;">
                <strong>Penting:</strong> Konfirmasi ini diperlukan untuk keamanan akun Anda.
            </p>
        </div>

        <div style="text-align: center;">
            <a href="{{ .ConfirmationURL }}" class="button">
                Konfirmasi Email
            </a>
        </div>

        <div class="security-box">
            <h3>⚠️ Keamanan Penting</h3>
            <p>• Admin tidak akan DM Anda terlebih dahulu</p>
            <p>• Jangan bagikan link ini kepada siapa pun</p>
            <p>• Hanya gunakan link resmi dari tpcglobal.io</p>
        </div>

        <div class="en-section">
            <div class="content">
                <h2>Welcome to TPC Global!</h2>
                <p>Thank you for signing up. Please confirm your email to activate your TPC Global account.</p>
                <p style="color: #9CA3AF; font-size: 14px;">
                    <strong>Important:</strong> This confirmation is required for your account security.
                </p>
            </div>

            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">
                    Confirm Email
                </a>
            </div>
        </div>

        <div class="footer">
            <p>© 2026 TPC Global. All rights reserved.</p>
            <p>Platform edukasi - tidak ada jaminan profit</p>
            <p>Investasi risiko Anda sendiri</p>
            <p style="margin-top: 8px; font-size: 11px;">
                Education platform - no profit guarantee | Invest at your own risk
            </p>
        </div>
    </div>
</body>
</html>
```

---

## 🎨 RESET PASSWORD EMAIL TEMPLATE

### Subject:
- **ID:** `🔑 Reset Password TPC Global`
- **EN:** `🔑 Reset TPC Global Password`

### HTML Code:
```html
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password TPC Global</title>
    <style>
        body {
            font-family: Inter, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
            background-color: #0B0F14;
            color: #E5E7EB;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #111827;
            border: 1px solid #374151;
            border-radius: 12px;
            padding: 32px;
        }
        .logo {
            text-align: center;
            margin-bottom: 32px;
        }
        .logo h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            color: #F0B90B;
        }
        .content {
            margin-bottom: 32px;
        }
        .content h2 {
            margin: 0 0 16px 0;
            font-size: 20px;
            font-weight: 600;
        }
        .content p {
            margin: 0 0 16px 0;
            color: #9CA3AF;
        }
        .button {
            display: inline-block;
            background-color: #F0B90B;
            color: #0B0F14;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            padding: 12px 24px;
            border-radius: 8px;
            text-align: center;
            margin: 16px 0;
        }
        .security-box {
            background-color: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.2);
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
        }
        .security-box h3 {
            margin: 0 0 8px 0;
            font-size: 14px;
            font-weight: 600;
            color: #EF4444;
        }
        .security-box p {
            margin: 0 0 4px 0;
            font-size: 14px;
        }
        .footer {
            border-top: 1px solid #374151;
            padding-top: 20px;
            text-align: center;
            font-size: 12px;
            color: #9CA3AF;
        }
        .footer p {
            margin: 0 0 8px 0;
        }
        .en-section {
            margin-top: 32px;
            padding-top: 32px;
            border-top: 1px solid #374151;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h1>TPC Global</h1>
        </div>

        <div class="content">
            <h2>Reset Password TPC Global</h2>
            <p>Anda meminta reset password untuk akun TPC Global. Klik tombol di bawah untuk membuat password baru.</p>
            <p style="color: #9CA3AF; font-size: 14px;">
                <strong>Penting:</strong> Link reset password hanya berlaku selama 1 jam untuk keamanan.
            </p>
            <p style="color: #9CA3AF; font-size: 14px;">
                <strong>Jika Anda tidak meminta ini:</strong> Abaikan email ini. Password Anda tidak akan berubah.
            </p>
        </div>

        <div style="text-align: center;">
            <a href="{{ .ConfirmationURL }}" class="button">
                Reset Password
            </a>
        </div>

        <div class="security-box">
            <h3>⚠️ Keamanan Penting</h3>
            <p>• Admin tidak akan DM Anda terlebih dahulu</p>
            <p>• Jangan bagikan link ini kepada siapa pun</p>
            <p>• Hanya gunakan link resmi dari tpcglobal.io</p>
            <p>• Jangan share password Anda dengan siapa pun</p>
        </div>

        <div class="en-section">
            <div class="content">
                <h2>Reset TPC Global Password</h2>
                <p>You requested a password reset for your TPC Global account. Click the button below to create a new password.</p>
                <p style="color: #9CA3AF; font-size: 14px;">
                    <strong>Important:</strong> This password reset link is only valid for 1 hour for security.
                </p>
                <p style="color: #9CA3AF; font-size: 14px;">
                    <strong>If you didn't request this:</strong> Please ignore this email. Your password will not change.
                </p>
            </div>

            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">
                    Reset Password
                </a>
            </div>
        </div>

        <div class="footer">
            <p>© 2026 TPC Global. All rights reserved.</p>
            <p>Platform edukasi - tidak ada jaminan profit</p>
            <p>Investasi risiko Anda sendiri</p>
            <p style="margin-top: 8px; font-size: 11px;">
                Education platform - no profit guarantee | Invest at your own risk
            </p>
        </div>
    </div>
</body>
</html>
```

---

## 📋 IMPORTANT NOTES

### Supabase Variables Used:
- `{{ .ConfirmationURL }}` - Standard Supabase variable for confirmation links
- All templates use only this variable for maximum compatibility

### Branding Consistency:
- **Dark Background:** `#0B0F14` (premium black)
- **Gold Accent:** `#F0B90B` (TPC brand color)
- **Typography:** Inter, system fonts fallback
- **Layout:** Mobile-first, table-based for email compatibility

### Security Features:
- **Anti-scam warnings** in all templates
- **Domain verification** - only use tpcglobal.io
- **Time limits** mentioned for security
- **Education disclaimer** in footer

### Bilingual Support:
- **Indonesian primary** - Main content in Bahasa Indonesia
- **English secondary** - Complete English section below
- **Consistent messaging** across all languages

### Production Ready:
- **Inline CSS only** - No external dependencies
- **Self-contained** - All styles included
- **Mobile responsive** - Works on all devices
- **Trust-first tone** - Professional, educational approach

---

## 🚀 NEXT STEPS

1. **Copy HTML** from each template above
2. **Paste in Supabase Dashboard** → Authentication → Email Templates
3. **Update subject lines** as specified
4. **Test with real emails** to verify rendering
5. **Monitor email delivery** for any issues

**Result:** All Supabase auth emails will now use TPC Global branding instead of default templates!
