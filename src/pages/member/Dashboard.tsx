import { useState, useEffect } from 'react';
import { Tag, Copy, CheckCircle, Users, LogOut, AlertCircle } from 'lucide-react';
import { Language, useTranslations, getLangPath } from '../../i18n';
import { PremiumShell, PremiumCard, NoticeBox, PremiumButton } from '../../components/ui';
import { supabase, getProfile, Profile } from '../../lib/supabase';

interface DashboardProps {
  lang: Language;
}

const Dashboard = ({ lang }: DashboardProps) => {
  const t = useTranslations(lang);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
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

        setProfile(profileData);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [lang]);

  const handleCopyReferralCode = async () => {
    if (!profile?.referral_code) return;

    try {
      await navigator.clipboard.writeText(profile.referral_code);
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

  if (loading) {
    return (
      <PremiumShell>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 pb-24 md:pb-28">
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 pb-24 md:pb-28">
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

  return (
    <PremiumShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 pb-24 md:pb-28">
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

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <PremiumCard>
            <div className="flex items-start gap-4">
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
                    {profile.referral_code}
                  </code>
                </div>
                <button
                  onClick={handleCopyReferralCode}
                  className="px-6 py-3 bg-gradient-to-r from-[#F0B90B] to-[#F0B90B]/80 text-black font-semibold rounded-lg hover:from-[#F0B90B]/90 hover:to-[#F0B90B]/70 transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
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
    </PremiumShell>
  );
};

export default Dashboard;
