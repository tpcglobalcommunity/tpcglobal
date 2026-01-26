import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed",{status:405});

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { transaction_id, verifier_note } = await req.json();
  if (!transaction_id) return new Response("Missing transaction_id",{status:400});

  const { data:tx } = await supabase.from("tpc_transactions").select("*").eq("id",transaction_id).single();
  if (!tx || tx.status !== "pending") return new Response("Invalid state",{status:400});

  await supabase.from("tpc_transactions").update({
    status:"verified", verified_at:new Date().toISOString(), verifier_note
  }).eq("id",transaction_id);

  return new Response(JSON.stringify({success:true}),{headers:{"Content-Type":"application/json"}});
});
