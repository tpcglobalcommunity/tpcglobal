import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { ensureLangPath } from "../../utils/langPath";

interface ProfileCompletionGuardProps {
  children: React.ReactNode;
  lang: string;
}

export default function ProfileCompletionGuard({ children, lang }: ProfileCompletionGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  useEffect(() => {
    const checkProfileCompletion = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Check if user is on the update-profit page - allow access
        if (location.pathname.includes('/update-profit')) {
          setIsLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone_wa, telegram, city')
          .eq('id', user.id)
          .single();

        if (profile) {
          const complete = !!(profile.full_name?.trim() && 
                           profile.phone_wa?.trim() && 
                           profile.telegram?.trim() && 
                           profile.city?.trim());
          
          setIsProfileComplete(complete);

          if (!complete) {
            // Redirect to update-profit page
            const updateProfitUrl = ensureLangPath(lang as any, '/member/update-profit');
            navigate(updateProfitUrl, { replace: true });
            return;
          }
        }
      } catch (error) {
        console.error('Error checking profile completion:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkProfileCompletion();
  }, [navigate, location.pathname, lang]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/70">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
