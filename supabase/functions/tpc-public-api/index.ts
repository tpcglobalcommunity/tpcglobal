import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const WINDOW_MS = 60_000;
const MAX_REQ = 60;
const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") || "").split(",").filter(Boolean);

const hits = new Map<string, { count: number; resetAt: number }>();

function corsHeaders(origin: string) {
  const allow = ALLOWED_ORIGINS.length === 0 ? "*" : (ALLOWED_ORIGINS.includes(origin) ? origin : "");
  return {
    "Access-Control-Allow-Origin": allow || "null",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  };
}

function getIP(req: Request) {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function rateLimit(ip: string) {
  const now = Date.now();
  const cur = hits.get(ip);
  if (!cur || now > cur.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, remaining: MAX_REQ - 1, resetAt: now + WINDOW_MS };
  }
  if (cur.count >= MAX_REQ) return { ok: false, remaining: 0, resetAt: cur.resetAt };
  cur.count += 1;
  hits.set(ip, cur);
  return { ok: true, remaining: MAX_REQ - cur.count, resetAt: cur.resetAt };
}

function okJson(body: unknown, headers: Record<string, string>) {
  return new Response(JSON.stringify(body), { headers: { "Content-Type": "application/json", ...headers } });
}

function errJson(status: number, message: string, headers: Record<string, string>) {
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function wrapV1(data: unknown, meta: Record<string, unknown>) {
  // stable envelope
  return {
    ok: true,
    version: "v1",
    meta: {
      generated_at: new Date().toISOString(),
      ...meta,
    },
    data,
  };
}

function wrapV2(data: unknown, meta: Record<string, unknown>) {
  // stable envelope for v2
  return {
    ok: true,
    version: "v2",
    meta: {
      generated_at: new Date().toISOString(),
      ...meta,
    },
    data,
  };
}

serve(async (req) => {
  const origin = req.headers.get("origin") || "";
  const cors = corsHeaders(origin);

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "GET") return errJson(405, "Method not allowed", cors);

  if (ALLOWED_ORIGINS.length > 0 && origin && !ALLOWED_ORIGINS.includes(origin)) {
    return errJson(403, "Forbidden origin", cors);
  }

  const ip = getIP(req);
  const rl = rateLimit(ip);

  const baseHeaders = {
    ...cors,
    "X-RateLimit-Limit": String(MAX_REQ),
    "X-RateLimit-Remaining": String(rl.remaining),
    "X-RateLimit-Reset": String(Math.floor(rl.resetAt / 1000)),
    "Cache-Control": "public, max-age=15, s-maxage=30",
    // API versioning hints
    "X-API-Default-Version": "v1",
  };

  if (!rl.ok) return errJson(429, "Rate limit exceeded", baseHeaders);

  const url = new URL(req.url);
  const pathname = url.pathname.replace(/\/+$/, "");

  // Support both:
  // - /tpc-public-api/public/v1/metrics
  // - /tpc-public-api/public/v2/daily
  // - /tpc-public-api/public/metrics (legacy)
  const isV1 = pathname.includes("/public/v1/");
  const isV2 = pathname.includes("/public/v2/");
  const path = pathname.replace(/\/public\/v[12]\//, "/public/");

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    if (path.endsWith("/public/metrics")) {
      const { data, error } = await supabase.rpc("get_public_metrics");
      if (error) return errJson(500, error.message, baseHeaders);
      return isV1
        ? okJson(wrapV1(data, { endpoint: "metrics" }), baseHeaders)
        : okJson({ ok: true, data }, { ...baseHeaders, "X-API-Deprecated": "Use /public/v1/*" });
    }

    if (path.endsWith("/public/daily")) {
      if (isV2) {
        // v2 daily with extended history
        const daysRaw = url.searchParams.get("days") || "90";
        const days = Math.max(1, Math.min(365, Number(daysRaw)));
        const { data, error } = await supabase.rpc("get_public_daily_v2", { p_days: days });
        if (error) return errJson(500, error.message, baseHeaders);
        return okJson(wrapV2(data, { endpoint: "daily", days }), baseHeaders);
      } else {
        // v1 daily (legacy)
        const daysRaw = url.searchParams.get("days") || "30";
        const days = Math.max(1, Math.min(365, Number(daysRaw)));
        const { data, error } = await supabase.rpc("get_public_daily_distribution", { p_days: days });
        if (error) return errJson(500, error.message, baseHeaders);
        return isV1
          ? okJson(wrapV1(data, { endpoint: "daily", days }), baseHeaders)
          : okJson({ ok: true, days, data }, { ...baseHeaders, "X-API-Deprecated": "Use /public/v1/*" });
      }
    }

    if (path.endsWith("/public/wallets")) {
      const { data, error } = await supabase.rpc("get_public_wallets");
      if (error) return errJson(500, error.message, baseHeaders);
      return isV1
        ? okJson(wrapV1(data, { endpoint: "wallets" }), baseHeaders)
        : okJson({ ok: true, data }, { ...baseHeaders, "X-API-Deprecated": "Use /public/v1/*" });
    }

    if (path.endsWith("/public/batches")) {
      if (isV2 && url.searchParams.has("id")) {
        // v2 batch drill-down
        const batchId = url.searchParams.get("id");
        const { data, error } = await supabase.rpc("get_public_batch_summary_v2", { p_batch_id: batchId });
        if (error) return errJson(500, error.message, baseHeaders);
        return okJson(wrapV2(data, { endpoint: "batch", batch_id: batchId }), baseHeaders);
      } else {
        // v1 batch list
        const limitRaw = url.searchParams.get("limit") || "10";
        const limit = Math.max(1, Math.min(50, Number(limitRaw)));
        const { data, error } = await supabase.rpc("get_public_batches", { p_limit: limit });
        if (error) return errJson(500, error.message, baseHeaders);
        return isV1
          ? okJson(wrapV1(data, { endpoint: "batches", limit }), baseHeaders)
          : okJson({ ok: true, limit, data }, { ...baseHeaders, "X-API-Deprecated": "Use /public/v1/*" });
      }
    }

    if (path.endsWith("/public/changelog")) {
      const limitRaw = url.searchParams.get("limit") || "20";
      const limit = Math.max(1, Math.min(100, Number(limitRaw)));
      const { data, error } = await supabase.rpc("get_public_changelog", { p_limit: limit });
      if (error) return errJson(500, error.message, baseHeaders);
      return isV1
        ? okJson(wrapV1(data, { endpoint: "changelog", limit }), baseHeaders)
        : okJson({ ok: true, limit, data }, { ...baseHeaders, "X-API-Deprecated": "Use /public/v1/*" });
    }

    return errJson(404, "Not found", baseHeaders);
  } catch (e) {
    return errJson(500, `Unexpected error: ${String(e)}`, baseHeaders);
  }
});
