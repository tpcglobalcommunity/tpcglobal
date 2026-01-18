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

export type NewsCategory = 'education' | 'update' | 'release' | 'policy' | 'transparency';

export interface NewsPost {
  id: string;
  slug: string;
  category: NewsCategory;
  title_en: string;
  excerpt_en: string;
  content_en: string;
  title_id: string;
  excerpt_id: string;
  content_id: string;
  cover_url: string | null;
  tags: string[];
  is_pinned: boolean;
  is_published: boolean;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewsPostListItem {
  id: string;
  slug: string;
  category: NewsCategory;
  title_en: string;
  excerpt_en: string;
  title_id: string;
  excerpt_id: string;
  cover_url: string | null;
  tags: string[];
  is_pinned: boolean;
  published_at: string | null;
  created_by: string | null;
  author_name: string | null;
  created_at: string;
}

export interface NewsPostDetail {
  id: string;
  slug: string;
  category: NewsCategory;
  title_en: string;
  excerpt_en: string;
  content_en: string;
  title_id: string;
  excerpt_id: string;
  content_id: string;
  cover_url: string | null;
  tags: string[];
  is_pinned: boolean;
  is_published: boolean;
  published_at: string | null;
  created_by: string | null;
  author_name: string | null;
  created_at: string;
  updated_at: string;
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

export const getNewsPosts = async (
  limit: number = 10,
  offset: number = 0,
  category: NewsCategory | null = null,
  pinnedFirst: boolean = true
): Promise<NewsPostListItem[]> => {
  const { data, error } = await supabase.rpc('get_news_posts', {
    p_limit: limit,
    p_offset: offset,
    p_category: category,
    p_pinned_first: pinnedFirst,
  });

  if (error) {
    console.error('Error fetching news posts:', error);
    return [];
  }

  return data || [];
};

export const getNewsPostBySlug = async (slug: string): Promise<NewsPostDetail | null> => {
  const { data, error } = await supabase.rpc('get_news_post_by_slug', {
    p_slug: slug,
  });

  if (error) {
    console.error('Error fetching news post:', error);
    return null;
  }

  return data && data.length > 0 ? data[0] : null;
};

export const adminGetNewsPost = async (identifier: string): Promise<NewsPostDetail | null> => {
  const { data, error } = await supabase.rpc('admin_get_news_post', {
    p_identifier: identifier,
  });

  if (error) {
    console.error('Error fetching news post (admin):', error);
    throw error;
  }

  return data && data.length > 0 ? data[0] : null;
};

export const createNewsPost = async (post: Omit<NewsPost, 'id' | 'created_at' | 'updated_at'>): Promise<NewsPost | null> => {
  const { data, error } = await supabase
    .from('news_posts')
    .insert([post])
    .select()
    .single();

  if (error) {
    console.error('Error creating news post:', error);
    throw error;
  }

  return data;
};

export const updateNewsPost = async (id: string, updates: Partial<NewsPost>): Promise<NewsPost | null> => {
  const { data, error } = await supabase
    .from('news_posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating news post:', error);
    throw error;
  }

  return data;
};

export const deleteNewsPost = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('news_posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting news post:', error);
    throw error;
  }

  return true;
};
