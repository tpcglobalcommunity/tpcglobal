// =========================================================
// REFERRAL VALIDATION HELPERS
// Frontend helpers untuk validate_referral_code_public RPC
// =========================================================

import { supabase } from "../lib/supabase";

// =========================================================
// BASIC VALIDATION
// =========================================================

/**
 * Basic referral validation (BOOLEAN response)
 * Menggunakan validate_referral_code_public yang sudah ada
 */
export async function validateReferralCodeBasic(code: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc("validate_referral_code_public", {
      p_code: code.trim().toUpperCase()
    });
    
    if (error) {
      console.error("validate_referral_code_public error:", error);
      return false;
    }
    
    return Boolean(data);
  } catch (error) {
    console.error("Referral validation error:", error);
    return false;
  }
}

// =========================================================
// ENHANCED VALIDATION (dengan referrer info)
// =========================================================

/**
 * Enhanced validation dengan referrer info
 * Menggunakan custom RPC untuk detail info
 */
export async function validateReferralCodeWithInfo(code: string): Promise<{
  is_valid: boolean;
  referrer_id: string | null;
  referrer_username: string | null;
  referrer_member_code: string | null;
}> {
  try {
    // Cek basic validation dulu
    const isValid = await validateReferralCodeBasic(code);
    
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
// LIVE VALIDATION HOOK
// =========================================================

import { useState, useEffect } from "react";

export function useReferralValidation() {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [referrerInfo, setReferrerInfo] = useState<{
    username: string | null;
    member_code: string | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateReferral = async (code: string) => {
    if (!code.trim()) {
      setIsValid(null);
      setReferrerInfo(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await validateReferralCodeWithInfo(code);
      setIsValid(result.is_valid);
      
      if (result.is_valid) {
        setReferrerInfo({
          username: result.referrer_username,
          member_code: result.referrer_member_code
        });
      } else {
        setReferrerInfo(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Validation failed");
      setIsValid(false);
      setReferrerInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isValid,
    isLoading,
    referrerInfo,
    error,
    validateReferral
  };
}

// =========================================================
// DEBOUNCED VALIDATION
// =========================================================

import { useCallback } from "react";

export function useDebouncedReferralValidation(delay = 500) {
  const [state, setState] = useState({
    isValid: false,
    isLoading: false,
    referrerInfo: null as any,
    error: null as string | null
  });

  const debouncedValidate = useCallback(
    async (code: string) => {
      if (!code.trim()) {
        setState({
          isValid: false,
          isLoading: false,
          referrerInfo: null,
          error: null
        });
        return;
      }

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Debounce logic
      const timeoutId = setTimeout(async () => {
        try {
          const result = await validateReferralCodeWithInfo(code);
          setState({
            isValid: result.is_valid,
            isLoading: false,
            referrerInfo: result.is_valid ? {
              username: result.referrer_username,
              member_code: result.referrer_member_code
            } : null,
            error: null
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

  return {
    referralCode,
    setReferralCode: handleChange,
    reset,
    validation: {
      isValid: validation.isValid,
      isLoading: validation.isLoading,
      referrerInfo: validation.referrerInfo,
      error: validation.error
    }
  };
}

// =========================================================
// UI HELPERS
// =========================================================

export function getReferralValidationMessage(validation: {
  isValid: boolean | null;
  isLoading: boolean;
  referrerInfo: { username: string | null; member_code: string | null } | null;
  error: string | null;
}): string {
  if (validation.isLoading) {
    return "Checking referral code...";
  }

  if (validation.error) {
    return `Error: ${validation.error}`;
  }

  if (validation.isValid === null) {
    return "Enter a referral code (optional)";
  }

  if (validation.isValid && validation.referrerInfo) {
    const displayName = validation.referrerInfo.username || 
                      validation.referrerInfo.member_code || 
                      "Valid referrer";
    return `✅ Valid • Upline: ${displayName}`;
  }

  if (!validation.isValid) {
    return "❌ Invalid referral code";
  }

  return "Enter a referral code (optional)";
}

export function getReferralValidationColor(validation: {
  isValid: boolean | null;
  isLoading: boolean;
  error: string | null;
}): string {
  if (validation.isLoading) {
    return "text-white/60";
  }

  if (validation.error) {
    return "text-red-400";
  }

  if (validation.isValid === true) {
    return "text-green-400";
  }

  if (validation.isValid === false) {
    return "text-red-400";
  }

  return "text-white/40";
}

// =========================================================
// USAGE EXAMPLES
// =========================================================

/*
// Basic usage in component:
const { isValid, isLoading, referrerInfo, validateReferral } = useReferralValidation();

useEffect(() => {
  validateReferral("TPC-ABC123");
}, []);

// Form integration:
const { referralCode, setReferralCode, validation } = useReferralForm();

// In JSX:
<input
  value={referralCode}
  onChange={(e) => setReferralCode(e.target.value)}
  placeholder="Enter referral code"
/>
<div className={`text-sm ${getReferralValidationColor(validation)}`}>
  {getReferralValidationMessage(validation)}
</div>

// Direct API call:
const isValid = await validateReferralCodeBasic("TPC-ABC123");
const details = await validateReferralCodeWithInfo("TPC-ABC123");
*/
