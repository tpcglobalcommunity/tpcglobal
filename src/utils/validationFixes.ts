import { supabase } from "@/lib/supabase";

export type ReferralRow = {
  is_valid: boolean;
  referrer_id: string | null;
  referrer_username: string | null;
  referrer_member_code: string | null;
};

export type ReferralCheck = {
  ok: boolean;
  row?: ReferralRow;
  error?: string;
};

export function normalizeReferralCode(input: string) {
  return input.trim().toUpperCase();
}

export function normalizeUsername(input: string) {
  return input.trim().toLowerCase();
}

/**
 * Normalize RPC response (TABLE or ROW)
 */
export function parseReferralRpc(data: any): ReferralRow | null {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;

  return {
    is_valid: !!row.is_valid,
    referrer_id: row.referrer_id ?? null,
    referrer_username: row.referrer_username ?? null,
    referrer_member_code: row.referrer_member_code ?? null,
  };
}

/**
 * SQL function:
 * validate_referral_code_public(p_referral_code text)
 */
export async function checkReferralCode(codeRaw: string): Promise<ReferralCheck> {
  const code = normalizeReferralCode(codeRaw);
  if (!code) return { ok: false };

  const { data, error } = await supabase.rpc(
    "validate_referral_code_public",
    { p_referral_code: code }
  );

  if (error) return { ok: false, error: error.message };

  const row = parseReferralRpc(data);
  if (!row?.is_valid) return { ok: false };

  return { ok: true, row };
}
