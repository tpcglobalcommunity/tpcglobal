import { supabase } from '@/lib/supabase';

export interface MarketplaceItem {
  id: string;
  vendor_user_id: string;
  vendor_application_id?: string;
  title: string;
  slug: string;
  category: string;
  short_desc?: string;
  description?: string;
  website?: string;
  contact_email?: string;
  contact_whatsapp?: string;
  price_from?: number;
  currency: string;
  tags: string[];
  media: any;
  meta: any;
  status: 'draft' | 'published' | 'archived';
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceItemWithVendor extends MarketplaceItem {
  vendor_name?: string;
  vendor_username?: string;
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

export const adminListMarketplaceItems = async (
  options: {
    status?: 'all' | 'draft' | 'published' | 'archived';
    search?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ data: MarketplaceItemWithVendor[]; error: string | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: [], error: 'Not authenticated' };
    }

    let query = supabase
      .from('marketplace_items')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(options.limit || 50);

    if (options.status && options.status !== 'all') {
      query = query.eq('status', options.status);
    }

    // Add search functionality
    if (options.search && options.search.trim()) {
      query = query.or(
        `title.ilike.%${options.search}%,slug.ilike.%${options.search}%,category.ilike.%${options.search}%,id.ilike.%${options.search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      return { data: [], error: normalizeError(error) };
    }

    // Transform data without vendor info
    const items: MarketplaceItemWithVendor[] = (data || []).map((item: any) => ({
      ...item,
      vendor_name: `Vendor ${item.vendor_user_id?.substring(0, 8)}...`,
      vendor_username: null,
    }));

    return { data: items, error: null };
  } catch (err) {
    return { data: [], error: normalizeError(err) };
  }
};

export const adminUpdateMarketplaceItem = async (
  id: string,
  patch: Partial<MarketplaceItem>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Basic slug sanitization
    if (patch.slug) {
      patch.slug = patch.slug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    }

    const { error } = await supabase
      .from('marketplace_items')
      .update({
        ...patch,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      return { success: false, error: normalizeError(error) };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeError(err) };
  }
};

export const adminTogglePublished = async (
  id: string,
  published: boolean
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('marketplace_items')
      .update({
        status: published ? 'published' : 'draft',
        published_at: published ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      return { success: false, error: normalizeError(error) };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeError(err) };
  }
};

export const adminToggleFeatured = async (
  id: string,
  featured: boolean
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('marketplace_items')
      .update({
        meta: { featured },
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      return { success: false, error: normalizeError(error) };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeError(err) };
  }
};

export const adminGetMarketplaceStats = async (): Promise<{
  total: number;
  published: number;
  draft: number;
  archived: number;
  error: string | null;
}> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { total: 0, published: 0, draft: 0, archived: 0, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('marketplace_items')
      .select('status');

    if (error) {
      return { total: 0, published: 0, draft: 0, archived: 0, error: normalizeError(error) };
    }

    const items = data || [];
    const stats = {
      total: items.length,
      published: items.filter(item => item.status === 'published').length,
      draft: items.filter(item => item.status === 'draft').length,
      archived: items.filter(item => item.status === 'archived').length,
    };

    return { ...stats, error: null };
  } catch (err) {
    return { total: 0, published: 0, draft: 0, archived: 0, error: normalizeError(err) };
  }
};
