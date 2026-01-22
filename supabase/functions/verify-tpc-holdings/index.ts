import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type WalletRow = { user_id: string; wallet_address: string };

// ====== CONFIG ======
const TPC_MINT = "21Lj7WmW7zo8xV3GD3nWcAbAuKpP5ryWkNZi615i4eXE";

// Tier thresholds (sesuai kebijakan)
const THRESHOLD_PRO = 100_000;
const THRESHOLD_ELITE = 1_000_000;

function tierFromBalance(balance: number): "BASIC" | "PRO" | "ELITE" {
  if (balance >= THRESHOLD_ELITE) return "ELITE";
  if (balance >= THRESHOLD_PRO) return "PRO";
  return "BASIC";
}

/**
 * Fetch SPL token balance for owner+mint by querying token accounts.
 * Uses Solana JSON-RPC method: getTokenAccountsByOwner with jsonParsed
 */
async function getSplBalanceByOwnerMint(rpcUrl: string, owner: string, mint: string): Promise<number> {
  const body = {
    jsonrpc: "2.0",
    id: 1,
    method: "getTokenAccountsByOwner",
    params: [
      owner,
      { mint },
      { encoding: "jsonParsed" },
    ],
  };

  const resp = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const txt = await resp.text().catch(() => "");
    throw new Error(`Solana RPC HTTP ${resp.status}: ${txt}`);
  }

  const json = await resp.json();
  const value = json?.result?.value;
  if (!Array.isArray(value)) return 0;

  // Sum across all token accounts for that mint
  let total = 0;
  for (const acc of value) {
    const info = acc?.account?.data?.parsed?.info;
    const amountStr = info?.tokenAmount?.uiAmountString ?? info?.tokenAmount?.uiAmount;
    const amt = typeof amountStr === "string" ? Number(amountStr) : Number(amountStr ?? 0);
    if (!Number.isNaN(amt)) total += amt;
  }
  return total;
}

serve(async (req) => {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const SOLANA_RPC_URL = Deno.env.get("SOLANA_RPC_URL") || "https://api.mainnet-beta.solana.com";

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  console.log("Starting TPC holdings verification...");
  console.log("RPC URL:", SOLANA_RPC_URL);
  console.log("TPC Mint:", TPC_MINT);

  try {
    // Check if single wallet mode
    const body = await req.json().catch(() => null);
    
    if (body && body.user_id && body.wallet) {
      // Single wallet verification mode
      console.log(`Single wallet verification for user: ${body.user_id}, wallet: ${body.wallet}`);
      
      try {
        const bal = await getSplBalanceByOwnerMint(SOLANA_RPC_URL, body.wallet, TPC_MINT);
        const tier = tierFromBalance(bal);

        console.log(`Single wallet result: balance=${bal}, tier=${tier}`);

        const { error: updateError } = await supabase.rpc("worker_update_tpc_tier", {
          p_user_id: body.user_id,
          p_balance: bal,
          p_tier: tier,
        });
        
        if (updateError) throw new Error(`update tier failed: ${updateError.message}`);

        return new Response(JSON.stringify({
          ok: true,
          mode: "single",
          user_id: body.user_id,
          wallet: body.wallet,
          balance: bal,
          tier,
          rpc: SOLANA_RPC_URL,
          mint: TPC_MINT,
        }), { 
          headers: { "Content-Type": "application/json" } 
        });
      } catch (e: any) {
        console.error(`Single wallet verification failed:`, e);
        return new Response(JSON.stringify({ 
          ok: false, 
          mode: "single",
          error: e?.message ?? String(e) 
        }), { 
          status: 500, 
          headers: { "Content-Type": "application/json" } 
        });
      }
    }

    // Original batch mode
    // 1) claim wallets batch
    const { data, error } = await supabase.rpc("worker_claim_primary_wallets", { p_limit: 50 });
    if (error) {
      console.error("Error claiming wallets:", error);
      return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500 });
    }

    const rows = (data || []) as WalletRow[];
    console.log(`Claimed ${rows.length} wallets for verification`);

    let updated = 0;
    let failed = 0;
    const results: any[] = [];

    // 2) for each wallet: fetch balance, compute tier, update profile cache
    for (const r of rows) {
      try {
        console.log(`Checking wallet: ${r.wallet_address}`);
        const bal = await getSplBalanceByOwnerMint(SOLANA_RPC_URL, r.wallet_address, TPC_MINT);
        const tier = tierFromBalance(bal);

        console.log(`Wallet ${r.wallet_address}: balance=${bal}, tier=${tier}`);

        const { error: e2 } = await supabase.rpc("worker_update_tpc_tier", {
          p_user_id: r.user_id,
          p_balance: bal,
          p_tier: tier,
        });
        if (e2) throw new Error(`update tier failed: ${e2.message}`);

        updated++;
        results.push({ user_id: r.user_id, wallet: r.wallet_address, balance: bal, tier });
      } catch (e: any) {
        console.error(`Failed to process wallet ${r.wallet_address}:`, e);
        failed++;
        results.push({ user_id: r.user_id, wallet: r.wallet_address, error: e?.message ?? String(e) });
      }
    }

    const response = {
      ok: true,
      mode: "batch",
      rpc: SOLANA_RPC_URL,
      mint: TPC_MINT,
      claimed: rows.length,
      updated,
      failed,
      thresholds: {
        PRO: THRESHOLD_PRO,
        ELITE: THRESHOLD_ELITE
      },
      sample: results.slice(0, 10),
    };

    console.log("TPC verification completed:", response);
    
    return new Response(JSON.stringify(response), { 
      headers: { "Content-Type": "application/json" } 
    });
  } catch (error: any) {
    console.error("TPC verification failed:", error);
    return new Response(JSON.stringify({ 
      ok: false, 
      error: error?.message ?? String(error) 
    }), { 
      status: 500, 
      headers: { "Content-Type": "application/json" } 
    });
  }
});
