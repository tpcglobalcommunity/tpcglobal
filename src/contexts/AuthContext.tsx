import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  username: string;
  role: string;
  referral_code: string;
  is_verified: boolean;
  can_invite: boolean;
  is_profile_complete: boolean;
  status?: string;
  created_at: string;
}

interface AuthContextType {
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isMember: boolean;
  isMod: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  signUpInviteOnly: (params: {
    referralCode: string;
    email: string;
    password: string;
    fullName: string;
    username: string;
  }) => Promise<{ error: Error | null; session: Session | null }>;
  signIn: (params: {
    email: string;
    password: string;
  }) => Promise<{ error: Error | null; session: Session | null }>;
  signOut: () => Promise<void>;
  signOutAllDevices: () => Promise<void>;
  sendPasswordReset: (email: string, redirectTo: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const fetchProfile = async (_userId: string) => {
    // DISABLED: Profile fetching is now handled by useProfileStatus hook
    // This prevents duplicate requests and infinite loops
    console.log('[AuthContext] Profile fetching delegated to useProfileStatus');
    return;
    
    /* Original code - disabled to prevent duplicates
    if (fetchingProfile) return;

    try {
      setFetchingProfile(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } finally {
      setFetchingProfile(false);
    }
    */
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUpInviteOnly = async (params: {
    referralCode: string;
    email: string;
    password: string;
    fullName: string;
    username: string;
  }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: params.email,
        password: params.password,
        options: {
          data: {
            referral_code: params.referralCode.trim().toUpperCase(),
            full_name: params.fullName.trim(),
            username: params.username.trim().toLowerCase(),
          },
        },
      });

      if (error) throw error;
      return { error: null, session: data.session };
    } catch (error) {
      return { error: error as Error, session: null };
    }
  };

  const signIn = async (params: { email: string; password: string }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: params.email,
        password: params.password,
      });

      if (error) throw error;
      return { error: null, session: data.session };
    } catch (error) {
      return { error: error as Error, session: null };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const signOutAllDevices = async () => {
    await supabase.auth.signOut({ scope: 'global' });
  };

  const sendPasswordReset = async (email: string, redirectTo: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const isMember = !!profile;
  const isMod = profile?.role === 'moderator' || profile?.role === 'admin' || profile?.role === 'super_admin';
  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
  const isSuperAdmin = profile?.role === 'super_admin';

  const value: AuthContextType = {
    loading,
    session,
    user,
    profile,
    isMember,
    isMod,
    isAdmin,
    isSuperAdmin,
    signUpInviteOnly,
    signIn,
    signOut,
    signOutAllDevices,
    sendPasswordReset,
    updatePassword,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
