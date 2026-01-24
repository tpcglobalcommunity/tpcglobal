import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';
import { completeRequiredProfile, getProfileCompletionStatus } from '../lib/supabase';
import { langPath } from '../utils/langPath';
import { User, Phone, MessageSquare, MapPin, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ProfileData {
  full_name: string;
  phone_wa: string;
  telegram: string;
  city: string;
}

interface ValidationErrors {
  full_name?: string;
  phone_wa?: string;
  telegram?: string;
  city?: string;
}

export const CompleteProfile: React.FC<{ lang: 'en' | 'id' }> = ({ lang }) => {
  const { t } = useI18n();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    phone_wa: '',
    telegram: '',
    city: ''
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Check if profile is already completed
  useEffect(() => {
    const checkProfileStatus = async () => {
      try {
        const status = await getProfileCompletionStatus();
        if (status?.profile_required_completed) {
          navigate(langPath(lang, '/member/dashboard'));
        }
      } catch (error) {
        console.error('[PROFILE_STATUS] Error:', error);
      }
    };

    checkProfileStatus();
  }, [lang, navigate]);

  const validateField = (field: keyof ProfileData, value: string): string | undefined => {
    if (!value.trim()) {
      return t('profile.errors.required');
    }

    switch (field) {
      case 'full_name':
        if (value.trim().length < 2) {
          return t('profile.errors.fullNameMinLength');
        }
        break;
      case 'phone_wa':
        // Normalize and validate WhatsApp number
        const normalizedPhone = value.replace(/[^0-9+]/g, '');
        if (!normalizedPhone.startsWith('+62') && !normalizedPhone.startsWith('62')) {
          return t('profile.errors.phoneFormat');
        }
        if (normalizedPhone.length < 10) {
          return t('profile.errors.phoneMinLength');
        }
        break;
      case 'telegram':
        // Validate Telegram username or link
        const telegramValue = value.trim();
        if (!telegramValue.startsWith('@') && !telegramValue.startsWith('https://t.me/')) {
          return t('profile.errors.telegramFormat');
        }
        if (telegramValue.startsWith('@') && telegramValue.length < 6) {
          return t('profile.errors.telegramMinLength');
        }
        break;
      case 'city':
        if (value.trim().length < 2) {
          return t('profile.errors.cityMinLength');
        }
        break;
    }
    return undefined;
  };

  const handleInputChange = (field: keyof ProfileData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProfileData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = (field: keyof ProfileData) => () => {
    const error = validateField(field, profileData[field]);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const normalizeAndValidateData = (): ProfileData => {
    const normalized = { ...profileData };

    // Normalize WhatsApp number
    if (normalized.phone_wa.startsWith('8')) {
      normalized.phone_wa = '+62' + normalized.phone_wa;
    }

    // Normalize Telegram username
    if (normalized.telegram && !normalized.telegram.startsWith('@') && !normalized.telegram.startsWith('https://t.me/')) {
      normalized.telegram = '@' + normalized.telegram;
    }

    return normalized;
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    const normalizedData = normalizeAndValidateData();

    Object.keys(normalizedData).forEach((field) => {
      const error = validateField(field as keyof ProfileData, normalizedData[field as keyof ProfileData]);
      if (error) {
        newErrors[field as keyof ValidationErrors] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const normalizedData = normalizeAndValidateData();
      await completeRequiredProfile(normalizedData);
      setIsSuccess(true);
    } catch (error: any) {
      console.error('[PROFILE] Error:', error);
      setErrors(prev => ({ 
        ...prev, 
        submit: error.message || t('profile.errors.saveError') 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return Object.values(profileData).every(value => value.trim() !== '') &&
           Object.keys(errors).length === 0;
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-gradient-to-br from-[#101827] to-[#0b0f17] border border-[rgba(240,185,11,0.18)] rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-[#f0b90b] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-[#0b0f17]" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              {t('profileCompletion.success')}
            </h1>
            <p className="text-[rgba(231,237,247,0.82)] mb-8">
              {t('profileCompletion.subtitle')}
            </p>
            
            <button
              onClick={() => navigate(langPath(lang, '/member/dashboard'))}
              className="w-full h-12 rounded-xl bg-[#f0b90b] text-[#0b0f17] font-semibold hover:bg-[#f0b90b]/90 transition-colors"
            >
              {t('profile.goToDashboard')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-gradient-to-br from-[#101827] to-[#0b0f17] border border-[rgba(240,185,11,0.18)] rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {t('profileCompletion.title')}
            </h1>
            <p className="text-[rgba(231,237,247,0.82)]">
              {t('profileCompletion.subtitle')}
            </p>
          </div>

          {/* Profile Completion Notice */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-yellow-300 font-semibold mb-1">
                  {t('profileCompletion.title')}
                </h3>
                <p className="text-yellow-200 text-sm mb-2">
                  {t('profileCompletion.subtitle')}
                </p>
                <p className="text-yellow-200 text-sm">
                  {t('profileCompletion.body')}
                </p>
                <p className="text-yellow-200 text-sm font-medium mt-2">
                  {t('profileCompletion.requiredNotice')}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Required Fields Section */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-[#f0b90b]" />
                {t('profileCompletion.requiredNotice')}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">
                    {t('profile.fullName')} *
                  </label>
                  <input
                    type="text"
                    value={profileData.full_name}
                    onChange={handleInputChange('full_name')}
                    onBlur={() => handleBlur('full_name')}
                    placeholder={t('profile.fullNamePlaceholder')}
                    className={`w-full h-12 rounded-xl bg-white/5 border px-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#f0b90b]/50 focus:border-transparent transition-all ${
                      errors.full_name ? 'border-red-500/50 bg-red-500/5' : 'border-white/20'
                    }`}
                  />
                  {errors.full_name && (
                    <p className="mt-2 text-sm text-red-400">{errors.full_name}</p>
                  )}
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">
                    {t('profile.phoneWa')} *
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone_wa}
                    onChange={handleInputChange('phone_wa')}
                    onBlur={() => handleBlur('phone_wa')}
                    placeholder={t('profile.phonePlaceholder')}
                    className={`w-full h-12 rounded-xl bg-white/5 border px-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#f0b90b]/50 focus:border-transparent transition-all ${
                      errors.phone_wa ? 'border-red-500/50 bg-red-500/5' : 'border-white/20'
                    }`}
                  />
                  {errors.phone_wa && (
                    <p className="mt-2 text-sm text-red-400">{errors.phone_wa}</p>
                  )}
                </div>

                {/* Telegram */}
                <div>
                  <label className="block text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">
                    {t('profile.telegram')} *
                  </label>
                  <input
                    type="text"
                    value={profileData.telegram}
                    onChange={handleInputChange('telegram')}
                    onBlur={() => handleBlur('telegram')}
                    placeholder={t('profile.telegramPlaceholder')}
                    className={`w-full h-12 rounded-xl bg-white/5 border px-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#f0b90b]/50 focus:border-transparent transition-all ${
                      errors.telegram ? 'border-red-500/50 bg-red-500/5' : 'border-white/20'
                    }`}
                  />
                  {errors.telegram && (
                    <p className="mt-2 text-sm text-red-400">{errors.telegram}</p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">
                    {t('profile.city')} *
                  </label>
                  <input
                    type="text"
                    value={profileData.city}
                    onChange={handleInputChange('city')}
                    onBlur={() => handleBlur('city')}
                    placeholder={t('profile.cityPlaceholder')}
                    className={`w-full h-12 rounded-xl bg-white/5 border px-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#f0b90b]/50 focus:border-transparent transition-all ${
                      errors.city ? 'border-red-500/50 bg-red-500/5' : 'border-white/20'
                    }`}
                  />
                  {errors.city && (
                    <p className="mt-2 text-sm text-red-400">{errors.city}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Error */}
            {(errors as any).submit && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-sm">{(errors as any).submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !isFormValid()}
              className="w-full h-12 rounded-xl bg-[#f0b90b] text-[#0b0f17] font-semibold hover:bg-[#f0b90b]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('profile.saving')}
                </>
              ) : (
                t('profileCompletion.save')
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
