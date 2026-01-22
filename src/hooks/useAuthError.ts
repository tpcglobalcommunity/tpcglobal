import { useState } from "react";
import { getAuthErrorMessage, AUTH_ERRORS, type AuthErrorKey } from "../lib/auth-errors";

export function useAuthError() {
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<AuthErrorKey | null>(null);

  const handleError = (error: any) => {
    const message = getAuthErrorMessage(error);
    const type = Object.keys(AUTH_ERRORS).find(
      (key) => AUTH_ERRORS[key as AuthErrorKey] === message
    ) as AuthErrorKey | null;

    setError(message);
    setErrorType(type);
  };

  const clearError = () => {
    setError(null);
    setErrorType(null);
  };

  const setCustomError = (message: string) => {
    setError(message);
    setErrorType('generic');
  };

  return {
    error,
    errorType,
    handleError,
    clearError,
    setCustomError,
    hasError: error !== null,
    isInvalidCredentials: errorType === 'invalidCredentials',
    isEmailNotConfirmed: errorType === 'emailNotConfirmed',
    isGenericError: errorType === 'generic'
  };
}
