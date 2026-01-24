// Form validation utilities for signup
export interface FormErrors {
  inviteCode?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export interface FormTouched {
  inviteCode: boolean;
  username: boolean;
  email: boolean;
  password: boolean;
  confirmPassword: boolean;
}

export interface FormState {
  inviteCode: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Validation regex patterns
export const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

// Validation functions
export const validateInviteCode = (code: string, referralEnabled: boolean): string | undefined => {
  if (referralEnabled && !code.trim()) {
    return 'signup.errors.inviteRequired';
  }
  return undefined;
};

export const validateUsername = (username: string): string | undefined => {
  if (!username.trim()) {
    return 'signup.errors.required';
  }
  const normalized = username.trim().toLowerCase();
  if (!USERNAME_REGEX.test(normalized)) {
    return 'signup.errors.usernameFormat';
  }
  return undefined;
};

export const validateEmail = (email: string): string | undefined => {
  if (!email.trim()) {
    return 'signup.errors.required';
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return 'signup.errors.invalidEmail';
  }
  return undefined;
};

export const validatePassword = (password: string): string | undefined => {
  if (!password) {
    return 'signup.errors.required';
  }
  if (password.length < 8) {
    return 'signup.errors.passwordMinLength';
  }
  if (!PASSWORD_REGEX.test(password)) {
    return 'signup.errors.passwordWeak';
  }
  return undefined;
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string | undefined => {
  if (!confirmPassword) {
    return 'signup.errors.required';
  }
  if (password !== confirmPassword) {
    return 'signup.errors.passwordMismatch';
  }
  return undefined;
};

// Comprehensive form validation
export const validateForm = (
  formState: FormState,
  touched: FormTouched,
  referralEnabled: boolean,
  submitAttempted: boolean = false
): FormErrors => {
  const errors: FormErrors = {};

  // Validate invite code if referral is enabled and field is touched or submit attempted
  if (touched.inviteCode || submitAttempted) {
    errors.inviteCode = validateInviteCode(formState.inviteCode, referralEnabled);
  }

  // Validate other fields if touched or submit attempted
  if (touched.username || submitAttempted) {
    errors.username = validateUsername(formState.username);
  }

  if (touched.email || submitAttempted) {
    errors.email = validateEmail(formState.email);
  }

  if (touched.password || submitAttempted) {
    errors.password = validatePassword(formState.password);
  }

  if (touched.confirmPassword || submitAttempted) {
    errors.confirmPassword = validateConfirmPassword(formState.password, formState.confirmPassword);
  }

  return errors;
};

// Check if form is valid for submission
export const isFormValid = (
  formState: FormState,
  referralEnabled: boolean,
  refStatus: 'idle' | 'checking' | 'valid' | 'invalid'
): boolean => {
  const inviteOk = !referralEnabled || refStatus === 'valid';
  
  return (
    inviteOk &&
    USERNAME_REGEX.test(formState.username.trim().toLowerCase()) &&
    EMAIL_REGEX.test(formState.email.trim()) &&
    PASSWORD_REGEX.test(formState.password) &&
    formState.password === formState.confirmPassword
  );
};

// Normalize username helper
export const normalizeUsername = (username: string): string => {
  return username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
};
