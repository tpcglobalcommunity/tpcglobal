// Premium Bilingual Email Templates for TPC Supabase Auth
// These templates are designed for professional fintech products with bilingual support

export const EMAIL_TEMPLATES = {
  // Confirm signup verification email
  confirm_signup: {
    subject: "Verify your email to activate your TPC account",
    html: `<div style="background:#0b0f17;margin:0;padding:0;width:100%;">
  <div style="max-width:640px;margin:0 auto;padding:28px 16px;font-family:Inter,Segoe UI,Arial,sans-serif;color:#e7edf7;">
    <div style="background:linear-gradient(180deg,#101827 0%,#0b0f17 100%);border:1px solid rgba(240,185,11,.18);border-radius:16px;overflow:hidden;">
      <div style="padding:22px;border-bottom:1px solid rgba(240,185,11,.12);">
        <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#f0b90b;">
          TPC • Trader Professional Community
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
          Kami menerima pendaftaran akun TPC. Untuk mengaktifkan akun, silakan verifikasi email dengan menekan tombol di bawah.</p>
          <p><strong>English:</strong><br/>
          We received a sign-up request for TPC. To activate your account, please verify your email below.</p>
        </div>

        <div style="margin-top:18px;">
          <a href="{{ .ConfirmationURL }}"
             style="display:inline-block;padding:12px 18px;border-radius:12px;background:#f0b90b;color:#0b0f17;text-decoration:none;font-weight:800;">
            Verify Email
          </a>
        </div>

        <p style="margin-top:16px;font-size:12px;color:rgba(231,237,247,.68);">
          If you did not request this, you can safely ignore this email.
        </p>

        <p style="font-size:12px;color:rgba(231,237,247,.6);">
          Trouble clicking the button? Copy this link:<br/>
          <span style="word-break:break-all;color:#f0b90b;">{{ .ConfirmationURL }}</span>
        </p>
      </div>
    </div>

    <p style="margin-top:14px;font-size:11px;text-align:center;color:rgba(231,237,247,.5);">
      This email was sent by TPC. Never share verification links with anyone.
    </p>
  </div>
</div>`,
    text: `TPC • Trader Professional Community

Verify your email
Account: {{ .Email }}

Indonesia:
Verifikasi email Anda untuk mengaktifkan akun TPC:
{{ .ConfirmationURL }}

English:
Verify your email to activate your account:
{{ .ConfirmationURL }}`
  },

  // Reset password email
  reset_password: {
    subject: "Reset your TPC password",
    html: `<div style="background:#0b0f17;margin:0;padding:0;width:100%;">
  <div style="max-width:640px;margin:0 auto;padding:28px 16px;font-family:Inter,Segoe UI,Arial,sans-serif;color:#e7edf7;">
    <div style="background:linear-gradient(180deg,#101827 0%,#0b0f17 100%);border:1px solid rgba(240,185,11,.18);border-radius:16px;overflow:hidden;">
      <div style="padding:22px;border-bottom:1px solid rgba(240,185,11,.12);">
        <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#f0b90b;">
          TPC • Trader Professional Community
        </div>
        <h1 style="margin:10px 0 6px;font-size:22px;color:#fff;">Reset your password</h1>
        <p style="font-size:14px;color:rgba(231,237,247,.82);">
          We received a password reset request for your TPC account.
        </p>
      </div>

      <div style="padding:22px;">
        <p style="font-size:13px;">
          <strong>Account:</strong> {{ .Email }}
        </p>

        <div style="margin-top:14px;padding:14px;border:1px solid rgba(240,185,11,.15);border-radius:12px;background:rgba(240,185,11,.06);">
          <p><strong>Indonesia:</strong><br/>
          Kami menerima permintaan reset password untuk akun TPC. Untuk melanjutkan, silakan klik tombol di bawah.</p>
          <p><strong>English:</strong><br/>
          We received a password reset request for your TPC account. To continue, please click the button below.</p>
        </div>

        <div style="margin-top:18px;">
          <a href="{{ .RecoveryURL }}"
             style="display:inline-block;padding:12px 18px;border-radius:12px;background:#f0b90b;color:#0b0f17;text-decoration:none;font-weight:800;">
            Reset Password
          </a>
        </div>

        <p style="margin-top:16px;font-size:12px;color:rgba(231,237,247,.68);">
          If you did not request this, you can safely ignore this email.
        </p>

        <p style="font-size:12px;color:rgba(231,237,247,.6);">
          Trouble clicking the button? Copy this link:<br/>
          <span style="word-break:break-all;color:#f0b90b;">{{ .RecoveryURL }}</span>
        </p>
      </div>
    </div>

    <p style="margin-top:14px;font-size:11px;text-align:center;color:rgba(231,237,247,.5);">
      This email was sent by TPC. Never share password reset links with anyone.
    </p>
  </div>
</div>`,
    text: `TPC • Trader Professional Community

Reset your password
Account: {{ .Email }}

Indonesia:
Kami menerima permintaan reset password untuk akun TPC:
{{ .RecoveryURL }}

English:
We received a password reset request for your TPC account:
{{ .RecoveryURL }}`
  },

  // Magic link email (passwordless login)
  magic_link: {
    subject: "Your secure sign-in link for TPC",
    html: `<div style="background:#0b0f17;margin:0;padding:0;width:100%;">
  <div style="max-width:640px;margin:0 auto;padding:28px 16px;font-family:Inter,Segoe UI,Arial,sans-serif;color:#e7edf7;">
    <div style="background:linear-gradient(180deg,#101827 0%,#0b0f17 100%);border:1px solid rgba(240,185,11,.18);border-radius:16px;overflow:hidden;">
      <div style="padding:22px;border-bottom:1px solid rgba(240,185,11,.12);">
        <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#f0b90b;">
          TPC • Trader Professional Community
        </div>
        <h1 style="margin:10px 0 6px;font-size:22px;color:#fff;">Your secure sign-in link</h1>
        <p style="font-size:14px;color:rgba(231,237,247,.82);">
          Click below to sign in to your TPC account securely without a password.
        </p>
      </div>

      <div style="padding:22px;">
        <p style="font-size:13px;">
          <strong>Account:</strong> {{ .Email }}
        </p>

        <div style="margin-top:14px;padding:14px;border:1px solid rgba(240,185,11,.15);border-radius:12px;background:rgba(240,185,11,.06);">
          <p><strong>Indonesia:</strong><br/>
          Gunakan tautan aman ini untuk masuk ke akun TPC Anda dengan aman tanpa password.</p>
          <p><strong>English:</strong><br/>
          Click below to securely sign in to your TPC account without using a password.</p>
        </div>

        <div style="margin-top:18px;">
          <a href="{{ .MagicLink }}"
             style="display:inline-block;padding:12px 18px;border-radius:12px;background:#f0b90b;color:#0b0f17;text-decoration:none;font-weight:800;">
            Sign In Securely
          </a>
        </div>

        <p style="margin-top:16px;font-size:12px;color:rgba(231,237,247,.68);">
          This link expires in 1 hour for security reasons.
        </p>

        <p style="font-size:12px;color:rgba(231,237,247,.6);">
          Trouble clicking the button? Copy this link:<br/>
          <span style="word-break:break-all;color:#f0b90b;">{{ .MagicLink }}</span>
        </p>
      </div>
    </div>

    <p style="margin-top:14px;font-size:11px;text-align:center;color:rgba(231,237,247,.5);">
      This email was sent by TPC. Never share sign-in links with anyone.
    </p>
  </div>
</div>`,
    text: `TPC • Trader Professional Community

Your secure sign-in link for TPC
Account: {{ .Email }}

Indonesia:
Gunakan tautan aman ini untuk masuk ke akun TPC Anda:
{{ .MagicLink }}

English:
Click below to securely sign in to your TPC account:
{{ .MagicLink }}`
  },

  // Invite user email
  invite_user: {
    subject: "You've been invited to join TPC",
    html: `<div style="background:#0b0f17;margin:0;padding:0;width:100%;">
  <div style="max-width:640px;margin:0 auto;padding:28px 16px;font-family:Inter,Segoe UI,Arial,sans-serif;color:#e7edf7;">
    <div style="background:linear-gradient(180deg,#101827 0%,#0b0f17 100%);border:1px solid rgba(240,185,11,.18);border-radius:16px;overflow:hidden;">
      <div style="padding:22px;border-bottom:1px solid rgba(240,185,11,.12);">
        <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#f0b90b;">
          TPC • Trader Professional Community
        </div>
        <h1 style="margin:10px 0 6px;font-size:22px;color:#fff;">You've been invited to join TPC</h1>
        <p style="font-size:14px;color:rgba(231,237,247,.82);">
          You've received an invitation to join the Trader Professional Community.
        </p>
      </div>

      <div style="padding:22px;">
        <p style="font-size:13px;">
          <strong>Invited by:</strong> {{ .Email }}
        </p>

        <div style="margin-top:14px;padding:14px;border:1px solid rgba(240,185,11,.15);border-radius:12px;background:rgba(240,185,11,.06);">
          <p><strong>Indonesia:</strong><br/>
          Anda diundang untuk bergabung dengan komunitas TPC. Untuk menerima undangan, silakan klik tombol di bawah.</p>
          <p><strong>English:</strong><br/>
          You've been invited to join the Trader Professional Community. To accept the invitation, please click the button below.</p>
        </div>

        <div style="margin-top:18px;">
          <a href="{{ .InviteURL }}"
             style="display:inline-block;padding:12px 18px;border-radius:12px;background:#f0b90b;color:#0b0f17;text-decoration:none;font-weight:800;">
            Accept Invitation
          </a>
        </div>

        <p style="margin-top:16px;font-size:12px;color:rgba(231,237,247,.68);">
          This invitation expires in 7 days for security reasons.
        </p>

        <p style="font-size:12px;color:rgba(231,237,247,.6);">
          Trouble clicking the button? Copy this link:<br/>
          <span style="word-break:break-all;color:#f0b90b;">{{ .InviteURL }}</span>
        </p>
      </div>
    </div>

    <p style="margin-top:14px;font-size:11px;text-align:center;color:rgba(231,237,247,.5);">
      This email was sent by TPC. Never share invitation links with anyone.
    </p>
  </div>
</div>`,
    text: `TPC • Trader Professional Community

You've been invited to join TPC
Invited by: {{ .Email }}

Indonesia:
Anda diundang untuk bergabung dengan komunitas TPC:
{{ .InviteURL }}

English:
You've been invited to join the Trader Professional Community:
{{ .InviteURL }}`
  }
};
