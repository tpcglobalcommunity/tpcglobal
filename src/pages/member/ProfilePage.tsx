import { useState, useEffect } from 'react';
import { User, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { Language, useTranslations } from '../../i18n';
import { PremiumShell, PremiumCard, PremiumButton, NoticeBox } from '../../components/ui';
import MemberGuard from '../../components/guards/MemberGuard';
import { supabase, getProfile, Profile } from '../../lib/supabase';
import { validateUsername } from '../../lib/authHelpers';

interface ProfilePageProps {
  lang: Language;
}

const ProfilePage = ({ lang }: ProfilePageProps) => {
  const t = useTranslations(lang);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    avatar_url: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = '/signin';
        return;
      }

      const profileData = await getProfile(user.id);

      if (!profileData) {
        setError('Failed to load profile');
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
      setError('Failed to load profile');
    } finally {
      setLoading(false);
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

    const usernameValidation = validateUsername(formData.username.trim());
    if (!usernameValidation.valid) {
      setError(usernameValidation.error || 'Invalid username');
      return;
    }

    const normalizedUsername = formData.username.trim().toLowerCase();

    if (normalizedUsername !== profile?.username) {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', normalizedUsername)
        .maybeSingle();

      if (existingUser) {
        setError('Username already taken');
        return;
      }
    }

    try {
      setSaving(true);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name.trim(),
          username: normalizedUsername,
          avatar_url: formData.avatar_url.trim() || null,
        })
        .eq('id', profile!.id);

      if (updateError) throw updateError;

      await loadProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
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
              Profile Settings
            </h1>
            <p className="text-white/70">
              Manage your profile information
            </p>
          </div>

          {success && (
            <NoticeBox variant="success" title="Profile Updated" className="mb-6">
              Your profile has been updated successfully
            </NoticeBox>
          )}

          <PremiumCard className="mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Account Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Email</label>
                <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-white/80">{profile.email || 'Not available'}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Role</label>
                  <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
                    <p className="text-white/80 capitalize">{profile.role}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Status</label>
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
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Invite Permissions</label>
                <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-white/80">{profile.can_invite ? 'Can invite new members' : 'Invite disabled'}</p>
                </div>
              </div>
            </div>
          </PremiumCard>

          <PremiumCard>
            <h2 className="text-xl font-bold text-white mb-4">Edit Profile</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Full Name *
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
                  Username *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/50 focus:border-transparent transition-all"
                  placeholder="Enter your username"
                  required
                />
                <p className="text-xs text-white/50 mt-2">
                  3+ characters, lowercase letters, numbers, dots and underscores only
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Avatar URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.avatar_url}
                  onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/50 focus:border-transparent transition-all"
                  placeholder="https://example.com/avatar.jpg"
                />
                <p className="text-xs text-white/50 mt-2">
                  Link to your profile picture
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <PremiumButton
                  type="submit"
                  disabled={saving}
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </PremiumButton>
              </div>
            </form>
          </PremiumCard>

          <NoticeBox variant="warning" title="Important" className="mt-6">
            Email and role cannot be changed. Contact an administrator if you need to update these fields.
          </NoticeBox>
        </div>
      </PremiumShell>
    </MemberGuard>
  );
};

export default ProfilePage;
