import { supabase } from "./supabase";
import { computeProfileCompletion, REQUIRED_PROFILE_FIELDS } from "./profileHelpers";

export async function getProfileCompletionStatus(): Promise<{
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  profile: any;
  profile_required_completed: boolean;
  missingFields: string[];
} | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return null;

  const isEmailVerified = !!session.user.email_confirmed_at;
  
  if (!isEmailVerified) {
    return {
      isAuthenticated: true,
      isEmailVerified: false,
      profile: null,
      profile_required_completed: false,
      missingFields: [...REQUIRED_PROFILE_FIELDS]
    };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,full_name,phone,telegram,city,role,verified")
    .eq("id", session.user.id)
    .maybeSingle();

  if (error) {
    console.error('[getProfileCompletionStatus] Error:', error);
    return {
      isAuthenticated: true,
      isEmailVerified: true,
      profile: null,
      profile_required_completed: false,
      missingFields: [...REQUIRED_PROFILE_FIELDS]
    };
  }

  const completion = computeProfileCompletion(data);

  return {
    isAuthenticated: true,
    isEmailVerified: true,
    profile: data,
    profile_required_completed: completion.isComplete,
    missingFields: completion.missing
  };
}
