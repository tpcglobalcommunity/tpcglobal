import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n/i18n";
import { supabase } from "@/integrations/supabase/client";

const LoginPage = () => {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [cooldownSec, setCooldownSec] = useState(0);
  const [rateLimitSec, setRateLimitSec] = useState(0);
  
  // Get returnTo from query params
  const returnTo = searchParams.get('returnTo');

  // Cooldown timer effects
  useEffect(() => {
    if (cooldownSec > 0) {
      const timer = setTimeout(() => {
        setCooldownSec(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownSec]);

  useEffect(() => {
    if (rateLimitSec > 0) {
      const timer = setTimeout(() => {
        setRateLimitSec(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [rateLimitSec]);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // User is already logged in, redirect to returnTo or dashboard
          const safeReturnTo = returnTo && returnTo.startsWith(`/${lang}/`) ? returnTo : null;
          const target = safeReturnTo || `/${lang}/dashboard`;
          navigate(target, { replace: true });
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };
    
    checkAuth();
  }, [returnTo, lang, navigate]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGoogleLogin = async () => {
    // Save returnTo to sessionStorage for OAuth callback
    sessionStorage.setItem('tpc_returnTo', returnTo || '');
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/${lang}/auth/callback`,
        },
      });

      if (error) {
        // Check if Google provider is not enabled
        if (error.message?.includes('provider is not enabled')) {
          toast.error(t("auth.googleNotEnabled"));
        } else {
          toast.error(t("auth.errorGeneric"));
        }
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      toast.error(t("auth.errorGeneric"));
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Prevent double submit and cooldown
    if (loading || cooldownSec > 0 || rateLimitSec > 0) {
      return;
    }

    if (!validateEmail(email)) {
      setError(t("auth.login.emailInvalid"));
      return;
    }

    setLoading(true);

    // Save returnTo to sessionStorage for magic link callback
    const targetReturnTo = returnTo || `/${lang}/dashboard`;
    sessionStorage.setItem('tpc_returnTo', targetReturnTo);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/${lang}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      setSent(true);
      toast.success(t("auth.login.checkEmailTitle"));
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Handle rate limit specifically
      if (error?.status === 429 || error?.message?.includes('rate limit')) {
        setError(t("auth.login.rateLimited"));
        setRateLimitSec(300); // 5 minutes cooldown
        toast.error(t("auth.login.tryGoogleNow"));
      } else {
        setError(error.message || t("auth.errorGeneric"));
        toast.error(t("auth.errorGeneric"));
      }
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center" 
           style={{ backgroundColor: '#0B0F17' }}>
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
               style={{ backgroundColor: 'rgba(34,197,94,0.2)' }}>
            <Mail className="w-8 h-8" style={{ color: '#22C55E' }} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#E5E7EB' }}>
            {t("auth.login.checkEmailTitle")}
          </h2>
          <p className="text-sm" style={{ color: '#9CA3AF' }}>
            {t("auth.login.checkEmailDesc")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" 
         style={{ backgroundColor: '#0B0F17' }}>
      <div className="w-full max-w-md mx-auto p-6">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#E5E7EB' }}>
            {t("auth.login.title")}
          </h1>
          <p className="text-sm" style={{ color: '#9CA3AF' }}>
            {t("auth.login.subtitle")}
          </p>
        </div>

        {/* Google Login - Primary */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full font-medium py-4 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mb-4"
          style={{
            background: 'linear-gradient(180deg, #4285F4, #1967D2)',
            color: 'white',
            border: 'none'
          }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {t("auth.login.googlePrimary")}
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: 'rgba(255,255,255,0.10)' }}></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-transparent" style={{ color: '#9CA3AF' }}>
              {t("auth.login.or")}
            </span>
          </div>
        </div>

        {/* Email Fallback */}
        <div className="space-y-4">
          {rateLimitSec > 0 && (
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
              <p className="text-sm font-medium" style={{ color: '#22C55E' }}>
                🚀 {t("auth.login.tryGoogleNow")}
              </p>
              <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                {t("auth.login.emailHelp")}
              </p>
            </div>
          )}

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#E5E7EB' }}>
                {t("auth.login.emailLabel")}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.login.emailPlaceholder")}
                className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all"
                style={{
                  backgroundColor: '#111827',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#E5E7EB'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#F0B90B';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.12)';
                }}
                disabled={loading}
              />
              {error && (
                <p className="mt-2 text-sm text-red-400" role="alert">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || cooldownSec > 0 || rateLimitSec > 0}
              className="w-full font-medium py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(180deg, #F0B90B, #D9A441)',
                color: '#111827'
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                  {t("auth.login.sendLink")}
                </>
              ) : rateLimitSec > 0 ? (
                lang === 'id' ? `Email dibatasi. Coba lagi dalam ${formatTime(rateLimitSec)}` : `Email limited. Try again in ${formatTime(rateLimitSec)}`
              ) : cooldownSec > 0 ? (
                lang === 'id' ? `Tunggu ${cooldownSec} detik` : `Wait ${cooldownSec}s`
              ) : (
                t("auth.login.sendLink")
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-xs" style={{ color: '#6B7280' }}>
              {t("auth.login.emailHelp")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
