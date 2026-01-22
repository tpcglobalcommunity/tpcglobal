// =========================================================
// REFERRAL VALIDATION HELPERS
// Sesuai dengan format response validate_referral_code_public
// =========================================================

import { supabase } from "../lib/supabase";

// =========================================================
// BASIC VALIDATION (sesuai contoh Anda)
// =========================================================

/**
 * Basic referral validation - sesuai format response RPC
 * validate_referral_code_public returns BOOLEAN, bukan object
 */
export async function validateReferralCodePublic(code: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc(
      'validate_referral_code_public',
      { p_referral_code: code.trim().toUpperCase() }
    );

    if (error) {
      console.error("validate_referral_code_public error:", error);
      return false;
    }

    // validate_referral_code_public returns BOOLEAN directly
    return Boolean(data);
  } catch (error) {
    console.error("Referral validation error:", error);
    return false;
  }
}

/**
 * Enhanced validation dengan referrer info
 * Menggunakan query ke profiles table
 */
export async function validateReferralCodeWithInfo(code: string): Promise<{
  is_valid: boolean;
  referrer_id: string | null;
  referrer_username: string | null;
  referrer_member_code: string | null;
}> {
  try {
    // Cek basic validation dulu
    const isValid = await validateReferralCodePublic(code);
    
    if (!isValid) {
      return {
        is_valid: false,
        referrer_id: null,
        referrer_username: null,
        referrer_member_code: null
      };
    }
    
    // Ambil detail referrer
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("member_code", code.trim().toUpperCase())
      .eq("verified", true)
      .single();
    
    if (error || !data) {
      return {
        is_valid: false,
        referrer_id: null,
        referrer_username: null,
        referrer_member_code: null
      };
    }
    
    return {
      is_valid: true,
      referrer_id: data.id,
      referrer_username: data.username,
      referrer_member_code: data.member_code
    };
  } catch (error) {
    console.error("Enhanced validation error:", error);
    return {
      is_valid: false,
      referrer_id: null,
      referrer_username: null,
      referrer_member_code: null
    };
  }
}

// =========================================================
// FORM VALIDATION HELPERS
// =========================================================

/**
 * Validasi referral dengan error handling yang sesuai contoh Anda
 */
export async function validateReferralForForm(referralCode: string): Promise<void> {
  if (!referralCode?.trim()) {
    // Referral code optional, jadi tidak throw error jika kosong
    return;
  }

  const { data } = await supabase.rpc(
    'validate_referral_code_public',
    { p_referral_code: referralCode.trim().toUpperCase() }
  );

  // validate_referral_code_public returns BOOLEAN, bukan array
  if (!data) {
    throw new Error('Invalid referral code');
  }
}

/**
 * Validasi dengan detail response
 */
export async function validateReferralWithDetail(referralCode: string): Promise<{
  isValid: boolean;
  referrerInfo?: {
    id: string;
    username: string | null;
    memberCode: string;
  };
  error?: string;
}> {
  try {
    if (!referralCode?.trim()) {
      return { isValid: true }; // Optional referral
    }

    const isValid = await validateReferralCodePublic(referralCode);
    
    if (!isValid) {
      return { isValid: false, error: 'Invalid referral code' };
    }

    // Get referrer details
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("member_code", referralCode.trim().toUpperCase())
      .eq("verified", true)
      .single();

    if (error || !data) {
      return { isValid: false, error: 'Referrer not found' };
    }

    return {
      isValid: true,
      referrerInfo: {
        id: data.id,
        username: data.username,
        memberCode: data.member_code
      }
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Validation failed'
    };
  }
}

// =========================================================
// REACT HOOKS
// =========================================================

import { useState, useEffect, useCallback } from "react";

/**
 * Hook untuk validasi referral dengan format yang sesuai
 */
