import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

export type AdminRole = 'super_admin' | 'admin' | 'viewer' | 'member' | null;

export function useMyRole() {
  const [role, setRole] = useState<AdminRole>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRole() {
      try {
        setLoading(true);
        setError(null);

        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setRole(null);
          return;
        }

        // Query user profile to get role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        setRole(profile.role as AdminRole);
      } catch (e: any) {
        console.error('Error fetching user role:', e);
        setError(e.message || 'Failed to fetch user role');
        setRole(null);
      } finally {
        setLoading(false);
      }
    }

    fetchRole();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          fetchRole();
        } else if (event === 'SIGNED_OUT') {
          setRole(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { role, loading, error };
}

// Helper functions for role checking
export function isSuperAdmin(role: AdminRole): boolean {
  return role === 'super_admin';
}

export function isAdmin(role: AdminRole): boolean {
  return role === 'admin' || role === 'super_admin';
}

export function isViewer(role: AdminRole): boolean {
  return role === 'viewer' || role === 'admin' || role === 'super_admin';
}

export function canEditMembers(role: AdminRole): boolean {
  return role === 'super_admin';
}

export function canManageVerification(role: AdminRole): boolean {
  return role === 'admin' || role === 'super_admin';
}

export function canManageSettings(role: AdminRole): boolean {
  return role === 'super_admin';
}

export function canViewAudit(role: AdminRole): boolean {
  return role === 'admin' || role === 'super_admin';
}
