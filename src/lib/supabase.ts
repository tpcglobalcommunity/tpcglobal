import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  role: 'member' | 'moderator' | 'admin' | 'super_admin';
  is_verified: boolean;
  referral_code: string;
  referred_by: string | null;
  referral_count: number;
  can_invite: boolean;
  created_at: string;
  updated_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  referral_code: string;
  created_at: string;
}

export interface MemberVerification {
  username: string | null;
  full_name: string | null;
  role: string;
  is_verified: boolean;
  created_at: string;
  avatar_url: string | null;
  referral_code: string;
}

export interface AdminAction {
  id: string;
  admin_id: string;
  action_type: string;
  target_user_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export const validateReferralCode = async (code: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('referral_code, can_invite')
    .eq('referral_code', code.toUpperCase())
    .maybeSingle();

  if (error) {
    console.error('Error validating referral code:', error);
    return false;
  }

  return !!(data && data.can_invite);
};

export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
};

export const getReferrals = async (userId: string): Promise<Referral[]> => {
  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('referrer_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching referrals:', error);
    return [];
  }

  return data || [];
};

export const verifyMember = async (identifier: string): Promise<MemberVerification | null> => {
  const { data, error } = await supabase.rpc('verify_member', {
    identifier: identifier.trim(),
  });

  if (error) {
    console.error('Error verifying member:', error);
    return null;
  }

  return data;
};

export const adminCreateBootstrapMember = async (
  targetUserId: string,
  targetUsername: string,
  targetFullName: string,
  targetRole: 'member' | 'moderator' | 'admin' | 'super_admin' = 'member',
  targetCanInvite: boolean = true
): Promise<string | null> => {
  const { data, error } = await supabase.rpc('admin_create_bootstrap_member', {
    target_user_id: targetUserId,
    target_username: targetUsername,
    target_full_name: targetFullName,
    target_role: targetRole,
    target_can_invite: targetCanInvite,
  });

  if (error) {
    console.error('Error creating bootstrap member:', error);
    throw error;
  }

  return data;
};

export const adminToggleCanInvite = async (
  targetUserId: string,
  newCanInviteStatus: boolean,
  reason?: string
): Promise<boolean> => {
  const { data, error } = await supabase.rpc('admin_toggle_can_invite', {
    target_user_id: targetUserId,
    new_can_invite_status: newCanInviteStatus,
    reason: reason || null,
  });

  if (error) {
    console.error('Error toggling can_invite:', error);
    throw error;
  }

  return data;
};

export const getAdminActions = async (limit: number = 50): Promise<AdminAction[]> => {
  const { data, error } = await supabase
    .from('admin_actions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching admin actions:', error);
    return [];
  }

  return data || [];
};
