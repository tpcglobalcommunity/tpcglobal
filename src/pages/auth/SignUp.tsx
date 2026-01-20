import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { Loader2 } from "lucide-react";

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

    // Validation
    if (!code) return setError("Referral code is required.");
    if (!uname) return setError("Username is required.");
    if (!email.trim()) return setError("Email is required.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");

    // Username validation (alphanumeric, underscore, period, 3-20 chars)
    const usernameRegex = /^[a-zA-Z0-9_.]{3,20}$/;
    if (!usernameRegex.test(uname)) {
      return setError("Username must be 3-20 characters (letters, numbers, underscore, period).");
    }

    setIsSubmitting(true);
    try {
      // Validate referral code via RPC
      const { data: valid, error: refErr } = await supabase.rpc("validate_referral_code_public", { p_code: code });
      if (refErr || !valid) throw new Error("Invalid referral code.");

      const { data, error: signUpErr } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            username: uname,
            referral_code: code,
          },
        },
      });

      if (signUpErr) throw signUpErr;

      // Success - user will receive email verification
      setSuccessEmail(data.user?.email ?? email.trim());
    } catch (err: any) {
      setError(err?.message ?? "Failed to create account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
      
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Referral Code */}
        <div>
          <label className="block text-sm font-medium mb-2">Referral Code *</label>
          <input 
            value={referralCode} 
            onChange={(e) => setReferralCode(e.target.value)} 
            placeholder="TPC-XXXXXX" 
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#F0B90B] text-white placeholder-white/50"
            required
          />
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium mb-2">Username *</label>
          <input 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            placeholder="username" 
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#F0B90B] text-white placeholder-white/50"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-2">Email *</label>
          <input 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="email@gmail.com" 
            type="email"
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#F0B90B] text-white placeholder-white/50"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium mb-2">Password *</label>
          <input 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            type="password" 
            placeholder="********" 
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#F0B90B] text-white placeholder-white/50"
            required
            minLength={8}
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium mb-2">Confirm Password *</label>
          <input 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            type="password" 
            placeholder="********" 
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#F0B90B] text-white placeholder-white/50"
            required
            minLength={8}
          />
        </div>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {successEmail && (
          <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 text-sm">
            Account created. Please check your email (<b>{successEmail}</b>) to verify, then sign in.
          </div>
        )}

        <button 
          disabled={isSubmitting} 
          type="submit"
          className="w-full py-3 bg-[#F0B90B] text-black font-semibold rounded-lg hover:bg-[#F0B90B]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>
    </div>
  );
}
