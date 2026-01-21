// Supabase Error Mapping untuk user-friendly messages
// Tujuan: User tahu persis harus ngapain

export interface ErrorMapping {
  code: string;
  message: string;
  action?: string;
}

const errorMappings: Record<string, ErrorMapping> = {
  // Authentication Errors
  'user_already_registered': {
    code: 'user_already_registered',
    message: 'Email already in use',
    action: 'Try signing in with this email or use a different email address'
  },
  
  'invalid_credentials': {
    code: 'invalid_credentials',
    message: 'Wrong email or password',
    action: 'Check your email and password and try again'
  },
  
  'email_rate_limit_exceeded': {
    code: 'email_rate_limit_exceeded',
    message: 'Too many requests — wait a moment',
    action: 'Please wait a few minutes before trying again'
  },
  
  'invalid_email': {
    code: 'invalid_email',
    message: 'Invalid email address',
    action: 'Please enter a valid email address'
  },
  
  'weak_password': {
    code: 'weak_password',
    message: 'Password is too weak',
    action: 'Password must be at least 8 characters with mixed letters and numbers'
  },

  // Network/Connection Errors
  'fetch_failed': {
    code: 'fetch_failed',
    message: 'Connection issue',
    action: 'Check your internet connection and try again'
  },
  
  'network_error': {
    code: 'network_error',
    message: 'Connection issue',
    action: 'Check your internet connection and try again'
  },
  
  'timeout': {
    code: 'timeout',
    message: 'Connection issue',
    action: 'Request timed out. Please check your connection and try again'
  },

  // Database/Server Errors
  'database_error': {
    code: 'database_error',
    message: 'Server error occurred',
    action: 'Please try again. If the problem persists, contact support'
  },
  
  'server_error': {
    code: 'server_error',
    message: 'Server error occurred',
    action: 'Please try again. If the problem persists, contact support'
  },

  // Rate Limiting
  'too_many_requests': {
    code: 'too_many_requests',
    message: 'Too many requests — wait a moment',
    action: 'Please wait a few minutes before trying again'
  },

  'rate_limit_exceeded': {
    code: 'rate_limit_exceeded',
    message: 'Too many requests — wait a moment',
    action: 'Please wait a few minutes before trying again'
  },

  // Generic Errors
  'unknown_error': {
    code: 'unknown_error',
    message: 'An error occurred',
    action: 'Please try again. If the problem persists, contact support'
  },

  'validation_failed': {
    code: 'validation_failed',
    message: 'Invalid information provided',
    action: 'Please check your information and try again'
  },

  'signup_disabled': {
    code: 'signup_disabled',
    message: 'Sign up is currently disabled',
    action: 'Please try again later'
  }
};

/**
 * Map Supabase error to user-friendly message
 */
export const mapSupabaseError = (error: any): ErrorMapping => {
  if (!error) {
    return errorMappings.unknown_error;
  }

  // Try to extract error code from various possible locations
  const errorCode = error.code || error.error_code || error.message?.toLowerCase() || '';
  
  // Direct code match
  if (errorMappings[errorCode]) {
    return errorMappings[errorCode];
  }

  // Fuzzy matching for error messages
  const errorMessage = (error.message || '').toLowerCase();
  
  for (const [key, mapping] of Object.entries(errorMappings)) {
    if (errorMessage.includes(key.toLowerCase())) {
      return mapping;
    }
  }

  // Default fallback
  return errorMappings.unknown_error;
};

/**
 * Get user-friendly error message with action suggestion
 */
export const getErrorMessage = (error: any): string => {
  const mapping = mapSupabaseError(error);
  return mapping.message;
};

/**
 * Get action suggestion for error
 */
export const getErrorAction = (error: any): string | undefined => {
  const mapping = mapSupabaseError(error);
  return mapping.action;
};

/**
 * Get complete error info for display
 */
export const getErrorInfo = (error: any): {
  code: string;
  message: string;
  action?: string;
} => {
  const mapping = mapSupabaseError(error);
  return {
    code: mapping.code,
    message: mapping.message,
    action: mapping.action
  };
};

export default errorMappings;
