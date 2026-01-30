// Email Templates for Supabase Edge Functions
import { createClient } from '@supabase/supabase-js';

const colors = {
  background: '#0B0F14',
  card: '#111827',
  gold: '#F0B90B',
  text: '#E5E7EB',
  muted: '#9CA3AF',
  border: '#374151',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444'
};

function getBaseStyles() {
  return `
    body {
      font-family: Inter, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      background-color: ${colors.background};
      color: ${colors.text};
      margin: 0;
      padding: 20px;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: ${colors.card};
      border: 1px solid ${colors.border};
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
      color: ${colors.gold};
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
      color: ${colors.muted};
    }
    .button {
      display: inline-block;
      background-color: ${colors.gold};
      color: ${colors.background};
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      padding: 12px 24px;
      border-radius: 8px;
      text-align: center;
      margin: 16px 0;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge-success {
      background-color: ${colors.success};
      color: ${colors.background};
    }
    .badge-error {
      background-color: ${colors.error};
      color: ${colors.background};
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
      border-top: 1px solid ${colors.border};
      padding-top: 20px;
      text-align: center;
      font-size: 12px;
      color: ${colors.muted};
    }
    .footer p {
      margin: 0 0 8px 0;
    }
  `;
}

function renderEmailHtml(params: {
  title: string;
  subtitle?: string;
  bodyHtml: string;
  primaryCta?: { label: string; url: string };
  secondaryCta?: { label: string; url: string };
  lang: 'id' | 'en';
  previewText?: string;
}) {
  const isId = params.lang === 'id';
  
  const securityBox = isId ? `
    <div class="security-box">
      <h3>⚠️ Keamanan Penting</h3>
      <p>• Admin tidak akan DM Anda terlebih dahulu</p>
      <p>• Jangan bagikan link/OTP ini kepada siapa pun</p>
      <p>• Hanya gunakan link resmi dari website kami</p>
    </div>
  ` : `
    <div class="security-box">
      <h3>⚠️ Security Alert</h3>
      <p>• Admin will never DM you first</p>
      <p>• Never share this link/OTP with anyone</p>
      <p>• Only use official website links</p>
    </div>
  `;

  const footer = isId ? `
    <div class="footer">
      <p>© 2026 TPC Global. All rights reserved.</p>
      <p>Platform edukasi - tidak ada jaminan profit</p>
      <p>Investasi risiko Anda sendiri</p>
    </div>
  ` : `
    <div class="footer">
      <p>© 2026 TPC Global. All rights reserved.</p>
      <p>Education platform - no profit guarantee</p>
      <p>Invest at your own risk</p>
    </div>
  `;

  return `<!DOCTYPE html>
<html lang="${params.lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${params.title}</title>
  <style>
    ${getBaseStyles()}
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <h1>TPC Global</h1>
    </div>

    <h2>${params.title}</h2>
    ${params.subtitle ? `<p style="color: ${colors.muted}; font-size: 16px; margin-bottom: 24px;">${params.subtitle}</p>` : ''}

    <div style="font-size: 16px; line-height: 1.6; margin: 16px 0;">
      ${params.bodyHtml}
    </div>

    ${params.primaryCta ? `
      <div style="text-align: center;">
        <a href="${params.primaryCta.url}" class="button">
          ${params.primaryCta.label}
        </a>
      </div>
    ` : ''}

    ${params.secondaryCta ? `
      <div style="text-align: center;">
        <a href="${params.secondaryCta.url}" class="button" style="background-color: transparent; border: 1px solid ${colors.gold};">
          ${params.secondaryCta.label}
        </a>
      </div>
    ` : ''}

    ${securityBox}
    ${footer}
  </div>
</body>
</html>`;
}
