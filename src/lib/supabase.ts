import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log Supabase configuration for debugging
console.log('🔧 Supabase Config:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  configured: !!(supabaseUrl && supabaseAnonKey)
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    VITE_SUPABASE_URL: !!supabaseUrl,
    VITE_SUPABASE_ANON_KEY: !!supabaseAnonKey
  });
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key'); // Fallback to prevent null

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Helper function to ensure supabase is configured before use
function ensureSupabase() {
  if (!supabase) {
    console.warn('Supabase is not configured. Using fallback client.');
    return supabase; // Return fallback client instead of throwing
  }
  return supabase;
}

function normalizeSupabaseError(err: any) {
  // jika sudah ternormalisasi, jangan dinormalisasi ulang
  if (err && typeof err === "object" && ("raw" in err) && ("timestamp" in err)) {
    return err;
  }

  const e = err || {};
  return {
    status: e?.status ?? e?.statusCode ?? null,
    code: e?.code ?? e?.error_code ?? null,
    message: e?.message ?? String(e),
    details: e?.details ?? null,
    hint: e?.hint ?? null,
    name: e?.name ?? null,
    stack: e?.stack ?? null,
    timestamp: new Date().toISOString(),
    raw: e,
  };
}

export interface Profile {
  id: string;
  email: string | null;
  username: string | null;
  full_name: string | null;
  phone: string | null;
  telegram: string | null;
  city: string | null;
  profile_completed: boolean;
  status?: string | null;
  role?: string | null;
  avatar_url: string | null;
  verified: boolean;  // ✅ Kolom di DB: verified
  referral_code: string;
  referred_by: string | null;
  referral_count: number;
  can_invite: boolean;
  created_at: string;
  updated_at: string;
  vendor_status?: 'approved' | 'pending' | 'rejected' | 'none';
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
  vendor_status?: string;
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
  if (!code || code.trim() === '') {
    console.log('[validateReferralCode] Empty code');
    return false;
  }

  const trimmedCode = code.trim().toUpperCase();
  console.log('[validateReferralCode] Starting validation for:', trimmedCode);

