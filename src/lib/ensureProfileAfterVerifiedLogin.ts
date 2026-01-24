import { supabase } from './supabase';

/**
 * Ensure profile exists after verified login
 * Only runs if user is authenticated AND email is verified
 * Creates minimal profile with required fields only
 */
export async function ensureProfileAfterVerifiedLogin(): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      throw sessionError;
    }

    if (!session?.user) {
      return { success: false, error: 'No authenticated session' };
    }

    const user = session.user;
    
    // Check if user email is verified
    const isVerified = Boolean(user.email_confirmed_at || user.confirmed_at);
    if (!isVerified) {
      return { success: false, error: 'Email not verified' };
    }

    // Get username from user metadata (stored during signup)
    const username = user.user_metadata?.username || null;
    if (!username) {
      return { success: false, error: 'Username not found in user metadata' };
    }

    // Create minimal profile (RLS safe - only for authenticated user)
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        username: username,
        email: user.email
      }, { 
        onConflict: 'id' 
      });

    if (profileError) {
      throw profileError;
    }

    return { success: true };
  } catch (error: any) {
    console.error('[ensureProfileAfterVerifiedLogin] Error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to ensure profile' 
    };
  }
}
