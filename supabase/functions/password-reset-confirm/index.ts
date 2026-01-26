/* deno-lint-ignore-file no-explicit-any */
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") || "").split(",").map(s => s.trim()).filter(Boolean);

function corsHeaders(origin: string | null) {
  const okOrigin = origin && ORIGINS.includes(origin) ? origin : (ORIGINS[0] || "*");
  return {
    "Access-Control-Allow-Origin": okOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
    "Cache-Control": "no-store",
    "Pragma": "no-cache",
  };
}
function json(req: Request, status: number, body: any) {
  const origin = req.headers.get("origin");
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...corsHeaders(origin) }});
}
function preflight(req: Request) {
  const origin = req.headers.get("origin");
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

async function sha256(input: string) {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}
function strongPassword(pw: string) {
  return typeof pw === "string" && pw.length >= 8;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return preflight(req);
  if (req.method !== "POST") return json(req, 405, { ok: false, error: "Method not allowed" });

  try {
    const { email, token, newPassword } = await req.json();
    if (!email || !token || !strongPassword(newPassword)) {
      return json(req, 400, { ok: false, error: "Invalid input" });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SRK = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const admin = createClient(SUPABASE_URL, SRK);

    const token_hash = await sha256(String(token));
    const nowIso = new Date().toISOString();

    // Find token (unused + not expired)
    const { data: rows } = await admin
      .from("password_reset_tokens")
      .select("id, expires_at, used_at")
      .eq("email", String(email).toLowerCase())
      .eq("token_hash", token_hash)
      .is("used_at", null)
      .limit(1);

    const row = rows?.[0];
    if (!row) return json(req, 400, { ok: false, error: "Link tidak valid / sudah dipakai." });
    if (new Date(row.expires_at).getTime() < Date.now()) return json(req, 400, { ok: false, error: "Link sudah kedaluwarsa." });

    // Find user by email (admin list)
    const { data: list, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (listErr) throw new Error(listErr.message);
    const user = list.users.find((u: any) => (u.email || "").toLowerCase() === String(email).toLowerCase());

    // Privacy-safe: if user not found, burn token anyway
    if (!user) {
      await admin.from("password_reset_tokens").update({ used_at: nowIso }).eq("id", row.id);
      return json(req, 200, { ok: true, session: null, user: null });
    }

    // Update password
    const { error: upErr } = await admin.auth.admin.updateUserById(user.id, { password: String(newPassword) });
    if (upErr) throw new Error(upErr.message);

    // Mark token used FIRST (one-time lock)
    await admin.from("password_reset_tokens").update({ used_at: nowIso }).eq("id", row.id);

    // Revoke old sessions (security)
    await admin.auth.admin.signOut(user.id);

    // Auto-login using ANON client
    const anon = createClient(SUPABASE_URL, ANON);
    const { data: login, error: loginErr } = await anon.auth.signInWithPassword({
      email: String(email).toLowerCase(),
      password: String(newPassword),
    });

    if (loginErr || !login?.session) {
      // fallback to manual login
      return json(req, 200, { ok: true, session: null, user: { id: user.id, email: user.email } });
    }

    return json(req, 200, {
      ok: true,
      session: {
        access_token: login.session.access_token,
        refresh_token: login.session.refresh_token,
        expires_in: login.session.expires_in,
        token_type: login.session.token_type,
      },
      user: { id: login.user?.id, email: login.user?.email },
    });
  } catch (e: any) {
    return json(req, 400, { ok: false, error: e?.message || "Unknown error" });
  }
});
