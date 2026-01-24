// =========================================================
// ONBOARDING PAGE COMPONENT
// Complete profile dengan username dan referral validation
// =========================================================

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { validateReferralCode } from "../../types/profile";
import { CheckCircle2, XCircle, Loader2, User, Users, LogOut } from "lucide-react";

function normalizeUsername(v: string) {
  return v.trim().toLowerCase();
}

function normalizeReferral(v: string) {
  return v.trim().toUpperCase();
}

export default function OnboardingPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [referralCode, setReferralCode] = useState("");

  const [checking, setChecking] = useState(false);
  const [refValid, setRefValid] = useState<boolean | null>(null);
  const [refHint, setRefHint] = useState<string>("");
  const [referrerInfo, setReferrerInfo] = useState<any>(null);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  const usernameValue = useMemo(() => normalizeUsername(username), [username]);
  const referralValue = useMemo(() => normalizeReferral(referralCode), [referralCode]);

  // Live validate referral code
  useEffect(() => {
    let alive = true;

    async function validate() {
      setErrorMsg("");
      setSuccessMsg("");
      const code = referralValue;
      
      if (!code) {
        setRefValid(null);
        setRefHint("");
        setReferrerInfo(null);
        return;
      }
      
      setChecking(true);
      
      try {
        const referralData = await validateReferralCode(code);
        
        if (!alive) return;

        if (referralData.is_valid) {
          setRefValid(true);
          setReferrerInfo(referralData);
          setRefHint(`✅ Valid • Upline: ${referralData.referrer_username || referralData.referrer_member_code || "OK"}`);
        } else {
          setRefValid(false);
          setReferrerInfo(null);
          setRefHint("❌ Referral tidak valid.");
        }
      } catch (error) {
        if (!alive) return;
        setRefValid(false);
        setReferrerInfo(null);
        setRefHint("⚠️ Gagal cek referral (network).");
      } finally {
        if (!alive) return;
        setChecking(false);
      }
    }

    validate();
    return () => {
      alive = false;
    };
  }, [referralValue]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const u = usernameValue;
    const r = referralValue;

    // Username validation
    if (!u || u.length < 3 || u.length > 20 || !/^[a-z0-9_.]+$/.test(u)) {
      setErrorMsg("Username harus 3-20 karakter (huruf kecil/angka/underscore).");
      return;
    }

    // Referral validation (jika diisi)
    if (r && refValid === false) {
      setErrorMsg("Referral code tidak valid.");
      return;
    }

    setSaving(true);
    
    try {
      const { data, error } = await supabase.rpc("activate_profile", {
        p_username: u,
        p_referral_code: r || null,
      });

      if (error) throw error;
      if (!data?.ok) throw new Error(data?.message || data?.error || "Finalize gagal");

      setSuccessMsg("✅ Profile activated successfully!");
      
      // Redirect setelah delay
      setTimeout(() => {
        navigate(data?.navigation_route || "/member/dashboard", { replace: true });
      }, 1500);

    } catch (err: any) {
      const msg = err?.message || "Terjadi kesalahan";
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    try {
      await supabase.auth.signOut();
      navigate("/signin", { replace: true });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }

  return (
    <div className="min-h-screen px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-[#F0B90B] rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold text-white">TPC Global</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Complete Your Profile</h1>
          <p className="text-sm text-white/60">
            Set username dan (opsional) referral code untuk mengaktifkan akun Anda.
          </p>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6">
          <form className="space-y-6" onSubmit={onSubmit}>
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                Username *
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <User className="w-4 h-4 text-white/40" />
                </div>
                <input
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 outline-none focus:border-[#F0B90B]/60 focus:bg-white/[0.06]"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="contoh: bangeko_01"
                  autoComplete="off"
                  disabled={saving}
                />
              </div>
              <p className="mt-2 text-xs text-white/60">
                3-20 karakter: huruf kecil, angka, underscore.
              </p>
            </div>

            {/* Referral Code Field */}
            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                Referral Code (Opsional)
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  {checking ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white/40" />
                  ) : refValid === true ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : refValid === false ? (
                    <XCircle className="w-4 h-4 text-red-400" />
                  ) : (
                    <Users className="w-4 h-4 text-white/40" />
                  )}
                </div>
                <input
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 outline-none focus:border-[#F0B90B]/60 focus:bg-white/[0.06]"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="contoh: TPC-000123"
                  autoComplete="off"
                  disabled={saving}
                />
              </div>
              
              {/* Referral Status */}
              <div className="mt-2 min-h-[20px]">
                {checking ? (
                  <span className="text-xs text-white/50 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Mengecek referral...
                  </span>
                ) : refValid === true ? (
                  <div className="space-y-1">
                    <span className="text-xs text-green-400">{refHint}</span>
                    {referrerInfo?.referrer_username && (
                      <span className="text-xs text-white/60">
                        Referrer: {referrerInfo.referrer_username}
                      </span>
                    )}
                  </div>
                ) : refValid === false ? (
                  <span className="text-xs text-red-400">{refHint}</span>
                ) : (
                  <span className="text-xs text-white/40">
                    Kosongkan jika tidak punya.
                  </span>
                )}
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/15 p-3 text-sm text-red-200">
                {errorMsg}
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="rounded-xl border border-green-500/30 bg-green-500/15 p-3 text-sm text-green-200">
                {successMsg}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl bg-[#F0B90B] text-black font-semibold hover:bg-[#F0B90B]/90 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Finish & Activate
                </>
              )}
            </button>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={handleSignOut}
              disabled={saving}
              className="w-full py-3 rounded-xl border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-white/60">
          Setelah ini, akun Anda akan aktif dan bisa mengakses semua fitur.
        </div>
      </div>
    </div>
  );
}
