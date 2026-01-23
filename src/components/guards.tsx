import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { ProfileData, getProfileWithNavigation } from "../types/profile";

export { default as MemberGuard } from "./MemberGuard";

export default function MemberGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    let mounted = true;

    async function guard() {
      try {
        // 1) Cek session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          navigate("/signin", { replace: true });
          return;
        }

        // 2) Pastikan profile ADA (ANTI BLANK) + navigation info
        const profileData = await getProfileWithNavigation();

        if (!mounted) return;

        setProfile(profileData);

        // 3) Routing tegas berdasarkan navigation route dari backend
        if (profileData.navigation_route !== window.location.pathname) {
          navigate(profileData.navigation_route, { replace: true });
          return;
        }

        // 4) Lolos guard → render children
        setLoading(false);

      } catch (error) {
        console.error("MemberGuard failed:", error);
        
        if (!mounted) return;
        
        // Auto logout jika error kritis
        await supabase.auth.signOut();
        navigate("/signin", { replace: true });
      }
    }

    guard();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/70">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F0B90B] mx-auto mb-4"></div>
          <div>Loading account...</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// =========================================================
// ADMIN GUARD COMPONENT
// =========================================================

export function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function guard() {
      try {
        // 1) Cek session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          navigate("/signin", { replace: true });
          return;
        }

        // 2) Get profile dengan navigation
        const profileData = await getProfileWithNavigation();

        if (!mounted) return;

        // 3) Check admin access
        if (!profileData.can_access_admin) {
          navigate(profileData.navigation_route, { replace: true });
          return;
        }

        // 4) Lolos guard → render children
        setLoading(false);

      } catch (error) {
        console.error("AdminGuard failed:", error);
        
        if (!mounted) return;
        
        await supabase.auth.signOut();
        navigate("/signin", { replace: true });
      }
    }

    guard();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/70">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F0B90B] mx-auto mb-4"></div>
          <div>Checking admin access...</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// =========================================================
// AUTH GUARD COMPONENT (Basic auth check)
// =========================================================

export function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function guard() {
      try {
        // 1) Cek session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          navigate("/signin", { replace: true });
          return;
        }

        if (!mounted) return;

        // 2) Lolos guard → render children
        setLoading(false);

      } catch (error) {
        console.error("AuthGuard failed:", error);
        
        if (!mounted) return;
        
        navigate("/signin", { replace: true });
      }
    }

    guard();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/70">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F0B90B] mx-auto mb-4"></div>
          <div>Checking authentication...</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// =========================================================
// PUBLIC GUARD COMPONENT (Redirect if authenticated)
// =========================================================

export function PublicGuard({
  children,
  redirectTo = "/member/dashboard",
}: {
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function guard() {
      try {
        // 1) Cek session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          // 2) Get navigation route
          try {
            const profileData = await getProfileWithNavigation();
            
            if (!mounted) return;
            
            navigate(profileData.navigation_route, { replace: true });
          } catch {
            // Fallback ke default redirect
            if (!mounted) return;
            navigate(redirectTo, { replace: true });
          }
          return;
        }

        if (!mounted) return;

        // 3) Tidak ada session → render children
        setLoading(false);

      } catch (error) {
        console.error("PublicGuard failed:", error);
        
        if (!mounted) return;
        
        // Jika error, tetap render children (public page)
        setLoading(false);
      }
    }

    guard();

    return () => {
      mounted = false;
    };
  }, [navigate, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/70">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F0B90B] mx-auto mb-4"></div>
          <div>Checking access...</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// =========================================================
// HOOK FOR PROFILE STATE
// =========================================================

export function useProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const profileData = await getProfileWithNavigation();
        
        if (!mounted) return;
        
        setProfile(profileData);
        setError(null);
      } catch (err) {
        if (!mounted) return;
        
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        if (!mounted) return;
        
        setLoading(false);
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const refreshProfile = async () => {
    setLoading(true);
    try {
      const profileData = await getProfileWithNavigation();
      setProfile(profileData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh profile');
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, error, refreshProfile };
}
