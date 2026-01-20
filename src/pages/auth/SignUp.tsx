import { useState } from "react";
import { supabase } from "../../lib/supabase"; // sesuaikan path supabase client kamu
// import NoticeBox / UI components kamu

export default function SignUp({ lang }: { lang: any }) {
  const [referralCode, setReferralCode] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessEmail(null);

    const code = referralCode.trim().toUpperCase();
    const uname = username.trim();

    if (!code) return setError("Referral code is required.");
    if (!uname) return setError("Username is required.");
    if (!email.trim()) return setError("Email is required.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");

    setIsSubmitting(true);
    try {
      // (opsional tapi bagus) validasi referral code via RPC public yang sudah kita buat
      // const { data: valid, error: refErr } = await supabase.rpc("validate_referral_code_public", { p_code: code });
      // if (refErr || !valid) throw new Error("Invalid referral code.");

      const { data, error: signUpErr } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            username: uname,
            referralCode: code,
          },
        },
      });

      if (signUpErr) throw signUpErr;

      // Kalau email confirmation ON: user akan dapat email verifikasi
      setSuccessEmail(data.user?.email ?? email.trim());
    } catch (err: any) {
      setError(err?.message ?? "Failed to create account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      {/* Referral Code */}
      <input 
        value={referralCode} 
        onChange={(e) => setReferralCode(e.target.value)} 
        placeholder="TPC-XXXXXX" 
      />

      {/* Username */}
      <input 
        value={username} 
        onChange={(e) => setUsername(e.target.value)} 
        placeholder="username" 
      />

      {/* Email */}
      <input 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        placeholder="email@gmail.com" 
        type="email"
      />

      {/* Password */}
      <input 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        type="password" 
        placeholder="********" 
      />

      {/* Confirm Password */}
      <input 
        value={confirmPassword} 
        onChange={(e) => setConfirmPassword(e.target.value)} 
        type="password" 
        placeholder="********" 
      />

      {error && <div className="text-red-400">{error}</div>}

      {successEmail && (
        <div className="text-green-300">
          Account created. Please check your email (<b>{successEmail}</b>) to verify, then sign in.
        </div>
      )}

      <button disabled={isSubmitting} type="submit">
        {isSubmitting ? "Creating..." : "Create Account"}
      </button>
    </form>
  );
}
