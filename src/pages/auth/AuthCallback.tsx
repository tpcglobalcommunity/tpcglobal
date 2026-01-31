import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { PremiumShell } from "@/components/layout/PremiumShell";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from URL hash (Supabase magic link flow)
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/id/login?error=auth_failed');
          return;
        }

        if (session) {
          // Successfully authenticated
          // Extract language from URL or use default
          const pathParts = location.pathname.split('/').filter(Boolean);
          const lang = pathParts[0] || 'id';
          
          // Check if user is admin (you can implement admin check here)
          const isAdmin = session.user?.email?.includes('admin@tpcglobal.io'); // Example admin check
          
          // Get next parameter from URL query
          const searchParams = new URLSearchParams(location.search);
          const nextParam = searchParams.get('next');
          
          if (isAdmin) {
            navigate(`/${lang}/admin`);
          } else if (nextParam) {
            // Use next parameter for custom redirect (member dashboard with invoice context)
            navigate(nextParam, { replace: true });
          } else {
            // Default to member dashboard
            navigate(`/${lang}/member`);
          }
        } else {
          // No session, redirect to login
          const pathParts = location.pathname.split('/').filter(Boolean);
          const lang = pathParts[0] || 'id';
          navigate(`/${lang}/login`);
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/id/login?error=callback_failed');
      }
    };

    handleAuthCallback();
  }, [navigate, location]);

  return (
    <PremiumShell showBottomNav={false}>
      <div className="container-app section-spacing">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <h2 className="text-xl font-semibold mb-2">Memproses login...</h2>
          <p className="text-muted-foreground">Mohon tunggu sebentar</p>
        </div>
      </div>
    </PremiumShell>
  );
};

export default AuthCallback;
