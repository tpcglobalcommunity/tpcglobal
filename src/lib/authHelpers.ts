import { supabase } from "@/integrations/supabase/client";

/**
 * Get redirect URL for auth callbacks
 * Returns absolute URL based on current origin and language
 */
export function getRedirectTo(lang?: 'en' | 'id'): string {
  const currentLang = lang || (typeof window !== 'undefined' ? 
    (localStorage.getItem('preferred-language') || 'id') : 'id');
  
  const baseUrl = typeof window !== 'undefined' ? 
    window.location.origin : 
    (import.meta.env.VITE_SITE_URL || 'https://tpcglobal.io');
  
  return `${baseUrl}/${currentLang}/auth/callback`;
}

/**
 * Sign in with Google OAuth
 * @param redirectTo - Optional custom redirect URL
 * @returns Promise with auth result
 */
export async function signInWithGoogle(redirectTo?: string) {
  try {
    const redirectUrl = redirectTo || getRedirectTo();
    
    console.info('[AUTH] Initiating Google OAuth sign-in...');
    console.info('[AUTH] Redirect URL:', redirectUrl);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('[AUTH] Google OAuth error:', error);
      return { success: false, error: error.message };
    }

    console.info('[AUTH] Google OAuth initiated successfully');
    return { success: true, data };
  } catch (error) {
    console.error('[AUTH] Google OAuth exception:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Sign in with Magic Link (email OTP)
 * @param email - User's email address
 * @param redirectTo - Optional custom redirect URL
 * @returns Promise with auth result
 */
export async function signInWithMagicLink(email: string, redirectTo?: string) {
  try {
    const redirectUrl = redirectTo || getRedirectTo();
    
    console.info('[AUTH] Initiating magic link sign-in...');
    console.info('[AUTH] Email:', email);
    console.info('[AUTH] Redirect URL:', redirectUrl);
    
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      console.error('[AUTH] Magic link error:', error);
      
      // Handle specific rate limiting
      if (error.message?.includes('rate limit') || error.status === 429) {
        return { 
          success: false, 
          error: 'rate_limited',
          message: 'Too many attempts. Please wait before trying again.' 
        };
      }
      
      return { success: false, error: error.message };
    }

    console.info('[AUTH] Magic link sent successfully');
    return { success: true, data };
  } catch (error) {
    console.error('[AUTH] Magic link exception:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Sign out current user
 * @returns Promise with sign out result
 */
export async function signOut() {
  try {
    console.info('[AUTH] Signing out...');
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('[AUTH] Sign out error:', error);
      return { success: false, error: error.message };
    }

    console.info('[AUTH] Sign out successful');
    return { success: true };
  } catch (error) {
    console.error('[AUTH] Sign out exception:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Get current session
 * @returns Promise with session data
 */
export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('[AUTH] Get session error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, session };
  } catch (error) {
    console.error('[AUTH] Get session exception:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Exchange auth code for session (PKCE flow)
 * @param authCodeUrl - The URL with auth code
 * @returns Promise with session data
 */
export async function exchangeCodeForSession(authCodeUrl: string) {
  try {
    console.info('[AUTH] Exchanging code for session...');
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(authCodeUrl);
    
    if (error) {
      console.error('[AUTH] Code exchange error:', error);
      return { success: false, error: error.message };
    }

    console.info('[AUTH] Code exchange successful');
    return { success: true, session: data.session };
  } catch (error) {
    console.error('[AUTH] Code exchange exception:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}
