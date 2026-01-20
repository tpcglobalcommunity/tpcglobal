-- Fix RLS untuk signup_error_logs table
-- Enable RLS untuk security
ALTER TABLE public.signup_error_logs ENABLE ROW LEVEL SECURITY;

-- Policy untuk user hanya bisa lihat error log mereka sendiri
CREATE POLICY "Users can view their own signup error logs" ON public.signup_error_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Policy untuk system bisa insert error logs
CREATE POLICY "Enable insert for signup error logging" ON public.signup_error_logs
  FOR INSERT WITH CHECK (true);

-- Opsional: Policy untuk admin (kalau perlu)
CREATE POLICY "Admins can view all signup error logs" ON public.signup_error_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
