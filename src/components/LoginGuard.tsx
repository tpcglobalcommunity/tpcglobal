import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ensureProfileAfterVerifiedLogin } from '../lib/ensureProfileAfterVerifiedLogin';
import { getProfileCompletionStatus } from '../lib/getProfileCompletionStatus';
import { langPath } from '../utils/langPath';
import { Loader2 } from 'lucide-react';
import { formatSbError } from '../lib/profileHelpers';

interface LoginGuardProps {
  lang: 'en' | 'id';
  children: React.ReactNode;
}

export const LoginGuard: React.FC<LoginGuardProps> = ({ lang, children }) => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);

  useEffect(() => {
    const checkAuthAndProfile = async () => {
      try {
        // Get session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[LoginGuard] Session error:', sessionError);
          setIsChecking(false);
          return;
        }

        // If NO session, allow access to login/signup
        if (!session?.user) {
          setIsChecking(false);
          return;
        }

        // Check email verification
        const isVerified = Boolean(session.user.email_confirmed_at || session.user.confirmed_at);
        if (!isVerified) {
          setNeedsVerification(true);
          setIsChecking(false);
          navigate(langPath(lang, '/auth/verify-email'));
          return;
        }

        // User is verified, check profile completion
        const profileStatus = await getProfileCompletionStatus();
        
        if (!profileStatus) {
          // Profile doesn't exist, create minimal profile
          await ensureProfileAfterVerifiedLogin();
          setNeedsProfileCompletion(true);
          setIsChecking(false);
          navigate(langPath(lang, '/member/complete-profile'));
          return;
        }

        if (!profileStatus.profile_required_completed) {
          // Profile exists but required fields incomplete
          setNeedsProfileCompletion(true);
          setIsChecking(false);
          navigate(langPath(lang, '/member/complete-profile'));
          return;
        }

        // Profile completed, allow access
        setIsChecking(false);
      } catch (error) {
        console.error('[LoginGuard] Error:', formatSbError(error));
        setIsChecking(false);
      }
    };

    checkAuthAndProfile();
  }, [lang, navigate]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#f0b90b] animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (needsVerification || needsProfileCompletion) {
    return null; // Will redirect
  }

  return <>{children}</>;
};
