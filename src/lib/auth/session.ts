import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

// Global session state
let currentSession: Session | null = null;
let currentUser: User | null = null;
let refreshAttempted = false;

// Broadcast channel for multi-tab sync
const authChannel = new BroadcastChannel('tpc-auth');

// Session listeners
const sessionListeners: ((session: Session | null) => void)[] = [];

// Initialize auth state change listener
export const initializeAuthManager = () => {
  console.info('[AUTH-HARDEN] Initializing auth manager...');
  
  // Get initial session
  getSessionSafe().then(session => {
    updateSessionState(session);
  });

  // Listen for auth state changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      console.info('[AUTH-HARDEN] Auth state change:', event, !!session);
      
      updateSessionState(session);
      
      // Broadcast to other tabs
      authChannel.postMessage({
        type: 'AUTH_STATE_CHANGE',
        event,
        session: session ? {
          user: session.user,
          access_token: session.access_token,
          expires_at: session.expires_at,
        } : null
      });

      // Log audit events
      if (event === 'SIGNED_IN') {
        logAuthEvent('LOGIN_SUCCESS', { provider: 'oauth_or_magic_link' });
      } else if (event === 'SIGNED_OUT') {
        logAuthEvent('LOGOUT', {});
      }
    }
  );

  // Listen for messages from other tabs
  authChannel.onmessage = (event) => {
    if (event.data.type === 'AUTH_STATE_CHANGE') {
      console.info('[AUTH-HARDEN] Received auth state from other tab');
      const session = event.data.session ? {
        user: event.data.session.user,
        access_token: event.data.session.access_token,
        expires_at: event.data.session.expires_at,
      } as Session : null;
      updateSessionState(session);
    }
  };

  return subscription;
};

// Update global session state
const updateSessionState = (session: Session | null) => {
  const previousUser = currentUser?.id;
  currentSession = session;
  currentUser = session?.user || null;
  
  // Notify listeners
  sessionListeners.forEach(listener => listener(session));
  
  // Log user changes
  if (previousUser !== currentUser?.id) {
    console.info('[AUTH-HARDEN] User changed:', {
      from: previousUser,
      to: currentUser?.id
    });
  }
};

// Get session safely with error handling
export const getSessionSafe = async (): Promise<Session | null> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('[AUTH-HARDEN] Get session error:', error);
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('[AUTH-HARDEN] Get session exception:', error);
    return null;
  }
};

// Refresh session if needed (within 2 minutes of expiry)
export const refreshSessionIfNeeded = async (): Promise<boolean> => {
  if (!currentSession || refreshAttempted) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  const expiresAt = currentSession.expires_at;
  const timeUntilExpiry = expiresAt ? expiresAt - now : 0;
  
  // Refresh if expires within 2 minutes
  if (timeUntilExpiry < 120) {
    console.info('[AUTH-HARDEN] Session expires soon, refreshing...');
    
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('[AUTH-HARDEN] Refresh failed:', error);
        logAuthEvent('TOKEN_REFRESH_FAIL', { error: error.message });
        refreshAttempted = true;
        return false;
      }
      
      if (session) {
        console.info('[AUTH-HARDEN] Session refreshed successfully');
        updateSessionState(session);
        return true;
      }
    } catch (error) {
      console.error('[AUTH-HARDEN] Refresh exception:', error);
      logAuthEvent('TOKEN_REFRESH_FAIL', { error: 'exception' });
      refreshAttempted = true;
    }
  }
  
  return false;
};

// Sign out safely
export const signOutSafe = async (): Promise<boolean> => {
  try {
    console.info('[AUTH-HARDEN] Signing out...');
    
    // Clear returnTo storage
    sessionStorage.removeItem('tpc:returnTo');
    sessionStorage.removeItem('tpc:redirectCount');
    
    await supabase.auth.signOut();
    
    // Clear local state
    updateSessionState(null);
    refreshAttempted = false;
    
    return true;
  } catch (error) {
    console.error('[AUTH-HARDEN] Sign out error:', error);
    return false;
  }
};

// Get current user
export const getCurrentUser = (): User | null => currentUser;

// Get current session
export const getCurrentSession = (): Session | null => currentSession;

// Check if user is authenticated
export const isAuthenticated = (): boolean => !!currentUser;

// Subscribe to session changes
export const onSessionChange = (callback: (session: Session | null) => void) => {
  sessionListeners.push(callback);
  
  // Return unsubscribe function
  return () => {
    const index = sessionListeners.indexOf(callback);
    if (index > -1) {
      sessionListeners.splice(index, 1);
    }
  };
};

// Audit logging (client-side safe)
export const logAuthEvent = (event: string, meta: Record<string, any> = {}) => {
  const logEntry = {
    event,
    meta: {
      ...meta,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: currentUser?.id
    }
  };
  
  console.info('[AUTH-AUDIT]', logEntry);
  
  // Optional: Send to database if RPC is available
  // This is best-effort and will be ignored if it fails
  try {
    // Type assertion to handle unknown RPC function
    (supabase.rpc as any)('log_auth_event', {
      p_event: event,
      p_meta: logEntry.meta
    }).catch(() => {
      // Silently ignore RPC failures
    });
  } catch {
    // Silently ignore any errors
  }
};

// Check if session is expired or will expire soon
export const isSessionExpiringSoon = (): boolean => {
  if (!currentSession?.expires_at) return true;
  
  const now = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = currentSession.expires_at - now;
  
  return timeUntilExpiry < 120; // Less than 2 minutes
};
