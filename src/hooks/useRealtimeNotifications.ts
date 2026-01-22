import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type NotificationRow = {
  id: number;
  created_at: string;
  user_id: string;
  type: string;
  title: string;
  body?: string;
  payload: any;
  is_read: boolean;
};

interface UseRealtimeNotificationsOptions {
  userId?: string;
  enabled?: boolean;
}

interface UseRealtimeNotificationsReturn {
  unreadCount: number;
  latest?: NotificationRow;
  isConnected: boolean;
  error?: string;
  markAsRead: (count: number) => void;
}

export function useRealtimeNotifications({
  userId,
  enabled = true
}: UseRealtimeNotificationsOptions): UseRealtimeNotificationsReturn {
  const [unreadCount, setUnreadCount] = useState(0);
  const [latest, setLatest] = useState<NotificationRow | undefined>();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | undefined>();
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastSeenIds = useRef<Set<number>>(new Set());

  // Fetch initial unread count
  const fetchInitialCount = useCallback(async () => {
    if (!userId || !enabled) return;

    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        // If table doesn't exist or other error, just return 0 silently
        console.warn('Notifications table not available:', error.message);
        setUnreadCount(0);
        return;
      }
      
      setUnreadCount(count || 0);
    } catch (e: any) {
      // Silently handle errors - don't show error banners
      console.warn('Failed to fetch notifications:', e.message);
      setUnreadCount(0);
    }
  }, [userId, enabled]);

  // Setup realtime subscription
  useEffect(() => {
    if (!userId || !enabled) {
      // Cleanup if disabled
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Fetch initial count
    fetchInitialCount();

    // Create realtime channel
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const row = payload.new as NotificationRow;
          
          // Client-side validation (extra safety)
          if (!row || row.user_id !== userId) return;
          
          // Prevent duplicates
          if (lastSeenIds.current.has(row.id)) return;
          lastSeenIds.current.add(row.id);

          // Update state
          setLatest(row);
          setUnreadCount(prev => prev + 1);
          setIsConnected(true);
          setError(undefined);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setError(undefined);
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          setError('Connection error');
        }
      });

    channelRef.current = channel;

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setIsConnected(false);
    };
  }, [userId, enabled, fetchInitialCount]);

  // Function to manually mark as read (for local updates)
  const markAsRead = useCallback((count: number) => {
    setUnreadCount(prev => Math.max(0, prev - count));
  }, []);

  return {
    unreadCount,
    latest,
    isConnected,
    error,
    markAsRead
  };
}

// Toast helper functions
export interface ToastOptions {
  title: string;
  body?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

let toastQueue: ToastOptions[] = [];
let toastListeners: ((toast: ToastOptions) => void)[] = [];

export function showToast(options: ToastOptions) {
  toastQueue.push(options);
  toastListeners.forEach(listener => listener(options));
}

export function useToastListener(listener: (toast: ToastOptions) => void) {
  useEffect(() => {
    toastListeners.push(listener);
    return () => {
      const index = toastListeners.indexOf(listener);
      if (index > -1) {
        toastListeners.splice(index, 1);
      }
    };
  }, [listener]);
}
