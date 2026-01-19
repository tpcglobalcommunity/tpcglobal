import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../i18n';
import { createProfileIfMissing } from '../../lib/supabase';
import { NoticeBox } from '../ui';
import { PremiumShell, PremiumSection } from '../ui';

interface MemberGuardProps {
  children: ReactNode;
}

export default function MemberGuard({ children }: MemberGuardProps) {
  const { loading, session, profile, user } = useAuth();
  const { language } = useLanguage();
  const [profileSafetyCheck, setProfileSafetyCheck] = useState<'checking' | 'failed' | null>(null);

  useEffect(() => {
    if (!loading && !session) {
      const currentPath = window.location.pathname;
      const nextParam = encodeURIComponent(currentPath);
      window.location.href = `/${language}/signin?next=${nextParam}`;
      return;
    }

    // Check profile completion
    if (session && profile) {
      const currentPath = window.location.pathname;
      const isCompleteProfilePage = currentPath.includes('/complete-profile');
      
      if (!profile.is_profile_complete && !isCompleteProfilePage) {
        window.location.href = `/${language}/complete-profile`;
        return;
      }
    }

    // Post-login safety: ensure profile exists
    if (session && user && !profile && !profileSafetyCheck) {
      setProfileSafetyCheck('checking');
      
      const ensureProfile = async () => {
        try {
          const result = await createProfileIfMissing(
            user.id,
            user.email || '',
            user.user_metadata?.full_name || '',
            user.user_metadata?.username || '',
            user.user_metadata?.referral_code || ''
          );

          if (!result.success) {
            console.error('[MemberGuard] Profile creation failed:', result.message);
            setProfileSafetyCheck('failed');
          } else {
            setProfileSafetyCheck(null);
          }
        } catch (error) {
          console.error('[MemberGuard] Profile safety check failed:', error);
          setProfileSafetyCheck('failed');
        }
      };

      // Add timeout to prevent hanging
      const timeoutId = setTimeout(() => {
        if (profileSafetyCheck === 'checking') {
          setProfileSafetyCheck('failed');
        }
      }, 10000); // 10 second timeout

      ensureProfile();
      clearTimeout(timeoutId);
    }
  }, [loading, session, user, profile, profileSafetyCheck, language]);

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

  // Profile safety check failed
  if (profileSafetyCheck === 'failed') {
    return (
      <PremiumShell>
        <PremiumSection>
          <div className="max-w-md mx-auto py-12">
            <NoticeBox
              variant="warning"
              title="Profile Setup Required"
            >
              <p className="text-sm text-white/80 mb-4">
                Your account was created successfully, but we couldn't set up your profile automatically.
              </p>
              <p className="text-sm text-white/60">
                Please contact our support team to complete your profile setup.
              </p>
            </NoticeBox>
          </div>
        </PremiumSection>
      </PremiumShell>
    );
  }

  // Still checking profile
  if (profileSafetyCheck === 'checking') {
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

  return <>{children}</>;
}
