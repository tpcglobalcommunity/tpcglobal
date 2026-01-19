import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../i18n';
import { PremiumShell } from '../../components/ui/PremiumShell';
import { PremiumCard } from '../../components/ui/PremiumCard';
import { PremiumButton } from '../../components/ui/PremiumButton';
import { NoticeBox } from '../../components/ui/NoticeBox';
import { Loader2 } from 'lucide-react';

interface ProfileData {
  full_name: string;
  phone: string;
  telegram_username: string;
  city: string;
}

interface FormErrors {
  full_name?: string;
  phone?: string;
  telegram_username?: string;
  city?: string;
  general?: string;
}

export default function CompleteProfile() {
  const { t } = useI18n();
  
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    phone: '',
    telegram_username: '',
    city: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentProfile();
  }, []);

  const loadCurrentProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/signin';
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone, telegram_username, city')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setProfileData({
          full_name: profile.full_name || '',
          phone: profile.phone || '',
          telegram_username: profile.telegram_username || '',
          city: profile.city || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Full Name validation
    if (!profileData.full_name.trim()) {
      newErrors.full_name = t('completeProfile.errors.fullNameRequired');
    } else if (profileData.full_name.trim().length < 2) {
      newErrors.full_name = t('completeProfile.errors.fullNameMinLength');
    }

    // Phone validation
    if (!profileData.phone.trim()) {
      newErrors.phone = t('completeProfile.errors.phoneRequired');
    } else if (profileData.phone.trim().length < 8) {
      newErrors.phone = t('completeProfile.errors.phoneMinLength');
    }

    // Telegram validation
    if (!profileData.telegram_username.trim()) {
      newErrors.telegram_username = t('completeProfile.errors.telegramRequired');
    } else if (profileData.telegram_username.trim().length < 2) {
      newErrors.telegram_username = t('completeProfile.errors.telegramMinLength');
    }

    // City validation
    if (!profileData.city.trim()) {
      newErrors.city = t('completeProfile.errors.cityRequired');
    } else if (profileData.city.trim().length < 2) {
      newErrors.city = t('completeProfile.errors.cityMinLength');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setErrors({ general: t('completeProfile.errors.sessionExpired') });
        return;
      }

      // Clean telegram username (remove @ if present)
      const cleanTelegram = profileData.telegram_username.trim().replace(/^@/, '');

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name.trim(),
          phone: profileData.phone.trim(),
          telegram_username: cleanTelegram,
          city: profileData.city.trim(),
          is_profile_complete: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id);

      if (error) {
        setErrors({ general: error.message });
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/member';
      }, 2000);

    } catch (error: any) {
      setErrors({ general: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  if (loading) {
    return (
      <PremiumShell>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
        </div>
      </PremiumShell>
    );
  }

  return (
    <PremiumShell>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <PremiumCard className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">
                {t('completeProfile.title')}
              </h1>
              <p className="text-gray-300">
                {t('completeProfile.subtitle')}
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <NoticeBox variant="success" className="mb-6">
                {t('completeProfile.success')}
              </NoticeBox>
            )}

            {/* Error Message */}
            {errors.general && (
              <NoticeBox variant="warning" className="mb-6">
                {errors.general}
              </NoticeBox>
            )}

            {/* Notice */}
            <NoticeBox variant="info" className="mb-6">
              {t('completeProfile.notice')}
            </NoticeBox>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-200 mb-2">
                  {t('completeProfile.labels.fullName')}
                </label>
                <input
                  type="text"
                  id="full_name"
                  value={profileData.full_name}
                  onChange={handleInputChange('full_name')}
                  placeholder={t('completeProfile.placeholders.fullName')}
                  className="w-full px-4 py-3 bg-black/30 border border-yellow-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                  disabled={isSubmitting}
                />
                {errors.full_name && (
                  <p className="mt-2 text-sm text-red-400">
                    {errors.full_name}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-200 mb-2">
                  {t('completeProfile.labels.phone')}
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={profileData.phone}
                  onChange={handleInputChange('phone')}
                  placeholder={t('completeProfile.placeholders.phone')}
                  className="w-full px-4 py-3 bg-black/30 border border-yellow-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                  disabled={isSubmitting}
                />
                {errors.phone && (
                  <p className="mt-2 text-sm text-red-400">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Telegram Username */}
              <div>
                <label htmlFor="telegram_username" className="block text-sm font-medium text-gray-200 mb-2">
                  {t('completeProfile.labels.telegram')}
                </label>
                <input
                  type="text"
                  id="telegram_username"
                  value={profileData.telegram_username}
                  onChange={handleInputChange('telegram_username')}
                  placeholder={t('completeProfile.placeholders.telegram')}
                  className="w-full px-4 py-3 bg-black/30 border border-yellow-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                  disabled={isSubmitting}
                />
                {errors.telegram_username && (
                  <p className="mt-2 text-sm text-red-400">
                    {errors.telegram_username}
                  </p>
                )}
              </div>

              {/* City */}
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-200 mb-2">
                  {t('completeProfile.labels.city')}
                </label>
                <input
                  type="text"
                  id="city"
                  value={profileData.city}
                  onChange={handleInputChange('city')}
                  placeholder={t('completeProfile.placeholders.city')}
                  className="w-full px-4 py-3 bg-black/30 border border-yellow-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                  disabled={isSubmitting}
                />
                {errors.city && (
                  <p className="mt-2 text-sm text-red-400">
                    {errors.city}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <PremiumButton
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {t('completeProfile.submitting')}
                  </div>
                ) : (
                  t('completeProfile.button')
                )}
              </PremiumButton>
            </form>
          </PremiumCard>
        </div>
      </div>
    </PremiumShell>
  );
}
