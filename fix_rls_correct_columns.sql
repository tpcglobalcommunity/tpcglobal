-- Cek struktur table signup_error_logs
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'signup_error_logs'
ORDER BY ordinal_position;

-- Fix RLS dengan column yang benar (ganti user_id dengan column yang ada)
ALTER TABLE public.signup_error_logs ENABLE ROW LEVEL SECURITY;

-- Policy untuk user hanya bisa lihat error log mereka sendiri
-- GANTI 'user_id' dengan column yang benar (biasanya 'email' atau 'created_by')
CREATE POLICY "Users can view their own signup error logs" ON public.signup_error_logs
  FOR SELECT USING (auth.uid()::text = email);  -- atau ganti 'email' dengan column yang ada

-- Policy untuk system bisa insert error logs
CREATE POLICY "Enable insert for signup error logging" ON public.signup_error_logs
  FOR INSERT WITH CHECK (true);

-- Opsional: Policy untuk admin
CREATE POLICY "Admins can view all signup error logs" ON public.signup_error_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
