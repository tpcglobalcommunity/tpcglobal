import React, { useState, useEffect } from "react";
import { User, Phone, Send, MapPin, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { useI18n, type Language, getLangPath } from "../../i18n";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import MemberLayout from "./MemberLayout";

interface UpdateProfitProps {
  lang?: Language;
}

interface ProfileData {
  full_name: string;
  phone_wa: string;
  telegram: string;
  city: string;
}

export default function UpdateProfit({ lang }: UpdateProfitProps) {
  const { t, language } = useI18n(lang || "en");
  const L = language;
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData>({
    full_name: '',
    phone_wa: '',
    telegram: '',
    city: ''
  });

  const [touched, setTouched] = useState({
    full_name: false,
    phone_wa: false,
    telegram: false,
    city: false
  });

  const [errors, setErrors] = useState<Partial<ProfileData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);

  // Load current profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, phone_wa, telegram, city')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
          checkProfileComplete(profileData);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfile();
  }, []);

  const checkProfileComplete = (data: ProfileData) => {
    const complete = !!(data.full_name?.trim() && 
                     data.phone_wa?.trim() && 
                     data.telegram?.trim() && 
                     data.city?.trim());
    setProfileComplete(complete);
    return complete;
  };

  const validateField = (field: keyof ProfileData, value: string): string | undefined => {
    if (!value.trim()) {
      return t("profile.errors.required");
    }

    switch (field) {
      case 'full_name':
        if (value.trim().length < 2) {
          return t("profile.errors.fullNameMinLength");
        }
        break;
      case 'phone_wa':
        // Normalize and validate WhatsApp number
        const normalizedPhone = value.replace(/[^0-9+]/g, '');
        if (!normalizedPhone.startsWith('+62') && !normalizedPhone.startsWith('62')) {
          return t("profile.errors.phoneFormat");
        }
        if (normalizedPhone.length < 10) {
          return t("profile.errors.phoneMinLength");
        }
        break;
      case 'telegram':
        // Validate Telegram username or link
        const telegramValue = value.trim();
        if (!telegramValue.startsWith('@') && !telegramValue.startsWith('https://t.me/')) {
          return t("profile.errors.telegramFormat");
        }
        if (telegramValue.startsWith('@') && telegramValue.length < 6) {
          return t("profile.errors.telegramMinLength");
        }
        break;
      case 'city':
        if (value.trim().length < 2) {
          return t("profile.errors.cityMinLength");
        }
        break;
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ProfileData> = {};
    let isValid = true;

    Object.keys(profile).forEach((field) => {
      const error = validateField(field as keyof ProfileData, profile[field as keyof ProfileData]);
      if (error) {
        newErrors[field as keyof ProfileData] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleFieldChange = (field: keyof ProfileData, value: string) => {
    let normalizedValue = value;

    // Normalize specific fields
    if (field === 'phone_wa') {
      normalizedValue = value.replace(/[^0-9+]/g, '');
      // Auto-add +62 if starts with 8
      if (normalizedValue.startsWith('8')) {
        normalizedValue = '+62' + normalizedValue;
      } else if (normalizedValue.startsWith('62') && !normalizedValue.startsWith('+62')) {
        normalizedValue = '+' + normalizedValue;
      }
    } else if (field === 'telegram') {
      normalizedValue = value.trim();
      // Auto-add @ if it's just a username without @ or t.me/
      if (!normalizedValue.startsWith('@') && !normalizedValue.startsWith('https://t.me/')) {
        normalizedValue = '@' + normalizedValue;
      }
    }

    setProfile(prev => ({ ...prev, [field]: normalizedValue }));
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
    setSaveMessage(null);
  };

  const handleBlur = (field: keyof ProfileData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, profile[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSaveMessage(null);
    setSaveSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name.trim(),
          phone_wa: profile.phone_wa.trim(),
          telegram: profile.telegram.trim(),
          city: profile.city.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      setSaveMessage(t("profileCompletion.success"));
      setSaveSuccess(true);
      setProfileComplete(checkProfileComplete(profile));
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setSaveMessage(t("profileCompletion.saveError"));
      setSaveSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canNavigateToOtherPages = profileComplete;

  return (
    <MemberLayout lang={L}>
      <div className="max-w-4xl mx-auto">
        {/* Profile Completion Warning */}
        {!profileComplete && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-yellow-300 font-semibold mb-1">
                  {t("profileCompletion.title")}
                </h3>
                <p className="text-yellow-200 text-sm mb-2">
                  {t("profileCompletion.subtitle")}
                </p>
                <p className="text-yellow-200 text-sm">
                  {t("profileCompletion.body")}
                </p>
                <p className="text-yellow-200 text-sm font-medium">
                  {t("profileCompletion.requiredNotice")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {t("profileCompletion.title")}
          </h1>
          <p className="text-white/60">
            {t("profileCompletion.subtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Required Profile Fields */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-[#F0B90B]" />
              {t("profileCompletion.requiredNotice")}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">
                  {t("profile.fullName", "Full Name")} *
                </label>
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={(e) => handleFieldChange('full_name', e.target.value)}
                  onBlur={() => handleBlur('full_name')}
                  placeholder={t("profile.fullNamePlaceholder", "Enter your full name")}
                  className={`w-full h-12 rounded-xl bg-white/5 border ${
                    errors.full_name ? "border-red-500/50 bg-red-500/5" : "border-white/20"
                  } text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/50 focus:border-transparent transition-all px-4`}
                />
                {errors.full_name && touched.full_name && (
                  <p className="mt-2 text-sm text-red-400">{t(errors.full_name)}</p>
                )}
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">
                  {t("profile.phoneWa", "WhatsApp")} *
                </label>
                <input
                  type="tel"
                  value={profile.phone_wa}
                  onChange={(e) => handleFieldChange('phone_wa', e.target.value)}
                  onBlur={() => handleBlur('phone_wa')}
                  placeholder={t("profile.phonePlaceholder", "+62 812-3456-7890")}
                  className={`w-full h-12 rounded-xl bg-white/5 border ${
                    errors.phone_wa ? "border-red-500/50 bg-red-500/5" : "border-white/20"
                  } text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/50 focus:border-transparent transition-all px-4`}
                />
                {errors.phone_wa && touched.phone_wa && (
                  <p className="mt-2 text-sm text-red-400">{t(errors.phone_wa)}</p>
                )}
              </div>

              {/* Telegram */}
              <div>
                <label className="block text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">
                  {t("profile.telegram", "Telegram")} *
                </label>
                <input
                  type="text"
                  value={profile.telegram}
                  onChange={(e) => handleFieldChange('telegram', e.target.value)}
                  onBlur={() => handleBlur('telegram')}
                  placeholder={t("profile.telegramPlaceholder", "@username or https://t.me/username")}
                  className={`w-full h-12 rounded-xl bg-white/5 border ${
                    errors.telegram ? "border-red-500/50 bg-red-500/5" : "border-white/20"
                  } text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/50 focus:border-transparent transition-all px-4`}
                />
                {errors.telegram && touched.telegram && (
                  <p className="mt-2 text-sm text-red-400">{t(errors.telegram)}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">
                  {t("profile.city", "City")} *
                </label>
                <input
                  type="text"
                  value={profile.city}
                  onChange={(e) => handleFieldChange('city', e.target.value)}
                  onBlur={() => handleBlur('city')}
                  placeholder={t("profile.cityPlaceholder", "Enter your city")}
                  className={`w-full h-12 rounded-xl bg-white/5 border ${
                    errors.city ? "border-red-500/50 bg-red-500/5" : "border-white/20"
                  } text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/50 focus:border-transparent transition-all px-4`}
                />
                {errors.city && touched.city && (
                  <p className="mt-2 text-sm text-red-400">{t(errors.city)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div className={`p-4 rounded-xl text-sm ${
              saveSuccess 
                ? "bg-green-500/10 border border-green-500/20 text-green-300" 
                : "bg-red-500/10 border border-red-500/20 text-red-300"
            }`}>
              {saveSuccess && <CheckCircle2 className="w-4 h-4 inline mr-2" />}
              {saveMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-12 rounded-xl bg-[#F0B90B] text-black font-semibold hover:bg-[#F0B90B]/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  {t("profile.saving", "Saving...")}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {t("profileCompletion.save")}
                </>
              )}
            </button>

            {profileComplete && (
              <Link
                to={getLangPath(L, "/member/dashboard")}
                className="flex-1 h-12 rounded-xl border border-white/20 bg-transparent text-white font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
              >
                {t("profile.goToDashboard", "Go to Dashboard")}
              </Link>
            )}
          </div>
        </form>
      </div>
    </MemberLayout>
  );
}
