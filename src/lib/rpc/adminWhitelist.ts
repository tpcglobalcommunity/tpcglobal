// Admin Whitelist Management RPC Functions
// These functions provide safe admin management with audit logging

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface AdminWhitelistEntry {
  user_id: string;
  note: string | null;
  created_at: string;
}

export interface AdminWhitelistAuditEntry {
  id: number;
  action: 'ADD' | 'REMOVE';
  target_user_id: string;
  note: string | null;
  actor_user_id: string;
  created_at: string;
}

/**
 * List all admin whitelist entries
 * Only accessible by admin users
 */
export async function listAdminWhitelist(): Promise<AdminWhitelistEntry[]> {
  try {
    const { data, error } = await supabase.rpc('admin_whitelist_list');
    
    if (error) {
      logger.error('Failed to list admin whitelist', error);
      throw new Error('Failed to list admin whitelist');
    }
    
    return data || [];
  } catch (error) {
    logger.error('Unexpected error listing admin whitelist', error);
    throw error;
  }
}

/**
 * Add or update user in admin whitelist
 * Only accessible by admin users
 */
export async function addAdminToWhitelist(userId: string, note?: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('admin_whitelist_add', {
      p_user_id: userId,
      p_note: note || null
    });
    
    if (error) {
      logger.error('Failed to add admin to whitelist', { userId, error });
      throw new Error('Failed to add admin to whitelist');
    }
    
    logger.info('Admin added to whitelist', { userId, note });
  } catch (error) {
    logger.error('Unexpected error adding admin to whitelist', error);
    throw error;
  }
}

/**
 * Remove user from admin whitelist
 * Only accessible by admin users
 */
export async function removeAdminFromWhitelist(userId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('admin_whitelist_remove', {
      p_user_id: userId
    });
    
    if (error) {
      logger.error('Failed to remove admin from whitelist', { userId, error });
      throw new Error('Failed to remove admin from whitelist');
    }
    
    logger.info('Admin removed from whitelist', { userId });
  } catch (error) {
    logger.error('Unexpected error removing admin from whitelist', error);
    throw error;
  }
}

/**
 * Get audit log for admin whitelist changes
 * Only accessible by admin users
 */
export async function getAdminWhitelistAudit(): Promise<AdminWhitelistAuditEntry[]> {
  try {
    const { data, error } = await supabase
      .from('admin_whitelist_audit')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      logger.error('Failed to get admin whitelist audit', error);
      throw new Error('Failed to get admin whitelist audit');
    }
    
    return data || [];
  } catch (error) {
    logger.error('Unexpected error getting admin whitelist audit', error);
    throw error;
  }
}
