import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { isValidAdmin } from "@/config/admin";
import { useI18n } from "@/i18n/i18n";
import { Shield, ArrowLeft } from "lucide-react";

interface RequireAdminProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const RequireAdmin = ({ children, redirectTo }: RequireAdminProps) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();
  const { t, lang } = useI18n();

  // Default redirect to dashboard in current language
  const defaultRedirect = `/${lang || 'id'}/dashboard`;
  const finalRedirectTo = redirectTo || defaultRedirect;

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        backgroundColor: '#0B0F17',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: '#E5E7EB' }}>{t("auth.loading.title")}</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/${lang || 'id'}/login`} replace />;
  }

  // Use the auth context's isAdmin which is already validated
  if (!isAdmin) {
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
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '2rem'
        }}>
          <Shield size={40} style={{ color: '#EF4444' }} />
        </div>
        
        <h1 style={{ 
          color: '#E5E7EB', 
          fontSize: '2rem',
          fontWeight: '700',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          {t("auth.notAuthorized.title")}
        </h1>
        
        <p style={{ 
          color: '#9CA3AF', 
          fontSize: '1.125rem',
          textAlign: 'center',
          marginBottom: '2rem',
          maxWidth: '500px',
          lineHeight: '1.6'
        }}>
          {t("auth.notAuthorized.desc")}
        </p>
        
        <button
          onClick={() => window.location.href = finalRedirectTo}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#F0B90B',
            color: '#111827',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#D4A008';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#F0B90B';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <ArrowLeft size={18} />
          {t("auth.notAuthorized.cta")}
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
