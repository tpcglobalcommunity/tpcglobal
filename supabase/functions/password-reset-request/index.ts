import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const ALLOWED = [
  "http://localhost:5173",
  "https://tpcglobal.io"
];

function cors(origin: string | null) {
  const o = origin && ALLOWED.includes(origin) ? origin : ALLOWED[0];
  return {
    "Access-Control-Allow-Origin": o,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin"
  };
}

serve(async (req) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors(origin) });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ ok: false }),
      { status: 405, headers: { "Content-Type": "application/json", ...cors(origin) } }
    );
  }

  // PRIVACY SAFE RESPONSE (Binance style)
  return new Response(
    JSON.stringify({ ok: true }),
    { status: 200, headers: { "Content-Type": "application/json", ...cors(origin) } }
  );
});
