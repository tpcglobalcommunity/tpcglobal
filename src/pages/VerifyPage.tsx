import { useState, useEffect, FormEvent } from 'react';
import { Shield, Search, CheckCircle, XCircle, Copy, Link as LinkIcon, User, Calendar, Award, ExternalLink } from 'lucide-react';
import { Language, useTranslations, getLangPath } from '../i18n';
import { PremiumShell, NoticeBox, PremiumButton, PremiumCard } from '../components/ui';
import { Link } from '../components/Router';
import { supabase, verifyMember, getProfile, MemberVerification, Profile } from '../lib/supabase';

interface VerifyPageProps {
  lang: Language;
}

const VerifyPage = ({ lang }: VerifyPageProps) => {
  const t = useTranslations(lang);

  const [identifier, setIdentifier] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<MemberVerification | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const profileData = await getProfile(user.id);
          setCurrentUser(profileData);
        }
      } catch (err) {
        console.error('Error fetching current user:', err);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryIdentifier = params.get('q');

    if (queryIdentifier) {
      setIdentifier(queryIdentifier);
      handleVerify(queryIdentifier);
    }
  }, []);

  const handleVerify = async (searchIdentifier?: string) => {
    const searchTerm = searchIdentifier || identifier;

    if (!searchTerm.trim()) return;

    setIsVerifying(true);
    setNotFound(false);
    setVerificationResult(null);

    try {
      const result = await verifyMember(searchTerm);

      if (result) {
        setVerificationResult(result);
        setNotFound(false);
      } else {
        setNotFound(true);
        setVerificationResult(null);
      }
    } catch (err) {
      console.error('Error verifying member:', err);
      setNotFound(true);
      setVerificationResult(null);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleVerify();
  };

  const handleCopyText = async () => {
    if (!verificationResult) return;

    const text = `${t.verify.result.verificationText}\n\nUsername: ${verificationResult.username}\nRole: ${verificationResult.role}\nVerified: ${verificationResult.is_verified ? t.verify.result.verifiedLabel : t.verify.result.notVerifiedLabel}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyLink = async () => {
    if (!verificationResult) return;

    const url = `${window.location.origin}${getLangPath(lang, '/verify')}?q=${encodeURIComponent(verificationResult.username || verificationResult.referral_code)}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'from-purple-500 to-pink-500';
      case 'admin':
        return 'from-red-500 to-orange-500';
      case 'moderator':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-[#F0B90B] to-[#FCD535]';
    }
  };

  const formatRole = (role: string) => {
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <PremiumShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 pb-24 md:pb-28">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#F0B90B]/20 to-[#F0B90B]/5 border border-[#F0B90B]/20 mb-6">
            <Shield className="w-10 h-10 text-[#F0B90B]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t.verify.hero.title}
          </h1>
          <p className="text-xl text-white/70 mb-6">
            {t.verify.hero.subtitle}
          </p>
          <NoticeBox variant="info" title={t.verify.hero.noticeTitle} className="max-w-2xl mx-auto">
            {t.verify.hero.noticeDesc}
          </NoticeBox>
        </div>

        {!loadingUser && currentUser && (
          <PremiumCard className="mb-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#F0B90B]/20 to-[#F0B90B]/5 border border-[#F0B90B]/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-8 h-8 text-[#F0B90B]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {t.verify.self.title}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-white/60">@{currentUser.username}</span>
                      {currentUser.is_verified && (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${getRoleBadgeColor(currentUser.role)} text-white`}>
                        <Award className="w-4 h-4" />
                        {formatRole(currentUser.role)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <Link to={getLangPath(lang, '/member/dashboard')}>
                <PremiumButton variant="secondary">
                  <ExternalLink className="w-5 h-5" />
                  {t.verify.self.openDashboard}
                </PremiumButton>
              </Link>
            </div>
          </PremiumCard>
        )}

        <PremiumCard className="mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-white/90 mb-2">
                {t.verify.form.label}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  id="identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={t.verify.form.placeholder}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#F0B90B]/50 focus:ring-2 focus:ring-[#F0B90B]/20 transition-all"
                  disabled={isVerifying}
                />
              </div>
            </div>

            <PremiumButton
              variant="primary"
              type="submit"
              disabled={isVerifying || !identifier.trim()}
              className="w-full"
            >
              {isVerifying ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  {t.verify.form.verifying}
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  {t.verify.form.button}
                </>
              )}
            </PremiumButton>
          </form>
        </PremiumCard>

        {verificationResult && (
          <PremiumCard className="mb-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500/50 mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {t.verify.result.foundTitle}
              </h2>
            </div>

            <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-6">
                {verificationResult.avatar_url ? (
                  <img
                    src={verificationResult.avatar_url}
                    alt={verificationResult.username || 'Member'}
                    className="w-20 h-20 rounded-xl object-cover border-2 border-[#F0B90B]/30"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#F0B90B]/20 to-[#F0B90B]/5 border-2 border-[#F0B90B]/30 flex items-center justify-center">
                    <User className="w-10 h-10 text-[#F0B90B]" />
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-2xl font-bold text-white">
                      {verificationResult.full_name || verificationResult.username}
                    </h3>
                    {verificationResult.is_verified && (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    )}
                  </div>

                  {verificationResult.username && (
                    <p className="text-white/70 mb-4">@{verificationResult.username}</p>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-white/60 mb-1">{t.verify.result.roleLabel}</p>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r ${getRoleBadgeColor(verificationResult.role)} text-white`}>
                        <Award className="w-4 h-4" />
                        {formatRole(verificationResult.role)}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm text-white/60 mb-1">
                        {verificationResult.is_verified ? t.verify.result.verifiedLabel : t.verify.result.notVerifiedLabel}
                      </p>
                      <div className="flex items-center gap-2">
                        {verificationResult.is_verified ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-green-500/20 border border-green-500/30 text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            {t.verify.result.verifiedLabel}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-white/5 border border-white/20 text-white/70">
                            <XCircle className="w-4 h-4" />
                            {t.verify.result.notVerifiedLabel}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <p className="text-sm text-white/60 mb-1">{t.verify.result.joinedLabel}</p>
                      <div className="flex items-center gap-2 text-white/90">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(verificationResult.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCopyText}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
              >
                {copiedText ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    {t.verify.result.copied}
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    {t.verify.result.copyText}
                  </>
                )}
              </button>

              <button
                onClick={handleCopyLink}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
              >
                {copiedLink ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    {t.verify.result.linkCopied}
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-5 h-5" />
                    {t.verify.result.copyLink}
                  </>
                )}
              </button>
            </div>
          </PremiumCard>
        )}

        {notFound && (
          <NoticeBox variant="warning" title={t.verify.result.notFoundTitle} className="mb-8">
            {t.verify.result.notFoundDesc}
          </NoticeBox>
        )}

        <NoticeBox variant="warning" title={t.verify.disclaimer.title}>
          {t.verify.disclaimer.desc}
        </NoticeBox>
      </div>
    </PremiumShell>
  );
};

export default VerifyPage;
