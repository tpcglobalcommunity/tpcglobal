import { supabase } from '@/lib/supabase';
import { Profile } from '@/lib/supabase';

export interface AdminMember extends Profile {
  // Use email from profiles table, no auth_email needed
}

function normalizeError(error: any): string {
  if (!error) return '';
  
  if (typeof error === 'string') return error;
  
  if (error?.code && error?.message) {
    return `${error.code}: ${error.message}`;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'Unknown error occurred';
}

export const adminListMembers = async (
  verified?: 'all' | 'verified' | 'unverified',
  search?: string
): Promise<{ data: AdminMember[]; error: string | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: [], error: 'Not authenticated' };
    }

    let query = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (verified && verified !== 'all') {
      query = query.eq('verified', verified === 'verified');
    }

    // Add search functionality using ilike
    if (search && search.trim()) {
      query = query.or(
        `email.ilike.%${search}%,full_name.ilike.%${search}%,username.ilike.%${search}%,id.ilike.%${search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      return { data: [], error: normalizeError(error) };
    }

    // No need for auth emails, use profiles.email directly
    const members: AdminMember[] = (data || []).map(profile => ({
      ...profile,
    }));

    return { data: members, error: null };
  } catch (err) {
    return { data: [], error: normalizeError(err) };
  }
};

export const adminSetMemberVerified = async (
  userId: string,
  verified: boolean
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('profiles')
      .update({ verified, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      return { success: false, error: normalizeError(error) };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeError(err) };
  }
};
