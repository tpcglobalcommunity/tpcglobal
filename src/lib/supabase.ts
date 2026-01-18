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

export const validateReferralCode = async (code: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('referral_code')
    .eq('referral_code', code.toUpperCase())
    .maybeSingle();

  if (error) {
    console.error('Error validating referral code:', error);
    return false;
  }

  return !!data;
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
