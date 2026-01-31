import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Loader2, LogIn } from "lucide-react";
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

  // Cooldown timer effect
  useEffect(() => {
    if (cooldownSec > 0) {
      const timer = setTimeout(() => {
        setCooldownSec(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownSec]);

  // Rate limit timer effect
  useEffect(() => {
    if (rateLimitSec > 0) {
      const timer = setTimeout(() => {
        setRateLimitSec(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [rateLimitSec]);

  // Check if user is already logged in and redirect if needed
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // User is already logged in, redirect to returnTo or dashboard
        // Basic security: ensure returnTo starts with current language path
        const safeReturnTo = returnTo && returnTo.startsWith(`/${lang}/`) ? returnTo : null;
        const target = safeReturnTo || `/${lang}/dashboard`;
        navigate(target, { replace: true });
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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Prevent double submit and cooldown
    if (loading || cooldownSec > 0 || rateLimitSec > 0) {
      return;
    }

    const emailStr = Array.isArray(email) ? email[0] : email;
    
    if (!emailStr || typeof emailStr !== 'string') {
      setError(t("auth.requiredEmail"));
      return;
    }

    if (!validateEmail(emailStr)) {
      setError(t("auth.invalidEmail"));
      return;
    }

    setLoading(true);

    // Save returnTo to sessionStorage for magic link callback
    const targetReturnTo = returnTo || `/${lang}/dashboard`;
    sessionStorage.setItem('tpc_returnTo', targetReturnTo);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: emailStr,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback-page`,
        },
      });

      if (error) {
        throw error;
      }

      setSent(true);
      toast.success(t("auth.magicLinkSent"));
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Handle rate limit specifically
      if (error?.status === 429 || error?.message?.includes('rate limit')) {
        setError(lang === 'id' ? 'Kita kena limit. Pakai Google dulu atau tunggu 5 menit.' : 'We\'re rate limited. Use Google login or wait 5 minutes.');
        setRateLimitSec(300); // 5 minutes cooldown
        toast.error(lang === 'id' ? 'Email dibatasi' : 'Email limited');
      } else {
        setError(error.message || t("auth.errorGeneric"));
        toast.error(t("auth.errorGeneric"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // Save returnTo to sessionStorage for OAuth callback
    sessionStorage.setItem('tpc_returnTo', returnTo || '');
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback-page`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      toast.error(t("auth.errorGeneric"));
    }
  };

  const handlePasskeyLogin = () => {
    toast.info(t("auth.passkeySoon"));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" 
         style={{
           background: 'radial-gradient(circle at top, rgba(240,185,11,0.08), transparent 40%), #0B0F17'
         }}>
      {/* Centered auth card */}
      <div className="relative w-full max-w-md">
        <div className="bg-[#0F1624] border border-[rgba(240,185,11,0.25)] rounded-2xl shadow-2xl p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                 style={{ backgroundColor: 'rgba(240,185,11,0.15)' }}>
              <LogIn className="w-8 h-8" style={{ color: '#F0B90B' }} />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2" style={{ color: '#E5E7EB' }}>
              {t("auth.title")}
            </h1>
            <p className="text-sm" style={{ color: '#9CA3AF' }}>
              {t("auth.subtitle")}
            </p>
          </div>

          {/* Email form */}
          {!sent ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#E5E7EB' }}>
                  {t("auth.emailLabel")}
                </label>
                <input
                  id="email"
                  type="email"
                  value={Array.isArray(email) ? email[0] : email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("auth.emailPlaceholder")}
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
                  aria-invalid={error ? "true" : "false"}
                  aria-describedby={error ? "email-error" : undefined}
                />
                {error && (
                  <p id="email-error" className="mt-2 text-sm text-red-400" role="alert">
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
                onMouseEnter={(e) => {
                  if (!loading && cooldownSec === 0 && rateLimitSec === 0) {
                    e.currentTarget.style.filter = 'brightness(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'brightness(1)';
                }}
                onMouseDown={(e) => {
                  if (cooldownSec === 0 && rateLimitSec === 0) {
                    e.currentTarget.style.filter = 'brightness(0.95)';
                  }
                }}
                onMouseUp={(e) => {
                  if (cooldownSec === 0 && rateLimitSec === 0) {
                    e.currentTarget.style.filter = 'brightness(1.05)';
                  }
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    {t("auth.continueEmail")}
                  </>
                ) : rateLimitSec > 0 ? (
                  lang === 'id' ? `Email dibatasi. Coba lagi dalam ${formatTime(rateLimitSec)}` : `Email limited. Try again in ${formatTime(rateLimitSec)}`
                ) : cooldownSec > 0 ? (
                  lang === 'id' ? `Tunggu ${cooldownSec} detik` : `Wait ${cooldownSec}s`
                ) : (
                  t("auth.continueEmail")
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                   style={{ backgroundColor: 'rgba(34,197,94,0.2)' }}>
                <Mail className="w-8 h-8" style={{ color: '#22C55E' }} />
              </div>
              <h3 className="text-lg font-semibold" style={{ color: '#E5E7EB' }}>
                {t("auth.magicLinkSent")}
              </h3>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>
                {t("auth.checkInbox")}
              </p>
            </div>
          )}

          {/* Divider */}
          {!sent && (
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: 'rgba(255,255,255,0.10)' }}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent" style={{ color: '#9CA3AF' }}>
                  {t("auth.orDivider")}
                </span>
              </div>
            </div>
          )}

          {/* Social buttons */}
          {!sent && (
            <div className="space-y-3">
              {/* Rate limit helper text */}
              {rateLimitSec > 0 && (
                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                  <p className="text-sm font-medium" style={{ color: '#22C55E' }}>
                    {lang === 'id' ? '🚀 Gunakan Google untuk login cepat' : '🚀 Use Google for quick login'}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                    {lang === 'id' ? 'Email akan tersedia lagi setelah limit berakhir' : 'Email will be available again after limit expires'}
                  </p>
                </div>
              )}

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className={`w-full font-medium py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 ${
                  rateLimitSec > 0 
                    ? 'border-2 shadow-lg' 
                    : 'border'
                }`}
                style={{
                  background: rateLimitSec > 0 
                    ? 'linear-gradient(180deg, #4285F4, #1967D2)' 
                    : 'transparent',
                  borderColor: rateLimitSec > 0 
                    ? '#4285F4' 
                    : 'rgba(255,255,255,0.12)',
                  color: rateLimitSec > 0 
                    ? 'white' 
                    : '#E5E7EB'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.borderColor = rateLimitSec > 0 ? '#4285F4' : 'rgba(240,185,11,0.4)';
                    e.currentTarget.style.color = rateLimitSec > 0 ? 'white' : '#F0B90B';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = rateLimitSec > 0 
                    ? '#4285F4' 
                    : 'rgba(255,255,255,0.12)';
                  e.currentTarget.style.color = rateLimitSec > 0 
                    ? 'white' 
                    : '#E5E7EB';
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {rateLimitSec > 0 
                  ? (lang === 'id' ? '🔥 Login dengan Google (Direkomendasikan)' : '🔥 Login with Google (Recommended)')
                  : t("auth.google")
                }
              </button>

              <button
                onClick={handlePasskeyLogin}
                disabled={loading}
                className="w-full font-medium py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#E5E7EB'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.borderColor = 'rgba(240,185,11,0.4)';
                    e.currentTarget.style.color = '#F0B90B';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                  e.currentTarget.style.color = '#E5E7EB';
                }}
              >
                <div className="w-5 h-5 rounded-sm flex items-center justify-center"
                     style={{ background: 'linear-gradient(180deg, #60A5FA, #2563EB)' }}>
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                {t("auth.passkey")}
              </button>

              {/* DEV ONLY - Quick login button */}
              {import.meta.env.DEV && (
                <button
                  onClick={handleGoogleLogin}
                  className="w-full font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-3"
                  style={{
                    background: 'rgba(34,197,94,0.1)',
                    border: '1px solid rgba(34,197,94,0.3)',
                    color: '#22C55E'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(34,197,94,0.2)';
                    e.currentTarget.style.borderColor = 'rgba(34,197,94,0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(34,197,94,0.1)';
                    e.currentTarget.style.borderColor = 'rgba(34,197,94,0.3)';
                  }}
                >
                  <div className="w-5 h-5 rounded-sm flex items-center justify-center"
                       style={{ background: 'rgba(34,197,94,0.2)' }}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  {lang === 'id' ? 'Masuk cepat (DEV)' : 'Quick login (DEV)'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
