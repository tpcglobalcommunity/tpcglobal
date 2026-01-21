export interface EmailTemplateVars {
  [key: string]: any;
}

export interface EmailTranslations {
  en: {
    approvedTitle: string;
    approvedBody: string;
    rejectedTitle: string;
    rejectedReason: string;
    ctaMember: string;
    ctaResubmit: string;
    footer: string;
  };
  id: {
    approvedTitle: string;
    approvedBody: string;
    rejectedTitle: string;
    rejectedReason: string;
    ctaMember: string;
    ctaResubmit: string;
    footer: string;
  };
  [key: string]: any;
}

export function renderTemplate(template: string, vars: EmailTemplateVars, lang: string) {
  const accent = "#F0B90B";
  const brand = "TPC — Trader Professional Community";

  const t: EmailTranslations = {
    en: {
      approvedTitle: "Verification approved",
      approvedBody: "Your account verification has been approved. You can now access all member features.",
      rejectedTitle: "Verification rejected",
      rejectedReason: "Reason",
      ctaMember: "Go to Member Area",
      ctaResubmit: "Resubmit Verification",
      footer: "This is an automated message. Trading involves risk. No profit is guaranteed.",
    },
    id: {
      approvedTitle: "Verifikasi disetujui",
      approvedBody: "Verifikasi akun Anda telah disetujui. Anda sekarang dapat mengakses semua fitur member.",
      rejectedTitle: "Verifikasi ditolak",
      rejectedReason: "Alasan",
      ctaMember: "Masuk ke Area Member",
      ctaResubmit: "Ajukan Ulang Verifikasi",
      footer: "Ini adalah pesan otomatis. Trading memiliki risiko. Tidak ada jaminan keuntungan.",
    },
  };

  const translations = t[lang] || t.en;

  const container = (body: string) => `
    <div style="background:#0b0b0b;padding:32px 16px;font-family:Inter,Arial,sans-serif;color:#ffffff">
      <div style="max-width:560px;margin:0 auto;background:#111;border-radius:12px;padding:28px">
        <h2 style="margin:0 0 16px;color:${accent}">${brand}</h2>
        ${body}
        <hr style="border:none;border-top:1px solid #222;margin:24px 0" />
        <p style="font-size:12px;color:#777">${translations.footer}</p>
      </div>
    </div>
  `;

  if (template === "verification_approved") {
    return container(`
      <p><b style="color:${accent}">${translations.approvedTitle}</b></p>
      <p>${translations.approvedBody}</p>
      <a href="https://tpcglobal.io/member"
         style="display:inline-block;margin-top:16px;padding:12px 18px;
                background:${accent};color:#000;text-decoration:none;
                border-radius:8px;font-weight:600">
        ${translations.ctaMember}
      </a>
    `);
  }

  if (template === "verification_rejected") {
    return container(`
      <p><b style="color:#ff6b6b">${translations.rejectedTitle}</b></p>
      <p>${translations.rejectedReason}: ${vars.reason ?? "-"}</p>
      <a href="https://tpcglobal.io/member/verification"
         style="display:inline-block;margin-top:16px;padding:12px 18px;
                background:${accent};color:#000;text-decoration:none;
                border-radius:8px;font-weight:600">
        ${translations.ctaResubmit}
      </a>
    `);
  }

  return container(`<p>${vars.body ?? ""}</p>`);
}

// Helper function to escape HTML
export function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// Enhanced renderTemplate with HTML escaping
export function renderTemplateSafe(template: string, vars: EmailTemplateVars, lang: string): string {
  const safeVars: EmailTemplateVars = {};
  
  // Escape all variable values
  for (const [key, value] of Object.entries(vars)) {
    safeVars[key] = typeof value === 'string' ? escapeHtml(value) : value;
  }

  return renderTemplate(template, safeVars, lang);
}
