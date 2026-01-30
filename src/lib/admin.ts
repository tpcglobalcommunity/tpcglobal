import { supabase } from '@/integrations/supabase/client';

/**
 * Check if current user is admin using database whitelist
 * This is the ONLY client-facing admin check (prevents enumeration)
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('get_is_admin');
    
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('Unexpected error checking admin status:', error);
    return false;
  }
}

/**
 * Legacy admin check using email (for backward compatibility)
 * @param email - User email to check
 * @deprecated Use isAdmin() instead - this may be removed in future
 */
export async function isAdminEmail(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('is_admin', {
      p_email: email
    });
    
    if (error) {
      console.error('Error checking admin status for email:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('Unexpected error checking admin status for email:', error);
    return false;
  }
}
