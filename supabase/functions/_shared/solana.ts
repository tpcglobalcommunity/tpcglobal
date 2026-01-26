import { Connection, PublicKey } from "https://esm.sh/@solana/web3.js@1.98.0";

export function getConn() {
  const rpc = Deno.env.get("SOLANA_RPC_URL");
  if (!rpc) throw new Error("Missing SOLANA_RPC_URL");
  return new Connection(rpc, "confirmed");
}

export function pk(s: string, name = "PUBLIC_KEY") {
  try { return new PublicKey(s); } catch { throw new Error(`Invalid ${name}`); }
}

export function num(n: unknown, name = "number") {
  const v = typeof n === "number" ? n : typeof n === "string" ? Number(n) : NaN;
  if (!Number.isFinite(v) || v <= 0) throw new Error(`Invalid ${name}`);
  return v;
}
