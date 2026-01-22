export const AUTH_ERRORS = {
  invalidCredentials: "Invalid email or password.",
  emailNotConfirmed: "Please verify your email before signing in.",
  generic: "Something went wrong. Please try again."
} as const;

export type AuthErrorKey = keyof typeof AUTH_ERRORS;

export function getAuthErrorMessage(error: any): string {
  // Handle Supabase specific error codes
  if (error?.message?.includes('Invalid login credentials')) {
    return AUTH_ERRORS.invalidCredentials;
  }
  
  if (error?.message?.includes('Email not confirmed')) {
    return AUTH_ERRORS.emailNotConfirmed;
  }
  
  // Handle custom error messages
  if (error?.message) {
    const message = error.message.toLowerCase();
    
    if (message.includes('invalid') && message.includes('credential')) {
      return AUTH_ERRORS.invalidCredentials;
    }
    
    if (message.includes('email') && message.includes('confirm')) {
      return AUTH_ERRORS.emailNotConfirmed;
    }
  }
  
  // Default to generic error
  return AUTH_ERRORS.generic;
}

export function isAuthError(error: any, type: AuthErrorKey): boolean {
  return getAuthErrorMessage(error) === AUTH_ERRORS[type];
}
