import { renderEmailHtml, EmailParams } from '../renderEmail';

interface MagicLinkEmailParams {
  lang: 'id' | 'en';
  magicLinkUrl: string;
}

export function buildMagicLinkEmail({ lang, magicLinkUrl }: MagicLinkEmailParams): string {
  const isId = lang === 'id';
  
  const params: EmailParams = {
    title: isId ? 'Masuk ke TPC Global' : 'Sign in to TPC Global',
    subtitle: isId ? 'Gunakan tombol di bawah untuk masuk dengan aman.' : 'Use the button below to sign in securely.',
    bodyHtml: isId ? `
      <p>Link masuk Anda telah dibuat. Klik tombol di bawah untuk melanjutkan proses login.</p>
      <p style="color: #9CA3AF; font-size: 14px;">
        <strong>Penting:</strong> Link ini hanya berlaku sekali dan akan kadaluarsa dalam 24 jam.
      </p>
      <p style="color: #9CA3AF; font-size: 14px;">
        Jika Anda tidak meminta link ini, abaikan email ini.
      </p>
    ` : `
      <p>Your sign-in link has been created. Click the button below to continue the login process.</p>
      <p style="color: #9CA3AF; font-size: 14px;">
        <strong>Important:</strong> This link is one-time use and will expire in 24 hours.
      </p>
      <p style="color: #9CA3AF; font-size: 14px;">
        If you didn't request this link, please ignore this email.
      </p>
    `,
    primaryCta: {
      label: isId ? 'Masuk Sekarang' : 'Sign In Now',
      url: magicLinkUrl
    },
    lang,
    previewText: isId ? 'Link masuk aman ke TPC Global' : 'Secure sign-in link to TPC Global'
  };

  return renderEmailHtml(params);
}
