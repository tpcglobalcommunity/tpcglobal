import { supabase } from '@/lib/supabase';

export interface VendorApplication {
  id: string;
  user_id: string;
  brand_name: string;
  category: string;
  description?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  contact_email?: string | null;
  website?: string | null;
  created_at: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  admin_note?: string | null;
  display_name?: string | null;
  contact_whatsapp?: string | null;
  country?: string | null;
  city?: string | null;
  updated_at?: string | null;
}

export interface VendorApplicationInput {
  brand_name: string;
  category: string;
  description?: string;
  website?: string;
  contact_email: string;
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

export const adminListVendorApplications = async (
  status?: 'all' | 'pending' | 'approved' | 'rejected'
): Promise<{ data: VendorApplication[]; error: string | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: [], error: 'Not authenticated' };
    }

    let query = supabase
      .from('vendor_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return { data: [], error: normalizeError(error) };
    }

    return { data: data || [], error: null };
  } catch (err) {
    return { data: [], error: normalizeError(err) };
  }
};

export const adminSetVendorApplicationStatus = async (
  id: string,
  status: 'approved' | 'rejected',
  adminNote?: string
): Promise<{ success: boolean; data?: VendorApplication; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase.rpc('review_vendor_application', {
      p_application_id: id,
      p_status: status,
      p_admin_note: adminNote || null
    });

    if (error) {
      return { success: false, error: normalizeError(error) };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: normalizeError(err) };
  }
};

export const submitVendorApplication = async (
  input: VendorApplicationInput
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('vendor_applications')
      .insert({
        user_id: user.id,
        ...input,
        website: input.website || null
      });

    if (error) {
      return { success: false, error: normalizeError(error) };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeError(err) };
  }
};

export const getMyVendorApplication = async (): Promise<{ data: VendorApplication | null; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('vendor_applications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      return { data: null, error: normalizeError(error) };
    }

    return { data, error: undefined };
  } catch (err) {
    return { data: null, error: normalizeError(err) };
  }
};
