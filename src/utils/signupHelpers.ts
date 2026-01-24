// =========================================================
// SIGNUP WITH META DATA HELPERS
// Complete signup flow dengan username dan referral_code di meta data
// =========================================================

import { supabase } from "@/lib/supabase";
import { validateReferralForForm } from "./referralValidationFixed";

// =========================================================
// BASIC SIGNUP WITH META DATA
// =========================================================

/**
 * Basic signup dengan username dan referral_code di meta data
 */
export async function signUpWithMetaData(
  email: string,
  password: string,
  username: string,
  referralCode?: string
): Promise<{
  user: any;
  session: any;
  needsEmailVerification: boolean;
}> {
  try {
    // Validate referral code (jika ada)
    if (referralCode?.trim()) {
      await validateReferralForForm(referralCode);
    }

    // Normalize data
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedReferralCode = referralCode?.trim().toUpperCase();

    // Sign up dengan meta data
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

    return {
      user: data.user,
      session: data.session,
      needsEmailVerification: !data.session // Jika tidak ada session, perlu email verification
    };
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
}

// =========================================================
// ENHANCED SIGNUP WITH VALIDATION
// =========================================================

/**
 * Enhanced signup dengan complete validation
 */
export async function signUpWithCompleteValidation(
  email: string,
  password: string,
  username: string,
  referralCode?: string
): Promise<{
  success: boolean;
  user?: any;
  session?: any;
  needsEmailVerification: boolean;
  message: string;
  nextStep: 'signin' | 'verify_email' | 'dashboard';
}> {
  try {
    // Email validation
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        success: false,
        needsEmailVerification: false,
        message: "Invalid email address",
        nextStep: 'signin'
      };
    }

    // Password validation
    if (!password || password.length < 6) {
      return {
        success: false,
        needsEmailVerification: false,
        message: "Password must be at least 6 characters",
        nextStep: 'signin'
      };
    }

    // Username validation
    if (!username?.trim() || username.length < 3 || username.length > 20) {
      return {
        success: false,
        needsEmailVerification: false,
        message: "Username must be 3-20 characters",
        nextStep: 'signin'
      };
    }

    if (!/^[a-z0-9_.]+$/.test(username.trim().toLowerCase())) {
      return {
        success: false,
        needsEmailVerification: false,
        message: "Username can only contain letters, numbers, and underscores",
        nextStep: 'signin'
      };
    }

    // Validate referral code (jika ada)
    if (referralCode?.trim()) {
      await validateReferralForForm(referralCode);
    }

    // Normalize data
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedReferralCode = referralCode?.trim().toUpperCase();

    // Sign up
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

    if (error) {
      // Handle specific error cases
      if (error.message.includes('User already registered')) {
        return {
          success: false,
          needsEmailVerification: false,
          message: "Email already registered. Please sign in.",
          nextStep: 'signin'
        };
      }
      
      throw error;
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
      needsEmailVerification: !data.session,
      message: data.session 
        ? "Account created successfully!" 
        : "Account created! Please check your email to verify.",
      nextStep: data.session ? 'dashboard' : 'verify_email'
    };
  } catch (error) {
    console.error("Complete signup error:", error);
    return {
      success: false,
      needsEmailVerification: false,
      message: error instanceof Error ? error.message : "Signup failed",
      nextStep: 'signin'
    };
  }
}

// =========================================================
// SIGNUP WITH AUTO PROFILE CREATION
// =========================================================

/**
 * Signup dengan auto profile creation dari meta data
 */
