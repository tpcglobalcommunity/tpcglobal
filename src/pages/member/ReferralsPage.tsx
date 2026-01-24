import { useState, useEffect } from 'react';
import { Users, TrendingUp, Copy, Check, Link as LinkIcon, CheckCircle, UserPlus, Calendar } from 'lucide-react';
import { Language, useTranslations } from '@/i18n';
import { PremiumShell, PremiumCard, NoticeBox } from '@/components/ui';
import MemberGuard from '@/components/guards/MemberGuard';
import { ReferralAnalytics, supabase, ensureReferralCode, getReferrals } from '@/lib/supabase';

interface ReferralsPageProps {
  lang: Language;
}

const ReferralsPage = ({ lang }: ReferralsPageProps) => {
  const t = useTranslations(lang);

  // Helper aman
  const safeUpper = (v?: string | null) => (v ?? "").toUpperCase();

  const [analytics, setAnalytics] = useState<ReferralAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedSignup, setCopiedSignup] = useState(false);
  const [copiedVerify, setCopiedVerify] = useState(false);
  const [downline, setDownline] = useState<any[]>([]);
  const [loadingDownline, setLoadingDownline] = useState(false);

  useEffect(() => {
    loadAnalytics();
    loadDownline();
  }, []);

  const loadDownline = async () => {
    try {
      setLoadingDownline(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const referrals = await getReferrals(user.id);
      
      // Get profile data for each referral
      const downlineData = await Promise.all(
        referrals.map(async (referral) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, full_name, created_at')
            .eq('id', referral.referred_id)
            .single();
          
          return {
            ...referral,
            ...profile
          };
        })
      );
      
      setDownline(downlineData);
    } catch (err) {
      console.error('Error loading downline:', err);
    } finally {
      setLoadingDownline(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      // Try RPC directly
      const { data, error } = await supabase.rpc("get_my_referral_analytics");
      
      if (error) {
        console.warn('RPC error, falling back to profile:', error);
        await loadProfileFallback();
      } else if (data && data.length > 0) {
        // RPC success - RETURNS TABLE returns array
        setAnalytics(data[0]);
      } else {
        // RPC returned empty, fallback to profile
        console.warn('RPC returned empty, falling back to profile');
        await loadProfileFallback();
      }
      
    } catch (err) {
      console.error('Error loading referral analytics:', err);
      // Try profile fallback on any error
      try {
        await loadProfileFallback();
      } catch (fallbackErr) {
        console.error('Profile fallback also failed:', fallbackErr);
        // Set minimal fallback to prevent crash
        setAnalytics({
          referral_code: null,
          total_referrals: 0,
          last_7_days: 0,
          last_30_days: 0,
          invite_status: 'ACTIVE',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const loadProfileFallback = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('referral_code, can_invite')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      // Fallback analytics from profile
      const fallbackAnalytics: ReferralAnalytics = {
        referral_code: profile?.referral_code || null,
        total_referrals: 0,
        last_7_days: 0,
        last_30_days: 0,
        invite_status: profile?.can_invite ? 'ACTIVE' : 'INACTIVE',
      };

      setAnalytics(fallbackAnalytics);
    } catch (err) {
      console.error('Profile fallback error:', err);
      throw err;
    }
  };

  const handleGenerateReferralCode = async () => {
    try {
      setGeneratingCode(true);
      const newCode = await ensureReferralCode();
      if (newCode) {
        // Reload analytics to get updated data
        await loadAnalytics();
        await loadDownline();
      }
    } catch (err) {
      console.error('Error generating referral code:', err);
    } finally {
      setGeneratingCode(false);
    }
  };

  const copyToClipboard = async (text: string | null | undefined, setter: (val: boolean) => void) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setter(true);
      setTimeout(() => setter(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getSignupLink = () => {
    if (!analytics?.referral_code) return '';
    return `${window.location.origin}/${lang}/signup?ref=${analytics.referral_code}`;
  };

  const getVerifyLink = () => {
    if (!analytics?.referral_code) return '';
    return `${window.location.origin}/${lang}/verify?q=${analytics.referral_code}`;
  };

  if (loading) {
    return (
      <MemberGuard>
        <PremiumShell>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 pb-24 md:pb-28">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="w-12 h-12 border-4 border-[#F0B90B]/30 border-t-[#F0B90B] rounded-full animate-spin" />
            </div>
          </div>
        </PremiumShell>
      </MemberGuard>
    );
  }

  return (
    <MemberGuard>
      <PremiumShell>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 pb-24 md:pb-28">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 flex items-center gap-3">
              <Users className="w-8 h-8 text-[#F0B90B]" />
              {t.member.referrals.title}
            </h1>
            <p className="text-white/70 text-lg mb-6">
              {t.member.referrals.subtitle}
            </p>
            <NoticeBox
              variant="info"
              title={t.member.referrals.noticeTitle}
              message={t.member.referrals.noticeDesc}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <PremiumCard className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-[#F0B90B]/10 rounded-full">
                <Users className="w-6 h-6 text-[#F0B90B]" />
              </div>
              <p className="text-3xl font-bold text-white mb-2">
                {analytics?.total_referrals || 0}
              </p>
              <p className="text-sm text-white/60">{t.member.referrals.stats.total}</p>
            </PremiumCard>

            <PremiumCard className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-500/10 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-2">
                {analytics?.last_7_days || 0}
              </p>
              <p className="text-sm text-white/60">{t.member.referrals.stats.last7}</p>
            </PremiumCard>

            <PremiumCard className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-blue-500/10 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-2">
                {analytics?.last_30_days || 0}
              </p>
              <p className="text-sm text-white/60">{t.member.referrals.stats.last30}</p>
            </PremiumCard>

            <PremiumCard className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-white/5 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <p className={`text-sm font-medium mb-2 text-green-400`}>
                {analytics?.invite_status === 'ACTIVE' ? t.member.referrals.stats.inviteActive : t.member.referrals.stats.inviteRevoked}
              </p>
              <p className="text-sm text-white/60">{t.member.referrals.stats.canInvite}</p>
            </PremiumCard>
          </div>

          <PremiumCard className="mb-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-[#F0B90B]" />
              {t.member.referrals.code.title}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  {t.member.referrals.code.title}
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
                    <p className="text-white font-mono text-lg">
                      {analytics?.referral_code
                        ? safeUpper(analytics.referral_code)
                        : "No code yet"}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(analytics?.referral_code, setCopiedCode)}
                    disabled={!analytics?.referral_code}
                    className="px-4 py-3 bg-[#F0B90B] hover:bg-[#F0B90B]/90 text-black font-medium rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-4 h-4" />
                        {t.member.referrals.code.copied}
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        {t.member.referrals.code.copy}
                      </>
                    )}
                  </button>
                  {!analytics?.referral_code && (
                    <button
                      onClick={handleGenerateReferralCode}
                      disabled={generatingCode}
                      className="px-4 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 font-medium rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generatingCode ? 'Generating...' : 'Generate'}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  {t.member.referrals.code.shareSignup}
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg overflow-x-auto">
                    <p className="text-white/70 text-sm font-mono truncate">{getSignupLink()}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(getSignupLink(), setCopiedSignup)}
                    className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-lg transition-all flex items-center gap-2"
                  >
                    {copiedSignup ? (
                      <>
                        <Check className="w-4 h-4" />
                        {t.member.referrals.code.copied}
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        {t.member.referrals.code.copyLink}
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  {t.member.referrals.code.shareVerify}
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg overflow-x-auto">
                    <p className="text-white/70 text-sm font-mono truncate">{getVerifyLink()}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(getVerifyLink(), setCopiedVerify)}
                    className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-lg transition-all flex items-center gap-2"
                  >
                    {copiedVerify ? (
                      <>
                        <Check className="w-4 h-4" />
                        {t.member.referrals.code.copied}
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        {t.member.referrals.code.copyLink}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </PremiumCard>

          {/* My Downline Section */}
          <PremiumCard>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#F0B90B]" />
              {t.member.referrals.downline.title || 'My Downline'}
              <span className="text-sm font-normal text-white/60">
                ({downline.length} {downline.length === 1 ? 'member' : 'members'})
              </span>
            </h2>

            {loadingDownline ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-[#F0B90B]/30 border-t-[#F0B90B] rounded-full animate-spin" />
              </div>
            ) : downline.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-white/40" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {t.member.referrals.downline.empty.title || 'No referrals yet'}
                </h3>
                <p className="text-white/60 mb-6">
                  {t.member.referrals.downline.empty.description || 'Start sharing your referral code to build your network!'}
                </p>
                <button
                  onClick={() => copyToClipboard(getSignupLink(), setCopiedSignup)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#F0B90B] hover:bg-[#F0B90B]/90 text-black font-medium rounded-lg transition-all"
                >
                  <LinkIcon className="w-4 h-4" />
                  {copiedSignup 
                    ? (t.member.referrals.code.copied || 'Copied!')
                    : (t.member.referrals.downline.empty.cta || 'Share Invite Link')
                  }
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {downline.map((member, index) => (
                  <div key={member.id} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg">
                    {/* Avatar with badge */}
                    <div className="relative">
                      {member.avatar_url ? (
                        <img 
                          src={member.avatar_url} 
                          alt={member.full_name || member.username}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white/10"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-[#F0B90B] to-[#F0B90B]/50 rounded-full flex items-center justify-center border-2 border-white/10">
                          <span className="text-black font-bold text-lg">
                            {(member.full_name || member.username || '?').charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      {/* New member badge */}
                      {index < 3 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white/10">
                          <span className="sr-only">New member</span>
                        </div>
                      )}
                    </div>

                    {/* Member info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-white">
                          {member.full_name || member.username || 'Unknown'}
                        </h4>
                        {member.full_name && member.username && (
                          <span className="text-white/60 text-sm">
                            @{member.username}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-white/60 text-sm">
                        <Calendar className="w-3 h-3" />
                        Joined {new Date(member.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>

                    {/* Referral code used */}
                    <div className="text-right">
                      <div className="text-xs text-white/40 mb-1">Used code</div>
                      <div className="text-sm font-mono text-[#F0B90B]">
                        {member.referral_code}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PremiumCard>
        </div>
      </PremiumShell>
    </MemberGuard>
  );
};

export default ReferralsPage;
