import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";

interface ProfileData {
  full_name: string | null;
  telegram: string | null;
  phone_whatsapp: string | null;
  profile_completed: boolean;
  wallet_address: string | null;
  tpc_balance: number | null;
}

interface UseProfileStatusReturn {
  loading: boolean;
  isComplete: boolean;
  profile: ProfileData | null;
  refresh: () => void;
  error: string | null;
}

export function useProfileStatus(): UseProfileStatusReturn {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
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
        .select(`
          full_name,
          telegram,
          phone_whatsapp,
          profile_completed,
          wallet_address,
          tpc_balance
        `)
        .eq("id", session.user.id)
        .single();

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
    }
  }, []);

  const refresh = useCallback(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const isComplete = Boolean(
    profile && (
      profile.profile_completed || 
      (profile.full_name && profile.telegram && profile.phone_whatsapp)
    )
  );

  return {
    loading,
    isComplete,
    profile,
    refresh,
    error
  };
}
