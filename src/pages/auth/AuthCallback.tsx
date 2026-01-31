import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { PremiumShell } from "@/components/layout/PremiumShell";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // First try to exchange code for session (magic link flow)
        let session;
        let authError;
        
        try {
          const result = await supabase.auth.exchangeCodeForSession(window.location.href);
          session = result.data.session;
          authError = result.error;
        } catch (exchangeError) {
          // Fallback to getSession if exchangeCodeForSession fails
          console.warn('exchangeCodeForSession failed, falling back to getSession:', exchangeError);
          const sessionResult = await supabase.auth.getSession();
          session = sessionResult.data.session;
          authError = sessionResult.error;
        }
        
        if (authError || !session) {
          console.error('Auth callback error:', authError);
          setError('Authentication failed. Please try again.');
          setLoading(false);
          return;
        }

        // Successfully authenticated
        // Extract language from URL or use default
        const pathParts = location.pathname.split('/').filter(Boolean);
        const lang = pathParts[0] || 'id';
        
        // Check if user is admin (you can implement admin check here)
        const isAdmin = session.user?.email?.includes('admin@tpcglobal.io'); // Example admin check
        
        // Get next parameter from URL query
        const searchParams = new URLSearchParams(location.search);
        const nextParam = searchParams.get('next');
        const returnTo = searchParams.get('returnTo');
        
        // Try to get returnTo from sessionStorage (for magic link and OAuth)
        const savedReturnTo = sessionStorage.getItem('tpc_returnTo');
        if (savedReturnTo) {
          sessionStorage.removeItem('tpc_returnTo');
        }
        
        // Basic security: ensure returnTo starts with current language path
        const safeReturnTo = returnTo && returnTo.startsWith(`/${lang}/`) ? returnTo : null;
        const safeSavedReturnTo = savedReturnTo && savedReturnTo.startsWith(`/${lang}/`) ? savedReturnTo : null;
        
        setLoading(false);
        
        if (isAdmin) {
          navigate(`/${lang}/admin`);
        } else if (safeReturnTo) {
          // Use returnTo parameter for custom redirect (member dashboard with invoice context)
          navigate(safeReturnTo, { replace: true });
        } else if (safeSavedReturnTo) {
          // Use saved returnTo from sessionStorage (magic link or OAuth)
          navigate(safeSavedReturnTo, { replace: true });
        } else if (nextParam) {
          // Use next parameter for custom redirect (member dashboard with invoice context)
          navigate(nextParam, { replace: true });
        } else {
          // Default to member dashboard
          navigate(`/${lang}/dashboard`);
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setError('Authentication failed. Please try again.');
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate, location]);

  return (
    <PremiumShell showBottomNav={false}>
      <div className="container-app section-spacing">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          {loading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-2">Memproses login...</h2>
              <p className="text-muted-foreground">Mohon tunggu sebentar</p>
            </>
          ) : error ? (
            <>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                   style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
                <Loader2 className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-red-500">Login Gagal</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <button
                onClick={() => navigate(`/${location.pathname.split('/')[1] || 'id'}/login`)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Kembali ke Login
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                   style={{ backgroundColor: 'rgba(34,197,94,0.1)' }}>
                <Loader2 className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-green-500">Login Berhasil</h2>
              <p className="text-muted-foreground">Mengarah ke dashboard...</p>
            </>
          )}
        </div>
      </div>
    </PremiumShell>
  );
};

export default AuthCallback;
