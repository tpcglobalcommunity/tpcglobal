import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function okJson(body: unknown) {
  return new Response(JSON.stringify(body), { headers: { "Content-Type": "application/json" } });
}

serve(async (req) => {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const CRON_KEY = Deno.env.get("CRON_KEY")!;

  const svc = createClient(SUPABASE_URL, SERVICE_KEY);

  // authorize: cron key OR admin JWT
  const cronHeader = req.headers.get("x-cron-key") || "";
  let isAuthorized = cronHeader && CRON_KEY && cronHeader === CRON_KEY;

  let adminUserId: string | null = null;
  if (!isAuthorized) {
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) return new Response("Unauthorized", { status: 401 });

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData } = await userClient.auth.getUser();
    if (!userData?.user) return new Response("Unauthorized", { status: 401 });
    adminUserId = userData.user.id;

    const { data: prof } = await svc.from("profiles").select("role").eq("id", adminUserId).single();
    if (prof?.role !== "admin") return new Response("Forbidden", { status: 403 });

    isAuthorized = true;
  }

  // fetch txs
  const { data: txs, error } = await svc
    .from("tpc_transactions")
    .select("*")
    .eq("status", "verified")
    .eq("distributed", false)
    .order("created_at", { ascending: true });

  if (error) return new Response(error.message, { status: 500 });
  const list = txs ?? [];
  if (list.length === 0) return okJson({ success: true, processed: 0, batch_id: null });

  // ✅ load split from app_settings (fallback default)
  const { data: splitRow } = await svc
    .from("app_settings")
    .select("value")
    .eq("key", "distribution_split")
    .maybeSingle();

  const split = splitRow?.value ?? { referral: 0.10, treasury: 0.20, buyback: 0.05 };

  const referralPct = Number(split.referral ?? 0.10);
  const treasuryPct = Number(split.treasury ?? 0.20);
  const buybackPct  = Number(split.buyback  ?? 0.05);

  // guard: prevent weird config
  const sum = referralPct + treasuryPct + buybackPct;
  if (referralPct < 0 || treasuryPct < 0 || buybackPct < 0 || sum > 1.0) {
    return new Response("Invalid distribution_split settings", { status: 500 });
  }

  // batch period
  const periodStart = list[0].created_at;
  const periodEnd = list[list.length - 1].created_at;

  // create batch
  const { data: batch, error: bErr } = await svc
    .from("tpc_distribution_batches")
    .insert({
      period_start: periodStart,
      period_end: periodEnd,
      created_by: adminUserId,
      note: "Auto distribution batch",
    })
    .select()
    .single();

  if (bErr || !batch) return new Response(`Batch create failed: ${bErr?.message}`, { status: 500 });

  let revenueSum = 0;
  let referralSum = 0;
  let treasurySum = 0;
  let buybackSum = 0;

  for (const tx of list) {
    const amount = Number(tx.amount);
    revenueSum += amount;

    const referralAmount = amount * referralPct;
    const treasuryAmount = amount * treasuryPct;
    const buybackAmount = amount * buybackPct;

    referralSum += referralAmount;
    treasurySum += treasuryAmount;
    buybackSum += buybackAmount;

    const { error: insErr } = await svc.from("tpc_distribution_logs").insert([
      { transaction_id: tx.id, batch_id: batch.id, type: "referral", amount: referralAmount },
      { transaction_id: tx.id, batch_id: batch.id, type: "treasury", amount: treasuryAmount },
      { transaction_id: tx.id, batch_id: batch.id, type: "buyback", amount: buybackAmount },
    ]);

    // if duplicate (idempotent), skip but still mark tx as distributed to converge state
    if (insErr && !String(insErr.message).includes("duplicate")) {
      return new Response(`Distribution insert failed: ${insErr.message}`, { status: 500 });
    }

    const { error: upErr } = await svc
      .from("tpc_transactions")
      .update({ distributed: true, distributed_at: new Date().toISOString() })
      .eq("id", tx.id);

    if (upErr) return new Response(`Tx update failed: ${upErr.message}`, { status: 500 });
  }

  // finalize batch totals
  const { error: finErr } = await svc
    .from("tpc_distribution_batches")
    .update({
      tx_count: list.length,
      revenue_sum: revenueSum,
      referral_sum: referralSum,
      treasury_sum: treasurySum,
      buyback_sum: buybackSum,
    })
    .eq("id", batch.id);

  if (finErr) return new Response(`Batch finalize failed: ${finErr.message}`, { status: 500 });

  // ✅ generate public hash for batch (signed snapshot)
  const { data: hashData, error: hashErr } = await svc.rpc("generate_batch_public_hash", {
    p_batch_id: batch.id,
  });

  if (hashErr) return new Response(`Batch hash failed: ${hashErr.message}`, { status: 500 });

  return okJson({ success: true, processed: list.length, batch_id: batch.id, public_hash: hashData });
});
