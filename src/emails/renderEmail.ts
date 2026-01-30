import { getEmailBaseStyles } from './emailStyles';

export interface EmailParams {
  title: string;
  subtitle?: string;
  bodyHtml: string;
  primaryCta?: {
    label: string;
    url: string;
  };
  secondaryCta?: {
    label: string;
    url: string;
  };
  lang: 'id' | 'en';
  previewText?: string;
}

export function renderEmailHtml(params: EmailParams): string {
  const styles = getEmailBaseStyles();
  
  const isId = params.lang === 'id';
  
  const securityBox = isId ? `
    <div style="${styles.securityBox}">
      <p style="margin: 0 0 8px 0; font-weight: 600; color: #EF4444;">⚠️ Keamanan Penting</p>
      <p style="margin: 0 0 4px 0;">• Admin tidak akan DM Anda terlebih dahulu</p>
      <p style="margin: 0 0 4px 0;">• Jangan bagikan link/OTP ini kepada siapa pun</p>
      <p style="margin: 0;">• Hanya gunakan link resmi dari website kami</p>
    </div>
  ` : `
    <div style="${styles.securityBox}">
      <p style="margin: 0 0 8px 0; font-weight: 600; color: #EF4444;">⚠️ Security Alert</p>
      <p style="margin: 0 0 4px 0;">• Admin will never DM you first</p>
      <p style="margin: 0 0 4px 0;">• Never share this link/OTP with anyone</p>
      <p style="margin: 0;">• Only use official website links</p>
    </div>
  `;

  const footer = isId ? `
    <div style="${styles.footer}">
      <p style="margin: 0 0 8px 0;">© 2026 TPC Global. All rights reserved.</p>
      <p style="margin: 0 0 8px 0;">Platform edukasi - tidak ada jaminan profit</p>
      <p style="margin: 0;">Investasi risiko Anda sendiri</p>
    </div>
  ` : `
    <div style="${styles.footer}">
      <p style="margin: 0 0 8px 0;">© 2026 TPC Global. All rights reserved.</p>
      <p style="margin: 0 0 8px 0;">Education platform - no profit guarantee</p>
      <p style="margin: 0;">Invest at your own risk</p>
    </div>
  `;

  return `<!DOCTYPE html>
<html lang="${params.lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${params.title}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { border-collapse: collapse; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
    }
  </style>
</head>
<body style="${styles.container}">
  <div class="email-container">
    <div style="${styles.card}">
      <!-- Logo/Brand -->
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: ${styles.colors.gold};">
          TPC Global
        </h1>
      </div>

      <!-- Title -->
      <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 600;">
        ${params.title}
      </h2>

      <!-- Subtitle -->
      ${params.subtitle ? `
        <p style="margin: 0 0 24px 0; color: ${styles.colors.muted}; font-size: 16px;">
          ${params.subtitle}
        </p>
      ` : ''}

      <!-- Body Content -->
      <div style="${styles.text}">
        ${params.bodyHtml}
      </div>

      <!-- Primary CTA -->
      ${params.primaryCta ? `
        <div style="text-align: center;">
          <a href="${params.primaryCta.url}" style="${styles.button}">
            ${params.primaryCta.label}
          </a>
        </div>
      ` : ''}

      <!-- Secondary CTA -->
      ${params.secondaryCta ? `
        <div style="text-align: center;">
          <a href="${params.secondaryCta.url}" style="${styles.button} background-color: transparent; border: 1px solid ${styles.colors.gold};">
            ${params.secondaryCta.label}
          </a>
        </div>
      ` : ''}

      <!-- Security Box -->
      ${securityBox}

      <!-- Divider -->
      <div style="${styles.divider}"></div>

      <!-- Footer -->
      ${footer}
    </div>
  </div>
</body>
</html>`;
}
