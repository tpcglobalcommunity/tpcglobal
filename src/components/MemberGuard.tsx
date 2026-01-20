import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

type ProfileRow = {
  id: string;
  is_profile_complete: boolean | null;
  status: string | null;
  role: string | null;
};

type Props = {
  children: React.ReactNode;
  // optional: izinkan akses tanpa lengkap profile untuk route tertentu
  allowIncomplete?: boolean;
};

export default function MemberGuard({ children, allowIncomplete }: Props) {
  const [loading, setLoading] = useState(true);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);

  const path = window.location.pathname;
  const isCompleteProfilePage = useMemo(
    () => path.includes("/complete-profile"),
    [path]
  );

  useEffect(() => {
    let mounted = true;

    async function run() {
      setLoading(true);

      // 1) Get session
      const { data: sessData, error: sessErr } = await supabase.auth.getSession();
      if (!mounted) return;

      const userId = sessData.session?.user?.id ?? null;
      setSessionUserId(userId);

      if (sessErr || !userId) {
        setProfile(null);
        setLoading(false);
        return;
      }

      // 2) Fetch profile
      const { data: prof, error: profErr } = await supabase
        .from("profiles")
        .select("id, is_profile_complete, status, role")
        .eq("id", userId)
        .maybeSingle();

      if (!mounted) return;

      // 3) If profile missing, create minimal fallback (fail silently)
      if ((!prof || profErr) && userId) {
        await supabase
          .from("profiles")
          .insert({ id: userId })
          .select("id, is_profile_complete, status, role")
          .maybeSingle();

        const { data: prof2 } = await supabase
          .from("profiles")
          .select("id, is_profile_complete, status, role")
          .eq("id", userId)
          .maybeSingle();

        if (!mounted) return;
        setProfile(prof2 ?? null);
        setLoading(false);
        return;
      }

      setProfile(prof ?? null);
      setLoading(false);
    }

    run();

    return () => {
      mounted = false;
    };
  }, [path]);

  // Loading skeleton / placeholder
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/70">
        Loading...
      </div>
    );
  }

  // Not logged in
  if (!sessionUserId) {
    window.location.href = '/signin';
    return;
  }

  // Logged in but profile still missing (rare)
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/70">
        Preparing your account...
      </div>
    );
  }

  const isComplete = profile.is_profile_complete === true;
  const status = (profile.status ?? "PENDING").toUpperCase();

  // Gate #1: profile completeness
  if (!allowIncomplete && !isComplete && !isCompleteProfilePage) {
    window.location.href = `/complete-profile`;
    return;
  }

  // Gate #2: status (optional, default allow but show notice)
  return (
    <>
      {status !== "ACTIVE" && isComplete && (
        <div className="mx-auto max-w-4xl px-4 pt-4">
          <div className="rounded-2xl border border-yellow-500/25 bg-yellow-500/10 px-4 py-3 text-sm text-white/85">
            Akun kita masih <b className="text-yellow-300">PENDING</b>. Beberapa fitur mungkin belum aktif sampai verifikasi selesai.
          </div>
        </div>
      )}
      {children}
    </>
  );
}
