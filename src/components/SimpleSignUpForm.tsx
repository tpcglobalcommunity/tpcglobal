// =========================================================
// SIMPLE SIGNUP FORM COMPONENT
// Dengan useState hooks dan basic form handling
// =========================================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { validateReferralForForm } from "../../utils/referralValidationFixed";

export default function SimpleSignUpForm() {
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [referralCode, setReferralCode] = useState("");

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // 1. Basic validation
      if (!email || !password || !username) {
        setError("All fields are required");
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }

      if (username.length < 3 || username.length > 20) {
        setError("Username must be 3-20 characters");
        return;
      }

      if (!/^[a-z0-9_]+$/.test(username.toLowerCase())) {
        setError("Username can only contain letters, numbers, and underscores");
        return;
      }

      // 2. Validate referral code (optional)
      if (referralCode.trim()) {
        await validateReferralForForm(referralCode);
      }

      // 3. Sign up with meta data
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username.trim().toLowerCase(),
            referral_code: referralCode.trim().toUpperCase()
          }
        }
      });

      if (signUpError) throw signUpError;

      // 4. Determine redirect
      const needsEmailVerification = !data.session;
      const redirectPath = needsEmailVerification ? "/verify-email" : "/signin";

      setSuccess(
        needsEmailVerification 
          ? "Account created! Please check your email to verify."
          : "Account created successfully!"
      );

      // 5. Redirect after delay
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 2000);

    } catch (error: any) {
      setError(error.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setEmail("");
    setPassword("");
    setUsername("");
    setReferralCode("");
    setError("");
    setSuccess("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-lg rounded-lg p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-600 mt-2">Join TPC Global today</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Min 6 characters"
                required
                disabled={isLoading}
              />
            </div>

            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="johndoe"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                3-20 characters: letters, numbers, underscores
              </p>
            </div>

            {/* Referral Code Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Referral Code (Optional)
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="TPC-ABC123"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty if you don't have one
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>

            {/* Form Actions */}
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={resetForm}
                disabled={isLoading}
                className="text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                Clear Form
              </button>
              
              <div className="text-sm text-gray-600">
                Already have an account?{" "}
                <a 
                  href="/signin" 
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Sign In
                </a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// MINIMAL SIGNUP FORM (no styling)
// =========================================================

export function MinimalSignUpForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Basic validation
      if (!email || !password || !username) {
        setError("All fields are required");
        return;
      }

      // Validate referral (optional)
      if (referralCode.trim()) {
        await validateReferralForForm(referralCode);
      }

      // Sign up
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username.trim().toLowerCase(),
            referral_code: referralCode.trim().toUpperCase()
          }
        }
      });

      if (signUpError) throw signUpError;

      // Redirect
      const needsEmailVerification = !data.session;
      navigate(needsEmailVerification ? "/verify-email" : "/signin", { replace: true });

    } catch (error: any) {
      setError(error.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" required />
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
      <input value={referralCode} onChange={(e) => setReferralCode(e.target.value)} placeholder="Referral Code (optional)" />
      {error && <div>{error}</div>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Sign Up"}
      </button>
    </form>
  );
}

// =========================================================
// USAGE EXAMPLES
// =========================================================

/*
// 1. Basic usage:

function SignUpPage() {
  return <SimpleSignUpForm />;
}

// 2. With custom styling:
function CustomSignUpPage() {
  return (
    <div className="my-custom-container">
      <SimpleSignUpForm />
    </div>
  );
}

// 3. Minimal version:

function MinimalSignUpPage() {
  return (
    <div>
      <h1>Sign Up</h1>
      <MinimalSignUpForm />
    </div>
  );
}

// 4. Manual state management:
function ManualSignUpForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Your custom logic here
    const result = await simpleSignUp(email, password, username, referralCode);
    
    if (result.success) {
      navigate(result.redirectPath);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={username} onChange={(e) => setUsername(e.target.value)} />
      {/* other fields */}
    </form>
  );
}
*/

