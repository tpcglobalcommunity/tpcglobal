import { useEffect, useState } from "react";
import { useProfileStatus } from "../../lib/useProfileStatus";
import { isProfileDataComplete, safeFetchProfile } from "../../lib/profileHelpers";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useNavigate } from "../../components/Router";
import { useAuth } from "../../contexts/AuthContext";

type Props = {
  children: React.ReactNode;
};

export default function ProfileGate({ children }: Props) {
  const navigate = useNavigate();
  const { loading, verified } = useProfileStatus();
  const { session } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    // Use role and verified from useProfileStatus instead of duplicate fetch
    if (!loading && !verified) {
      setError("Profile not verified");
    } else {
      setError(null);
    }
  }, [loading, verified]);

  useEffect(() => {
    // Fetch full profile data when we have the user ID
    async function fetchProfile() {
      if (!session?.user?.id) {
        setProfileLoading(false);
        return;
      }

      try {
        const profile = await safeFetchProfile(session.user.id);
        setProfileData(profile);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('Failed to load profile data');
      } finally {
        setProfileLoading(false);
      }
    }

    fetchProfile();
  }, [session?.user?.id]);

  const isProfileComplete = () => {
    return isProfileDataComplete(profileData);
  };

  const handleRetry = () => {
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
  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#F0B90B] mx-auto mb-4" />
          <p className="text-white/70">Checking profile status...</p>
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
    navigate('/member/complete-profile');
    return null;
  }

  // Profile complete or already on complete profile route - render children
  return <>{children}</>;
}
