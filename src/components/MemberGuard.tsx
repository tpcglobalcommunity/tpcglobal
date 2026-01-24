import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

type ProfileRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  telegram: string | null;
  city: string | null;
  verified: boolean | null;
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
  const [blocked, setBlocked] = useState<string | null>(null);
  let alive = true;

  const path = window.location.pathname;
  const isCompleteProfilePage = useMemo(
    () => path.includes("/complete-profile"),
    [path]
  );

  useEffect(() => {
    let mounted = true;
    alive = true;

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
        .select("id,email,username,full_name,phone,telegram,city,role,verified,avatar_url,referral_code,referred_by,can_invite,tpc_tier,tpc_balance,wallet_address,wallet_verified_at,created_at,updated_at")
        .eq("id", userId)
        .maybeSingle();

      if (!mounted) return;

      // 3) If profile missing, create minimal fallback (fail silently)
      if ((!prof || profErr) && userId) {
        await supabase
          .from("profiles")
          .insert({ id: userId });

        const { data: prof2 } = await supabase
          .from("profiles")
          .select("id,email,username,full_name,phone,telegram,city,role,verified,avatar_url,referral_code,referred_by,can_invite,tpc_tier,tpc_balance,wallet_address,wallet_verified_at,created_at,updated_at")
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
  if (!profile || !profile.verified) {
    if (!alive) return;
    setBlocked("verify");
    return;
  }

  // Check if profile is complete (dynamic logic)
  const isComplete = profile.full_name?.trim() &&
                     profile.phone?.trim() &&
                     profile.telegram?.trim() &&
                     profile.city?.trim();
  
  const isVerified = profile.verified === true;
  const isViewer = profile.role === "viewer";
  
  if (!allowIncomplete && !isComplete) {
    if (!alive) return;
    setBlocked("complete");
    return;
  }

  // Show blocked state
  if (blocked) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/70">
        {blocked === "verify" && (
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Email Verification Required</h2>
            <p className="mb-4">Please check your email and verify your account to continue.</p>
            <button 
              onClick={() => window.location.href = '/verify-email'}
              className="px-4 py-2 bg-[#f0b90b] text-[#0b0f17] rounded-lg hover:bg-[#f0b90b]/90"
            >
              Verify Email
            </button>
          </div>
        )}
        {blocked === "complete" && (
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Complete Profile Required</h2>
            <p className="mb-4">Please complete your profile information to continue.</p>
            <button 
              onClick={() => window.location.href = '/complete-profile'}
              className="px-4 py-2 bg-[#f0b90b] text-[#0b0f17] rounded-lg hover:bg-[#f0b90b]/90"
            >
              Complete Profile
            </button>
          </div>
        )}
      </div>
    );
  }

  // Gate #1: profile completeness
  if (!allowIncomplete && !isComplete && !isCompleteProfilePage) {
    window.location.href = `/complete-profile`;
    return;
  }

  // Gate #2: verification and role
  return (
    <>
      {(!isVerified || isViewer) && isComplete && (
        <div className="mx-auto max-w-4xl px-4 pt-4">
          <div className="rounded-2xl border border-yellow-500/25 bg-yellow-500/10 px-4 py-3 text-sm text-white/85">
            {isViewer ? (
              <>Akun anda memiliki akses <b className="text-yellow-300">VIEWER</b>. Fitur terbatas tersedia.</>
            ) : (
              <>Akun kita masih <b className="text-yellow-300">PENDING VERIFICATION</b>. Beberapa fitur mungkin belum aktif sampai verifikasi selesai.</>
            )}
          </div>
        </div>
      )}
      {children}
    </>
  );
}
