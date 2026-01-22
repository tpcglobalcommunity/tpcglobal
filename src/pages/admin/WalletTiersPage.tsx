import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { PremiumSection, PremiumCard } from "../../components/ui";
import { TierBadge } from "../../components/ui/TierBadge";
import AdminGuard from "../../guards/AdminGuard";

type WalletTier = {
  user_id: string;
  email: string;
  username: string;
  full_name: string;
  role: string;
  status: string;
  verified: boolean;
  tpc_tier: string;
  tpc_balance: number;
  wallet_verified_at: string | null;
  wallet_address: string | null;
};

export default function WalletTiersPage({ lang }: { lang: string }) {
  const [data, setData] = useState<WalletTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("ALL");
  const [refreshing, setRefreshing] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("admin_wallet_tiers")
        .select("*")
        .order("tpc_tier", { ascending: false })
        .order("tpc_balance", { ascending: false });

      if (error) throw error;
      setData(data || []);
    } catch (error: any) {
      console.error("Error loading wallet tiers:", error);
    } finally {
      setLoading(false);
    }
  };

  const forceRefresh = async (userId: string, walletAddress: string) => {
    try {
      setRefreshing(userId);
      
      // Call RPC to get wallet info
      const { error: rpcError } = await supabase.rpc("admin_force_verify_wallet", {
        p_user_id: userId
      });
      
      if (rpcError) throw rpcError;
      
      // Call Edge Function for single wallet verification
      const { error: verifyError } = await supabase.functions.invoke("verify-tpc-holdings", {
        body: { 
          user_id: userId,
          wallet: walletAddress 
        }
      });
      
      if (verifyError) throw verifyError;
      
      // Reload data
      await loadData();
    } catch (error: any) {
      console.error("Error force refreshing:", error);
      alert("Failed to refresh wallet: " + error.message);
    } finally {
      setRefreshing(null);
    }
  };

  const filteredData = data.filter(item => {
    const matchesSearch = !search || 
      item.email?.toLowerCase().includes(search.toLowerCase()) ||
      item.username?.toLowerCase().includes(search.toLowerCase()) ||
      item.wallet_address?.toLowerCase().includes(search.toLowerCase());
    
    const matchesTier = tierFilter === "ALL" || item.tpc_tier === tierFilter;
    
    return matchesSearch && matchesTier;
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const shortAddress = (address: string) => {
    if (!address) return "N/A";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <AdminGuard lang={lang}>
        <PremiumSection title="Wallet & Tiers" subtitle="Loading...">
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F0B90B]"></div>
          </div>
        </PremiumSection>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard lang={lang}>
      <PremiumSection title="Wallet & Tiers" subtitle="Monitor all member wallets and tiers">
        <PremiumCard>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search email, username, or wallet..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:border-[#F0B90B]"
              />
            </div>
            <div>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#F0B90B]"
              >
                <option value="ALL">All Tiers</option>
                <option value="BASIC">BASIC</option>
                <option value="PRO">PRO</option>
                <option value="ELITE">ELITE</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 font-semibold">Username</th>
                  <th className="text-left py-3 px-4 font-semibold">Email</th>
                  <th className="text-left py-3 px-4 font-semibold">Role</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Verified</th>
                  <th className="text-left py-3 px-4 font-semibold">Wallet</th>
                  <th className="text-left py-3 px-4 font-semibold">TPC Balance</th>
                  <th className="text-left py-3 px-4 font-semibold">Tier</th>
                  <th className="text-left py-3 px-4 font-semibold">Verified At</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.user_id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4">{item.username || "-"}</td>
                    <td className="py-3 px-4">{item.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.role === 'super_admin' ? 'bg-red-500/20 text-red-300' :
                        item.role === 'admin' ? 'bg-orange-500/20 text-orange-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {item.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.status === 'ACTIVE' ? 'bg-green-500/20 text-green-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {item.verified ? (
                        <span className="text-green-400">✓</span>
                      ) : (
                        <span className="text-red-400">✗</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {item.wallet_address ? (
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-white/5 px-2 py-1 rounded">
                            {shortAddress(item.wallet_address)}
                          </code>
                          <button
                            onClick={() => copyToClipboard(item.wallet_address!)}
                            className="text-[#F0B90B] hover:text-[#F0B90B]/80 text-xs"
                            title="Copy wallet address"
                          >
                            📋
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400">No wallet</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono">
                        {item.tpc_balance.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <TierBadge tier={item.tpc_tier} />
                    </td>
                    <td className="py-3 px-4">
                      {item.wallet_verified_at ? (
                        <span className="text-xs text-white/70">
                          {new Date(item.wallet_verified_at).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Never</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => forceRefresh(item.user_id, item.wallet_address!)}
                        disabled={refreshing === item.user_id || !item.wallet_address}
                        className="px-3 py-1 bg-[#F0B90B] text-black text-xs rounded font-semibold hover:bg-[#F0B90B]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {refreshing === item.user_id ? "Refreshing..." : "Force Refresh"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-8 text-white/50">
              No members found matching the current filters.
            </div>
          )}
        </PremiumCard>
      </PremiumSection>
    </AdminGuard>
  );
}
