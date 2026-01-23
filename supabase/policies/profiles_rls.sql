-- Policy: Row Level Security for profiles table
-- Purpose: Users can only see/update their own profile
-- Author: AI Assistant
-- Date: 2026-01-23
-- Version: 1.0.0

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Service role can manage all profiles (for system operations)
CREATE POLICY "Service role full access" ON public.profiles
FOR ALL USING (
  auth.jwt() ->> 'role' = 'service_role'
);

-- Add policy comments for documentation
COMMENT ON POLICY "Users can view own profile" ON public.profiles IS 'Allows users to view their own profile record';
COMMENT ON POLICY "Users can update own profile" ON public.profiles IS 'Allows users to update their own profile record';
COMMENT ON POLICY "Users can insert own profile" ON public.profiles IS 'Allows users to insert their own profile record';
COMMENT ON POLICY "Service role full access" ON public.profiles IS 'Allows service role to manage all profiles';
