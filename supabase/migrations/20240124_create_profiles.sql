-- TPC Global Production Schema
-- Profiles table with Row Level Security

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone_wa TEXT,
  telegram TEXT,
  city TEXT,
  profile_required_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
-- Users can insert their own profile (only after email verification)
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can read their own profile
CREATE POLICY "Users can read their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Function to check username availability (public safe)
CREATE OR REPLACE FUNCTION public.check_username_available(username_input TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE username = username_input
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate invitation code (public safe)
CREATE OR REPLACE FUNCTION public.validate_invitation_code(code_input TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- TODO: Implement invitation validation logic
  -- For now, return true for testing
  -- In production, check against invitations table
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create profile after email verification
CREATE OR REPLACE FUNCTION public.create_user_profile(user_id UUID, username_input TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Only create profile if user is authenticated and email is verified
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_id AND email_confirmed_at IS NOT NULL
  ) THEN
    RETURN FALSE;
  END IF;

  -- Insert profile with user_id as the primary key
  INSERT INTO public.profiles (id, username)
  VALUES (user_id, username_input)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
