import { useEffect, useState } from "react";
import { supabase } from "./supabase";

type Result = {
  loading: boolean;
  verified: boolean;
  role: string;
  refresh: () => Promise<void>;
};

export function useProfileStatus(userId?: string): Result {
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState<boolean>(false);
  const [role, setRole] = useState<string>("viewer");

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
        .select("verified,role")
        .eq("id", userId)
        .single();

      if (!alive) return;

      if (!error && data) {
        setVerified(!!data.verified);
        setRole(data.role ?? "viewer");
      }

      setLoading(false);
    }

    run();
    return () => { 
      alive = false; 
    };
  }, [userId]);

  const refresh = async () => {
    if (!userId) return;
    
    const { data, error } = await supabase
      .from("profiles")
      .select("verified,role")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setVerified(!!data.verified);
      setRole(data.role ?? "viewer");
    }
  };

  return { loading, verified, role, refresh };
}
