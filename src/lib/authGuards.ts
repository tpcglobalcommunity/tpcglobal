import type { User } from "@supabase/supabase-js";

export type AuthState = {
  user: User | null;
  loading: boolean;
};

export function requireAuth(user: User | null): boolean {
  return !!user;
}

export function requireGuest(user: User | null): boolean {
  return !user;
}
