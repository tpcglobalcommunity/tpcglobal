import { supabase } from "./supabase";
import { ensureLangPath, detectLangFromPath } from "../utils/langPath";

export type Lang = "en" | "id";

export interface AuthState {
  isAuthed: boolean;
  isEmailVerified: boolean;
  user: any | null;
}

/**
 * Get current authentication state
 */
export async function getAuthState(): Promise<AuthState> {
  try {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user ?? null;
    
    return {
      isAuthed: !!user,
      isEmailVerified: Boolean(user?.email_confirmed_at),
      user,
    };
  } catch {
    return {
      isAuthed: false,
      isEmailVerified: false,
      user: null,
    };
  }
}

/**
 * Extract language from pathname
 */
export function getLanguageFromPath(pathname: string): Lang {
  const detected = detectLangFromPath(pathname);
  return (detected as Lang) || "en";
}

/**
 * REQUIRED EXPORT — used by SignIn.tsx
 * Overload for backward compatibility
 */
export async function getAuthRedirectPath(lang: Lang): Promise<string>;
export async function getAuthRedirectPath(authState: AuthState, lang: Lang): Promise<string>;
export async function getAuthRedirectPath(authStateOrLang: AuthState | Lang, lang?: Lang): Promise<string> {
  try {
    // Handle backward compatibility: single param (lang)
    if (typeof authStateOrLang === "string") {
      const authState = await getAuthState();
      const targetLang = authStateOrLang;
      
      if (!authState.isAuthed) {
        return ensureLangPath(targetLang, "/login");
      }

      if (!authState.isEmailVerified) {
        return ensureLangPath(targetLang, "/verify");
      }

      return ensureLangPath(targetLang, "/member/update-profit");
    }
    
    // Handle new signature: (authState, lang)
    const authState = authStateOrLang;
    const targetLang = lang!;
    
    if (!authState.isAuthed) {
      return ensureLangPath(targetLang, "/login");
    }

    if (!authState.isEmailVerified) {
      return ensureLangPath(targetLang, "/verify");
    }

    return ensureLangPath(targetLang, "/member/update-profit");
  } catch {
    const fallbackLang = typeof authStateOrLang === "string" ? authStateOrLang : lang || "en";
    return ensureLangPath(fallbackLang, "/login");
  }
}
