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
  const brand = "TPC — Trader Professional Community";
  const accent = "#F0B90B";
  const container = (body: string) => `
    <div style="background:#0b0b0b;padding:32px 16px;font-family:Inter,Arial,sans-serif;color:#ffffff">
      <div style="max-width:560px;margin:0 auto;background:#111;border-radius:12px;padding:28px">
        <h2 style="margin:0 0 16px;color:${accent}">${brand}</h2>
        ${body}
        <hr style="border:none;border-top:1px solid #222;margin:24px 0" />
        <p style="font-size:12px;color:#777">
          This is an automated message. Please do not reply.<br/>
          Trading involves risk. No profit is guaranteed.
        </p>
      </div>
    </div>
  `;

  if (template === "verification_approved") {
    return container(`
      <p>Your account verification has been <b style="color:${accent}">approved</b>.</p>
      <p>You can now access all TPC member features.</p>
      <a href="https://tpcglobal.io/member"
         style="display:inline-block;margin-top:16px;padding:12px 18px;
                background:${accent};color:#000;text-decoration:none;
                border-radius:8px;font-weight:600">
        Go to Member Area
      </a>
      <p style="margin-top:16px;font-size:12px;color:#888">
        Request ID: ${vars.request_id ?? "-"}
      </p>
    `);
  }

  if (template === "verification_rejected") {
    return container(`
      <p>Your verification request was <b style="color:#ff6b6b">rejected</b>.</p>
      <p>Reason:</p>
      <blockquote style="background:#1a1a1a;border-left:3px solid ${accent};
                         padding:12px;margin:12px 0;color:#ccc">
        ${vars.reason ?? "Please review and resubmit."}
      </blockquote>
      <a href="https://tpcglobal.io/member/verification"
         style="display:inline-block;margin-top:16px;padding:12px 18px;
                background:${accent};color:#000;text-decoration:none;
                border-radius:8px;font-weight:600">
        Resubmit Verification
      </a>
    `);
  }

  if (template === "account_updated") {
    return container(`
      <p>Your account settings have been updated by our administrator.</p>
      ${vars.changes && vars.changes.length > 0 ? `
        <div style="background:#1a1a1a;padding:16px;border-radius:8px;margin:16px 0">
          <p style="margin:0 0 8px;color:#aaa;font-size:12px">Changes made:</p>
          <ul style="color:#ddd;margin:0;padding-left:20px;font-size:12px">
            ${vars.changes.map((change: string) => `<li style="margin:4px 0">${escapeHtml(change)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      <p style="margin-top:8px;font-size:12px;color:#888">
        If you didn't make these changes, please contact support immediately.
      </p>
    `);
  }

  return container(`<p>${vars.body || "System notification"}</p>`);
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
