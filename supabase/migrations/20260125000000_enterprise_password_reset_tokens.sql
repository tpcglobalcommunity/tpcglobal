-- Enterprise Password Reset Tokens Migration
-- Creates secure token storage with hashing, expiry, and single-use tracking

-- 0) Required extension for secure hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Password reset tokens table
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  request_ip text NULL,
  user_agent text NULL
);

-- 2) Performance indexes for efficient lookups
CREATE INDEX IF NOT EXISTS password_reset_tokens_email_idx
  ON public.password_reset_tokens (email);

CREATE INDEX IF NOT EXISTS password_reset_tokens_hash_idx
  ON public.password_reset_tokens (token_hash);

CREATE INDEX IF NOT EXISTS password_reset_tokens_expires_idx
  ON public.password_reset_tokens (expires_at);

-- 3) Row Level Security - deny all client access
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_all" ON public.password_reset_tokens;
CREATE POLICY "deny_all"
ON public.password_reset_tokens
FOR ALL
TO public
USING (false)
WITH CHECK (false);

-- 4) Optional cleanup function for expired tokens (run via cron or edge function)
CREATE OR REPLACE FUNCTION public.cleanup_expired_reset_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.password_reset_tokens 
  WHERE expires_at < now() - interval '7 days';
END;
$$;

-- 5) Grant execute permission for cleanup function
GRANT EXECUTE ON FUNCTION public.cleanup_expired_reset_tokens() TO service_role;
