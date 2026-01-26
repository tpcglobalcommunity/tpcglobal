CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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

CREATE INDEX IF NOT EXISTS prt_email_idx ON public.password_reset_tokens (email);
CREATE INDEX IF NOT EXISTS prt_hash_idx ON public.password_reset_tokens (token_hash);
CREATE INDEX IF NOT EXISTS prt_expires_idx ON public.password_reset_tokens (expires_at);

ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_all" ON public.password_reset_tokens;
CREATE POLICY "deny_all"
ON public.password_reset_tokens
FOR ALL
TO public
USING (false)
WITH CHECK (false);
