import { ReactNode, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../i18n';
import { PremiumShell, PremiumSection } from '../ui';

interface MemberGuardProps {
  children: ReactNode;
}

export default function MemberGuard({ children }: MemberGuardProps) {
  const { loading, session } = useAuth();
  const { language } = useLanguage();

  useEffect(() => {
    if (!loading && !session) {
      const currentPath = window.location.pathname;
      const nextParam = encodeURIComponent(currentPath);
      window.location.href = `/${language}/signin?next=${nextParam}`;
    }
  }, [loading, session, language]);

  if (loading) {
    return (
      <PremiumShell>
        <PremiumSection>
          <div className="flex items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </PremiumSection>
      </PremiumShell>
    );
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
