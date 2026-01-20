import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabase";
import { ProfileData, isProfileDataComplete } from "./profileHelpers";

interface UseProfileStatusReturn {
  loading: boolean;
  isComplete: boolean;
  profile: ProfileData | null;
  refreshProfile: () => void;
  error: string | null;
}

export function useProfileStatus(): UseProfileStatusReturn {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  const fetchProfile = useCallback(async () => {
    // Prevent duplicate requests
    if (inFlight.current) return;
    
    try {
      inFlight.current = true;
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setError("No authenticated session");
        setLoading(false);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      setProfile(profileData);
      setLoading(false);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch profile");
      setLoading(false);
    } finally {
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, []); // Remove fetchProfile dependency to prevent infinite loop

  const isComplete = isProfileDataComplete(profile);

  return {
    loading,
    isComplete,
    profile,
    refreshProfile: fetchProfile,
    error
  };
}
