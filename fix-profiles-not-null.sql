-- Fix profiles table NOT NULL constraints - TARGETED FIX
-- HANYA drop NOT NULL untuk kolom yang benar-benar menyebabkan signup gagal
-- JANGAN drop kolom yang wajib bisnis (username, email, dll)

-- STEP 1: Lihat hasil diagnosis dulu!
-- Jalankan query di atas untuk lihat kolom mana yang is_nullable = 'NO'

-- STEP 2: Drop NOT NULL hanya untuk kolom lokasi yang umumnya tidak wajib saat signup
-- Uncomment dan jalankan hanya kolom yang benar-benar NO dari hasil diagnosis

/*
-- CONTOH: Jika diagnosis menunjukkan city, province, country adalah NOT NULL:
ALTER TABLE public.profiles 
  ALTER COLUMN city DROP NOT NULL,
  ALTER COLUMN province DROP NOT NULL, 
  ALTER COLUMN country DROP NOT NULL;

-- CONTOH: Jika ada kolom lain yang NO tapi tidak wajib bisnis:
-- ALTER TABLE public.profiles 
--   ALTER COLUMN bio DROP NOT NULL,
--   ALTER COLUMN avatar_url DROP NOT NULL,
--   ALTER COLUMN phone DROP NOT NULL;

-- JANGAN drop kolom seperti username, email, referral_code, role dll
-- karena itu wajib bisnis!
*/

-- STEP 3: Verifikasi hasil
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
