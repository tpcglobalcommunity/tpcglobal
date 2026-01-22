# Authentication Error Handling

This document explains how to use the authentication error handling system in the TPC application.

## Error Types

The system supports three main error types:

```typescript
export const AUTH_ERRORS = {
  invalidCredentials: "Invalid email or password.",
  emailNotConfirmed: "Please verify your email before signing in.",
  generic: "Something went wrong. Please try again."
} as const;
```

## Usage Examples

### 1. Using the useAuthError Hook

```typescript
import { useAuthError } from "../../hooks/useAuthError";

function SignInPage() {
  const { error, handleError, clearError, hasError, isEmailNotConfirmed } = useAuthError();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await signIn({ email, password });
      // Success handling
    } catch (err) {
      handleError(err); // Automatically categorizes and sets appropriate error message
    }
  };

  return (
    <div>
      {hasError && (
        <div className="error-message">
          {error}
          {isEmailNotConfirmed && (
            <button onClick={resendVerificationEmail}>
              Resend verification email
            </button>
          )}
        </div>
      )}
    </div>
  );
}
```

### 2. Manual Error Handling

```typescript
import { getAuthErrorMessage, isAuthError } from "../../lib/auth-errors";

function handleAuthError(error: any) {
  const message = getAuthErrorMessage(error);
  
  if (isAuthError(error, 'emailNotConfirmed')) {
    // Handle email confirmation required
    showResendVerificationOption();
  } else if (isAuthError(error, 'invalidCredentials')) {
    // Handle invalid credentials
    showPasswordResetOption();
  } else {
    // Handle generic error
    showGenericError(message);
  }
}
```

### 3. Custom Error Messages

```typescript
import { useAuthError } from "../../hooks/useAuthError";

function CustomAuthComponent() {
  const { setCustomError } = useAuthError();

  const handleCustomError = () => {
    setCustomError("Custom error message for specific scenario");
  };
}
```

## Hook API

### useAuthError() Returns

```typescript
{
  error: string | null,           // Current error message
  errorType: AuthErrorKey | null, // Current error type
  handleError: (error: any) => void, // Handle and categorize error
  clearError: () => void,         // Clear current error
  setCustomError: (message: string) => void, // Set custom error
  hasError: boolean,              // Whether there's an active error
  isInvalidCredentials: boolean,   // Whether error is invalid credentials
  isEmailNotConfirmed: boolean,    // Whether error is email not confirmed
  isGenericError: boolean         // Whether error is generic
}
```

## Error Detection Logic

The system automatically detects errors based on:

1. **Supabase Error Messages**: Standard Supabase auth error codes
2. **Custom Error Messages**: Application-specific error messages
3. **Message Content Analysis**: Pattern matching in error messages

### Detection Rules

- `invalidCredentials`: 
  - "Invalid login credentials"
  - Messages containing "invalid" and "credential"

- `emailNotConfirmed`:
  - "Email not confirmed"
  - Messages containing "email" and "confirm"

- `generic`: All other errors

## Best Practices

1. **Always clear errors before new operations**
   ```typescript
   clearError();
   await performAuthOperation();
   ```

2. **Use specific error type checks for UX**
   ```typescript
   {isEmailNotConfirmed && <ResendVerificationLink />}
   ```

3. **Provide contextual actions based on error types**
   ```typescript
   {isInvalidCredentials && <ForgotPasswordLink />}
   ```

4. **Handle loading states properly**
   ```typescript
   const [loading, setLoading] = useState(false);
   
   const handleSubmit = async () => {
     setLoading(true);
     clearError();
     try {
       await signIn();
     } catch (err) {
       handleError(err);
     } finally {
       setLoading(false);
     }
   };
   ```

## Integration with Existing Components

### SignIn.tsx Integration
```typescript
// Replace existing error handling
const { error, handleError, clearError } = useAuthError();

const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  clearError();
  setSubmitting(true);
  try {
    await signIn({ email: email.trim(), password });
    window.location.assign(nextUrl);
  } catch (err: any) {
    handleError(err); // Automatic error categorization
  } finally {
    setSubmitting(false);
  }
};
```

### SignUp.tsx Integration
```typescript
const { error, handleError, clearError } = useAuthError();

const handleSignUp = async () => {
  clearError();
  try {
    await signUp({ email, password });
  } catch (err) {
    handleError(err);
  }
};
```

## File Structure

```
src/
├── lib/
│   └── auth-errors.ts          # Error definitions and utilities
├── hooks/
│   └── useAuthError.ts         # Custom hook for error management
├── pages/auth/
│   ├── SignIn.tsx             # Updated with new error handling
│   └── SignUp.tsx             # Updated with new error handling
└── docs/
    └── auth-error-handling.md   # This documentation
```

## Benefits

1. **Consistent Error Messages**: Standardized error text across the app
2. **Automatic Error Categorization**: Smart detection of error types
3. **Better UX**: Contextual actions based on error types
4. **Type Safety**: Full TypeScript support
5. **Reusable**: Easy to use across all auth components
6. **Maintainable**: Centralized error handling logic
