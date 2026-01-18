import { useState, useEffect, useRef } from 'react';
import { User, Save, CheckCircle, AlertCircle, Upload, Loader2, Check, X, Shield, Tag, Users } from 'lucide-react';
import { Language, useTranslations } from '../../i18n';
import { PremiumShell, PremiumCard, PremiumButton, NoticeBox } from '../../components/ui';
import MemberGuard from '../../components/guards/MemberGuard';
import { supabase, getProfile, Profile, updateProfileSafe, uploadAvatar, checkUsernameAvailable } from '../../lib/supabase';

interface ProfilePageProps {
  lang: Language;
}

const ProfilePage = ({ lang }: ProfilePageProps) => {
  const t = useTranslations(lang);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    avatar_url: '',
  });

  const [usernameStatus, setUsernameStatus] = useState<'checking' | 'available' | 'taken' | 'invalid' | null>(null);
  const [usernameCheckTimeout, setUsernameCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (usernameCheckTimeout) {
      clearTimeout(usernameCheckTimeout);
    }

    if (!formData.username.trim()) {
      setUsernameStatus(null);
      return;
    }

    const normalizedUsername = formData.username.trim().toLowerCase();

    if (normalizedUsername === profile?.username) {
      setUsernameStatus(null);
      return;
    }

    if (!isValidUsername(normalizedUsername)) {
      setUsernameStatus('invalid');
      return;
    }

    setUsernameStatus('checking');

    const timeout = setTimeout(async () => {
      const available = await checkUsernameAvailable(normalizedUsername);
      setUsernameStatus(available ? 'available' : 'taken');
    }, 500);

    setUsernameCheckTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [formData.username, profile?.username]);

  const isValidUsername = (username: string): boolean => {
    const pattern = /^[a-z0-9](?:[a-z0-9_]{1,18}[a-z0-9])?$/;
    return pattern.test(username) && username.length >= 3 && username.length <= 20;
  };

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = '/signin';
        return;
      }

      const profileData = await getProfile(user.id);

      if (!profileData) {
        setError(t.member.profile.genericError);
        return;
      }

      setProfile(profileData);
      setFormData({
        full_name: profileData.full_name || '',
        username: profileData.username || '',
        avatar_url: profileData.avatar_url || '',
      });
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(t.member.profile.genericError);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const publicUrl = await uploadAvatar(file);
      setFormData({ ...formData, avatar_url: publicUrl });
    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      if (err.message === 'FILE_TOO_LARGE') {
        setError(t.member.profile.fileTooLarge);
      } else if (err.message === 'INVALID_FILE_TYPE') {
        setError(t.member.profile.fileTypeInvalid);
      } else {
        setError(t.member.profile.genericError);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.full_name.trim()) {
      setError('Full name is required');
      return;
    }

    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }

    const normalizedUsername = formData.username.trim().toLowerCase();

    if (!isValidUsername(normalizedUsername)) {
      setError(t.member.profile.usernameInvalid);
      return;
    }

    if (usernameStatus === 'taken') {
      setError(t.member.profile.usernameTaken);
      return;
    }

    try {
      setSaving(true);

      const updatedProfile = await updateProfileSafe({
        full_name: formData.full_name.trim(),
        username: normalizedUsername,
        avatar_url: formData.avatar_url.trim() || '',
      });

      setProfile(updatedProfile);
      setFormData({
        full_name: updatedProfile.full_name || '',
        username: updatedProfile.username || '',
        avatar_url: updatedProfile.avatar_url || '',
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || t.member.profile.genericError);
    } finally {
      setSaving(false);
    }
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
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-white/70">{error || 'Profile not found'}</p>
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
              <User className="w-8 h-8 text-[#F0B90B]" />
              {t.member.profile.title}
            </h1>
            <p className="text-white/70 text-lg">
              {t.member.profile.subtitle}
            </p>
          </div>

          {success && (
            <NoticeBox variant="success" title={t.member.profile.saved} className="mb-6">
              {t.member.profile.saved}
            </NoticeBox>
          )}

          <PremiumCard className="mb-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-[#F0B90B]" />
              {t.member.profile.sectionIdentity}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="relative">
                    {formData.avatar_url ? (
                      <img
                        src={formData.avatar_url}
                        alt="Avatar"
                        className="w-24 h-24 rounded-full object-cover border-2 border-white/10"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#F0B90B]/20 to-[#F0B90B]/5 border-2 border-white/10 flex items-center justify-center">
                        <User className="w-10 h-10 text-[#F0B90B]/50" />
                      </div>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-[#F0B90B] animate-spin" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload className="w-4 h-4" />
                    {uploading ? t.member.profile.uploading : t.member.profile.upload}
                  </button>
                  <p className="text-xs text-white/50 mt-2">
                    PNG, JPEG, WebP. Max 2MB
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  {t.member.profile.fullName} *
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/50 focus:border-transparent transition-all"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  {t.member.profile.username} *
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                    @
                  </div>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/50 focus:border-transparent transition-all"
                    placeholder="username"
                    required
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {usernameStatus === 'checking' && (
                      <Loader2 className="w-4 h-4 text-white/40 animate-spin" />
                    )}
                    {usernameStatus === 'available' && (
                      <Check className="w-5 h-5 text-green-400" />
                    )}
                    {usernameStatus === 'taken' && (
                      <X className="w-5 h-5 text-red-400" />
                    )}
                    {usernameStatus === 'invalid' && (
                      <X className="w-5 h-5 text-orange-400" />
                    )}
                  </div>
                </div>
                <p className="text-xs text-white/50 mt-2">
                  {t.member.profile.usernameHelp}
                </p>
                {usernameStatus === 'taken' && (
                  <p className="text-xs text-red-400 mt-1">{t.member.profile.usernameTaken}</p>
                )}
                {usernameStatus === 'invalid' && (
                  <p className="text-xs text-orange-400 mt-1">{t.member.profile.usernameInvalid}</p>
                )}
                {usernameStatus === 'available' && (
                  <p className="text-xs text-green-400 mt-1">Username available</p>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <PremiumButton
                  type="submit"
                  disabled={saving || usernameStatus === 'checking' || usernameStatus === 'taken' || usernameStatus === 'invalid'}
                >
                  <Save className="w-5 h-5" />
                  {saving ? t.member.profile.saving : t.member.profile.save}
                </PremiumButton>
              </div>
            </form>
          </PremiumCard>

          <PremiumCard className="mb-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#F0B90B]" />
              {t.member.profile.sectionStatus}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">{t.member.profile.role}</label>
                <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-white/80 capitalize">{profile.role}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">{t.member.profile.verified}</label>
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

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-white/60 mb-2">{t.member.profile.canInvite}</label>
                <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-white/80">{profile.can_invite ? 'Can invite new members' : 'Invite disabled'}</p>
                </div>
              </div>
            </div>
          </PremiumCard>

          <PremiumCard>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#F0B90B]" />
              {t.member.profile.sectionReferral}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">{t.member.profile.referralCode}</label>
                <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#F0B90B]" />
                  <p className="text-white/80 font-mono">{profile.referral_code}</p>
                </div>
              </div>

              {profile.referred_by && (
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">{t.member.profile.referredBy}</label>
                  <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
                    <p className="text-white/80 font-mono">{profile.referred_by}</p>
                  </div>
                </div>
              )}
            </div>
          </PremiumCard>
        </div>
      </PremiumShell>
    </MemberGuard>
  );
};

export default ProfilePage;
