// Safe Notifications Helper - Production Ready
// Handles notifications with feature flag and graceful fallbacks

import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export interface Notification {
  id: number;
  created_at: string;
  user_id: string;
  type: string;
  title: string;
  body?: string;
  is_read: boolean;
}

// Cache and state
let notificationsCache: Notification[] = [];
let cacheAt = 0;
let inFlight: Promise<Notification[]> | null = null;
let featureEnabled: boolean | null = null;

const TTL_MS = 2 * 60 * 1000; // 2 minutes cache
const DEFAULT_NOTIFICATIONS: Notification[] = [];

/**
 * Check if notifications feature is enabled
 */
async function isNotificationsEnabled(): Promise<boolean> {
  if (featureEnabled !== null) {
    return featureEnabled;
  }

  try {
    // Try to fetch from app_settings
    const { data, error } = await supabase.rpc('get_app_settings');
    
    if (error || !data) {
      console.warn('Notifications feature check failed, assuming disabled:', error);
      featureEnabled = false;
      return false;
    }

    const settings = typeof data === 'object' ? data : {};
    featureEnabled = settings.notifications_enabled === true;
    
    console.log('Notifications feature enabled:', featureEnabled);
    return featureEnabled;
  } catch (err) {
    console.error('Notifications feature check error:', err);
    featureEnabled = false;
    return false;
  }
}

/**
 * Fetch notifications safely with feature flag check
 */
export async function fetchNotifications(userId: string, force = false): Promise<Notification[]> {
  const now = Date.now();

  // Check if feature is enabled
  const enabled = await isNotificationsEnabled();
  if (!enabled) {
    console.log('📵 Notifications feature disabled, returning empty array');
    return DEFAULT_NOTIFICATIONS;
  }

  // Return cached data if valid and not forced
  if (!force && notificationsCache.length > 0 && now - cacheAt < TTL_MS) {
    return notificationsCache;
  }

  // Return existing in-flight promise
  if (!force && inFlight) {
    return inFlight;
  }

  // Create new fetch promise
  inFlight = (async () => {
    try {
      console.log('🔔 [fetchNotifications] Fetching for user:', userId);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.warn('⚠️ [fetchNotifications] Error:', error);
        notificationsCache = DEFAULT_NOTIFICATIONS;
        cacheAt = now;
        return DEFAULT_NOTIFICATIONS;
      }

      const notifications = Array.isArray(data) ? data : DEFAULT_NOTIFICATIONS;
      notificationsCache = notifications;
      cacheAt = now;
      
      console.log(`✅ [fetchNotifications] Loaded ${notifications.length} notifications`);
      return notifications;
      
    } catch (err: any) {
      console.error('❌ [fetchNotifications] Exception:', err);
      notificationsCache = DEFAULT_NOTIFICATIONS;
      cacheAt = now;
      return DEFAULT_NOTIFICATIONS;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight!;
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.warn('Failed to mark notification as read:', error);
      return false;
    }

    // Update cache
    const notification = notificationsCache.find(n => n.id === notificationId);
    if (notification) {
      notification.is_read = true;
    }

    return true;
  } catch (err: any) {
    console.error('Exception marking notification as read:', err);
    return false;
  }
}

/**
 * Get unread count
 */
export function getUnreadCount(): number {
  return notificationsCache.filter(n => !n.is_read).length;
}

/**
 * Clear notifications cache
 */
export function clearNotificationsCache(): void {
  notificationsCache = [];
  cacheAt = 0;
  inFlight = null;
  featureEnabled = null;
}

/**
 * React hook for notifications
 */
export function useNotifications(userId: string | undefined, force = false) {
  const [notifications, setNotifications] = useState<Notification[]>(DEFAULT_NOTIFICATIONS);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Effect to fetch notifications
  useEffect(() => {
    if (!userId) return;

    let mounted = true;

    async function loadNotifications() {
      setLoading(true);
      try {
        const result = await fetchNotifications(userId, force);
        if (mounted) {
          setNotifications(result);
          setUnreadCount(result.filter(n => !n.is_read).length);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadNotifications();

    return () => {
      mounted = false;
    };
  }, [userId, force]);

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead: markNotificationRead,
    refetch: () => {
      if (userId) {
        return fetchNotifications(userId, true);
      }
      return Promise.resolve([]);
    }
  };
}
