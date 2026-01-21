import { supabase } from './supabase';

export async function requireAdmin() {
  const { data: session } = await supabase.auth.getSession();
  const uid = session.session?.user?.id;
  if (!uid) return false;

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", uid)
    .maybeSingle();

  return data?.role === "admin" || data?.role === "super_admin";
}
