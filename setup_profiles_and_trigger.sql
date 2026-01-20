-- 1. Pastikan kolom yang dibutuhkan tersedia di tabel profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS referral_code TEXT, -- Kode milik Upline
ADD COLUMN IF NOT EXISTS member_code TEXT UNIQUE; -- Kode milik Member Baru

-- 2. Fungsi Trigger dengan penanganan error (Anti-Error 500)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, referral_code, member_code, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'referral_code',
    'TPC-' || UPPER(substr(md5(random()::text), 1, 6)), -- Generate Member Code Otomatis
    'member',
    'PENDING'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW; -- Tetap kembalikan NEW agar Auth sukses meski profil gagal (Mencegah Error 500)
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
