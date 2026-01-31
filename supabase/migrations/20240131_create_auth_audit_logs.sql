-- Auth Audit Logs Table
-- Security: Only insertable via SECURITY DEFINER RPC

CREATE TABLE IF NOT EXISTS auth_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NULL,
    event TEXT NOT NULL,
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_user_id ON auth_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_event ON auth_audit_logs(event);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_created_at ON auth_audit_logs(created_at);

-- Row Level Security
ALTER TABLE auth_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: No direct inserts from anon/authenticated users
-- Only allow inserts via the RPC function below
CREATE POLICY "No direct insert policy" ON auth_audit_logs
    FOR INSERT WITH CHECK (false);

-- RPC Function for safe logging
CREATE OR REPLACE FUNCTION log_auth_event(
    p_event TEXT,
    p_meta JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO auth_audit_logs (user_id, event, meta)
    VALUES (
        COALESCE(auth.uid(), NULL),
        p_event,
        p_meta
    );
END;
$$;

-- Grant execute on RPC to authenticated users
GRANT EXECUTE ON FUNCTION log_auth_event TO authenticated;
GRANT EXECUTE ON FUNCTION log_auth_event TO anon; -- Allow anon for failed login attempts

-- Grant select on table to service role only (for admin viewing)
GRANT SELECT ON auth_audit_logs TO service_role;
