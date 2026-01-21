import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type EmailRow = {
  id: number;
  to_email: string;
  subject: string;
  template: string;
  variables: Record<string, any> | null;
  attempt_count: number;
};

function escapeHtml(s: string) {
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function renderTemplate(template: string, vars: Record<string, any>) {
  // Minimal HTML templates. Extend anytime.
  const brand = "TPC — Trader Professional Community";
  const safe = (v: any) => escapeHtml(String(v ?? ""));

  if (template === "verification_approved") {
    return `
      <div style="font-family:Arial,sans-serif;line-height:1.5;max-width:600px;margin:0 auto;padding:20px;background:#f8f9fa;border-radius:8px;">
        <div style="background:#ffffff;padding:30px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color:#2d3748;margin:0 0 20px 0;font-size:24px;font-weight:600;">${brand}</h2>
          <div style="background:#e8f5e8;padding:20px;border-radius:6px;margin:20px 0;">
            <h3 style="color:#28a745;margin:0 0 10px 0;font-size:18px;">✅ Verification Approved</h3>
            <p style="color:#495057;font-size:16px;line-height:1.5;">Congratulations! Your wallet verification has been <strong>approved</strong>.</p>
            <p style="color:#495057;font-size:16px;line-height:1.5;">You can now access all member features and enjoy the full benefits of the TPC platform.</p>
            <div style="background:#f8f9fa;padding:15px;border-radius:6px;margin:20px 0;">
              <p style="color:#6c757d;font-size:14px;"><strong>Request ID:</strong> ${safe(vars.request_id)}</p>
            </div>
          </div>
          <div style="text-align:center;padding:20px;color:#6c757d;font-size:12px;">
            <p style="margin:0;">This is an automated message. Please do not reply to this email.</p>
            <p style="margin:10px 0 0 0;">© 2026 TPC — Trader Professional Community. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;
  }

  if (template === "verification_rejected") {
    return `
      <div style="font-family:Arial,sans-serif;line-height:1.5;max-width:600px;margin:0 auto;padding:20px;background:#f8f9fa;border-radius:8px;">
        <div style="background:#ffffff;padding:30px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color:#2d3748;margin:0 0 20px 0;font-size:24px;font-weight:600;">${brand}</h2>
          <div style="background:#fef2f2;padding:20px;border-radius:6px;margin:20px 0;border-left:4px solid #f59e0b;">
            <h3 style="color:#dc3545;margin:0 0 10px 0;font-size:18px;">❌ Verification Rejected</h3>
            <p style="color:#495057;font-size:16px;line-height:1.5;">We're sorry, but your wallet verification has been <strong>rejected</strong>.</p>
            <p style="color:#495057;font-size:16px;line-height:1.5;">${safe(vars.reason || "Please review your submission and try again.")}</p>
            <div style="background:#f8f9fa;padding:15px;border-radius:6px;margin:20px 0;">
              <p style="color:#6c757d;font-size:14px;"><strong>Request ID:</strong> ${safe(vars.request_id)}</p>
            </div>
          </div>
          <div style="text-align:center;padding:20px;color:#6c757d;font-size:12px;">
            <p style="margin:0;">If you believe this is an error, please contact our support team.</p>
            <p style="margin:10px 0 0 0;">This is an automated message. Please do not reply to this email.</p>
            <p style="margin:10px 0 0 0;">© 2026 TPC — Trader Professional Community. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;
  }

  if (template === "account_updated") {
    return `
      <div style="font-family:Arial,sans-serif;line-height:1.5;max-width:600px;margin:0 auto;padding:20px;background:#f8f9fa;border-radius:8px;">
        <div style="background:#ffffff;padding:30px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color:#2d3748;margin:0 0 20px 0;font-size:24px;font-weight:600;">${brand}</h2>
          <div style="background:#e3f2fd;padding:20px;border-radius:6px;margin:20px 0;">
            <h3 style="color:#1e40af;margin:0 0 10px 0;font-size:18px;">🔄 Account Updated</h3>
            <p style="color:#495057;font-size:16px;line-height:1.5;">Your account settings have been updated by our administrator.</p>
            ${vars.changes && vars.changes.length > 0 ? `
              <div style="background:#f8f9fa;padding:15px;border-radius:6px;margin:20px 0;">
                <p style="color:#495057;font-size:14px;"><strong>Changes made:</strong></p>
                <ul style="color:#495057;font-size:14px;margin:10px 0;padding-left:20px;">
                  ${vars.changes.map((change: string) => `<li style="margin:5px 0;">${escapeHtml(change)}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            <p style="color:#495057;font-size:16px;line-height:1.5;">If you didn't make these changes, please contact our support team immediately.</p>
            <div style="background:#f8f9fa;padding:15px;border-radius:6px;margin:20px 0;">
              <p style="color:#6c757d;font-size:14px;"><strong>Updated by:</strong> Administrator</p>
              <p style="color:#6c757d;font-size:14px;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
          </div>
          <div style="text-align:center;padding:20px;color:#6c757d;font-size:12px;">
            <p style="margin:0;">This is an automated message. Please do not reply to this email.</p>
            <p style="margin:10px 0 0 0;">© 2026 TPC — Trader Professional Community. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;
  }

  // default fallback
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.5;max-width:600px;margin:0 auto;padding:20px;background:#f8f9fa;border-radius:8px;">
      <div style="background:#ffffff;padding:30px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color:#2d3748;margin:0 0 20px 0;font-size:24px;font-weight:600;">TPC — Trader Professional Community</h2>
        <div style="background:#e3f2fd;padding:20px;border-radius:6px;margin:20px 0;">
          <h3 style="color:#1e40af;margin:0 0 10px 0;font-size:18px;">📧 Notification</h3>
          <p style="color:#495057;font-size:16px;line-height:1.5;">${safe(vars.body || "You have a new notification.")}</p>
        </div>
        <div style="text-align:center;padding:20px;color:#6c757d;font-size:12px;">
          <p style="margin:0;">This is an automated message. Please do not reply to this email.</p>
          <p style="margin:10px 0 0 0;">© 2026 TPC — Trader Professional Community. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;
}

async function sendWithResend(apiKey: string, fromEmail: string, to: string, subject: string, html: string) {
  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to,
      subject,
      html,
    }),
  });

  if (!resp.ok) {
    const txt = await resp.text().catch(() => "");
    throw new Error(`Resend error ${resp.status}: ${txt}`);
  }
}

serve(async (_req) => {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
  const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "TPC <noreply@tpcglobal.io>";

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase.rpc("worker_claim_email_batch", { p_limit: 25, p_lock_minutes: 5 });
  if (error) return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500 });

  const rows = (data || []) as EmailRow[];
  let sent = 0, failed = 0;

  console.log(`Claimed ${rows.length} emails for processing`);

  for (const row of rows) {
    try {
      const vars = row.variables || {};
      const html = renderTemplate(row.template, vars);

      await sendWithResend(RESEND_API_KEY, FROM_EMAIL, row.to_email, row.subject, html);

      const { error: e2 } = await supabase.rpc("worker_mark_email_sent", { p_id: row.id });
      if (e2) throw new Error(`mark_sent failed: ${e2.message}`);

      sent++;
      console.log(`✅ Sent email to ${row.to_email}: ${row.subject}`);
    } catch (e: any) {
      failed++;
      const msg = e?.message || String(e);

      // backoff + keep pending until max attempts then FAILED
      await supabase.rpc("worker_mark_email_failed", { p_id: row.id, p_error: msg });
      console.error(`❌ Failed email to ${row.to_email}: ${msg}`);
    }
  }

  return new Response(JSON.stringify({ 
    ok: true, 
    claimed: rows.length, 
    sent, 
    failed,
    processing_time_ms: Date.now()
  }), {
    headers: { "Content-Type": "application/json" },
  });
});
