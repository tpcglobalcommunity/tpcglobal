import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";

type Props = {
  lang: any;
  children: React.ReactNode;
};

export default function ProfileGate({ lang, children }: Props) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    let alive = true;
    let timeoutId: NodeJS.Timeout;

    const checkProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          if (!alive) return;
          setError("No authenticated session found");
          setLoading(false);
          return;
        }

        // Set timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (!alive) return;
          setTimeoutReached(true);
          setLoading(false);
          setError("Profile check timed out. Please refresh.");
        }, 10000); // 10 second timeout

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, telegram, phone_whatsapp, profile_completed")
          .eq("id", session.user.id)
          .single();

        clearTimeout(timeoutId);

        if (!alive) return;

        if (profileError) {
          setError(profileError.message);
          setLoading(false);
          return;
        }

        setProfile(profileData);
        setLoading(false);
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (!alive) return;
        setError(err?.message || "Failed to check profile status");
        setLoading(false);
      }
    };

    checkProfile();

    return () => {
      alive = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const isProfileComplete = () => {
    if (!profile) return false;
    
    // Check if profile_completed flag is true
    if (profile.profile_completed) return true;
    
    // Or check individual required fields
    return !!(
      profile.full_name && 
      profile.telegram && 
      profile.phone_whatsapp
    );
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setTimeoutReached(false);
    // Trigger re-check by forcing re-render
    window.location.reload();
  };

  const getCurrentPath = () => {
    return window.location.pathname;
  };

  const isCompleteProfileRoute = () => {
    const path = getCurrentPath();
    return path.includes('/complete-profile');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#F0B90B] mx-auto mb-4" />
          <p className="text-white/70">Checking profile status...</p>
          {timeoutReached && (
            <button 
              onClick={handleRetry}
              className="mt-4 px-4 py-2 bg-[#F0B90B] text-black rounded-lg hover:bg-[#F0B90B]/90 transition-colors flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="max-w-md mx-auto p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Profile Check Failed</h3>
          <p className="text-white/70 mb-6">{error}</p>
          <button 
            onClick={handleRetry}
            className="px-6 py-3 bg-[#F0B90B] text-black rounded-lg hover:bg-[#F0B90B]/90 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Profile incomplete - redirect to complete profile
  if (!isProfileComplete() && !isCompleteProfileRoute()) {
    const langPrefix = lang === 'id' ? '/id' : '/en';
    window.location.href = `${langPrefix}/member/complete-profile`;
    return null;
  }

  // Profile complete or already on complete profile route - render children
  return <>{children}</>;
}
