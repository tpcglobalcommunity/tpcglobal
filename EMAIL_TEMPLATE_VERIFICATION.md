# Premium Email Template for TPC Global Email Verification

## Subject
Verify your TPC Global account

## HTML Template
```html
<div style="background:#0b0f17;margin:0;padding:0;width:100%;">
  <div style="max-width:640px;margin:0 auto;padding:28px 16px;font-family:Inter,Segoe UI,Arial,sans-serif;color:#e7edf7;">
    <div style="background:linear-gradient(180deg,#101827 0%,#0b0f17 100%);border:1px solid rgba(240,185,11,.18);border-radius:16px;overflow:hidden;">
      <div style="padding:22px;border-bottom:1px solid rgba(240,185,11,.12);">
        <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#f0b90b;">
          TPC Global • Trader Professional Community
        </div>
        <h1 style="margin:10px 0 6px;font-size:22px;color:#fff;">Verify your email</h1>
        <p style="font-size:14px;color:rgba(231,237,247,.82);">
          We need to confirm this email address before you can access your account.
        </p>
      </div>

      <div style="padding:22px;">
        <p style="font-size:13px;">
          <strong>Account:</strong> {{ .Email }}
        </p>

        <div style="margin-top:14px;padding:14px;border:1px solid rgba(240,185,11,.15);border-radius:12px;background:rgba(240,185,11,.06);">
          <p><strong>Indonesia:</strong><br/>
          Kami menerima pendaftaran akun TPC Global. Untuk mengaktifkan akun, silakan verifikasi email dengan menekan tombol di bawah.</p>
          <p><strong>English:</strong><br/>
          We received a sign-up request for TPC Global. To activate your account, please verify your email below.</p>
        </div>

        <div style="margin-top:18px;">
          <a href="{{ .ConfirmationURL }}"
             style="display:inline-block;padding:12px 18px;border-radius:12px;background:#f0b90b;color:#0b0f17;text-decoration:none;font-weight:800;">
            Verify Email
          </a>
        </div>

        <div style="margin-top:16px;padding:12px;border:1px solid rgba(255,255,255,.1);border-radius:8px;background:rgba(255,255,255,.02);">
          <p style="font-size:12px;color:rgba(231,237,247,.68);margin:0;">
            <strong>Security Notice:</strong> For your account security, please verify your email within 24 hours. This link expires after 24 hours for your protection.
          </p>
        </div>

        <p style="margin-top:16px;font-size:12px;color:rgba(231,237,247,.68);">
          If you did not request this account creation, you can safely ignore this email.
        </p>

        <p style="font-size:12px;color:rgba(231,237,247,.6);">
          Trouble clicking the button? Copy this link:<br/>
          <span style="word-break:break-all;color:#f0b90b;">{{ .ConfirmationURL }}</span>
        </p>
      </div>
    </div>

    <div style="margin-top:14px;padding:16px;border:1px solid rgba(240,185,11,.1);border-radius:12px;background:rgba(240,185,11,.02);">
      <p style="font-size:11px;text-align:center;color:rgba(231,237,247,.5);margin:0;">
        <strong>TPC Global</strong><br/>
        Professional Trading Community<br/>
        <span style="color:#f0b90b;">Security • Education • Transparency</span>
      </p>
    </div>

    <p style="margin-top:14px;font-size:11px;text-align:center;color:rgba(231,237,247,.5);">
      This email was sent by TPC Global. Never share verification links with anyone.
    </p>
  </div>
</div>
```

## Plain Text Template
```
TPC Global • Trader Professional Community

Verify your email
Account: {{ .Email }}

Indonesia:
Kami menerima pendaftaran akun TPC Global. Untuk mengaktifkan akun:
{{ .ConfirmationURL }}

English:
We received a sign-up request for TPC Global. To activate your account:
{{ .ConfirmationURL }}

Security Notice:
Please verify your email within 24 hours. This link expires after 24 hours for your protection.

---
TPC Global
Professional Trading Community
Security • Education • Transparency

This email was sent by TPC Global. Never share verification links with anyone.
```

## Template Features

### Professional Design
- Dark theme matching TPC Global branding
- Gold accent colors (#f0b90b)
- Clean, modern layout
- Responsive design for all devices

### Security Elements
- Clear security notice with 24-hour expiration
- Verification link safety information
- Professional footer with brand values

### Bilingual Support
- Indonesian and English content
- Clear separation of languages
- Consistent messaging across both

### Trust Signals
- Professional branding
- Security-focused messaging
- Clear call-to-action
- Support information

### Technical Specifications
- Uses Supabase variables: {{ .Email }} and {{ .ConfirmationURL }}
- Inline CSS for maximum email client compatibility
- Fallback text for email clients that don't support HTML
- Responsive design with mobile-first approach

## Implementation Instructions

1. Go to Supabase Dashboard → Authentication → Email Templates
2. Select "Confirm signup" template
3. Replace subject with: "Verify your TPC Global account"
4. Paste the HTML template in the HTML body field
5. Paste the plain text template in the text body field
6. Save and test with a new signup

This template provides a premium, secure, and professional email verification experience that matches TPC Global's fintech standards.
