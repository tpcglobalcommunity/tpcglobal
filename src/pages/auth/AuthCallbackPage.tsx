import { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useI18n } from "@/i18n/i18n";

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get lang from params or fallback to 'id'
  const lang = (params.lang as string) || 'id';

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.info('[AUTH] Processing auth callback...');
        
        // Step 1: Try to exchange code for session (PKCE flow)
        let session;
        let exchangeError;
        
        try {
          console.info('[AUTH] Exchanging code for session...');
          const result = await supabase.auth.exchangeCodeForSession(window.location.href);
          session = result.data.session;
          exchangeError = result.error;
          console.info('[AUTH] Exchange result:', { session: !!session, error: exchangeError });
        } catch (error) {
          console.warn('[AUTH] Exchange failed:', error);
          exchangeError = error;
        }
        
        // Step 2: Fallback to getSession if exchange failed
        if (!session && !exchangeError) {
          console.info('[AUTH] Falling back to getSession...');
          const sessionResult = await supabase.auth.getSession();
          session = sessionResult.data.session;
          exchangeError = sessionResult.error;
          console.info('[AUTH] GetSession result:', { session: !!session, error: exchangeError });
        }
        
        if (exchangeError || !session) {
          console.error('[AUTH] No session established:', exchangeError);
          setError(t("auth.callback.errorDesc"));
          setLoading(false);
          return;
        }
        
        console.info('[AUTH] Session established, user:', session.user.email);
        
        // Determine target redirect
        const searchParams = new URLSearchParams(location.search);
        const returnTo = searchParams.get('returnTo');
        
        // Get returnTo from sessionStorage (for magic link and OAuth)
        const savedReturnTo = sessionStorage.getItem('tpc_returnTo');
        if (savedReturnTo) {
          sessionStorage.removeItem('tpc_returnTo');
        }
        
        // Security: ensure target starts with current language path
        const safeReturnTo = returnTo && returnTo.startsWith(`/${lang}/`) ? returnTo : null;
        const safeSavedReturnTo = savedReturnTo && savedReturnTo.startsWith(`/${lang}/`) ? savedReturnTo : null;
        
        const targetUrl = safeReturnTo || safeSavedReturnTo || `/${lang}/dashboard`;
        
        console.info('[AUTH] Callback success, redirecting to:', targetUrl);
        navigate(targetUrl, { replace: true });
        
      } catch (error) {
        console.error('[AUTH] Callback error:', error);
        setError(t("auth.callback.errorDesc"));
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate, location, params, t]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" 
           style={{ backgroundColor: '#0B0F17' }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
               style={{ backgroundColor: 'rgba(240,185,11,0.15)' }}>
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#F0B90B' }} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#E5E7EB' }}>
            {t("auth.callback.loading")}
          </h2>
          <p style={{ color: '#9CA3AF' }}>
            {t("auth.callback.loadingDesc")}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" 
           style={{ backgroundColor: '#0B0F17' }}>
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
               style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
            <Loader2 className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-red-500">
            {t("auth.callback.errorTitle")}
          </h2>
          <p className="text-muted-foreground mb-6" style={{ color: '#9CA3AF' }}>
            {error}
          </p>
          <button
            onClick={() => navigate(`/${lang}/login`, { replace: true })}
            className="px-6 py-3 rounded-lg transition-all font-medium"
            style={{ backgroundColor: '#F0B90B', color: '#111827' }}
          >
            {t("auth.callback.backToLogin")}
          </button>
        </div>
      </div>
    );
  }

  return null; // Will redirect automatically
};

export default AuthCallbackPage;
