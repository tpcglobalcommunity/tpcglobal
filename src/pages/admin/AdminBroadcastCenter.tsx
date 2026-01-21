import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useMyRole } from "@/hooks/useMyRole";
import {
  Send,
  RefreshCw,
  Megaphone,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Users,
  Globe,
  Target,
  Settings,
  TrendingUp,
  Clock,
  CheckSquare
} from "lucide-react";

interface Broadcast {
  id: string;
  title: string;
  message: string;
  lang_mode: string;
  target_role: string | null;
  verified_only: boolean;
  status: string;
  total_recipients: number;
  enqueued_count: number;
  sent_count: number;
  failed_count: number;
  created_at: string;
  updated_at: string;
}

interface BroadcastStats {
  total: number;
  pending: number;
  sending: number;
  sent: number;
  failed: number;
}

export default function AdminBroadcastCenter() {
  const navigate = useNavigate();
  const { role, loading: roleLoading } = useMyRole();

  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [refreshing, setRefreshing] = useState<Set<string>>(new Set());

  // Simple toast replacement
  const showToast = (title: string, description: string, variant: "default" | "destructive" = "default") => {
    console.log(`[${variant.toUpperCase()}] ${title}: ${description}`);
    alert(`${title}: ${description}`);
  };

  // Form state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [langMode, setLangMode] = useState<"auto" | "en" | "id">("auto");
  const [targetRole, setTargetRole] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [testMode, setTestMode] = useState(true);
  const [testLimit, setTestLimit] = useState(10);

  useEffect(() => {
    if (!roleLoading && (role !== 'admin' && role !== 'super_admin')) {
      navigate("/admin");
      return;
    }
    fetchBroadcasts();
  }, [role, roleLoading, navigate]);

  const fetchBroadcasts = async () => {
    try {
      const { data, error } = await supabase
        .from("broadcasts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setBroadcasts(data || []);
    } catch (error) {
      console.error("Error fetching broadcasts:", error);
      showToast("Error", "Failed to fetch broadcasts", "destructive");
    } finally {
      setLoading(false);
    }
  };

  const createBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !message.trim()) {
      showToast("Validation Error", "Title and message are required", "destructive");
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase.rpc("admin_create_broadcast_and_enqueue", {
        p_title: title.trim(),
        p_message: message.trim(),
        p_lang_mode: langMode,
        p_target_role: targetRole.trim() || null,
        p_verified_only: verifiedOnly,
        p_limit_n: testMode ? testLimit : null,
      });

      if (error) throw error;

      showToast("Broadcast Created", `Broadcast ID: ${data}`);

      // Reset form
      setTitle("");
      setMessage("");
      setTargetRole("");
      setLangMode("auto");
      setVerifiedOnly(true);
      setTestMode(true);
      setTestLimit(10);

      // Refresh broadcasts
      await fetchBroadcasts();

      // Auto refresh stats for new broadcast
      if (data) {
        refreshStats(data);
      }
    } catch (error) {
      console.error("Error creating broadcast:", error);
      showToast("Error", error instanceof Error ? error.message : "Failed to create broadcast", "destructive");
    } finally {
      setCreating(false);
    }
  };

  const refreshStats = async (broadcastId: string) => {
    setRefreshing(prev => new Set(prev).add(broadcastId));
    try {
      const { data, error } = await supabase.rpc("admin_refresh_broadcast_stats", {
        p_broadcast_id: broadcastId,
      });

      if (error) throw error;

      // Update local broadcasts with new stats
      setBroadcasts(prev => 
        prev.map(b => 
          b.id === broadcastId 
            ? { ...b, sent_count: data[0]?.sent || 0, failed_count: data[0]?.failed || 0 }
            : b
        )
      );

      toast("Stats Refreshed", `Total: ${data[0]?.total}, Sent: ${data[0]?.sent}, Failed: ${data[0]?.failed}`);
    } catch (error) {
      console.error("Error refreshing stats:", error);
      showToast("Error", "Failed to refresh statistics", "destructive");
    } finally {
      setRefreshing(prev => {
        const next = new Set(prev);
        next.delete(broadcastId);
        return next;
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <Settings className="w-4 h-4" />;
      case "queued":
        return <Clock className="w-4 h-4" />;
      case "sent":
        return <CheckCircle2 className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "text-gray-400";
      case "queued":
        return "text-yellow-400";
      case "sent":
        return "text-green-400";
      case "cancelled":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-1/3 mb-8"></div>
            <div className="h-64 bg-slate-800 rounded-lg mb-8"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-slate-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Megaphone className="w-8 h-8 text-amber-400" />
            <h1 className="text-3xl font-bold text-white">Broadcast Center</h1>
          </div>
          <p className="text-slate-400">Send announcements to all users or targeted groups</p>
        </div>

        {/* Create Broadcast Form */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-amber-500/20 rounded-xl p-6 mb-8 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-semibold text-white">Create New Broadcast</h2>
          </div>

          <form onSubmit={createBroadcast} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-amber-400 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-amber-500/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
                  placeholder="Broadcast title"
                  disabled={creating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-400 mb-2">
                  Language Mode
                </label>
                <select
                  value={langMode}
                  onChange={(e) => setLangMode(e.target.value as "auto" | "en" | "id")}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-amber-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
                  disabled={creating}
                >
                  <option value="auto">Auto (User Preference)</option>
                  <option value="en">English</option>
                  <option value="id">Indonesian</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-400 mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 bg-slate-900/50 border border-amber-500/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 resize-none"
                placeholder="Broadcast message"
                disabled={creating}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-amber-400 mb-2">
                  Target Role (Optional)
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-amber-500/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
                  placeholder="e.g., admin, member"
                  disabled={creating}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="verifiedOnly"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="w-4 h-4 text-amber-400 bg-slate-900 border-amber-500/20 rounded focus:ring-amber-400/50"
                  disabled={creating}
                />
                <label htmlFor="verifiedOnly" className="ml-2 text-sm text-white">
                  Verified Users Only
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="testMode"
                  checked={testMode}
                  onChange={(e) => setTestMode(e.target.checked)}
                  className="w-4 h-4 text-amber-400 bg-slate-900 border-amber-500/20 rounded focus:ring-amber-400/50"
                  disabled={creating}
                />
                <label htmlFor="testMode" className="ml-2 text-sm text-white">
                  Test Mode
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-400 mb-2">
                  Test Limit
                </label>
                <input
                  type="number"
                  value={testLimit}
                  onChange={(e) => setTestLimit(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-amber-500/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
                  min="1"
                  disabled={creating || !testMode}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={creating}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-lg hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Create Broadcast
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Broadcasts List */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-semibold text-white">Recent Broadcasts</h2>
          </div>

          {broadcasts.length === 0 ? (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-amber-500/20 rounded-xl p-8 text-center">
              <Megaphone className="w-12 h-12 text-amber-400 mx-auto mb-4 opacity-50" />
              <p className="text-slate-400">No broadcasts yet. Create your first broadcast above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {broadcasts.map((broadcast) => (
                <div
                  key={broadcast.id}
                  className="bg-slate-800/50 backdrop-blur-sm border border-amber-500/20 rounded-xl p-6 shadow-xl"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(broadcast.status)}
                        <h3 className="text-lg font-semibold text-white">{broadcast.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(broadcast.status)} bg-slate-900/50`}>
                          {broadcast.status}
                        </span>
                      </div>
                      <p className="text-slate-400 mb-3 line-clamp-2">{broadcast.message}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          <span>Lang: {broadcast.lang_mode}</span>
                        </div>
                        {broadcast.target_role && (
                          <div className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            <span>Role: {broadcast.target_role}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <CheckSquare className="w-4 h-4" />
                          <span>{broadcast.verified_only ? "Verified only" : "All users"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(broadcast.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => refreshStats(broadcast.id)}
                      disabled={refreshing.has(broadcast.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 border border-amber-500/20 rounded-lg text-amber-400 hover:bg-slate-700/70 focus:outline-none focus:ring-2 focus:ring-amber-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {refreshing.has(broadcast.id) ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Refreshing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          Refresh Stats
                        </>
                      )}
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-amber-400">{broadcast.total_recipients}</div>
                      <div className="text-xs text-slate-400">Total</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-yellow-400">{broadcast.enqueued_count}</div>
                      <div className="text-xs text-slate-400">Enqueued</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-400">{broadcast.sent_count}</div>
                      <div className="text-xs text-slate-400">Sent</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-red-400">{broadcast.failed_count}</div>
                      <div className="text-xs text-slate-400">Failed</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {broadcast.total_recipients > 0 
                          ? Math.round((broadcast.sent_count / broadcast.total_recipients) * 100)
                          : 0}%
                      </div>
                      <div className="text-xs text-slate-400">Success Rate</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
