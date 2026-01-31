import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";

interface RequireAuthProps {
  children: React.ReactNode;
}

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

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
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    // Get language from current path or default to 'id'
    const pathSegments = location.pathname.split('/');
    const lang = pathSegments[1] || 'id';
    
    // Build returnTo with current path
    const returnTo = encodeURIComponent(location.pathname + location.search);
    
    return <Navigate to={`/${lang}/login?returnTo=${returnTo}`} replace />;
  }

  return <>{children}</>;
};
