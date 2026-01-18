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

export type AnnouncementCategory = 'general' | 'update' | 'policy' | 'security' | 'release';

export interface Announcement {
  id: string;
  title_en: string;
  title_id: string;
  body_en: string;
  body_id: string;
  category: AnnouncementCategory;
  is_pinned: boolean;
  is_published: boolean;
  published_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface OnboardingState {
  user_id: string;
  accepted_disclaimer: boolean;
  joined_telegram: boolean;
  read_docs: boolean;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

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

export const getPublishedAnnouncements = async ({
  page = 1,
  pageSize = 20,
  query: searchQuery = '',
}: {
  page?: number;
  pageSize?: number;
  query?: string;
}): Promise<Announcement[]> => {
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from('announcements')
    .select('*')
    .eq('is_published', true);

  if (searchQuery.trim()) {
    query = query.or(`title_en.ilike.%${searchQuery}%,title_id.ilike.%${searchQuery}%`);
  }

  query = query
    .order('is_pinned', { ascending: false })
    .order('published_at', { ascending: false, nullsFirst: false })
    .range(offset, offset + pageSize - 1);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }

  return data || [];
};

export const listAnnouncementsAdmin = async ({
  filter = 'all',
  limit = 50,
  offset = 0,
}: {
  filter?: 'all' | 'published' | 'draft';
  limit?: number;
  offset?: number;
}): Promise<Announcement[]> => {
  let query = supabase
    .from('announcements')
    .select('*');

  if (filter === 'published') {
    query = query.eq('is_published', true);
  } else if (filter === 'draft') {
    query = query.eq('is_published', false);
  }

  query = query
    .order('is_pinned', { ascending: false })
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching announcements (admin):', error);
    return [];
  }

  return data || [];
};

export const getAnnouncement = async (id: string): Promise<Announcement | null> => {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching announcement:', error);
    return null;
  }

  return data;
};

export const upsertAnnouncement = async (
  announcement: Partial<Announcement> & { id?: string }
): Promise<Announcement | null> => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const payload = {
    ...announcement,
    updated_by: user.id,
    created_by: announcement.id ? announcement.created_by : user.id,
  };

  const { data, error } = await supabase
    .from('announcements')
    .upsert([payload])
    .select()
    .single();

  if (error) {
    console.error('Error upserting announcement:', error);
    throw error;
  }

  return data;
};

export const deleteAnnouncement = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting announcement:', error);
    throw error;
  }

  return true;
};

export const getOnboardingState = async (): Promise<OnboardingState | null> => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('member_onboarding')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching onboarding state:', error);
    return null;
  }

  return data;
};

export const upsertOnboardingState = async (
  patch: Partial<Omit<OnboardingState, 'user_id' | 'created_at' | 'updated_at'>>
): Promise<OnboardingState | null> => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('member_onboarding')
    .upsert([{ user_id: user.id, ...patch }])
    .select()
    .single();

  if (error) {
    console.error('Error upserting onboarding state:', error);
    throw error;
  }

  return data;
};

export const ensureOnboardingRow = async (): Promise<OnboardingState | null> => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const existing = await getOnboardingState();
  if (existing) return existing;

  const { data, error } = await supabase
    .from('member_onboarding')
    .insert([{ user_id: user.id }])
    .select()
    .single();

  if (error) {
    console.error('Error ensuring onboarding row:', error);
    return null;
  }

  return data;
};

export const signIn = async ({ email, password }: { email: string; password: string }): Promise<void> => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }
};

export const signUpInviteOnly = async ({
  referralCode,
  email,
  password,
  fullName,
  username,
}: {
  referralCode: string;
  email: string;
  password: string;
  fullName: string;
  username: string;
}): Promise<{ checkEmail?: boolean } | null> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        username: username,
        referral_code: referralCode.toUpperCase(),
      },
    },
  });

  if (error) {
    throw error;
  }

  return {
    checkEmail: data?.user?.identities?.length === 0,
  };
};