export async function signUpWithAutoProfile(
  email: string,
  password: string,
  username: string,
  referralCode?: string
): Promise<{
  success: boolean;
  user?: any;
  session?: any;
  profile?: any;
  needsEmailVerification: boolean;
  message: string;
  navigationRoute: string;
}> {
  try {
    // Basic signup
    const signupResult = await signUpWithCompleteValidation(
      email,
      password,
      username,
      referralCode
    );

    if (!signupResult.success) {
      return {
        ...signupResult,
        profile: undefined,
        navigationRoute: '/signin'
      };
    }

    // Jika session ada, coba create profile dari meta data
    let profile = null;
    let navigationRoute = signupResult.nextStep === 'dashboard' ? '/member/dashboard' : '/signin';

    if (signupResult.session) {
      try {
        const { data: profileData } = await supabase.rpc("create_profile_from_meta", {
          p_user_id: signupResult.user.id
        });

        if (profileData && profileData.length > 0) {
          profile = profileData[0];
          
          // Determine navigation based on profile status
          if (profile.success) {
            navigationRoute = profile.status === 'ACTIVE' ? '/member/dashboard' : '/member/onboarding';
          }
        }
      } catch (profileError) {
        console.error("Profile creation error:", profileError);
        // Continue without profile creation
      }
    }

    return {
      success: true,
      user: signupResult.user,
      session: signupResult.session,
      profile,
      needsEmailVerification: signupResult.needsEmailVerification,
      message: signupResult.message,
      navigationRoute
    };
  } catch (error) {
    console.error("Auto profile signup error:", error);
    return {
      success: false,
      needsEmailVerification: false,
      message: error instanceof Error ? error.message : "Signup failed",
      navigationRoute: '/signin'
    };
  }
}

// =========================================================
// REACT HOOKS
// =========================================================

import { useState, useCallback } from "react";

/**
 * Hook untuk signup form dengan meta data
 */
export function useSignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [referralCode, setReferralCode] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setEmail("");
    setPassword("");
    setUsername("");
    setReferralCode("");
    setError(null);
    setSuccess(null);
  }, []);

  const signUp = useCallback(async (
    options: {
      validateOnly?: boolean;
      autoProfile?: boolean;
    } = {}
  ) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let result;
      
      if (options.autoProfile) {
        result = await signUpWithAutoProfile(email, password, username, referralCode);
      } else {
        result = await signUpWithCompleteValidation(email, password, username, referralCode);
      }

      if (result.success) {
        setSuccess(result.message);
        return result;
      } else {
        setError(result.message);
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Signup failed";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [email, password, username, referralCode]);

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
    resetForm
  };
}

// =========================================================
// FORM VALIDATION HELPERS
// =========================================================

/**
 * Real-time form validation
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
} {
  const errors: any = {};

  // Email validation
  if (!email?.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Invalid email format";
  }

  // Password validation
  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  // Username validation
  if (!username?.trim()) {
    errors.username = "Username is required";
  } else if (username.length < 3 || username.length > 20) {
    errors.username = "Username must be 3-20 characters";
  } else if (!/^[a-z0-9_.]+$/.test(username.trim().toLowerCase())) {
    errors.username = "Only letters, numbers, and underscores allowed";
  }

  // Referral validation (optional)
  if (referralCode?.trim() && !/^[A-Z0-9-]+$/.test(referralCode.trim().toUpperCase())) {
    errors.referral = "Invalid referral code format";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// =========================================================
// USAGE EXAMPLES
// =========================================================

/*
// 1. Basic usage (sesuai contoh Anda):
await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      username,
      referral_code: referralCode
    }
  }
});

// 2. Dengan helper function:
const result = await signUpWithMetaData(
  'user@example.com',
  'password123',
  'johndoe',
  'TPC-ABC123'
);

if (result.needsEmailVerification) {
  navigate('/verify-email');
} else {
  navigate('/member/dashboard');
}

// 3. Dengan complete validation:
const result = await signUpWithCompleteValidation(
  email,
  password,
  username,
  referralCode
);

if (result.success) {
  setSuccess(result.message);
  if (result.nextStep === 'verify_email') {
    navigate('/verify-email');
  } else if (result.nextStep === 'dashboard') {
    navigate('/member/dashboard');
  }
}

// 4. Dengan auto profile creation:
const result = await signUpWithAutoProfile(
  email,
  password,
  username,
  referralCode
);

if (result.success) {
  navigate(result.navigationRoute);
}

// 5. Dalam React component:
const {
  email, setEmail,
  password, setPassword,
  username, setUsername,
  referralCode, setReferralCode,
  isLoading, error, success,
  signUp
} = useSignUpForm();

const handleSubmit = async (e) => {
  e.preventDefault();
  const result = await signUp({ autoProfile: true });
  if (result) {
    navigate(result.navigationRoute);
  }
};

// Form validation:
const { isValid, errors } = validateSignUpForm(email, password, username, referralCode);
*/
