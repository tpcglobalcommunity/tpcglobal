/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_BUILD_TIME: string;
  readonly CF_PAGES_COMMIT_SHA: string;
  readonly CF_PAGES_BUILD_ID: string;
  // Add other ENV variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
