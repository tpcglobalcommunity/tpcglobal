import { useState, useEffect } from 'react';
import { Shield, LogOut, Activity, CheckCircle, AlertTriangle, User, Clock, Monitor } from 'lucide-react';
import { Language, useTranslations } from '@/i18n';
import { PremiumShell, PremiumCard, PremiumButton, NoticeBox } from '@/components/ui';
import MemberGuard from '@/components/guards/MemberGuard';
import { supabase, getProfile, Profile, signOutLocal, signOutAllDevices, getMemberAuthEvents, MemberAuthEvent, logAuthEvent } from '@/lib/supabase';

interface SecurityPageProps {
  lang: Language;
}

const SecurityPage = ({ lang }: SecurityPageProps) => {
  const t = useTranslations(lang);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [authEvents, setAuthEvents] = useState<MemberAuthEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [showLocalSignOutModal, setShowLocalSignOutModal] = useState(false);
  const [showGlobalSignOutModal, setShowGlobalSignOutModal] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = '/signin';
        return;
      }

      const profileData = await getProfile(user.id);
      setProfile(profileData);
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }

    try {
      const events = await getMemberAuthEvents(10);
      setAuthEvents(events);
    } catch (err) {
      console.error('Error loading auth events:', err);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleSignOutLocal = async () => {
    setSigningOut(true);
    try {
      await logAuthEvent('sign_out');
      await signOutLocal();
      window.location.href = `/${lang}/signin`;
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      setSigningOut(false);
    }
  };

  const handleSignOutGlobal = async () => {
    setSigningOut(true);
    try {
      await logAuthEvent('sign_out');
      await signOutAllDevices();
      window.location.href = `/${lang}/signin`;
    } catch (err) {
      console.error('Error signing out all devices:', err);
    } finally {
      setSigningOut(false);
    }
  };

  const getEventLabel = (eventType: string): string => {
    switch (eventType) {
      case 'sign_in':
        return t.member.security.activity.eventSignIn;
      case 'sign_out':
        return t.member.security.activity.eventSignOut;
      case 'password_reset':
        return t.member.security.activity.eventPasswordReset;
      case 'password_change':
        return t.member.security.activity.eventPasswordChange;
      case 'profile_update':
        return t.member.security.activity.eventProfileUpdate;
      default:
        return eventType;
    }
  };

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const parseUserAgent = (ua: string | null): string => {
    if (!ua) return 'Unknown Device';

    if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) {
      return 'Mobile Device';
    }
    if (ua.includes('Chrome')) return 'Chrome Browser';
    if (ua.includes('Firefox')) return 'Firefox Browser';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari Browser';
    if (ua.includes('Edge')) return 'Edge Browser';
    return 'Desktop Browser';
  };

  if (loading) {
    return (
      <MemberGuard lang={lang}>
        <PremiumShell>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 pb-24 md:pb-28">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="w-12 h-12 border-4 border-[#F0B90B]/30 border-t-[#F0B90B] rounded-full animate-spin" />
            </div>
          </div>
        </PremiumShell>
      </MemberGuard>
    );
  }

  if (!profile) {
    return (
      <MemberGuard lang={lang}>
        <PremiumShell>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 pb-24 md:pb-28">
            <PremiumCard>
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-white/70">Profile not found</p>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 pb-24 md:pb-28">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 flex items-center gap-3">
              <Shield className="w-8 h-8 text-[#F0B90B]" />
              {t.member.security.title}
            </h1>
            <p className="text-white/70 text-lg">
              {t.member.security.subtitle}
            </p>
          </div>

          <PremiumCard className="mb-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#F0B90B]" />
              {t.member.security.status.title}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  {t.member.security.status.verified}
                </label>
                <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2">
                  {profile.is_verified ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <p className="text-white/80">Verified</p>
                    </>
                  ) : (
                    <p className="text-white/80">Member</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  {t.member.security.status.role}
                </label>
                <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-white/80 capitalize">{profile.role}</p>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-white/60 mb-2">
                  {t.member.security.status.invitePermission}
                </label>
                <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-white/80">
                    {profile.can_invite ? 'Can invite new members' : 'Invite disabled'}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-300">
                {t.member.security.status.desc}
              </p>
            </div>
          </PremiumCard>

          <PremiumCard className="mb-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-[#F0B90B]" />
              {t.member.security.session.title}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  {t.member.security.session.signedInAs}
                </label>
                <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2">
                  <User className="w-4 h-4 text-[#F0B90B]" />
                  <p className="text-white/80">@{profile.username}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  {t.member.security.session.device}
                </label>
                <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-white/40" />
                  <p className="text-white/80">{parseUserAgent(navigator.userAgent)}</p>
                </div>
              </div>
            </div>
          </PremiumCard>

          <PremiumCard className="mb-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <LogOut className="w-5 h-5 text-[#F0B90B]" />
              {t.member.security.actions.title}
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => setShowLocalSignOutModal(true)}
                className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5 text-white/60 group-hover:text-white/80 transition-colors" />
                  <div>
                    <p className="font-medium">{t.member.security.actions.signOutDevice}</p>
                    <p className="text-sm text-white/50">Sign out from this device only</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setShowGlobalSignOutModal(true)}
                className="w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" />
                  <div>
                    <p className="font-medium text-red-300">{t.member.security.actions.signOutAll}</p>
                    <p className="text-sm text-red-400/70">Sign out from all devices and sessions</p>
                  </div>
                </div>
              </button>
            </div>
          </PremiumCard>

          <PremiumCard>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#F0B90B]" />
              {t.member.security.activity.title}
            </h2>

            {loadingEvents ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-[#F0B90B]/30 border-t-[#F0B90B] rounded-full animate-spin" />
              </div>
            ) : authEvents.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white/70 mb-2">
                  {t.member.security.activity.emptyTitle}
                </h3>
                <p className="text-sm text-white/50">
                  {t.member.security.activity.emptyDesc}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {authEvents.map((event) => (
                  <div
                    key={event.id}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/[0.07] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-white/90">{getEventLabel(event.event_type)}</p>
                          <span className="text-xs px-2 py-0.5 bg-[#F0B90B]/10 text-[#F0B90B] rounded">
                            {formatRelativeTime(event.created_at)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/50">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(event.created_at).toLocaleString()}</span>
                        </div>
                        {event.user_agent && (
                          <div className="flex items-center gap-2 text-sm text-white/50 mt-1">
                            <Monitor className="w-3 h-3" />
                            <span>{parseUserAgent(event.user_agent)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PremiumCard>
        </div>

        {showLocalSignOutModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-white/5 rounded-lg">
                  <LogOut className="w-6 h-6 text-[#F0B90B]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {t.member.security.actions.confirmTitle}
                  </h3>
                  <p className="text-white/60 text-sm">
                    {t.member.security.actions.confirmDescDevice}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowLocalSignOutModal(false)}
                  disabled={signingOut}
                  className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium transition-all disabled:opacity-50"
                >
                  {t.member.security.actions.cancel}
                </button>
                <button
                  onClick={handleSignOutLocal}
                  disabled={signingOut}
                  className="flex-1 px-4 py-2.5 bg-[#F0B90B] hover:bg-[#F0B90B]/90 text-black font-medium rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {signingOut ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      <span>Signing out...</span>
                    </>
                  ) : (
                    t.member.security.actions.confirm
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {showGlobalSignOutModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a1a1a] border border-red-500/20 rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <LogOut className="w-6 h-6 text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {t.member.security.actions.confirmTitle}
                  </h3>
                  <p className="text-white/60 text-sm">
                    {t.member.security.actions.confirmDescAll}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowGlobalSignOutModal(false)}
                  disabled={signingOut}
                  className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium transition-all disabled:opacity-50"
                >
                  {t.member.security.actions.cancel}
                </button>
                <button
                  onClick={handleSignOutGlobal}
                  disabled={signingOut}
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {signingOut ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing out...</span>
                    </>
                  ) : (
                    t.member.security.actions.confirm
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </PremiumShell>
    </MemberGuard>
  );
};

export default SecurityPage;
