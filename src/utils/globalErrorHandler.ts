/**
 * Global Error Handler - TPC Global
 * Catches and isolates errors from browser extensions and external scripts
 */

// Store original console methods
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// Extension error patterns to ignore
const EXTENSION_ERROR_PATTERNS = [
  /solanaActionsContentScript/i,
  /phantom/i,
  /metamask/i,
  /wallet/i,
  /extension/i,
  /chrome-extension/i,
  /moz-extension/i,
  /safari-extension/i,
  /web3/i,
  /ethereum/i,
];

// Check if error is from browser extension
function isExtensionError(error: any): boolean {
  const errorString = String(error?.message || error?.stack || error || '');
  return EXTENSION_ERROR_PATTERNS.some(pattern => pattern.test(errorString));
}

// Safe error logging - filters extension errors
function safeLogError(...args: any[]) {
  const [firstArg, ...rest] = args;
  
  // Check if this is an extension error
  if (isExtensionError(firstArg)) {
    // Log as warning instead of error
    originalConsoleWarn('[Extension Error Filtered]', firstArg, ...rest);
    return;
  }
  
  // Log normal errors
  originalConsoleError(firstArg, ...rest);
}

// Enhanced error handler for unhandled errors
function handleGlobalError(event: ErrorEvent) {
  // Filter extension errors
  if (isExtensionError(event.error)) {
    console.warn('[Global Extension Error Filtered]', event.error);
    event.preventDefault();
    return false;
  }
  
  // Log normal errors
  console.error('[Global Error]', event.error);
  return false;
}

// Enhanced error handler for unhandled promise rejections
function handleUnhandledRejection(event: PromiseRejectionEvent) {
  // Filter extension errors
  if (isExtensionError(event.reason)) {
    console.warn('[Extension Promise Rejection Filtered]', event.reason);
    event.preventDefault();
    return false;
  }
  
  // Log normal promise rejections
  console.error('[Unhandled Promise Rejection]', event.reason);
  return false;
}

// Install global error handlers
export function installGlobalErrorHandlers() {
  // Override console.error with safe version
  console.error = safeLogError;
  
  // Add global error listeners
  window.addEventListener('error', handleGlobalError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);
  
  console.info('[Global Error Handlers] Installed');
}

// Remove global error handlers (for cleanup)
export function removeGlobalErrorHandlers() {
  // Restore original console.error
  console.error = originalConsoleError;
  
  // Remove global error listeners
  window.removeEventListener('error', handleGlobalError);
  window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  
  console.info('[Global Error Handlers] Removed');
}

// Export for testing
export { isExtensionError, safeLogError };