export function useReferralValidation() {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [referrerInfo, setReferrerInfo] = useState<{
    id: string;
    username: string | null;
    memberCode: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateReferral = useCallback(async (code: string) => {
    if (!code?.trim()) {
      setIsValid(null);
      setReferrerInfo(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await validateReferralWithDetail(code);
      setIsValid(result.isValid);
      
      if (result.isValid && result.referrerInfo) {
        setReferrerInfo(result.referrerInfo);
      } else {
        setReferrerInfo(null);
      }
      
      if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Validation failed");
      setIsValid(false);
      setReferrerInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isValid,
    isLoading,
    referrerInfo,
    error,
    validateReferral
  };
}

/**
 * Hook dengan debounced validation
 */
export function useDebouncedReferralValidation(delay = 500) {
  const [state, setState] = useState({
    isValid: false,
    isLoading: false,
    referrerInfo: null as any,
    error: null as string | null
  });

  const debouncedValidate = useCallback(
    (code: string) => {
      if (!code?.trim()) {
        setState({
          isValid: false,
          isLoading: false,
          referrerInfo: null,
          error: null
        });
        return;
      }

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const timeoutId = setTimeout(async () => {
        try {
          const result = await validateReferralWithDetail(code);
          setState({
            isValid: result.isValid,
            isLoading: false,
            referrerInfo: result.referrerInfo || null,
            error: result.error || null
          });
        } catch (err) {
          setState({
            isValid: false,
            isLoading: false,
            referrerInfo: null,
            error: err instanceof Error ? err.message : "Validation failed"
          });
        }
      }, delay);

      return () => clearTimeout(timeoutId);
    },
    [delay]
  );

  return {
    ...state,
    validateReferral: debouncedValidate
  };
}

// =========================================================
// FORM INTEGRATION
// =========================================================

/**
 * Hook untuk form integration
 */
export function useReferralForm() {
  const [referralCode, setReferralCode] = useState("");
  const validation = useDebouncedReferralValidation();

  // Auto-validate when code changes
  useEffect(() => {
    validation.validateReferral(referralCode);
  }, [referralCode, validation.validateReferral]);

  const handleChange = (value: string) => {
    setReferralCode(value);
  };

  const reset = () => {
    setReferralCode("");
  };

  const validateAndThrow = async () => {
    await validateReferralForForm(referralCode);
  };

  return {
    referralCode,
    setReferralCode: handleChange,
    reset,
    validateAndThrow,
    validation: {
      isValid: validation.isValid,
      isLoading: validation.isLoading,
      referrerInfo: validation.referrerInfo,
      error: validation.error
    }
  };
}

// =========================================================
// USAGE EXAMPLES
// =========================================================

/*
// 1. Basic usage (sesuai contoh Anda):
const { data } = await supabase.rpc(
  'validate_referral_code_public',
  { p_referral_code: referralCode }
);

if (!data) {  // validate_referral_code_public returns BOOLEAN
  throw new Error('Invalid referral code');
}

// 2. Dengan helper function:
try {
  await validateReferralForForm(referralCode);
  // Lanjutkan proses
} catch (error) {
  console.error(error.message);
}

// 3. Dengan detail validation:
const result = await validateReferralWithDetail(referralCode);
if (result.isValid) {
  console.log('Referrer:', result.referrerInfo);
}

// 4. Dalam React component:
const { referralCode, setReferralCode, validation } = useReferralForm();

// Form submission:
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await validation.validateAndThrow();
    // Submit form
  } catch (error) {
    setError(error.message);
  }
};

// JSX:
<input
  value={referralCode}
  onChange={(e) => setReferralCode(e.target.value)}
  placeholder="Referral code (optional)"
/>
{validation.error && (
  <div className="text-red-400 text-sm">{validation.error}</div>
)}
{validation.referrerInfo && (
  <div className="text-green-400 text-sm">
    Valid referrer: {validation.referrerInfo.username || validation.referrerInfo.memberCode}
  </div>
)}
*/
