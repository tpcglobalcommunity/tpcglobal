// =========================================================
// ENVIRONMENT VALIDATION
// =========================================================

/**
 * Validate Supabase environment variables
 */
export function validateSupabaseEnv(): {
  isValid: boolean;
  error: string | null;
  env: {
    url: string | undefined;
    anonKey: string | undefined;
  };
} {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    const DEBUG = import.meta.env.DEV && localStorage.getItem("tpc_debug") === "1";
    if (DEBUG) {
      console.error('[ENV ERROR]', {
        url: url || 'MISSING',
        anon: anonKey ? 'OK' : 'MISSING',
      });
    }
    
    return {
      isValid: false,
      error: 'Missing Supabase environment variables',
      env: { url, anonKey }
    };
  }

  return {
    isValid: true,
    error: null,
    env: { url, anonKey }
  };
}

// =========================================================
// USERNAME VALIDATION HELPERS
// Regex patterns dan validation functions untuk username
// =========================================================

// =========================================================
// REGEX PATTERNS
// =========================================================

/**
 * Username validation pattern:
 * - 3-20 characters
 * - Lowercase letters (a-z)
 * - Numbers (0-9)
 * - Underscore (_)
 */
export const usernameRegex = /^[a-z0-9_]{3,20}$/;

/**
 * Strict username pattern (no leading/trailing underscores):
 * - 3-20 characters
 * - Cannot start or end with underscore
 * - No consecutive underscores
 */
export const strictUsernameRegex = /^[a-z0-9](?:[a-z0-9_]{1,18})[a-z0-9]$/;

/**
 * Email validation pattern
 */
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Referral code pattern (TPC-XXXXXX format)
 */
export const referralCodeRegex = /^TPC-[A-Z0-9]{6}$/;

/**
 * General referral code pattern (flexible)
 */
export const generalReferralRegex = /^[A-Z0-9-]{3,10}$/;

// =========================================================
// VALIDATION FUNCTIONS
// =========================================================

/**
 * Validate username with regex
 */
export function validateUsername(username: string): {
  isValid: boolean;
  error: string | null;
} {
  if (!username?.trim()) {
    return {
      isValid: false,
      error: "Username is required"
    };
  }

  const trimmedUsername = username.trim();

  if (!usernameRegex.test(trimmedUsername)) {
    return {
      isValid: false,
      error: "Username must be 3–20 chars, lowercase, numbers, underscore only"
    };
  }

  // Additional checks
  if (trimmedUsername.startsWith('_') || trimmedUsername.endsWith('_')) {
    return {
      isValid: false,
      error: "Username cannot start or end with underscore"
    };
  }

  if (trimmedUsername.includes('__')) {
    return {
      isValid: false,
      error: "Username cannot contain consecutive underscores"
    };
  }

  return {
    isValid: true,
    error: null
  };
}

/**
 * Validate username with strict pattern
 */
export function validateUsernameStrict(username: string): {
  isValid: boolean;
  error: string | null;
} {
  if (!username?.trim()) {
    return {
      isValid: false,
      error: "Username is required"
    };
  }

  const trimmedUsername = username.trim();

  if (!strictUsernameRegex.test(trimmedUsername)) {
    return {
      isValid: false,
      error: "Username must be 3–20 chars, start/end with letter/number, no consecutive underscores"
    };
  }

  return {
    isValid: true,
    error: null
  };
}

/**
 * Validate email address
 */
export function validateEmail(email: string): {
  isValid: boolean;
  error: string | null;
} {
  if (!email?.trim()) {
    return {
      isValid: false,
      error: "Email is required"
    };
  }

  const trimmedEmail = email.trim();

  if (!emailRegex.test(trimmedEmail)) {
    return {
      isValid: false,
      error: "Please enter a valid email address"
    };
  }

  return {
    isValid: true,
    error: null
  };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean;
  error: string | null;
  strength: 'weak' | 'medium' | 'strong';
} {
  if (!password) {
    return {
      isValid: false,
      error: "Password is required",
      strength: 'weak'
    };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      error: "Password must be at least 6 characters",
      strength: 'weak'
    };
  }

  // Calculate strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  
  if (password.length >= 8) strength = 'medium';
  if (password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
    strength = 'strong';
  }

  return {
    isValid: true,
    error: null,
    strength
  };
}

/**
 * Validate referral code
 */
