import { supabase } from "./supabase";
import { isProfileComplete } from "./profileHelpers";

export async function getProfileCompletionStatus(): Promise<{ profile_required_completed: boolean } | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, phone, telegram, city")
    .eq("id", session.user.id)
    .single();

  if (error) throw error;

  const done = isProfileComplete(data);

  return { profile_required_completed: done };
}
