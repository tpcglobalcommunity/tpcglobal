import { useState, useEffect } from 'react';
import { Users, TrendingUp, Copy, Check, Link as LinkIcon, AlertCircle, CheckCircle, User, Calendar } from 'lucide-react';
import { Language, useTranslations } from '../../i18n';
import { PremiumShell, PremiumCard, NoticeBox } from '../../components/ui';
import MemberGuard from '../../components/guards/MemberGuard';
import { getMyReferralAnalytics, ReferralAnalytics } from '../../lib/supabase';

interface ReferralsPageProps {
  lang: Language;
}

const ReferralsPage = ({ lang }: ReferralsPageProps) => {
  const t = useTranslations(lang);

  const [analytics, setAnalytics] = useState<ReferralAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedSignup, setCopiedSignup] = useState(false);
  const [copiedVerify, setCopiedVerify] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await getMyReferralAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Error loading referral analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, setter: (val: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      setter(true);
      setTimeout(() => setter(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getSignupLink = () => {
    if (!analytics?.my_referral_code) return '';
    return `${window.location.origin}/${lang}/signup?ref=${analytics.my_referral_code}`;
  };

  const getVerifyLink = () => {
    if (!analytics?.my_referral_code) return '';
    return `${window.location.origin}/${lang}/verify?q=${analytics.my_referral_code}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <MemberGuard lang={lang}>
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

  if (!analytics) {
    return (
      <MemberGuard lang={lang}>
        <PremiumShell>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 pb-24 md:pb-28">
            <PremiumCard>
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-white/70">Failed to load referral data</p>
              </div>
            </PremiumCard>
          </div>
        </PremiumShell>
      </MemberGuard>
    );
  }

  return (
    <MemberGuard lang={lang}>
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
              type="info"
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
                {analytics.my_referral_count}
              </p>
              <p className="text-sm text-white/60">{t.member.referrals.stats.total}</p>
            </PremiumCard>

            <PremiumCard className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-500/10 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-2">
                {analytics.invited_last_7_days}
              </p>
              <p className="text-sm text-white/60">{t.member.referrals.stats.last7}</p>
            </PremiumCard>

            <PremiumCard className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-blue-500/10 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-2">
                {analytics.invited_last_30_days}
              </p>
              <p className="text-sm text-white/60">{t.member.referrals.stats.last30}</p>
            </PremiumCard>

            <PremiumCard className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-white/5 rounded-full">
                <CheckCircle className={`w-6 h-6 ${analytics.can_invite ? 'text-green-400' : 'text-red-400'}`} />
              </div>
              <p className={`text-sm font-medium mb-2 ${analytics.can_invite ? 'text-green-400' : 'text-red-400'}`}>
                {analytics.can_invite ? t.member.referrals.stats.inviteActive : t.member.referrals.stats.inviteRevoked}
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
                    <p className="text-white font-mono text-lg">{analytics.my_referral_code}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(analytics.my_referral_code, setCopiedCode)}
                    className="px-4 py-3 bg-[#F0B90B] hover:bg-[#F0B90B]/90 text-black font-medium rounded-lg transition-all flex items-center gap-2"
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

          <PremiumCard>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#F0B90B]" />
              {t.member.referrals.list.title}
            </h2>

            {analytics.recent_invites.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white/70 mb-2">
                  {t.member.referrals.list.emptyTitle}
                </h3>
                <p className="text-sm text-white/50">
                  {t.member.referrals.list.emptyDesc}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {analytics.recent_invites.map((invite, index) => (
                  <div
                    key={index}
                    className="px-4 py-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/[0.07] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative flex-shrink-0">
                        {invite.avatar_url ? (
                          <img
                            src={invite.avatar_url}
                            alt={invite.username}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white/10"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#F0B90B]/10 border-2 border-white/10 flex items-center justify-center">
                            <User className="w-6 h-6 text-[#F0B90B]" />
                          </div>
                        )}
                        {invite.is_verified && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-[#1a1a1a]">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-white truncate">{invite.full_name}</p>
                          {invite.is_verified && (
                            <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-400 rounded">
                              {t.member.referrals.list.verified}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-white/60">@{invite.username}</p>
                      </div>

                      <div className="flex-shrink-0 text-right">
                        <div className="flex items-center gap-2 text-sm text-white/50">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(invite.joined_at)}</span>
                        </div>
                        <p className="text-xs text-white/40 mt-1">
                          {t.member.referrals.list.joined}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PremiumCard>

          {analytics.referred_by && (
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-center">
              <p className="text-sm text-blue-300">
                You were invited by <span className="font-medium">@{analytics.referred_by}</span>
              </p>
            </div>
          )}
        </div>
      </PremiumShell>
    </MemberGuard>
  );
};

export default ReferralsPage;