export function validateReferralCode(code: string): {
  isValid: boolean;
  error: string | null;
  normalizedCode: string | null;
} {
  if (!code?.trim()) {
    // Referral is optional
    return {
      isValid: true,
      error: null,
      normalizedCode: null
    };
  }

  const trimmedCode = code.trim().toUpperCase();

  if (!generalReferralRegex.test(trimmedCode)) {
    return {
      isValid: false,
      error: "Invalid referral code format",
      normalizedCode: null
    };
  }

  return {
    isValid: true,
    error: null,
    normalizedCode: trimmedCode
  };
}

// =========================================================
// COMBINED VALIDATION
// =========================================================

/**
 * Validate complete signup form
 */
export function validateSignUpForm(
  email: string,
  password: string,
  username: string,
  referralCode?: string
): {
  isValid: boolean;
  errors: {
    email?: string;
    password?: string;
    username?: string;
    referral?: string;
  };
  normalizedData: {
    email: string;
    password: string;
    username: string;
    referralCode: string | null;
  };
} {
  const errors: any = {};
  const normalizedData = {
    email: email.trim().toLowerCase(),
    password,
    username: username.trim().toLowerCase(),
    referralCode: referralCode?.trim().toUpperCase() || null
  };

  // Validate email
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
  }

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error;
  }

  // Validate username
  const usernameValidation = validateUsername(username);
  if (!usernameValidation.isValid) {
    errors.username = usernameValidation.error;
  }

  // Validate referral (optional)
  if (referralCode?.trim()) {
    const referralValidation = validateReferralCode(referralCode);
    if (!referralValidation.isValid) {
      errors.referral = referralValidation.error;
    } else {
      normalizedData.referralCode = referralValidation.normalizedCode;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    normalizedData
  };
}

// =========================================================
// REACT HOOKS
// =========================================================

import { useState, useEffect, useCallback } from "react";

/**
 * Hook for real-time username validation
 */
export function useUsernameValidation(initialUsername = "") {
  const [username, setUsername] = useState(initialUsername);
  const [validation, setValidation] = useState<{
    isValid: boolean;
    error: string | null;
  }>({ isValid: false, error: null });

  const validate = useCallback((value: string) => {
    const result = validateUsername(value);
    setValidation(result);
    return result;
  }, []);

  const handleChange = useCallback((value: string) => {
    setUsername(value);
    return validate(value);
  }, [validate]);

  // Auto-validate on change
  useEffect(() => {
    if (username) {
      validate(username);
    }
  }, [username, validate]);

  return {
    username,
    setUsername: handleChange,
    validation,
    validate
  };
}

/**
 * Hook for complete form validation
 */
export function useFormValidation() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [referralCode, setReferralCode] = useState("");

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    username?: string;
    referral?: string;
  }>({});

  const validateForm = useCallback(() => {
    const result = validateSignUpForm(email, password, username, referralCode);
    setErrors(result.errors);
    return result;
  }, [email, password, username, referralCode]);

  const isValid = Object.keys(errors).length === 0;

  return {
    // Form state
    email, setEmail,
    password, setPassword,
    username, setUsername,
    referralCode, setReferralCode,
    
    // Validation state
    errors,
    isValid,
    
    // Actions
    validateForm
  };
}

// =========================================================
// USAGE EXAMPLES
// =========================================================

/*
// 1. Basic regex usage:
const usernameRegex = /^[a-z0-9_]{3,20}$/;

if (!usernameRegex.test(username)) {
  setError("Username must be 3–20 chars, lowercase, numbers, underscore only");
  return;
}

// 2. With helper function:
const validation = validateUsername(username);
if (!validation.isValid) {
  setError(validation.error);
  return;
}

// 3. Complete form validation:
const { isValid, errors, normalizedData } = validateSignUpForm(
  email,
  password,
  username,
  referralCode
);

if (!isValid) {
  setErrors(errors);
  return;
}

// 4. With React hook:
const { username, setUsername, validation } = useUsernameValidation();

const handleChange = (e) => {
  setUsername(e.target.value);
  // validation.isValid dan validation.error otomatis updated
};

// 5. Form validation hook:
const {
  email, setEmail,
  password, setPassword,
  username, setUsername,
  referralCode, setReferralCode,
  errors, isValid,
  validateForm
} = useFormValidation();

const handleSubmit = async (e) => {
  e.preventDefault();
  
  const result = validateForm();
  if (!result.isValid) {
    // result.errors berisi semua error messages
    return;
  }
  
  // Use normalizedData for API call
  await signUp(result.normalizedData);
};

// 6. In JSX:
<input
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  className={validation.isValid ? 'valid' : 'invalid'}
/>
{validation.error && (
  <span className="error">{validation.error}</span>
)}
*/
