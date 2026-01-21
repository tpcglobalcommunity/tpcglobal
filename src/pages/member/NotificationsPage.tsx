import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { type Language, useI18n, getLangPath } from "../../i18n";
import { PremiumCard, PremiumButton, NoticeBox } from "../../components/ui";
import { Bell, BellRing, Check, CheckCircle, Clock, X } from "lucide-react";

type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  payload: any;
  is_read: boolean;
  created_at: string;
};

export default function NotificationsPage({ lang }: { lang: Language }) {
  const { t } = useI18n(lang);
  const baseMember = `${getLangPath(lang, "")}/member`;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [markingAll, setMarkingAll] = useState(false);
  const [markingIds, setMarkingIds] = useState<Set<string>>(new Set());

  // Load notifications
  async function loadNotifications() {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications((data || []) as Notification[]);
    } catch (e: any) {
      setError(e.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  // Load unread count
  async function loadUnreadCount() {
    try {
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false);

      if (error) throw error;

      setUnreadCount(count || 0);
    } catch (e: any) {
      console.error("Failed to load unread count:", e);
    }
  }

  // Mark single notification as read
  async function markAsRead(id: string) {
    try {
      setMarkingIds(prev => new Set(prev).add(id));

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);

      if (error) throw error;

      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e: any) {
      setError(e.message || "Failed to mark as read");
    } finally {
      setMarkingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  // Mark all notifications as read
  async function markAllAsRead() {
    try {
      setMarkingAll(true);

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("is_read", false);

      if (error) throw error;

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e: any) {
      setError(e.message || "Failed to mark all as read");
    } finally {
      setMarkingAll(false);
    }
  }

  // Format time
  function formatTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  // Get type chip color
  function getTypeColor(type: string) {
    switch (type) {
      case "VERIFICATION_APPROVED":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "VERIFICATION_REJECTED":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "ACCOUNT_UPDATED":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "SYSTEM_ALERT":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-white/10 text-white/70 border-white/20";
    }
  }

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, []);

  return (
    <div className="grid gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-white inline-flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#F0B90B]" />
            {t("member.notifications.title") || "Notifications"}
            {unreadCount > 0 && (
              <span className="px-2 py-1 text-xs bg-[#F0B90B]/20 text-[#F0B90B] rounded-full">
                {unreadCount}
              </span>
            )}
          </h2>
          <p className="text-white/60 text-sm mt-1">
            {t("member.notifications.subtitle") || "Stay updated with your account activities."}
          </p>
        </div>

        <div className="flex gap-2">
          {unreadCount > 0 && (
            <PremiumButton
              variant="secondary"
              onClick={markAllAsRead}
              disabled={markingAll}
            >
              <span className="inline-flex items-center gap-2">
                {markingAll ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {t("member.notifications.markAllRead") || "Mark All Read"}
              </span>
            </PremiumButton>
          )}
          <PremiumButton variant="secondary" onClick={loadNotifications} disabled={loading}>
            <span className="inline-flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {t("member.common.refresh") || "Refresh"}
            </span>
          </PremiumButton>
        </div>
      </div>

      {error && (
        <NoticeBox variant="warning">
          <div className="text-sm text-white/85">{error}</div>
        </NoticeBox>
      )}

      {/* Notifications List */}
      <div className="grid gap-3">
        {loading ? (
          <PremiumCard className="p-5">
            <div className="text-center text-white/60">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2" />
              {t("member.notifications.loading") || "Loading notifications..."}
            </div>
          </PremiumCard>
        ) : notifications.length === 0 ? (
          <PremiumCard className="p-5">
            <div className="text-center text-white/60">
              <BellRing className="w-12 h-12 text-white/30 mx-auto mb-3" />
              {t("member.notifications.empty") || "No notifications yet"}
            </div>
          </PremiumCard>
        ) : (
          notifications.map((notification) => (
            <PremiumCard
              key={notification.id}
              className={`p-5 transition-all ${
                !notification.is_read ? "bg-[#F0B90B]/5 border-[#F0B90B]/20" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-white font-medium">{notification.title}</h3>
                    {!notification.is_read && (
                      <span className="w-2 h-2 bg-[#F0B90B] rounded-full" />
                    )}
                    <span className={`px-2 py-1 text-xs rounded-full border ${getTypeColor(notification.type)}`}>
                      {notification.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  
                  {notification.body && (
                    <p className="text-white/70 text-sm mb-2">{notification.body}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-white/50">
                    <span>{formatTime(notification.created_at)}</span>
                    {notification.payload && Object.keys(notification.payload).length > 0 && (
                      <span>• Has details</span>
                    )}
                  </div>
                </div>

                {!notification.is_read && (
                  <PremiumButton
                    variant="secondary"
                    size="sm"
                    onClick={() => markAsRead(notification.id)}
                    disabled={markingIds.has(notification.id)}
                  >
                    <span className="inline-flex items-center gap-2">
                      {markingIds.has(notification.id) ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      {t("member.notifications.markRead") || "Mark Read"}
                    </span>
                  </PremiumButton>
                )}
              </div>
            </PremiumCard>
          ))
        )}
      </div>
    </div>
  );
}
