import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

type QueueItem = {
  id: string;
  template_type: string;
  lang: string;
  to_email: string;
  to_name: string;
  payload: Record<string, unknown>;
  status: string;
  attempts: number;
  created_at: string;
};

type TemplateRow = {
  subject: string;
  body_text: string;
  body_html: string;
  lang: string;
};

function mustEnv(name: string) {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function render(template: string, vars: Record<string, string>) {
  // Simple placeholder replace: {{key}}
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? "");
}

async function sendViaResend(args: {
  resendApiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${args.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: args.from,
      to: [args.to],
      subject: args.subject,
      html: args.html,
      text: args.text,
    }),
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    throw new Error(`Resend error: ${r.status} ${JSON.stringify(data)}`);
  }
  return data;
}

serve(async (req) => {
  try {
    // Optional secret guard (recommended)
    const expected = Deno.env.get("CRON_SECRET");
    if (expected) {
      const got = req.headers.get("x-cron-secret");
      if (got !== expected) return new Response("Unauthorized", { status: 401 });
    }

    const SUPABASE_URL = mustEnv("SUPABASE_URL");
    const SERVICE_ROLE_KEY = mustEnv("SUPABASE_SERVICE_ROLE_KEY");
    const RESEND_API_KEY = mustEnv("RESEND_API_KEY");
    const EMAIL_FROM = mustEnv("EMAIL_FROM"); // ex: "TPC Global <no-reply@tpcglobal.io>"
    const APP_URL = mustEnv("APP_URL"); // ex: "https://tpcglobal.io"

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Pick a small batch
    const BATCH_SIZE = Number(Deno.env.get("BATCH_SIZE") ?? "10");
    const MAX_ATTEMPTS = Number(Deno.env.get("MAX_ATTEMPTS") ?? "3");

    // 1) Fetch pending emails
    const { data: queue, error: qErr } = await supabase
      .from("email_queue")
      .select("*")
      .eq("status", "pending")
      .lt("attempts", MAX_ATTEMPTS)
      .order("created_at", { ascending: true })
      .limit(BATCH_SIZE);

    if (qErr) throw qErr;

    if (!queue || queue.length === 0) {
      return new Response(JSON.stringify({ ok: true, processed: 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    let sent = 0;
    let failed = 0;

    // 2) Process each email
    for (const item of queue) {
      const id = item.id as string;
      const type = (item.template_type ?? item.template ?? "announcement") as string;
      const lang = (item.lang ?? "en") as string;
      const to = (item.to_email ?? item.email ?? "") as string;
      const name = (item.to_name ?? item.name ?? "Member") as string;
      const payload = (item.payload ?? {}) as Record<string, unknown>;

      if (!to) {
        await supabase
          .from("email_queue")
          .update({
            status: "failed",
            attempts: (item.attempts ?? 0) + 1,
            last_error: "Missing recipient email (to_email/email)",
          })
          .eq("id", id);
        failed++;
        continue;
      }

      try {
        // Mark as sending
        await supabase
          .from("email_queue")
          .update({
            status: "sending",
            attempts: (item.attempts ?? 0) + 1,
            last_error: null,
          })
          .eq("id", id);

        // Get template from database
        const { data: tpl, error: tErr } = await supabase
          .rpc("get_email_template", { p_type: type, p_lang: lang }) as unknown as { data: TemplateRow[]; error: any };

        if (tErr) throw tErr;
        if (!tpl || !tpl[0]) throw new Error(`Template not found for type=${type}`);

        // Variables available to templates
        const vars: Record<string, string> = {
          name,
          app_url: APP_URL,
          verify_url: String(payload["verify_url"] ?? ""),
          reset_url: String(payload["reset_url"] ?? ""),
          message: String(payload["message"] ?? ""),
        };

        // Subject: pakai subject yang sudah ada di row kalau ada, kalau tidak ambil dari template
        const subject = render((item.subject ?? tpl[0].subject) as string, vars);
        const text = render(tpl[0].body_text, vars);
        const html = render(tpl[0].body_html, vars);

        // Send via Resend
        await sendViaResend({
          resendApiKey: RESEND_API_KEY,
          from: EMAIL_FROM,
          to,
          subject,
          html,
          text,
        });

        // Mark as sent
        await supabase
          .from("email_queue")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            last_error: null,
          })
          .eq("id", id);

        sent++;
      } catch (e) {
        await supabase
          .from("email_queue")
          .update({
            status: "failed",
            last_error: e instanceof Error ? e.message : String(e),
          })
          .eq("id", id);

        failed++;
      }
    }

    return new Response(JSON.stringify({ ok: true, processed: queue.length, sent, failed }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
