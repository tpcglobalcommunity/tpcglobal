import { supabase } from '@/integrations/supabase/client';

/**
 * Check if current user is admin using database whitelist
 * This is the source of truth for admin access
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
 * Check if specific user ID is admin
 * @param userId - User UUID to check
 */
export async function isAdminUserId(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('is_admin_uuid', {
      p_user_id: userId
    });
    
    if (error) {
      console.error('Error checking admin status for user:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('Unexpected error checking admin status for user:', error);
    return false;
  }
}

/**
 * Legacy admin check using email (for backward compatibility)
 * @param email - User email to check
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
