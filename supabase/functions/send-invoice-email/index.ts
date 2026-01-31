import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders })
    }

    console.log("[EDGE] Handler started");

    const body = await req.json()
    console.log("[EDGE] Body:", body);

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY missing")
    }

    const resend = new Resend(RESEND_API_KEY);

    // TEMPORARY TEST EMAIL (NO RPC FIRST)
    const test = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: body.email,
      subject: "TPC Test Email",
      html: "<p>Edge Function is alive</p>",
    });

    console.log("[EDGE] Resend OK:", test);

    return new Response(
      JSON.stringify({ success: true, test }),
      { status: 200, headers: corsHeaders }
    );

  } catch (err) {
    console.error("[EDGE][FATAL]", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: corsHeaders }
    )
  }
});
