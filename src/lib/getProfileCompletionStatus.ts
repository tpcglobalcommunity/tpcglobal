import { supabase } from './supabase';

/**
 * Get profile completion status
 * Returns null if not logged in, otherwise completion status
 */
export async function getProfileCompletionStatus(): Promise<null | { profile_required_completed: boolean }> {
  try {
    // Get session via supabase.auth.getSession()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('[getProfileCompletionStatus] Session error:', sessionError);
      return null;
    }

    // If no session.user => return null
    if (!session?.user) {
      return null;
    }

    // Query own profile ONLY
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, phone_wa, telegram, city, profile_required_completed')
      .eq('id', session.user.id)
      .maybeSingle();

    // If error and it's 406 or "No rows" => treat as not existing and return { profile_required_completed:false }
    if (error) {
      if (error.code === 'PGRST116' || error.code === '406') {
        return { profile_required_completed: false };
      }
      console.error('[getProfileCompletionStatus] Profile query error:', error);
      return null;
    }

    // If data missing => return { profile_required_completed:false }
    if (!data) {
      return { profile_required_completed: false };
    }

    // Compute required completion
    const requiredOk =
      Boolean(data.full_name?.trim()) &&
      Boolean(data.phone_wa?.trim()) &&
      Boolean(data.telegram?.trim()) &&
      Boolean(data.city?.trim());

    // Return:
    return {
      profile_required_completed: Boolean(data.profile_required_completed) || requiredOk
    };
  } catch (error) {
    console.error('[getProfileCompletionStatus] Error:', error);
    return null;
  }
}
