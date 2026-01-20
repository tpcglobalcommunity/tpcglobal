import { useState, useEffect } from 'react';
import { Tag, Copy, CheckCircle, Users, LogOut, AlertCircle, Megaphone, BookOpen, MessageCircle, Shield, User, Newspaper, ExternalLink, Check } from 'lucide-react';
import { Language, useTranslations, getLangPath } from '../../i18n';
import { PremiumShell, PremiumCard, NoticeBox, PremiumButton } from '../../components/ui';
import { supabase, getProfile, Profile, getPublishedAnnouncements, Announcement, getOnboardingState, upsertOnboardingState, ensureOnboardingRow, ensureReferralCode } from '../../lib/supabase';

interface DashboardProps {
  lang: Language;
}

const Dashboard = ({ lang }: DashboardProps) => {
  const t = useTranslations(lang);

  // Safe string helpers to prevent runtime errors
  const safeUpper = (v: unknown, fallback = "") => {
    const result = (typeof v === "string" ? v : v == null ? "" : String(v)).toUpperCase() || fallback;
    if (!v && fallback === "ANNOUNCEMENT") {
      console.warn("[Dashboard] undefined category field detected, using fallback");
    }
    return result;
  };

  const [profile, setProfile] = useState<Profile | null>(null);
  const [onboarding, setOnboarding] = useState<any>(null);
  const [updatingOnboarding, setUpdatingOnboarding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [pinnedAnnouncements, setPinnedAnnouncements] = useState<Announcement[]>([]);
  const [latestAnnouncements, setLatestAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          window.location.href = getLangPath(lang, '/signin');
          return;
        }

        const profileData = await getProfile(user.id);

        if (!profileData) {
          setError('Failed to load profile');
          return;
        }

        // Debug log for referral code
        if (!profileData.referral_code) {
          console.warn('[Dashboard] referral_code missing for user', user.id);
        } else {
          console.log('[Dashboard] referral_code loaded:', profileData.referral_code);
        }

        setProfile(profileData);

        await ensureOnboardingRow();
        const onboardingData = await getOnboardingState();
        setOnboarding(onboardingData);

        const announcements = await getPublishedAnnouncements({
          page: 1,
          pageSize: 10,
          query: ''
        });

        const safeAnnouncements = announcements || [];
        setPinnedAnnouncements(safeAnnouncements.filter(a => a.is_pinned).slice(0, 3));
        setLatestAnnouncements(safeAnnouncements.filter(a => !a.is_pinned).slice(0, 5));

      } catch (err) {
        console.error('Error initializing dashboard:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [lang]);

  const [generatingCode, setGeneratingCode] = useState(false);

  const handleGenerateReferralCode = async () => {
    try {
      setGeneratingCode(true);
      const newCode = await ensureReferralCode();
      if (newCode) {
        // Refresh profile data
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const updatedProfile = await getProfile(user.id);
          setProfile(updatedProfile);
        }
      }
    } catch (err) {
      console.error('Error generating referral code:', err);
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleCopyReferralCode = async () => {
    const referralCode = profile?.referral_code;
    if (!referralCode) return;

    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = getLangPath(lang, '/home');
  };

  const handleAcceptDisclaimer = async () => {
    if (updatingOnboarding) return;
    setUpdatingOnboarding(true);
    try {
      const updated = await upsertOnboardingState({ accepted_disclaimer: true });
      setOnboarding(updated);
    } catch (err) {
      console.error('Error updating onboarding:', err);
    } finally {
      setUpdatingOnboarding(false);
    }
  };

  const handleReadDocs = () => {
    window.location.href = getLangPath(lang, '/docs');
  };

  const handleMarkDocsRead = async () => {
    if (updatingOnboarding) return;
    setUpdatingOnboarding(true);
    try {
      const updated = await upsertOnboardingState({ read_docs: true });
      setOnboarding(updated);
    } catch (err) {
      console.error('Error updating onboarding:', err);
    } finally {
      setUpdatingOnboarding(false);
    }
  };

  const handleJoinTelegram = () => {
    window.open('https://t.me/tpcglobal', '_blank');
  };

  const handleConfirmJoinedTelegram = async () => {
    if (updatingOnboarding) return;
    setUpdatingOnboarding(true);
    try {
      const updated = await upsertOnboardingState({ joined_telegram: true });
      setOnboarding(updated);
    } catch (err) {
      console.error('Error updating onboarding:', err);
    } finally {
      setUpdatingOnboarding(false);
    }
  };

  const getAnnouncementTitle = (announcement: Announcement): string => {
    return lang === 'id' ? announcement.title_id : announcement.title_en;
  };

  const getAnnouncementBody = (announcement: Announcement): string => {
    return lang === 'id' ? announcement.body_id : announcement.body_en;
  };

  if (loading) {
    return (
      <PremiumShell>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 pb-24 md:pb-28">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-[#F0B90B]/30 border-t-[#F0B90B] rounded-full animate-spin" />
          </div>
        </div>
      </PremiumShell>
    );
  }

  if (error || !profile) {
    return (
      <PremiumShell>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 pb-24 md:pb-28">
          <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-10">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-white/70">{error || 'Profile not found'}</p>
            </div>
          </div>
        </div>
      </PremiumShell>
    );
  }

  // Render with error boundary
  const renderDashboard = () => {
    try {
      return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 pb-24 md:pb-28">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {t.member.dashboard.title}
              </h1>
              <p className="text-white/70">
                {t.member.dashboard.welcome}, {profile.full_name || profile.username}
              </p>
            </div>
            <PremiumButton variant="secondary" onClick={handleSignOut}>
              <LogOut className="w-5 h-5" />
              Sign Out
            </PremiumButton>
          </div>

        {onboarding && !onboarding.completed && (
          <PremiumCard className="mb-8 border-2 border-[#F0B90B]/30">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {t.member.onboarding.title}
              </h2>
              <p className="text-white/60">
                {t.member.onboarding.subtitle}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${onboarding.accepted_disclaimer ? 'bg-green-500/20 border-2 border-green-500' : 'bg-white/5 border-2 border-white/20'}`}>
                  {onboarding.accepted_disclaimer && <Check className="w-5 h-5 text-green-400" />}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {t.member.onboarding.acceptDisclaimerTitle}
                  </h3>
                  <p className="text-white/60 text-sm mb-3">
                    {t.member.onboarding.acceptDisclaimerDesc}
                  </p>
                  {!onboarding.accepted_disclaimer && (
                    <PremiumButton
                      onClick={handleAcceptDisclaimer}
                      disabled={updatingOnboarding}
                      size="sm"
                    >
                      {t.member.onboarding.acceptDisclaimerAction}
                    </PremiumButton>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${onboarding.read_docs ? 'bg-green-500/20 border-2 border-green-500' : 'bg-white/5 border-2 border-white/20'}`}>
                  {onboarding.read_docs && <Check className="w-5 h-5 text-green-400" />}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {t.member.onboarding.readDocsTitle}
                  </h3>
                  <p className="text-white/60 text-sm mb-3">
                    {t.member.onboarding.readDocsDesc}
                  </p>
                  {!onboarding.read_docs && (
                    <div className="flex gap-2">
                      <PremiumButton
                        onClick={handleReadDocs}
                        size="sm"
                      >
                        {t.member.onboarding.readDocsAction}
                      </PremiumButton>
                      <PremiumButton
                        variant="secondary"
                        onClick={handleMarkDocsRead}
                        disabled={updatingOnboarding}
                        size="sm"
                      >
                        {t.member.onboarding.readDocsMark}
                      </PremiumButton>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${onboarding.joined_telegram ? 'bg-green-500/20 border-2 border-green-500' : 'bg-white/5 border-2 border-white/20'}`}>
                  {onboarding.joined_telegram && <Check className="w-5 h-5 text-green-400" />}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {t.member.onboarding.joinTelegramTitle}
                  </h3>
                  <p className="text-white/60 text-sm mb-3">
                    {t.member.onboarding.joinTelegramDesc}
                  </p>
                  {!onboarding.joined_telegram && (
                    <div className="flex gap-2">
                      <PremiumButton
                        onClick={handleJoinTelegram}
                        size="sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {t.member.onboarding.joinTelegramAction}
                      </PremiumButton>
                      <PremiumButton
                        variant="secondary"
                        onClick={handleConfirmJoinedTelegram}
                        disabled={updatingOnboarding}
                        size="sm"
                      >
                        {t.member.onboarding.joinTelegramConfirm}
                      </PremiumButton>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </PremiumCard>
        )}

        {onboarding && onboarding.completed && (
          <NoticeBox variant="success" title={t.member.onboarding.completedTitle} className="mb-8">
            {t.member.onboarding.completedDesc}
          </NoticeBox>
        )}

        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <PremiumCard>
            <div className="flex items-start gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F0B90B]/20 to-[#F0B90B]/5 border border-[#F0B90B]/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-[#F0B90B]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {t.member.referral.countLabel}
                </h3>
                <p className="text-3xl font-bold text-[#F0B90B]">
                  {profile.referral_count}
                </p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = getLangPath(lang, '/member/referrals')}
              className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              View Analytics
            </button>
          </PremiumCard>

          <PremiumCard>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F0B90B]/20 to-[#F0B90B]/5 border border-[#F0B90B]/20 flex items-center justify-center flex-shrink-0">
                <Tag className="w-6 h-6 text-[#F0B90B]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">Role</h3>
                <p className="text-xl font-semibold text-white/90 capitalize">
                  {profile.role}
                </p>
              </div>
            </div>
          </PremiumCard>

          <PremiumCard>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F0B90B]/20 to-[#F0B90B]/5 border border-[#F0B90B]/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-[#F0B90B]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">Status</h3>
                <p className="text-xl font-semibold text-white/90">
                  {profile.is_verified ? 'Verified' : 'Member'}
                </p>
              </div>
            </div>
          </PremiumCard>
        </div>

        {pinnedAnnouncements.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Megaphone className="w-6 h-6 text-[#F0B90B]" />
                {t.member.dashboard.pinnedTitle}
              </h2>
              <a
                href={getLangPath(lang, '/member/announcements')}
                className="text-[#F0B90B] hover:text-[#F0B90B]/80 text-sm font-medium transition-colors"
              >
                View All
              </a>
            </div>
            <div className="grid gap-4">
              {pinnedAnnouncements.map((announcement) => (
                <PremiumCard key={announcement.id} className="border-l-4 border-[#F0B90B]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-[#F0B90B]/20 text-[#F0B90B] rounded">
                          {safeUpper(announcement?.category, "ANNOUNCEMENT")}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {getAnnouncementTitle(announcement)}
                      </h3>
                      <p className="text-white/60 text-sm line-clamp-2">
                        {getAnnouncementBody(announcement)}
                      </p>
                    </div>
                  </div>
                </PremiumCard>
              ))}
            </div>
          </div>
        )}

        {latestAnnouncements.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              {t.member.dashboard.latestTitle}
            </h2>
            <div className="grid gap-4">
              {latestAnnouncements.map((announcement) => (
                <PremiumCard key={announcement.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-white/10 text-white/70 rounded">
                          {safeUpper(announcement?.category, "ANNOUNCEMENT")}
                        </span>
                        {announcement.published_at && (
                          <span className="text-xs text-white/50">
                            {new Date(announcement.published_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {getAnnouncementTitle(announcement)}
                      </h3>
                      <p className="text-white/60 text-sm line-clamp-2">
                        {getAnnouncementBody(announcement)}
                      </p>
                    </div>
                  </div>
                </PremiumCard>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            {t.member.dashboard.quickActions}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <a
              href={getLangPath(lang, '/member/profile')}
              className="group block p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-[#F0B90B]/50 hover:bg-white/[0.04] transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <User className="w-5 h-5 text-[#F0B90B]" />
                <h3 className="font-semibold text-white">{t.member.dashboard.goProfile}</h3>
              </div>
              <p className="text-sm text-white/60">Manage your profile</p>
            </a>

            <a
              href={getLangPath(lang, '/member/security')}
              className="group block p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-[#F0B90B]/50 hover:bg-white/[0.04] transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5 text-[#F0B90B]" />
                <h3 className="font-semibold text-white">{t.member.dashboard.goSecurity}</h3>
              </div>
              <p className="text-sm text-white/60">Security settings</p>
            </a>

            <a
              href={getLangPath(lang, '/verify')}
              className="group block p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-[#F0B90B]/50 hover:bg-white/[0.04] transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-[#F0B90B]" />
                <h3 className="font-semibold text-white">{t.member.dashboard.goVerify}</h3>
              </div>
              <p className="text-sm text-white/60">Verify members</p>
            </a>

            <a
              href={getLangPath(lang, '/docs')}
              className="group block p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-[#F0B90B]/50 hover:bg-white/[0.04] transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-5 h-5 text-[#F0B90B]" />
                <h3 className="font-semibold text-white">{t.member.dashboard.goDocs}</h3>
              </div>
              <p className="text-sm text-white/60">Read documentation</p>
            </a>

            <a
              href={getLangPath(lang, '/news')}
              className="group block p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-[#F0B90B]/50 hover:bg-white/[0.04] transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <Newspaper className="w-5 h-5 text-[#F0B90B]" />
                <h3 className="font-semibold text-white">{t.member.dashboard.goNews}</h3>
              </div>
              <p className="text-sm text-white/60">Latest news</p>
            </a>

            <a
              href="https://t.me/tpcglobal"
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-[#F0B90B]/50 hover:bg-white/[0.04] transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <MessageCircle className="w-5 h-5 text-[#F0B90B]" />
                <h3 className="font-semibold text-white">Telegram</h3>
              </div>
              <p className="text-sm text-white/60">Join community</p>
            </a>
          </div>
        </div>

        <PremiumCard>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <Tag className="w-6 h-6 text-[#F0B90B]" />
              {t.member.referral.title}
            </h2>
            <p className="text-white/60">
              {t.member.referral.subtitle}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                {t.member.referral.codeLabel}
              </label>
              <div className="flex gap-3">
                <div className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
                  <code className="text-lg font-mono font-semibold text-[#F0B90B]">
                    {profile?.referral_code ? profile.referral_code : "No code yet"}
                  </code>
                </div>
                <button
                  onClick={handleCopyReferralCode}
                  disabled={!profile?.referral_code}
                  className="px-6 py-3 bg-gradient-to-r from-[#F0B90B] to-[#F0B90B]/80 text-black font-semibold rounded-lg hover:from-[#F0B90B]/90 hover:to-[#F0B90B]/70 transition-all duration-200 flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      {t.member.referral.copied}
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      {t.member.referral.copy}
                    </>
                  )}
                </button>
              </div>
            </div>

            {!profile?.referral_code && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mt-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs flex-1">
                    <p className="text-yellow-400 font-medium mb-1">
                      Referral code belum tersedia
                    </p>
                    <p className="text-white/60 mb-2">
                      Coba refresh halaman atau kontak support jika masalah berlanjut.
                    </p>
                    <button
                      onClick={handleGenerateReferralCode}
                      disabled={generatingCode}
                      className="px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 text-xs font-medium rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generatingCode ? 'Generating...' : 'Generate Code'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <NoticeBox variant="info" title="">
              {t.member.referral.shareText}
            </NoticeBox>

            <NoticeBox variant="warning" title="">
              {t.member.referral.disclaimer}
            </NoticeBox>
          </div>
        </PremiumCard>

        {profile.referred_by && (
          <PremiumCard className="mt-6">
            <div className="text-center py-4">
              <p className="text-white/60 text-sm mb-2">You were referred by</p>
              <code className="text-lg font-mono font-semibold text-[#F0B90B]">
                {profile.referred_by}
              </code>
            </div>
          </PremiumCard>
        )}
      </div>
    );
    } catch (err) {
      console.error('[Dashboard] Runtime error:', err);
      setRuntimeError((err as any)?.message || 'Unexpected error rendering dashboard');
      return null;
    }
  };

  if (runtimeError) {
    return (
      <PremiumShell>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 pb-24 md:pb-28">
          <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-10">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
              <p className="text-white/70 mb-4">{runtimeError}</p>
              <PremiumButton onClick={() => window.location.reload()}>
                Reload Page
              </PremiumButton>
            </div>
          </div>
        </div>
      </PremiumShell>
    );
  }

  return (
    <PremiumShell>
      {renderDashboard()}
    </PremiumShell>
  );
};

export default Dashboard;
