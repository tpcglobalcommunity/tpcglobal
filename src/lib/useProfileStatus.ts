import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export function useProfileStatus(userId?: string) {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"viewer"|"member"|"admin"|"super_admin">("viewer");
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    let alive = true;

    async function run() {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("role,verified")
        .eq("id", userId)
        .single();

      if (!alive) return;

      if (!error && data) {
        setRole(data.role ?? "viewer");
        setVerified(!!data.verified);
      }

      setLoading(false);
    }

    run();
    return () => { alive = false; };
  }, [userId]);

  return { loading, role, verified };
}
