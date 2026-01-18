import { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../i18n';
import { PremiumShell, PremiumSection, PremiumButton } from '../ui';
import { ShieldOff } from 'lucide-react';

interface RoleGuardProps {
  children: ReactNode;
  allow: string[];
}

export default function RoleGuard({ children, allow }: RoleGuardProps) {
  const { profile } = useAuth();
  const { t, language } = useLanguage();
  const translations = t;

  const hasPermission = profile && allow.includes(profile.role);

  if (!hasPermission) {
    return (
      <PremiumShell>
        <PremiumSection>
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <ShieldOff className="w-16 h-16 text-red-500 mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {translations.news.admin.permissionDenied}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
              {translations.news.admin.permissionDeniedDesc}
            </p>
            <a href={`/${language}/member/dashboard`}>
              <PremiumButton>
                {translations.member.dashboard.title}
              </PremiumButton>
            </a>
          </div>
        </PremiumSection>
      </PremiumShell>
    );
  }

  return <>{children}</>;
}
