export const BUILD_SHA =
  (import.meta as any)?.env?.CF_PAGES_COMMIT_SHA ||
  (import.meta as any)?.env?.VITE_BUILD_SHA ||
  "dev-local";

export const BUILD_TIME = new Date().toISOString();
export const BUILD_ID = `${BUILD_SHA.slice(0, 7)}-${BUILD_TIME.replace(/[:.]/g, "").slice(0, 15)}`;
