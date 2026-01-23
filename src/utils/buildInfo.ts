export const BUILD_ID =
  (import.meta as any)?.env?.VITE_BUILD_ID ||
  (import.meta as any)?.env?.MODE ||
  "unknown";
