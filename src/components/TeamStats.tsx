import { useEffect, useState } from 'react';
import { supabase } from "../lib/supabase";

interface TeamStatsData {
  level1_count: number;
  total_team_count: number;
  level2_count: number;
  level3_count: number;
}

export function TeamStats({ userId }: { userId: string }) {
  const [stats, setStats] = useState<TeamStatsData>({
    level1_count: 0,
    total_team_count: 0,
    level2_count: 0,
    level3_count: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getTeamData() {
      try {
        setLoading(true);
        
        // Menggunakan RPC untuk multi-level stats
        const { data, error } = await supabase.rpc('get_team_stats', {
          p_user_id: userId
        });

        if (error) throw error;

        if (data && data.length > 0) {
          setStats(data[0]);
        }
      } catch (error) {
        console.error('Error fetching team stats:', error);
        // Fallback ke basic stats jika RPC error
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        const { data: totalTeam } = await supabase
          .from('referrals')
          .select('id', { count: 'exact' })
          .eq('referrer_id', userId);

        setStats({
          level1_count: profile?.referral_count || 0,
          total_team_count: totalTeam?.length || 0,
          level2_count: 0,
          level3_count: 0
        });
      } finally {
        setLoading(false);
      }
    }

    getTeamData();
  }, [userId]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white/5 rounded-xl border border-white/10 animate-pulse">
          <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
          <div className="h-6 bg-white/10 rounded w-1/2"></div>
        </div>
        <div className="p-4 bg-white/5 rounded-xl border border-white/10 animate-pulse">
          <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
          <div className="h-6 bg-white/10 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <p className="text-sm text-white/60">Direct Referrals</p>
          <p className="text-2xl font-bold text-[#F0B90B]">{stats.level1_count}</p>
        </div>
        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <p className="text-sm text-white/60">Total Team</p>
          <p className="text-2xl font-bold text-[#F0B90B]">{stats.total_team_count}</p>
        </div>
      </div>

      {/* Multi-level Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-white/5 rounded-xl border border-white/10">
          <p className="text-xs text-white/60">Level 2</p>
          <p className="text-xl font-semibold text-white/80">{stats.level2_count}</p>
        </div>
        <div className="p-3 bg-white/5 rounded-xl border border-white/10">
          <p className="text-xs text-white/60">Level 3</p>
          <p className="text-xl font-semibold text-white/80">{stats.level3_count}</p>
        </div>
      </div>

      {/* Team Growth Indicator */}
      {stats.total_team_count > 0 && (
        <div className="p-3 bg-[#F0B90B]/10 rounded-xl border border-[#F0B90B]/20">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/80">Team Network</span>
            <span className="text-sm font-semibold text-[#F0B90B]">
              {stats.level1_count > 0 ? 'Active' : 'Growing'}
            </span>
          </div>
          <div className="mt-2 text-xs text-white/60">
            Direct: {stats.level1_count} • Network: {stats.total_team_count}
          </div>
        </div>
      )}
    </div>
  );
}
