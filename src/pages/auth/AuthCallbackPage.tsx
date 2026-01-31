import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.info("[AUTH] Processing auth callback...");
        
        // Get session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("[AUTH] Session error:", error);
          setError("Authentication failed");
          setLoading(false);
          return;
        }
        
        if (!session) {
          console.warn("[AUTH] No session found, redirecting to login");
          // Extract language from URL or default to 'id'
          const pathParts = location.pathname.split('/').filter(Boolean);
          const lang = pathParts[0] || 'id';
          navigate(`/${lang}/login`, { replace: true });
          return;
        }
        
        console.info("[AUTH] Session established, user:", session.user.email);
        
        // Get returnTo from query string
        const searchParams = new URLSearchParams(location.search);
        const returnTo = searchParams.get('returnTo');
        
        // Extract language from URL or default to 'id'
        const pathParts = location.pathname.split('/').filter(Boolean);
        const lang = pathParts[0] || 'id';
        
        // Get returnTo from sessionStorage (for magic link and OAuth)
        const savedReturnTo = sessionStorage.getItem('tpc_returnTo');
        if (savedReturnTo) {
          sessionStorage.removeItem('tpc_returnTo');
        }
        
        // Security: ensure returnTo starts with current language path
        const safeReturnTo = returnTo && returnTo.startsWith(`/${lang}/`) ? returnTo : null;
        const safeSavedReturnTo = savedReturnTo && savedReturnTo.startsWith(`/${lang}/`) ? savedReturnTo : null;
        
        const targetUrl = safeReturnTo || safeSavedReturnTo || `/${lang}/dashboard`;
        
        console.info("[AUTH] Callback success, redirecting to:", targetUrl);
        navigate(targetUrl, { replace: true });
        
      } catch (error) {
        console.error("[AUTH] Callback error:", error);
        setError("Authentication failed");
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate, location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" 
           style={{ backgroundColor: '#0B0F17' }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#F0B90B' }} />
          <h2 className="text-xl font-semibold mb-2" style={{ color: '#E5E7EB' }}>
            Processing login...
          </h2>
          <p style={{ color: '#9CA3AF' }}>
            Please wait while we authenticate you
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" 
           style={{ backgroundColor: '#0B0F17' }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
               style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
            <Loader2 className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-red-500">Authentication Failed</h2>
          <p className="text-muted-foreground mb-4" style={{ color: '#9CA3AF' }}>{error}</p>
          <button
            onClick={() => navigate('/id/login', { replace: true })}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{ backgroundColor: '#F0B90B', color: '#111827' }}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return null; // Will redirect automatically
};

export default AuthCallbackPage;
