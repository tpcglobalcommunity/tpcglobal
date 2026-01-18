const RATE_LIMIT_KEY = 'tpc_auth_attempts';
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

interface AttemptRecord {
  count: number;
  firstAttempt: number;
  lockedUntil?: number;
}

export function checkRateLimit(): {
  allowed: boolean;
  attemptsLeft: number;
  lockedUntil?: number;
} {
  try {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    const now = Date.now();

    if (!stored) {
      return { allowed: true, attemptsLeft: MAX_ATTEMPTS };
    }

    const record: AttemptRecord = JSON.parse(stored);

    if (record.lockedUntil && record.lockedUntil > now) {
      return {
        allowed: false,
        attemptsLeft: 0,
        lockedUntil: record.lockedUntil,
      };
    }

    if (now - record.firstAttempt > RATE_LIMIT_WINDOW) {
      localStorage.removeItem(RATE_LIMIT_KEY);
      return { allowed: true, attemptsLeft: MAX_ATTEMPTS };
    }

    const attemptsLeft = MAX_ATTEMPTS - record.count;
    return {
      allowed: attemptsLeft > 0,
      attemptsLeft,
      lockedUntil: record.lockedUntil,
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    return { allowed: true, attemptsLeft: MAX_ATTEMPTS };
  }
}

export function recordAttempt(): void {
  try {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    const now = Date.now();

    if (!stored) {
      const record: AttemptRecord = {
        count: 1,
        firstAttempt: now,
      };
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(record));
      return;
    }

    const record: AttemptRecord = JSON.parse(stored);

    if (now - record.firstAttempt > RATE_LIMIT_WINDOW) {
      const newRecord: AttemptRecord = {
        count: 1,
        firstAttempt: now,
      };
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(newRecord));
      return;
    }

    record.count += 1;

    if (record.count >= MAX_ATTEMPTS) {
      record.lockedUntil = now + RATE_LIMIT_WINDOW;
    }

    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(record));
  } catch (error) {
    console.error('Record attempt error:', error);
  }
}

export function resetRateLimit(): void {
  try {
    localStorage.removeItem(RATE_LIMIT_KEY);
  } catch (error) {
    console.error('Reset rate limit error:', error);
  }
}

export function safeRedirect(nextPath: string | null, language: 'en' | 'id'): string {
  const defaultPath = `/${language}/member/dashboard`;

  if (!nextPath) {
    return defaultPath;
  }

  try {
    const decoded = decodeURIComponent(nextPath);

    if (!decoded.startsWith('/')) {
      return defaultPath;
    }

    if (decoded.includes('://') || decoded.startsWith('//')) {
      return defaultPath;
    }

    if (decoded.includes('..')) {
      return defaultPath;
    }

    return decoded;
  } catch (error) {
    console.error('Safe redirect error:', error);
    return defaultPath;
  }
}

export function validateUsername(username: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = username.trim();

  if (trimmed.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }

  if (trimmed.length > 30) {
    return { valid: false, error: 'Username must be 30 characters or less' };
  }

  const usernameRegex = /^[a-z0-9_.]+$/;
  if (!usernameRegex.test(trimmed)) {
    return {
      valid: false,
      error: 'Username can only contain lowercase letters, numbers, dots, and underscores',
    };
  }

  return { valid: true };
}

export function mapAuthError(error: any, language: 'en' | 'id'): string {
  const errorMessage = error?.message?.toLowerCase() || '';

  const errors = {
    en: {
      invalidCredentials: 'Invalid email or password',
      emailNotConfirmed: 'Please confirm your email address before signing in',
      emailInUse: 'This email is already registered',
      usernameTaken: 'This username is already taken',
      referralRequired: 'A valid referral code is required to sign up',
      referralInvalid: 'Invalid or revoked referral code',
      tooManyAttempts: 'Too many attempts. Please try again later.',
      generic: 'An error occurred. Please try again.',
    },
    id: {
      invalidCredentials: 'Email atau kata sandi tidak valid',
      emailNotConfirmed: 'Silakan konfirmasi alamat email Anda sebelum masuk',
      emailInUse: 'Email ini sudah terdaftar',
      usernameTaken: 'Nama pengguna ini sudah digunakan',
      referralRequired: 'Kode referral yang valid diperlukan untuk mendaftar',
      referralInvalid: 'Kode referral tidak valid atau dicabut',
      tooManyAttempts: 'Terlalu banyak percobaan. Silakan coba lagi nanti.',
      generic: 'Terjadi kesalahan. Silakan coba lagi.',
    },
  };

  const strings = errors[language];

  if (errorMessage.includes('invalid') || errorMessage.includes('credentials')) {
    return strings.invalidCredentials;
  }

  if (errorMessage.includes('email not confirmed') || errorMessage.includes('confirm')) {
    return strings.emailNotConfirmed;
  }

  if (errorMessage.includes('already') || errorMessage.includes('exists')) {
    return strings.emailInUse;
  }

  if (errorMessage.includes('username')) {
    return strings.usernameTaken;
  }

  if (errorMessage.includes('referral')) {
    return strings.referralInvalid;
  }

  if (errorMessage.includes('rate') || errorMessage.includes('many')) {
    return strings.tooManyAttempts;
  }

  return strings.generic;
}
