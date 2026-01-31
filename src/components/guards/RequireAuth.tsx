import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/i18n/i18n";
import { Loader2 } from "lucide-react";

type AuthState = 'loading' | 'authed' | 'unauthed';

interface RequireAuthProps {
  children: React.ReactNode;
}

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { t, lang } = useI18n();

  // Determine auth state
  let authState: AuthState = 'loading';
  if (!loading) {
    authState = user ? 'authed' : 'unauthed';
  }

  // Loading state - premium skeleton
  if (authState === 'loading') {
    return (
      <div style={{ 
        minHeight: '100vh',
        backgroundColor: '#0B0F17',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: 'rgba(240,185,11,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem'
        }}>
          <Loader2 size={28} style={{ color: '#F0B90B' }} className="animate-spin" />
        </div>
        <h2 style={{ 
          color: '#E5E7EB', 
          fontSize: '1.5rem',
          fontWeight: '600',
          marginBottom: '0.5rem',
          textAlign: 'center'
        }}>
          {t("auth.loading.title")}
        </h2>
        <p style={{ 
          color: '#9CA3AF', 
          fontSize: '0.875rem',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          {t("auth.loading.desc")}
        </p>
      </div>
    );
  }

  // Unauthenticated state - redirect to login
  if (authState === 'unauthed') {
    // Get language from current path or default to 'id'
    const pathSegments = location.pathname.split('/');
    const currentLang = pathSegments[1] || 'id';
    
    // Validate language
    const validLang = ['en', 'id'].includes(currentLang) ? currentLang : 'id';
    
    // Loop prevention - don't add next if already on login or callback
    const isLoginPage = location.pathname.includes('/login');
    const isCallbackPage = location.pathname.includes('/auth/callback');
    
    if (isLoginPage || isCallbackPage) {
      return <Navigate to={`/${validLang}/login`} replace />;
    }
    
    // Build next with current path for protected routes
    const next = encodeURIComponent(location.pathname + location.search);
    
    return <Navigate to={`/${validLang}/login?next=${next}`} replace />;
  }

  // Authenticated - render children
  return <>{children}</>;
};
