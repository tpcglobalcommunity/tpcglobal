import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Vary": "Origin",
};

serve(async (req: Request) => {
  // ✅ CORS preflight MUST succeed
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Anti-enumeration: do not leak anything
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const email = body?.email;

    if (!email) {
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${Deno.env.get("SITE_URL")}/id/reset-password`,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
  } catch {
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
  }
});
