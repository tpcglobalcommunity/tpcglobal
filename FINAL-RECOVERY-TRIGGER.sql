CREATE OR REPLACE FUNCTION public.final_recovery_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER AS $$
BEGIN
  -- INSERT MINIMALIS: Hanya kolom yang pasti aman
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    username, 
    role, 
    can_invite,
    referral_code
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'fullName', 'Member'),
    COALESCE(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 5)),
    'member',
    true,
    'TPC-' || upper(substr(new.id::text, 1, 6))
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Jika tetap gagal, biarkan user terbuat di auth.users tanpa profil
  -- (Aplikasi Anda punya MemberGuard yang bisa handle ini nanti)
  RETURN new; 
END;
$$;

-- Pasang Trigger Baru
CREATE TRIGGER on_auth_user_created_recovery
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.final_recovery_trigger();