  try {
    const startTime = Date.now();

    const { data, error } = await ensureSupabase().rpc('validate_referral_code', {
      p_code: trimmedCode
    });

    const elapsed = Date.now() - startTime;
    console.log('[validateReferralCode] Request completed in', elapsed, 'ms');
    console.log('[validateReferralCode] Raw response:', { data, error });

    if (error) {
      console.error('[validateReferralCode] RPC Error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return false;
    }

    const isValid = data === true;
    console.log('[validateReferralCode] Is valid:', isValid);

    return isValid;
  } catch (err: any) {
    console.error('[validateReferralCode] Exception:', {
      message: err?.message,
      stack: err?.stack
    });
    return false;
  }
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

export const updateProfileSafe = async ({
  full_name,
  username,
  avatar_url,
}: {
  full_name: string;
  username: string;
  avatar_url: string;
}): Promise<Profile> => {
  const { data, error } = await supabase.rpc('update_profile_safe', {
    p_full_name: full_name,
    p_username: username,
    p_avatar_url: avatar_url,
  });

  if (error) {
    console.error('Error updating profile:', error);
    throw new Error(error.message || 'Failed to update profile');
  }

  return data as Profile;
};

export const checkUsernameAvailable = async (username: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc('check_username_available', {
    p_username: username,
  });

  if (error) {
    console.error('Error checking username:', error);
    return false;
  }

  return data as boolean;
};

export const uploadAvatar = async (file: File): Promise<string> => {
  const MAX_SIZE = 2 * 1024 * 1024;
  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/jpg'];

  if (file.size > MAX_SIZE) {
    throw new Error('FILE_TOO_LARGE');
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('INVALID_FILE_TYPE');
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const fileExt = file.name.split('.').pop();
  const filePath = `${user.id}/profile.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    console.error('Error uploading avatar:', uploadError);
    throw new Error('Failed to upload avatar');
  }

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  return publicUrl;
};

export const signOutLocal = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut({ scope: 'local' });
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const signOutAllDevices = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut({ scope: 'global' });
  if (error) {
    console.error('Error signing out all devices:', error);
    throw error;
  }
};

export const logAuthEvent = async (eventType: string, userAgent?: string): Promise<void> => {
  try {
    await supabase.rpc('log_member_auth_event', {
      p_event_type: eventType,
      p_user_agent: userAgent || navigator.userAgent || null,
    });
  } catch (err) {
    console.warn('Failed to log auth event (non-blocking):', err);
  }
};

export interface MemberAuthEvent {
  id: string;
  event_type: string;
  user_agent: string | null;
  created_at: string;
}

export const getMemberAuthEvents = async (limit: number = 10): Promise<MemberAuthEvent[]> => {
  const { data, error } = await supabase.rpc('get_member_auth_events', {
    p_limit: limit,
  });

  if (error) {
    console.error('Error fetching auth events:', error);
    return [];
  }

  return (data || []) as MemberAuthEvent[];
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

export interface ReferralItem {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
}

export interface ReferralAnalytics {
  referral_code: string | null;
  total_referrals: number;
  last_7_days: number;
  last_30_days: number;
  invite_status: string; // 'ACTIVE' or 'INACTIVE'
}

export const ensureReferralCode = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase.rpc('ensure_referral_code');

    if (error) {
      console.error('Error ensuring referral code:', error);
      return null;
    }

    return data as string;
  } catch (err) {
    console.error('Error in ensureReferralCode:', err);
    return null;
  }
};

export const generateReferralCode = async (): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const referralCode = 'TPC-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    const { error } = await supabase
      .from('profiles')
      .update({ referral_code: referralCode })
      .eq('id', user.id);

    if (error) throw error;

    return referralCode;
  } catch (err) {
    console.error('Error generating referral code:', err);
    return null;
  }
};

export interface LeaderboardItem {
  username: string;
  full_name: string;
  avatar_url: string | null;
  referral_count: number;
  is_verified: boolean;
}

export const getReferralLeaderboard = async (limit: number = 10): Promise<LeaderboardItem[]> => {
  try {
    const { data, error } = await supabase.rpc('get_referral_leaderboard', {
      p_limit: limit,
    });

    if (error) {
      console.error('Error fetching referral leaderboard:', error);
      return [];
    }

    return (data || []) as LeaderboardItem[];
  } catch (err) {
    console.error('Error in getReferralLeaderboard:', err);
    return [];
  }
};

export interface DirectoryMemberItem {
  username: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
  is_verified: boolean;
  created_at: string;
  bio: string | null;
  country: string | null;
  vendor_status: string;
  total_count?: number;
}

export interface DirectoryResult {
  members: DirectoryMemberItem[];
  total: number;
}

export const updateDirectorySettings = async (settings: {
  show_in_directory: boolean;
  bio?: string;
  country?: string;
}): Promise<{ show_in_directory: boolean; bio: string | null; country: string | null } | null> => {
  try {
    const { data, error } = await supabase.rpc('update_directory_settings', {
      p_show: settings.show_in_directory,
      p_bio: settings.bio || null,
      p_country: settings.country || null,
    });

    if (error) {
      console.error('Error updating directory settings:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error in updateDirectorySettings:', err);
    return null;
  }
};

export const getMemberDirectory = async (params: {
  query?: string;
  page?: number;
  pageSize?: number;
}): Promise<DirectoryResult> => {
  const { query = '', page = 1, pageSize = 24 } = params;
  const offset = (page - 1) * pageSize;

  try {
    const { data, error } = await supabase.rpc('get_member_directory', {
      p_query: query || null,
      p_limit: pageSize,
      p_offset: offset,
    });

    if (error) {
      console.error('Error fetching member directory:', error);
      return { members: [], total: 0 };
    }

    const members = (data || []) as DirectoryMemberItem[];
    const total = members.length > 0 ? members[0].total_count || 0 : 0;

    return { members, total };
  } catch (err) {
    console.error('Error in getMemberDirectory:', err);
    return { members: [], total: 0 };
  }
};

export const getPublicProfileByUsername = async (username: string): Promise<DirectoryMemberItem | null> => {
  try {
    const { data, error } = await supabase.rpc('get_public_profile_by_username', {
      p_username: username,
    });

    if (error) {
      console.error('Error fetching public profile:', error);
      return null;
    }

    return data as DirectoryMemberItem | null;
  } catch (err) {
    console.error('Error in getPublicProfileByUsername:', err);
    return null;
  }
};

export interface PublicVendor {
  id: string;
  brand_name: string;
  description_en: string;
  description_id: string;
  category: string;
  website_url: string | null;
  contact_telegram: string | null;
  created_at: string;
  role: string;
  is_verified: boolean;
}

export interface VendorApplication {
  id: string;
  user_id: string;
  username: string;
  brand_name: string;
  description_en: string;
  description_id: string;
  category: string;
  website_url: string | null;
  contact_telegram: string | null;
  contact_email: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const getPublicVendors = async (category?: string): Promise<PublicVendor[]> => {
  try {
    const { data, error } = await supabase.rpc('get_public_vendors', {
      p_category: category || null,
    });

    if (error) {
      console.error('Error fetching public vendors:', error);
      return [];
    }

    return (data || []) as PublicVendor[];
  } catch (err) {
    console.error('Error in getPublicVendors:', err);
    return [];
  }
};

export const submitVendorApplication = async (params: {
  brand_name: string;
  description_en: string;
  description_id: string;
  category: string;
  website_url?: string;
  contact_telegram?: string;
  contact_email?: string;
}): Promise<string | null> => {
  try {
    const { data, error } = await supabase.rpc('submit_vendor_application', {
      p_brand_name: params.brand_name,
      p_description_en: params.description_en,
      p_description_id: params.description_id,
      p_category: params.category,
      p_website_url: params.website_url || null,
      p_contact_telegram: params.contact_telegram || null,
      p_contact_email: params.contact_email || null,
    });

    if (error) {
      console.error('Error submitting vendor application:', error);
      throw new Error(error.message);
    }

    return data as string;
  } catch (err: any) {
    console.error('Error in submitVendorApplication:', err);
    throw err;
  }
};

export const getVendorApplicationsAdmin = async (status?: string): Promise<VendorApplication[]> => {
  try {
    const { data, error } = await supabase.rpc('get_vendor_applications_admin', {
      p_status: status || null,
    });

    if (error) {
      console.error('Error fetching vendor applications:', error);
      return [];
    }

    return (data || []) as VendorApplication[];
  } catch (err) {
    console.error('Error in getVendorApplicationsAdmin:', err);
    return [];
  }
};

export const updateVendorApplicationStatus = async (
  applicationId: string,
  status: 'pending' | 'approved' | 'rejected'
): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('update_vendor_application_status', {
      p_application_id: applicationId,
      p_status: status,
    });

    if (error) {
      console.error('Error updating vendor application status:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error in updateVendorApplicationStatus:', err);
    return false;
  }
};

export interface TrustSnapshot {
  username: string;
  full_name: string;
  avatar_url: string | null;
  role: 'member' | 'moderator' | 'admin' | 'super_admin';
  is_verified: boolean;
  can_invite: boolean;
  created_at: string;
  show_in_directory: boolean;
  vendor_status: 'approved' | 'pending' | 'rejected' | 'none';
  vendor_brand_name: string | null;
}

export const getTrustSnapshot = async (identifier: string): Promise<TrustSnapshot | null> => {
  try {
    const { data, error } = await supabase.rpc('get_trust_snapshot', {
      identifier: identifier.trim(),
    });

    if (error) {
      console.error('Error getting trust snapshot:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    return data[0] as TrustSnapshot;
  } catch (err) {
    console.error('Error in getTrustSnapshot:', err);
    return null;
  }
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

export interface AdminUserListItem {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  role: 'member' | 'moderator' | 'admin' | 'super_admin';
  is_verified: boolean;
  can_invite: boolean;
  referral_code: string;
  referral_count: number;
  created_at: string;
  show_in_directory: boolean;
  vendor_status: string;
  country: string | null;
  total_count: number;
}

export interface AdminListUsersParams {
  query?: string;
  role?: string;
  verified?: boolean;
  can_invite?: boolean;
  limit?: number;
  offset?: number;
}

export const adminListUsers = async (params: AdminListUsersParams = {}): Promise<AdminUserListItem[]> => {
  const {
    query = null,
    role = null,
    verified = null,
    can_invite = null,
    limit = 20,
    offset = 0,
  } = params;

  try {
    const { data, error } = await supabase.rpc('admin_list_users', {
      p_query: query,
      p_role: role,
      p_verified: verified,
      p_can_invite: can_invite,
      p_limit: limit,
      p_offset: offset,
    });

    if (error) {
      console.error('Error listing users (admin):', error);
      throw error;
    }

    return (data || []) as AdminUserListItem[];
  } catch (err) {
    console.error('Error in adminListUsers:', err);
    throw err;
  }
};

export const adminSetUserRole = async (
  targetUserId: string,
  newRole: 'member' | 'moderator' | 'admin' | 'super_admin',
  reason: string = ''
): Promise<{ success: boolean; old_role: string; new_role: string }> => {
  try {
    const { data, error } = await supabase.rpc('admin_set_user_role', {
      p_target_user_id: targetUserId,
      p_new_role: newRole,
      p_reason: reason,
    });

    if (error) {
      console.error('Error setting user role:', error);
      throw error;
    }

    return data as { success: boolean; old_role: string; new_role: string };
  } catch (err) {
    console.error('Error in adminSetUserRole:', err);
    throw err;
  }
};

export const adminSetUserVerified = async (
  targetUserId: string,
  newVerified: boolean,
  reason: string = ''
): Promise<{ success: boolean; old_verified: boolean; new_verified: boolean }> => {
  try {
    const { data, error } = await supabase.rpc('admin_set_user_verified', {
      p_target_user_id: targetUserId,
      p_new_verified: newVerified,
      p_reason: reason,
    });

    if (error) {
      console.error('Error setting user verified:', error);
      throw error;
    }

    return data as { success: boolean; old_verified: boolean; new_verified: boolean };
  } catch (err) {
    console.error('Error in adminSetUserVerified:', err);
    throw err;
  }
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
    if (error.code === '23505') {
      return await getOnboardingState();
    }
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
  console.log('[SIGNUP_API] Starting signUpInviteOnly');
  console.log('[SIGNUP_API] Input:', { 
    email: email.replace(/(.{2}).+(@.+)/, '$1***$2'), // privacy masking
    referralCode: referralCode.trim().toUpperCase(),
    hasFullName: !!fullName,
    hasUsername: !!username
  });

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          referralCode: referralCode.trim().toUpperCase(),
        },
      },
    });

    console.log('[SIGNUP_API] Response:', { 
      data: data ? {
        user: {
          id: data.user?.id,
          email: data.user?.email,
          confirmed_at: data.user?.confirmed_at,
          identities_count: data.user?.identities?.length || 0
        }
      } : null, 
      error: error ? {
        message: error.message,
        status: error.status,
        code: error.code
      } : null 
    });

    if (error) {
      const normalizedError = normalizeSupabaseError(error);
      console.log('SIGNUP SUPABASE ERROR:', normalizedError);
      throw normalizedError;
    }

    const result = {
      checkEmail: data?.user?.identities?.length === 0,
    };
    
    console.log('[SIGNUP_API] Success:', result);
    return result;
  } catch (err: any) {
    const normalizedError = normalizeSupabaseError(err);
    console.log('SIGNUP EXCEPTION ERROR:', normalizedError);
    throw normalizedError;
  }
};

export const createProfileIfMissing = async (userId: string, email: string, fullName: string, username: string, referralCode: string): Promise<{ success: boolean; message?: string }> => {
  console.log('[PROFILE] Creating profile if missing for user:', userId);
  
  try {
    // First check if profile already exists
    console.log('[PROFILE] Checking if profile exists...');
    const { data: existingProfile, error: checkError } = await ensureSupabase()
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('[PROFILE] Check error:', checkError);
      return { success: false, message: checkError.message };
    }

    if (existingProfile) {
      console.log('[PROFILE] Profile already exists, skipping creation');
      return { success: true }; // Profile already exists
    }

    console.log('[PROFILE] Creating new profile...');
    // Try to create minimal profile
    const profileData = {
      id: userId,
      email: email,
      full_name: fullName,
      username: username.toLowerCase(),
      referral_code: referralCode.toUpperCase(),
      role: 'member',
      is_verified: false,
      can_invite: false,
      referral_count: 0,
    };

    console.log('[PROFILE] Inserting profile data:', profileData);
    const { error } = await ensureSupabase()
      .from('profiles')
      .insert([profileData]);

    if (error) {
      console.error('[PROFILE] Profile creation error:', error);
      
      // Telemetry: log profile creation failure with privacy masking
      const emailMasked = email.replace(/(.{2}).+(@.+)/, "$1***$2");
      console.error('[TELEMETRY] Profile creation failed:', { 
        userId, 
        email: emailMasked, 
        error: error.message, 
        code: error.code 
      });
      
      // Check if it's a NOT NULL constraint error
      if (error.code === '23502' || error.message.includes('null value')) {
        return { 
          success: false, 
          message: 'Profil belum bisa dibuat karena konfigurasi database (kolom wajib). Hubungi admin.' 
        };
      }
      
      return { success: false, message: error.message };
    }

    console.log('[PROFILE] Profile created successfully');
    return { success: true };
  } catch (err: any) {
    console.error('[PROFILE] Profile creation exception:', err);
    return { success: false, message: err?.message || 'Failed to create profile' };
  }
};

export async function getMyProfile(): Promise<Profile | null> {
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

// Safe get_app_settings with fallback
export async function getAppSettings(): Promise<Record<string, string>> {
  try {
    console.log('🔧 Fetching app settings...');
    const { data, error } = await supabase.rpc('get_app_settings');
    
    if (error) {
      console.warn('⚠️ get_app_settings RPC failed:', error.message);
      // Return fallback settings
      return {
        maintenance_mode: 'false',
        version: '1.0.0',
        app_name: 'TPC Global'
      };
    }
    
    if (!data || data.length === 0) {
      console.warn('⚠️ get_app_settings returned no data');
      return {
        maintenance_mode: 'false',
        version: '1.0.0',
        app_name: 'TPC Global'
      };
    }
    
    // Convert array to object
    const settings: Record<string, string> = {};
    data.forEach((item: any) => {
      settings[item.key] = item.value;
    });
    
    console.log('✅ App settings loaded:', settings);
    return settings;
  } catch (err: any) {
    console.error('❌ get_app_settings exception:', err);
    // Return fallback settings on any error
    return {
      maintenance_mode: 'false',
      version: '1.0.0',
      app_name: 'TPC Global'
    };
  }
}
