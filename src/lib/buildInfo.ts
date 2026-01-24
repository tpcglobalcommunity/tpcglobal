declare const __BUILD_SHA__: string;
declare const __BUILD_ID__: string;
declare const __BUILD_TIME__: string;

export type BuildInfo = {
  sha: string;
  id: string;
  time: string;
};

export function getBuildInfo(): BuildInfo {
  return {
    sha: typeof __BUILD_SHA__ !== "undefined" ? __BUILD_SHA__ : (import.meta.env.CF_PAGES_COMMIT_SHA || "dev"),
    id: typeof __BUILD_ID__ !== "undefined" ? __BUILD_ID__ : (import.meta.env.CF_PAGES_BUILD_ID || ""),
    time: typeof __BUILD_TIME__ !== "undefined" ? __BUILD_TIME__ : (import.meta.env.VITE_BUILD_TIME || new Date().toISOString())
  };
}

// Legacy exports for backward compatibility
export const BUILD_SHA = getBuildInfo().sha;
export const BUILD_ID = getBuildInfo().id;
export const BUILD_TIME = getBuildInfo().time;
