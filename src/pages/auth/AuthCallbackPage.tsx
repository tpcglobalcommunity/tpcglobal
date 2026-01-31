import { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { exchangeCodeForSession, getCurrentSession } from "@/lib/authHelpers";
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
        const { success, session, error: exchangeError } = await exchangeCodeForSession(window.location.href);
        
        console.info('[AUTH] Exchange result:', { success, session: !!session, error: exchangeError });
        
        // Step 2: Fallback to getSession if exchange failed
        if (!success && !exchangeError) {
          console.info('[AUTH] Falling back to getSession...');
          const sessionResult = await getCurrentSession();
          console.info('[AUTH] GetSession result:', { success: sessionResult.success, session: !!sessionResult.session });
          
          if (sessionResult.success && sessionResult.session) {
            // Session found, proceed with redirect
            handleSuccessfulRedirect();
            return;
          }
        }
        
        if (exchangeError || !success) {
          console.error('[AUTH] No session established:', exchangeError);
          setError(t("auth.callback.errorDesc"));
          setLoading(false);
          return;
        }
        
        // Session established successfully
        handleSuccessfulRedirect();
        
      } catch (error) {
        console.error('[AUTH] Callback error:', error);
        setError(t("auth.callback.errorDesc"));
        setLoading(false);
      }
    };
    
    const handleSuccessfulRedirect = () => {
      // Get next destination from multiple sources
      const qsNext = new URLSearchParams(location.search).get('next');
      const stored = sessionStorage.getItem('tpc:returnTo');
      const fallback = `/${lang}/dashboard`; // Default to member area
      
      // Clear sessionStorage
      sessionStorage.removeItem('tpc:returnTo');
      
      // Sanitize and determine destination
      const sanitizeNext = (path: string | null): string => {
        if (!path) return fallback;
        
        // Only allow paths starting with '/' and no protocol
        if (!path.startsWith('/') || path.startsWith('//') || path.startsWith('http')) {
          return fallback;
        }
        
        return path;
      };
      
      const dest = sanitizeNext(qsNext || stored || fallback);
      
      // Prevent loops
      const currentPath = `/${lang}/auth/callback`;
      if (dest === currentPath) {
        console.warn('[AUTH] Preventing redirect loop, using fallback');
        navigate(fallback, { replace: true });
        return;
      }
      
      console.info('[AUTH] Callback success, redirecting to:', dest);
      navigate(dest, { replace: true });
    };
    
    handleAuthCallback();
  }, [lang, navigate, location.search, t]);

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
