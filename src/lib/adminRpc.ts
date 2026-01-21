import { supabase } from "./supabase";

// Rate limit error handling
function handleRateLimitError(error: any) {
  if (error?.code === "42900" || 
      error?.message?.includes("rate limit exceeded") ||
      error?.message?.includes("too many actions")) {
    throw new Error("RATE_LIMIT");
  }
  throw error;
}

export async function updateMember(args: {
  userId: string;
  status?: string | null;
  role?: string | null;
  verified?: boolean | null;
  canInvite?: boolean | null;
}) {
  const { error } = await supabase.rpc("admin_update_member", {
    p_user_id: args.userId,
    p_status: args.status ?? null,
    p_role: args.role ?? null,
    p_verified: args.verified ?? null,
    p_can_invite: args.canInvite ?? null,
  });
  if (error) handleRateLimitError(error);
}

export async function approveVerification(requestId: string) {
  const { error } = await supabase.rpc("admin_approve_verification", { p_request_id: requestId });
  if (error) handleRateLimitError(error);
}

export async function rejectVerification(requestId: string, reason?: string) {
  const { error } = await supabase.rpc("admin_reject_verification", { p_request_id: requestId, p_reason: reason ?? null });
  if (error) handleRateLimitError(error);
}

export async function upsertSetting(key: string, value: any) {
  const { error } = await supabase.rpc("admin_upsert_app_setting", { p_key: key, p_value: value });
  if (error) handleRateLimitError(error);
}
