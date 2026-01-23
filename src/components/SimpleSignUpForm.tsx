// =========================================================
// SIMPLE SIGNUP FORM COMPONENT
// Dengan useState hooks dan basic form handling
// =========================================================

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { validateReferralForForm } from "../utils/referralValidationFixed";

type FieldErrors = {
  email?: string | null;
  password?: string | null;
  confirmPassword?: string | null;
  username?: string | null;
  referral?: string;
};

type ReferralValidationState = {
  isValid: boolean | null;
  isLoading: boolean;
  message: string;
};

export default function SimpleSignUpForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Auto-detect referral code from URL
  const urlReferralCode = (searchParams.get("ref") || "").trim();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [referralCode, setReferralCode] = useState(urlReferralCode);

  // Validation states
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // UI states
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [referralValidation, setReferralValidation] =
    useState<ReferralValidationState>({
      isValid: null,
      isLoading: false,
      message: "",
    });

  // ---- validators
  const validateEmail = (v: string): string | null => {
    if (!v.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(v)) return "Invalid email format";
    return null;
  };

  const validateUsername = (v: string): string | null => {
    const val = v.trim();
    if (!val) return "Username is required";
    if (val.length < 3) return "Username must be at least 3 characters";
    if (val.length > 20) return "Username must be 20 characters or less";
    const usernameRegex = /^[a-z0-9_]+$/;
    if (!usernameRegex.test(val.toLowerCase())) {
      return "Username can only contain lowercase letters, numbers, and underscores";
    }
    return null;
  };

  const validatePassword = (v: string): string | null => {
    if (!v.trim()) return "Password is required";
    if (v.length < 8) return "Password must be at least 8 characters";
    return null;
  };

  const validateConfirmPassword = (pwd: string, confirm: string): string | null => {
    if (!confirm.trim()) return "Please confirm your password";
    if (pwd !== confirm) return "Passwords do not match";
    return null;
  };

  // ---- referral validation
  const validateReferralCode = useCallback(
    async (code: string) => {
      const c = (code || "").trim();
      if (!c || submitting) {
        setReferralValidation({ isValid: null, isLoading: false, message: "" });
        return;
      }

      setReferralValidation({ isValid: null, isLoading: true, message: "Checking..." });

      try {
        await validateReferralForForm(c);
        setReferralValidation({ isValid: true, isLoading: false, message: "Referral verified" });
      } catch (err: any) {
        let message = "Unable to verify. Check connection and retry";

        const raw = String(err?.message ?? "").toLowerCase();
        if (raw.includes("not found") || raw.includes("invalid")) {
          message = "Referral code not found or inactive";
        } else if (raw.includes("quota") || raw.includes("reached") || raw.includes("uses")) {
          message = "Referral quota reached (try another code)";
        } else if (raw.includes("network") || raw.includes("connection")) {
          message = "Unable to verify. Check connection and retry";
        } else if (raw.includes("expired")) {
          message = "Referral code has expired";
        } else if (raw.includes("suspended")) {
          message = "Referral code suspended";
        }

        setReferralValidation({ isValid: false, isLoading: false, message });
      }
    },
    [submitting]
  );

  // Sync referralCode with URL when it changes
  useEffect(() => {
    if (urlReferralCode) setReferralCode(urlReferralCode.toUpperCase());
  }, [urlReferralCode]);

  // Real-time field validation
  useEffect(() => {
    setFieldErrors((prev) => ({ ...prev, email: validateEmail(email) }));
  }, [email]);

  useEffect(() => {
    setFieldErrors((prev) => ({ ...prev, username: validateUsername(username) }));
  }, [username]);

  useEffect(() => {
    setFieldErrors((prev) => ({ ...prev, password: validatePassword(password) }));
  }, [password]);

  useEffect(() => {
    setFieldErrors((prev) => ({
      ...prev,
      confirmPassword: validateConfirmPassword(password, confirmPassword),
    }));
  }, [password, confirmPassword]);

  // Debounce referral validation when user types
  useEffect(() => {
    const t = setTimeout(() => {
      validateReferralCode(referralCode);
    }, 400);

    return () => clearTimeout(t);
  }, [referralCode, validateReferralCode]);

  const canSubmit =
    !!email &&
    !!password &&
    !!username &&
    password.length >= 8 &&
    username.length >= 3 &&
    username.length <= 20 &&
    /^[a-z0-9_]+$/.test(username.toLowerCase()) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    password === confirmPassword &&
    // referral: boleh kosong, kalau isi wajib valid
    (!referralCode.trim() || referralValidation.isValid === true) &&
    !submitting &&
    !referralValidation.isLoading &&
    !fieldErrors.email &&
    !fieldErrors.password &&
    !fieldErrors.confirmPassword &&
    !fieldErrors.username;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Fail-fast validation
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

      // Referral validation (if provided)
      if (referralCode.trim() && referralValidation.isValid !== true) {
        setError(referralValidation.message || "Invalid referral code");
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            username: username.trim().toLowerCase(),
            referral_code: referralCode.trim().toUpperCase(),
          },
        },
      });

      if (signUpError) throw signUpError;

      const needsEmailVerification = !data.session;

      setSuccess(
        needsEmailVerification
          ? "Account created! Please check your email to verify."
          : "Account created successfully!"
      );

      setTimeout(() => {
        navigate(needsEmailVerification ? "/verify-email" : "/signin", { replace: true });
      }, 2000);
    } catch (err: any) {
      setError(err?.message || "Signup failed");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setUsername("");
    setReferralCode(urlReferralCode ? urlReferralCode.toUpperCase() : "");
    setError("");
    setSuccess("");
    setReferralValidation({ isValid: null, isLoading: false, message: "" });
    setFieldErrors({});
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-600 mt-2">Join TPC Global today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  fieldErrors.email ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
                placeholder="Enter your email"
                required
                disabled={submitting || referralValidation.isLoading}
              />
              {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  fieldErrors.password ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
                placeholder="Min 8 characters"
                required
                disabled={submitting || referralValidation.isLoading}
              />
              {fieldErrors.password && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  fieldErrors.confirmPassword ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
                placeholder="Confirm your password"
                required
                disabled={submitting || referralValidation.isLoading}
              />
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  fieldErrors.username ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
                placeholder="johndoe"
                required
                disabled={submitting || referralValidation.isLoading}
              />
              {fieldErrors.username && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.username}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                3-20 characters: lowercase letters, numbers, underscores
              </p>
            </div>

            {/* Referral */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Referral Code (Optional)
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  className={`w-full px-3 py-2 pr-28 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    referralValidation.isValid === true
                      ? "border-green-300 bg-green-50"
                      : referralValidation.isValid === false
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="TPC-ABC123"
                  disabled={submitting}
                />

                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                  {referralValidation.isLoading ? (
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-700"></div>
                      Checking
                    </div>
                  ) : referralValidation.isValid === true ? (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      ✓ Verified
                    </div>
                  ) : referralValidation.isValid === false ? (
                    <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                      ✕ Invalid
                    </div>
                  ) : null}
                </div>
              </div>

              {referralValidation.message && !referralValidation.isLoading && (
                <p
                  className={`text-xs mt-2 ${
                    referralValidation.isValid === true
                      ? "text-green-600"
                      : referralValidation.isValid === false
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  {referralValidation.message}
                </p>
              )}

              <p className="text-xs text-gray-500 mt-1">Leave empty if you don't have one</p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Creating Account..." : "Sign Up"}
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={resetForm}
                disabled={submitting}
                className="text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                Clear Form
              </button>

              <div className="text-sm text-gray-600">
                Already have an account?{" "}
                <a href="/signin" className="text-blue-600 hover:text-blue-800 font-medium">
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
// MINIMAL SIGNUP FORM (fixed)
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
      if (!email || !password || !username) {
        setError("All fields are required");
        return;
      }

      if (referralCode.trim()) {
        await validateReferralForForm(referralCode.trim());
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            username: username.trim().toLowerCase(),
            referral_code: referralCode.trim().toUpperCase(),
          },
        },
      });

      if (signUpError) throw signUpError;

      const needsEmailVerification = !data.session;
      navigate(needsEmailVerification ? "/verify-email" : "/signin", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder="Password"
        required
      />
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        required
      />
      <input
        value={referralCode}
        onChange={(e) => setReferralCode(e.target.value)}
        placeholder="Referral Code (optional)"
      />
      {error && <div>{error}</div>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Sign Up"}
      </button>
    </form>
  );
}



