import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = (o:string)=>({
  "Access-Control-Allow-Origin": o,
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null,{status:204,headers:cors("*")});
  if (req.method !== "POST") return new Response("Method not allowed",{status:405});

  const origin = req.headers.get("origin") || "";
  const allowed = (Deno.env.get("ALLOWED_ORIGINS")||"").split(",");
  if (!allowed.includes(origin)) return new Response("Forbidden",{status:403});

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const auth = req.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ")) return new Response("Unauthorized",{status:401});

  const { user_id, type, amount, source_id } = await req.json();
  if (!user_id || !type || !amount) return new Response("Invalid payload",{status:400});

  const { data, error } = await supabase.from("tpc_transactions").insert({
    user_id, type, amount, source_id, status: "pending"
  }).select().single();

  if (error) return new Response(error.message,{status:500});
  return new Response(JSON.stringify({success:true, transaction:data}),{headers:{...cors(origin),"Content-Type":"application/json"}});
});
