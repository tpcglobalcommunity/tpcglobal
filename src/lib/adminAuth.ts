import { supabase } from '../config/supabase';
import { isAdminUser } from '../config/admin';

export async function getCurrentAdminUser() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  if (!isAdminUser(user.id, user.email || undefined)) {
    return null;
  }

  return user;
}

export async function requireAdmin() {
  const user = await getCurrentAdminUser();
  
  if (!user) {
    throw new Error('Admin access required');
  }

  return user;
}

export async function signOut() {
  await supabase.auth.signOut();
}
