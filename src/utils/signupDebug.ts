import { supabase } from '../lib/supabase';

interface SignupData {
  email: string;
  password: string;
  username: string;
  referralCode: string;
}

interface SignupResult {
  success: boolean;
  user?: any;
  error?: string;
  debug?: any;
}

export async function signUpWithDebug({
  email,
  password,
  username,
  referralCode
}: SignupData): Promise<SignupResult> {
  const debug: any = {
    timestamp: new Date().toISOString(),
    input: {
      email,
      username: username.trim().toLowerCase(),
      referralCode: referralCode.trim().toUpperCase(),
      passwordLength: password.length
    },
    steps: [] as string[]
  };

  try {
    debug.steps.push('Starting signup process');
    
    // Step 1: Validate referral code first
    debug.steps.push('Validating referral code');
    const { data: referralData, error: referralError } = await supabase.rpc(
      'validate_referral_code_public',
      { p_referral_code: referralCode.trim().toUpperCase() }
    );

    debug.referralValidation = {
      data: referralData,
      error: referralError
    };

    if (referralError) {
      debug.steps.push('Referral validation failed');
      return {
        success: false,
        error: `Referral validation error: ${referralError.message}`,
        debug
      };
    }

    if (!referralData || referralData.length === 0 || !referralData[0].is_valid) {
      debug.steps.push('Invalid referral code');
      return {
        success: false,
        error: 'Invalid referral code',
        debug
      };
    }

    debug.steps.push('Referral code valid');
    debug.referrerInfo = referralData[0];

    // Step 2: Attempt signup
    debug.steps.push('Attempting Supabase signup');
    
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          username: username.trim().toLowerCase(),
          referral_code: referralCode.trim().toUpperCase()
        }
      }
    });

    debug.signupResult = {
      data,
      error
    };

    console.log('🔍 SIGNUP DEBUG:', debug);

    if (error) {
      debug.steps.push('Signup failed');
      return {
        success: false,
        error: error.message,
        debug
      };
    }

    debug.steps.push('Signup successful');
    
    // Step 3: Verify profile creation (optional)
    if (data.user) {
      debug.steps.push('Verifying profile creation');
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      debug.profileVerification = {
        data: profile,
        error: profileError
      };

      if (profileError) {
        debug.steps.push('Profile verification failed');
        console.warn('⚠️ Profile creation issue:', profileError);
      } else {
        debug.steps.push('Profile created successfully');
      }
    }

    return {
      success: true,
      user: data.user,
      debug
    };

  } catch (err: any) {
    debug.steps.push('Unexpected error');
    debug.unexpectedError = err;
    
    console.error('💥 SIGNUP CRASH:', debug);
    
    return {
      success: false,
      error: err?.message || 'Unknown error occurred',
      debug
    };
  }
}

// Helper untuk format debug output
export function formatDebugOutput(debug: any): string {
  return `
🔍 SIGNUP DEBUG REPORT
==================
Timestamp: ${debug.timestamp}
Input: ${JSON.stringify(debug.input, null, 2)}
Steps: ${debug.steps.join(' → ')}
Referral Validation: ${JSON.stringify(debug.referralValidation, null, 2)}
Signup Result: ${JSON.stringify(debug.signupResult, null, 2)}
Profile Verification: ${JSON.stringify(debug.profileVerification, null, 2)}
  `.trim();
}
