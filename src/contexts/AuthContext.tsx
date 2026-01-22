import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';
import { useProfileStatus } from '../lib/useProfileStatus';

interface AuthContextType {
  loading: boolean;
  session: Session | null;
  user: User | null;
  role: string;
  verified: boolean;
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
  const { loading: profileLoading, role, verified } = useProfileStatus(session?.user?.id);

  const isMember = role === 'member';
  const isMod = false; // No moderator role in new system
  const isAdmin = role === 'admin' || role === 'super_admin';
  const isSuperAdmin = role === 'super_admin';

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
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
    // Profile refresh is handled by useProfileStatus hook
  };

  const value: AuthContextType = {
    loading: loading || profileLoading,
    session,
    user,
    role,
    verified,
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
