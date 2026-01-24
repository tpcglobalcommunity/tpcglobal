import { createClient } from '@supabase/supabase-js';
import { User } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export interface AuthState {
  isAuthed: boolean;
  isEmailVerified: boolean;
  user: User | null;
  loading: boolean;
}

export const AUTH_PATHS = [
  '/login',
  '/signup', 
  '/forgot',
  '/verify',
  '/invite',
  '/magic'
] as const;

export async function getAuthState(): Promise<AuthState> {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return {
        isAuthed: false,
        isEmailVerified: false,
        user: null,
        loading: false
      };
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        isAuthed: false,
        isEmailVerified: false,
        user: null,
        loading: false
      };
    }

    return {
      isAuthed: true,
      isEmailVerified: !!user.email_confirmed_at,
      user,
      loading: false
    };
  } catch (error) {
    console.error('Auth state check error:', error);
    return {
      isAuthed: false,
      isEmailVerified: false,
      user: null,
      loading: false
    };
  }
}

export function isAuthPath(pathname: string): boolean {
  const normalizedPath = pathname.replace(/^\/(en|id)/, '');
  return AUTH_PATHS.some(authPath => normalizedPath.startsWith(authPath));
}

export function getLanguageFromPath(pathname: string): 'en' | 'id' {
  const match = pathname.match(/^\/(en|id)(?:\/|$)/);
  return (match?.[1] as 'en' | 'id') || 'en';
}

export function stripLang(pathname: string): string {
  return pathname.replace(/^\/(en|id)/, '') || '/';
}

export function ensureLangPath(lang: 'en' | 'id', pathWithoutLang: string): string {
  const cleanPath = pathWithoutLang.startsWith('/') ? pathWithoutLang : `/${pathWithoutLang}`;
  return `/${lang}${cleanPath === '/' ? '' : cleanPath}`;
}

export function getAuthRedirectPath(authState: AuthState, currentLang: 'en' | 'id'): string {
  if (!authState.isAuthed) {
    return ensureLangPath(currentLang, '/login');
  }
  
  if (!authState.isEmailVerified) {
    return ensureLangPath(currentLang, '/verify');
  }
  
  // For verified users, redirect to update-profit after login
  return ensureLangPath(currentLang, '/member/update-profit');
}

export async function signOutIfUnverified(): Promise<void> {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const authState = await getAuthState();
  
  if (authState.isAuthed && !authState.isEmailVerified) {
    await supabase.auth.signOut();
  }
}
