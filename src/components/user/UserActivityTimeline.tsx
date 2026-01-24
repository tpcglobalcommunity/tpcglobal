import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useMyRole, canViewAudit } from "../../hooks/useMyRole";
import { Shield, CheckCircle, XCircle, Bell, Clock } from "lucide-react";

type ActivityItem = {
  occurred_at: string;
  source: "ADMIN" | "VERIFICATION" | "NOTIFICATION";
  event: string;
  title: string;
  detail?: string;
  payload?: any;
  created_at: string;
};

type Props = {
  userId: string;
};

export default function UserActivityTimeline({ userId }: Props) {
  const { role } = useMyRole();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const canViewPayload = canViewAudit(role);
  const pageSize = 20;

  // Load activity items
  async function loadItems(append = false) {
    try {
      setLoading(true);
      const offset = append ? pageIndex * pageSize : 0;
      
      const { data, error } = await supabase.rpc("get_user_activity_timeline", {
        p_user_id: userId,
        p_limit: pageSize,
        p_offset: offset
      });

      if (error) throw error;

      const newItems = (data || []) as ActivityItem[];
      
      if (append) {
        setItems(prev => [...prev, ...newItems]);
      } else {
        setItems(newItems);
      }

      setHasMore(newItems.length === pageSize);
      if (append) {
        setPageIndex(prev => prev + 1);
      }
    } catch (e: any) {
      console.error("Failed to load activity timeline:", e);
    } finally {
      setLoading(false);
    }
  }

  // Format relative time
  function getRelativeTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  }

  // Get icon for source
  function getSourceIcon(source: string, event: string) {
    switch (source) {
      case "ADMIN":
        return <Shield className="w-4 h-4 text-blue-400" />;
      case "VERIFICATION":
        return event === "APPROVED" 
          ? <CheckCircle className="w-4 h-4 text-green-400" />
          : <XCircle className="w-4 h-4 text-red-400" />;
      case "NOTIFICATION":
        return <Bell className="w-4 h-4 text-yellow-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  }

  // Get source color
  function getSourceColor(source: string) {
    switch (source) {
      case "ADMIN": return "border-blue-500/30 bg-blue-500/10";
      case "VERIFICATION": return "border-purple-500/30 bg-purple-500/10";
      case "NOTIFICATION": return "border-yellow-500/30 bg-yellow-500/10";
      default: return "border-gray-500/30 bg-gray-500/10";
    }
  }

  // Toggle payload expansion
  function togglePayload(index: number) {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }

  // Load initial data
  useEffect(() => {
    setItems([]);
    setPageIndex(0);
    setHasMore(true);
    loadItems(false);
  }, [userId]);

  if (items.length === 0 && !loading) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 text-white/30 mx-auto mb-2" />
        <p className="text-white/60">No activity found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timeline Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Activity Timeline</h3>
        <div className="text-sm text-white/60">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </div>
      </div>

      {/* Timeline Items */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/10" />

        {/* Activity items */}
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="relative flex gap-4">
              {/* Icon circle */}
              <div className={`relative z-10 w-12 h-12 rounded-full border-2 flex items-center justify-center ${getSourceColor(item.source)}`}>
                {getSourceIcon(item.source, item.event)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  {/* Title and time */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-medium text-white">{item.title}</h4>
                    <span className="text-sm text-white/60 whitespace-nowrap">
                      {getRelativeTime(item.occurred_at)}
                    </span>
                  </div>

                  {/* Detail */}
                  {item.detail && (
                    <p className="text-sm text-white/70 mb-2">{item.detail}</p>
                  )}

                  {/* Source badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getSourceColor(item.source)}`}>
                      {item.source}
                    </span>
                    <span className="text-xs text-white/50">
                      Event: {item.event}
                    </span>
                  </div>

                  {/* Payload (admin only) */}
                  {canViewPayload && item.payload && (
                    <div className="mt-2">
                      <button
                        onClick={() => togglePayload(index)}
                        className="text-xs text-white/60 hover:text-white/80 transition-colors"
                      >
                        {expandedItems.has(index) ? 'Hide' : 'Show'} payload
                      </button>
                      
                      {expandedItems.has(index) && (
                        <div className="mt-2 p-2 bg-black/30 rounded border border-white/10">
                          <pre className="text-xs text-white/80 overflow-x-auto">
                            {JSON.stringify(item.payload, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={() => loadItems(true)}
            disabled={loading}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
        </div>
      )}
    </div>
  );
}
