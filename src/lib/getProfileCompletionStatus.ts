import { supabase } from "./supabase";
import { computeProfileCompletion, formatSbError } from "./profileHelpers";

export async function getProfileCompletionStatus(): Promise<{
  authenticated: boolean;
  verified: boolean;
  profile_required_completed: boolean;
} | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return null;

  const isEmailVerified = !!session.user.email_confirmed_at;
  
  if (!isEmailVerified) {
    return {
      authenticated: true,
      verified: false,
      profile_required_completed: false
    };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,full_name,phone,telegram,city,role,verified")
    .eq("id", session.user.id)
    .maybeSingle();

  if (error) {
    console.error('[getProfileCompletionStatus] Error:', formatSbError(error));
    return {
      authenticated: true,
      verified: true,
      profile_required_completed: false
    };
  }

  const completion = computeProfileCompletion(data);

  return {
    authenticated: true,
    verified: true,
    profile_required_completed: completion.isComplete
  };
}
