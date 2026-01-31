import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/i18n/i18n";

interface RequireAuthProps {
  children: React.ReactNode;
}

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { t } = useI18n();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#0B0F17',
        color: '#E5E7EB'
      }}>
        <div>{t("common.loading")}</div>
      </div>
    );
  }

  if (!user) {
    // Get language from current path or default to 'id'
    const pathSegments = location.pathname.split('/');
    const lang = pathSegments[1] || 'id';
    
    // Build next with current path
    const next = encodeURIComponent(location.pathname + location.search);
    
    return <Navigate to={`/${lang}/login?next=${next}`} replace />;
  }

  return <>{children}</>;
};
