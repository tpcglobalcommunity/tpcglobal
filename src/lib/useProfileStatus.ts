import { useEffect, useState } from "react";
import { safeFetchRoleAndVerified } from "./safeProfileFetch";

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

      try {
        console.log('🔧 [useProfileStatus] Fetching profile for:', userId);
        
        // Use safe fetch instead of direct supabase call
        const result = await safeFetchRoleAndVerified(userId);

        if (!alive) return;

        setRole(result.role as "viewer"|"member"|"admin"|"super_admin");
        setVerified(result.verified);
        
        console.log('✅ [useProfileStatus] Profile loaded:', { role: result.role, verified: result.verified });
      } catch (err: any) {
        console.error('❌ [useProfileStatus] Exception:', err);
        if (!alive) return;
        setRole("viewer");
        setVerified(false);
      }

      setLoading(false);
    }

    run();
    return () => { alive = false; };
  }, [userId]);

  return { loading, role, verified };
}
