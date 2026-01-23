# Supabase Configuration for TPC Global

## Authentication Settings

### 1. URL Configuration
Go to: **Supabase Dashboard → Authentication → URL Configuration**

**Development:**
- Site URL: `http://localhost:5173`
- Redirect URLs:
  - `http://localhost:5173/*`
  - `http://localhost:5173/id/*`
  - `http://localhost:5173/en/*`

**Production:**
- Site URL: `https://tpcglobal.io`
- Redirect URLs:
  - `https://tpcglobal.io/*`
  - `https://tpcglobal.io/id/*`
  - `https://tpcglobal.io/en/*`

### 2. Email Provider
Go to: **Supabase Dashboard → Authentication → Providers**

**Email Settings:**
- ✅ Enable Email provider
- ❌ Disable new user signups (Set to OFF to allow signups)
- **Sender:** Use default Supabase email or configure custom SMTP
- **Templates:** Customize signup and confirmation email templates

### 3. Database Schema
Required tables in `public` schema:

```sql
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT,
  referral_code TEXT,
  full_name TEXT,
  phone TEXT,
  telegram TEXT,
  city TEXT,
  role TEXT DEFAULT 'MEMBER',
  status TEXT DEFAULT 'PENDING',
  verified BOOLEAN DEFAULT false,
  can_invite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- App settings table
CREATE TABLE public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO public.app_settings (key, value) VALUES 
('referral_enabled', 'true'),
('maintenance_mode', 'false'),
('registrations_open', 'true');
```

### 4. Row Level Security (RLS)
Enable RLS on `profiles` table and create policies:

```sql
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### 5. Environment Variables
Make sure these are set in your `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Flow Summary

1. **User signs up** → Creates auth user + sends confirmation email
2. **User clicks confirmation link** → Redirects to `/:lang/auth/callback`
3. **Callback handler** → Creates/updates profile → Redirects to onboarding
4. **Onboarding** → User completes profile → Redirects to dashboard

## Testing

1. Test signup flow end-to-end
2. Verify email confirmation works
3. Check profile creation in database
4. Test onboarding completion
