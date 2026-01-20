// =========================================================
// SIMPLE SIGNUP FLOW
// =========================================================

import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { validateReferralForForm } from "./referralValidationFixed";

// =========================================================
// SIMPLE SIGNUP FUNCTION
// =========================================================

/**
 * Simple signup flow:
 * 1. Validate referral (optional)
 * 2. Create auth.users with meta data
 * 3. Trigger auto-creates profile
 * 4. Return redirect info
 */
export async function simpleSignUp(
  email: string,
  password: string,
  username: string,
  referralCode?: string
): Promise<{
  success: boolean;
  message: string;
  redirectPath: string;
  needsEmailVerification: boolean;
}> {
  try {
    // 1. Validate referral (optional)
    if (referralCode?.trim()) {
      await validateReferralForForm(referralCode);
    }

    // 2. Normalize data
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedReferralCode = referralCode?.trim().toUpperCase();

    // 3. Create auth.users dengan meta data
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: normalizedUsername,
          referral_code: normalizedReferralCode
        }
      }
    });

    if (error) throw error;

    // 4. Determine redirect based on session
    const needsEmailVerification = !data.session;
    const redirectPath = needsEmailVerification ? "/verify-email" : "/signin";

    return {
      success: true,
      message: needsEmailVerification 
        ? "Account created! Please check your email to verify."
        : "Account created successfully!",
      redirectPath,
      needsEmailVerification
    };
  } catch (error) {
    console.error("Simple signup error:", error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : "Signup failed",
      redirectPath: "/signup",
      needsEmailVerification: false
    };
  }
}

// =========================================================
// REACT HOOK FOR SIMPLE SIGNUP
// =========================================================

export function useSimpleSignUp() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const signUp = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await simpleSignUp(email, password, username, referralCode);
      
      if (result.success) {
        setSuccess(result.message);
        // Redirect ke path yang ditentukan
        navigate(result.redirectPath, { replace: true });
      } else {
        setError(result.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Signup failed";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [email, password, username, referralCode]);

  const reset = useCallback(() => {
    setEmail("");
    setPassword("");
    setUsername("");
    setReferralCode("");
    setError(null);
    setSuccess(null);
  }, []);

  return {
    // Form state
    email,
    setEmail,
    password,
    setPassword,
    username,
    setUsername,
    referralCode,
    setReferralCode,
    
    // UI state
    isLoading,
    error,
    success,
    
    // Actions
    signUp,
    reset
  };
}

// =========================================================
// SIMPLE SIGNUP COMPONENT
// =========================================================

export function SimpleSignUpComponent() {
  const navigate = useNavigate();
  const { signUp } = useSimpleSignUp();

  // Auto redirect on success
  useEffect(() => {
    if (signUp.success) {
      // Success message sudah ditampilkan, redirect akan ditangani di handleSubmit
      navigate(signUp.redirectPath, { replace: true });
    }
  }, [signUp.success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await signUp(
      signUp.email,
      signUp.password,
      signUp.username,
      signUp.referralCode
    );
    
    if (result.success) {
      // Redirect ke path yang ditentukan
      navigate(result.redirectPath, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={signUp.email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="email@example.com"
              required
              disabled={signUp.isLoading}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={signUp.password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Min 6 characters"
              required
              disabled={signUp.isLoading}
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={signUp.username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="johndoe"
              required
              disabled={signUp.isLoading}
            />
          </div>

          {/* Referral Code (Optional) */}
          <div>
            <label className="block text-sm font-medium mb-2">Referral Code (Optional)</label>
            <input
              type="text"
              value={signUp.referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="TPC-ABC123"
              disabled={signUp.isLoading}
            />
          </div>

          {/* Error */}
          {signUp.error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {signUp.error}
            </div>
          )}

          {/* Success */}
          {signUp.success && (
            <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {signUp.success}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={signUp.isLoading}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {signUp.isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        {/* Sign In Link */}
        <div className="text-center">
          <span className="text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/signin" className="text-blue-600 hover:underline">
              Sign In
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}

export default SimpleSignUpComponent;
