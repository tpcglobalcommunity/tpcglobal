import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, type Profile } from "./supabase";

type Result = {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useProfileStatus(): Result {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // mencegah race condition
  const alive = useRef(true);

  const loadProfile = async (session: Session | null) => {
    if (!session?.user?.id) {
      setProfile(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const userId = session.user.id;
    console.log("[useProfileStatus] fetching profile by id:", userId);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)       // ✅ KUNCI: HARUS pakai id auth.user
      .maybeSingle();         // lebih aman daripada single() untuk first load

    if (!alive.current) return;

    if (error) {
      setProfile(null);
      setError(error.message);
      setLoading(false);
      return;
    }

    setProfile(data ?? null);
    setLoading(false);
  };

  // initial session + subscribe auth changes
  useEffect(() => {
    alive.current = true;

    supabase.auth.getSession().then(({ data }) => {
      loadProfile(data.session ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      loadProfile(session);
    });

    return () => {
      alive.current = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const refresh = async () => {
    const { data } = await supabase.auth.getSession();
    await loadProfile(data.session ?? null);
  };

  return { profile, loading, error, refresh };
}
