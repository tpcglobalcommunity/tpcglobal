import { useState, useEffect } from 'react';
import { User, MapPin, Calendar, CheckCircle, AlertCircle, ExternalLink, MessageCircle } from 'lucide-react';
import { Language, useTranslations, getLangPath } from '../i18n';
import { PremiumShell, PremiumCard, PremiumButton } from '../components/ui';
import { getPublicProfileByUsername, DirectoryMemberItem } from '../lib/supabase';
import { TrustBadges } from '../components/trust/TrustBadges';

interface PublicProfilePageProps {
  lang: Language;
  username: string;
}

const PublicProfilePage = ({ lang, username }: PublicProfilePageProps) => {
  const t = useTranslations(lang);

  const [profile, setProfile] = useState<DirectoryMemberItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setNotFound(false);

      const data = await getPublicProfileByUsername(username);

      if (!data) {
        setNotFound(true);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error loading public profile:', err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

  if (notFound || !profile) {
    return (
      <PremiumShell>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 pb-24 md:pb-28">
          <PremiumCard>
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-white/20 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-white mb-3">
                {t.public.profile.notAvailableTitle}
              </h1>
              <p className="text-white/60 mb-8 max-w-md mx-auto">
                {t.public.profile.notAvailableDesc}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <PremiumButton onClick={() => window.location.href = getLangPath(lang, `/verify?q=${username}`)}>
                  <CheckCircle className="w-5 h-5" />
                  {t.public.profile.verifyCta}
                </PremiumButton>
                <PremiumButton
                  variant="secondary"
                  onClick={() => window.open('https://t.me/tokopediacoin', '_blank')}
                >
                  <MessageCircle className="w-5 h-5" />
                  {t.public.profile.joinCta}
                </PremiumButton>
              </div>
            </div>
          </PremiumCard>
        </div>
      </PremiumShell>
    );
  }

  return (
    <PremiumShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 pb-24 md:pb-28">
        <PremiumCard className="mb-6">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-6">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white/10"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#F0B90B]/20 to-[#F0B90B]/5 border-4 border-white/10 flex items-center justify-center">
                  <User className="w-16 h-16 text-[#F0B90B]/50" />
                </div>
              )}
              {profile.is_verified && (
                <div className="absolute bottom-0 right-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-[#1a1a1a]">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {profile.full_name}
            </h1>
            <p className="text-xl text-white/60 mb-4">@{profile.username}</p>

            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              <TrustBadges
                role={profile.role as any}
                is_verified={profile.is_verified}
                can_invite={false}
                vendor_status={profile.vendor_status as any}
                mode="public"
                lang={lang}
              />
            </div>

            {profile.bio && (
              <p className="text-white/70 max-w-2xl mb-6 leading-relaxed">
                {profile.bio}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/50">
              {profile.country && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.country}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{t.public.profile.memberSince} {formatDate(profile.created_at)}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <PremiumButton onClick={() => window.location.href = getLangPath(lang, `/verify?q=${username}`)}>
                <CheckCircle className="w-5 h-5" />
                {t.public.profile.verifyCta}
              </PremiumButton>
              <PremiumButton
                variant="secondary"
                onClick={() => window.open('https://t.me/tokopediacoin', '_blank')}
              >
                <ExternalLink className="w-5 h-5" />
                {t.public.profile.joinCta}
              </PremiumButton>
            </div>
          </div>
        </PremiumCard>

        <div className="text-center">
          <p className="text-sm text-white/40">
            This is a public profile page. Join TPC to access the full member directory.
          </p>
        </div>
      </div>
    </PremiumShell>
  );
};

export default PublicProfilePage;
