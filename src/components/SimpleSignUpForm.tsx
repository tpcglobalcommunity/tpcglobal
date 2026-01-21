// =========================================================
// SIMPLE SIGNUP FORM COMPONENT
// Dengan useState hooks dan basic form handling
// =========================================================

import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { validateReferralForForm } from "../../utils/referralValidationFixed";

export default function SimpleSignUpForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Auto-detect referral code from URL
  const urlReferralCode = searchParams.get('ref') || '';

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [referralCode, setReferralCode] = useState(urlReferralCode);

  // Validation states
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    username?: string;
    referral?: string;
  }>({});

  // UI states
  const [checkingReferral, setCheckingReferral] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [referralValidation, setReferralValidation] = useState<{
    isValid: boolean | null;
    isLoading: boolean;
    message: string;
  }>({ isValid: null, isLoading: false, message: "" });

  // Debounced referral validation
  const validateReferralCode = useCallback(async (code: string) => {
    if (!code.trim() || submitting) {
      setReferralValidation({ isValid: null, isLoading: false, message: "" });
      return;
    }

    setCheckingReferral(true);
    setReferralValidation({ isValid: null, isLoading: true, message: "Checking..." });
    
    try {
      await validateReferralForForm(code);
      setReferralValidation({ isValid: true, isLoading: false, message: "Referral verified" });
    } catch (error: any) {
      // User-friendly error messages
      let message = "Unable to verify. Check connection and retry";
      
      if (error.message) {
        const lowerError = error.message.toLowerCase();
        
        if (lowerError.includes('not found') || lowerError.includes('invalid')) {
          message = "Referral code not found or inactive";
        } else if (lowerError.includes('quota') || lowerError.includes('reached') || lowerError.includes('uses')) {
          message = "Referral quota reached (try another code)";
        } else if (lowerError.includes('network') || lowerError.includes('connection')) {
          message = "Unable to verify. Check connection and retry";
        } else if (lowerError.includes('expired')) {
          message = "Referral code has expired";
        } else if (lowerError.includes('suspended')) {
          message = "Referral code suspended";
        }
      }
      
      setReferralValidation({ isValid: false, isLoading: false, message });
    } finally {
      setCheckingReferral(false);
    }
  }, [submitting]);

  // Real-time validation functions
  const validateEmail = (email: string): string | null => {
    if (!email.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Invalid email format";
    return null;
  };

  const validateUsername = (username: string): string | null => {
    if (!username.trim()) return "Username is required";
    if (username.length < 3) return "Username must be at least 3 characters";
    if (username.length > 20) return "Username must be 20 characters or less";
    const usernameRegex = /^[a-z0-9_]+$/;
    if (!usernameRegex.test(username.toLowerCase())) {
      return "Username can only contain lowercase letters, numbers, and underscores";
    }
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (!password.trim()) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    return null;
  };

  const validateConfirmPassword = (password: string, confirm: string): string | null => {
    if (!confirm.trim()) return "Please confirm your password";
    if (password !== confirm) return "Passwords do not match";
    return null;
  };

  // Real-time field validation
  useEffect(() => {
    setFieldErrors(prev => ({
      ...prev,
      email: validateEmail(email)
    }));
  }, [email]);

  useEffect(() => {
    setFieldErrors(prev => ({
      ...prev,
      username: validateUsername(username)
    }));
  }, [username]);

  useEffect(() => {
    setFieldErrors(prev => ({
      ...prev,
      password: validatePassword(password)
    }));
  }, [password]);

  useEffect(() => {
    setFieldErrors(prev => ({
      ...prev,
      confirmPassword: validateConfirmPassword(password, confirmPassword)
    }));
  }, [password, confirmPassword]);

  useEffect(() => {
    // Auto-detect and validate URL referral code
    if (urlReferralCode) {
      validateReferralCode(urlReferralCode);
    }
  }, [urlReferralCode, validateReferralCode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      validateReferralCode(referralCode);
    }, 400);

    return () => clearTimeout(timer);
  }, [referralCode, validateReferralCode]);

  // Check if form is ready to submit
  const canSubmit = email && password && username && 
    password.length >= 8 && 
    username.length >= 3 && username.length <= 20 &&
    /^[a-z0-9_]+$/.test(username.toLowerCase()) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    password === confirmPassword &&
    (!referralCode.trim() || referralValidation.isValid === true) &&
    !submitting && !checkingReferral &&
    !fieldErrors.email && !fieldErrors.password && !fieldErrors.confirmPassword && !fieldErrors.username;

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // 1. Fail-fast validation
      const emailError = validateEmail(email);
      if (emailError) {
        setError(emailError);
        return;
      }

      const usernameError = validateUsername(username);
      if (usernameError) {
        setError(usernameError);
        return;
      }

      const passwordError = validatePassword(password);
      if (passwordError) {
        setError(passwordError);
        return;
      }

      const confirmError = validateConfirmPassword(password, confirmPassword);
      if (confirmError) {
        setError(confirmError);
        return;
      }

      // 2. Referral validation (if provided)
      if (referralCode.trim()) {
        if (referralValidation.isValid !== true) {
          setError(referralValidation.message || "Invalid referral code");
          return;
        }
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

      // 4. Success state
      const needsEmailVerification = !data.session;
      setSuccess(
        needsEmailVerification 
          ? "Account created! Please check your email to verify."
          : "Account created successfully!"
      );

      // 5. Redirect after delay
      setTimeout(() => {
        navigate(needsEmailVerification ? "/verify-email" : "/signin", { replace: true });
      }, 2000);

    } catch (error: any) {
      setError(error.message || "Signup failed");
    } finally {
      setSubmitting(false);
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
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  fieldErrors.email 
                    ? "border-red-300 bg-red-50" 
                    : "border-gray-300"
                }`}
                placeholder="Enter your email"
                required
                disabled={submitting || checkingReferral}
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
              )}
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
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  fieldErrors.password 
                    ? "border-red-300 bg-red-50" 
                    : "border-gray-300"
                }`}
                placeholder="Min 8 characters"
                required
                disabled={submitting || checkingReferral}
              />
              {fieldErrors.password && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  fieldErrors.confirmPassword 
                    ? "border-red-300 bg-red-50" 
                    : "border-gray-300"
                }`}
                placeholder="Confirm your password"
                required
                disabled={submitting || checkingReferral}
              />
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  fieldErrors.username 
                    ? "border-red-300 bg-red-50" 
                    : "border-gray-300"
                }`}
                placeholder="johndoe"
                required
                disabled={submitting || checkingReferral}
              />
              {fieldErrors.username && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.username}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                3-20 characters: lowercase letters, numbers, underscores
              </p>
            </div>

            {/* Referral Code Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Referral Code (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  className={`w-full px-3 py-2 pr-24 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    referralValidation.isValid === true
                      ? "border-green-300 bg-green-50"
                      : referralValidation.isValid === false
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="TPC-ABC123"
                  disabled={submitting || checkingReferral}
                />
                
                {/* Status Chip */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                  {referralValidation.isLoading ? (
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-700"></div>
                      Checking...
                    </div>
                  ) : referralValidation.isValid === true ? (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Code Verified
                    </div>
                  ) : referralValidation.isValid === false ? (
                    <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      {referralValidation.message || "Invalid"}
                    </div>
                  ) : null}
                </div>
              </div>
              
              {/* Additional message below chip */}
              {referralValidation.message && !referralValidation.isLoading && (
                <p className={`text-xs mt-2 ${
                  referralValidation.isValid === true
                    ? "text-green-600"
                    : referralValidation.isValid === false
                    ? "text-red-600"
                    : "text-gray-500"
                }`}>
                  {referralValidation.message}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Leave empty if you don't have one
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>

            {/* Global Error Notice Box */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Success Notice Box */}
            {success && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={resetForm}
                disabled={submitting || checkingReferral}
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
      <button type="submit" disabled={submitting || checkingReferral}>
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

