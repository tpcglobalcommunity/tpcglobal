import React, { useState, useEffect } from "react";
import { useI18n } from "@/i18n";
import { Link } from "@/components/Router";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function Onboarding() {
  const { t, language: lang } = useI18n();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    telegram: "",
    city: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          window.location.href = `/${lang}/signin`;
          return;
        }

        setUser(session.user);

        // Load existing profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
          setFormData({
            full_name: profileData.full_name || "",
            phone: profileData.phone || "",
            telegram: profileData.telegram || "",
            city: profileData.city || "",
          });
        }
      } catch (err) {
        console.error("Error loading user data:", err);
      }
    };

    loadUserData();
  }, [lang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          ...formData,
          status: "ACTIVE",
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-[#F0B90B]" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="max-w-md w-full mx-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg shadow-black/30 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              {t("onboarding.successTitle") || "Profile Completed!"}
            </h2>
            <p className="text-white/60 mb-6">
              {t("onboarding.successDesc") || "Your profile has been set up successfully. Welcome to TPC Global!"}
            </p>
            <Link
              to={`/${lang}/member`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F0B90B] to-[#F8D568] text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-[#F0B90B]/20 transition-all duration-200"
            >
              {t("onboarding.goToDashboard") || "Go to Dashboard"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="max-w-md w-full mx-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg shadow-black/30 p-8">
          {/* Back to Home */}
          <div className="flex justify-end mb-4">
            <Link
              to={`/${lang}`}
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              ← {t("auth.backToHome")}
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
              {t("onboarding.title")}
            </h1>
            <p className="text-sm text-white/70">
              {t("onboarding.subtitle")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("onboarding.fullName")} *
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
                placeholder={t("onboarding.fullNamePlaceholder")}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#F0B90B] text-white placeholder-white/50"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("onboarding.phone")} *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder={t("onboarding.phonePlaceholder")}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#F0B90B] text-white placeholder-white/50"
                required
              />
            </div>

            {/* Telegram */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("onboarding.telegram")}
              </label>
              <input
                type="text"
                value={formData.telegram}
                onChange={(e) => handleInputChange("telegram", e.target.value)}
                placeholder={t("onboarding.telegramPlaceholder")}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#F0B90B] text-white placeholder-white/50"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("onboarding.city")} *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder={t("onboarding.cityPlaceholder")}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#F0B90B] text-white placeholder-white/50"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-2xl font-semibold bg-gradient-to-r from-[#F0B90B] to-[#F8D568] text-black transition-all duration-200 hover:shadow-lg hover:shadow-[#F0B90B]/20 active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("onboarding.saving")}
                </>
              ) : (
                t("onboarding.completeProfile")
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
