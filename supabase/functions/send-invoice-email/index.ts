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
    const result = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: body.email,
      subject: `TPC Test Email - ${body.invoice_no || 'NO_INVOICE'}`,
      html: `<p>Edge Function is alive</p><p>Invoice: ${body.invoice_no || 'NO_INVOICE'}</p>`,
    });

    console.log("[EDGE][RESEND RESULT]", result);

    // Validate messageId
    if (!result || (!result.id && !result.data?.id)) {
      console.log("[EDGE] No messageId from Resend");
      throw new Error("Resend did not return message id");
    }

    const messageId = result.id ?? result.data?.id ?? null;
    console.log("[EDGE] Email sent with messageId:", messageId);

    return new Response(
      JSON.stringify({
        success: true,
        invoice_no: body.invoice_no,
        messageId: messageId
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (err) {
    console.error("[EDGE][FATAL]", err);
    return new Response(
      JSON.stringify({ success: false, step: "resend", error: err.message }),
      { status: 500, headers: corsHeaders }
    )
  }
});
