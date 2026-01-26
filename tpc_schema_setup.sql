-- =========================================================
-- TPC TRANSACTIONS SCHEMA SETUP
-- =========================================================

-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Add role column to profiles if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'member';
    CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
  END IF;
END $$;

-- Create tpc_transactions table
CREATE TABLE IF NOT EXISTS public.tpc_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('marketplace','staking','subscription')),
  amount numeric(18,6) NOT NULL CHECK (amount > 0),
  source_id text,
  status text NOT NULL CHECK (status IN ('pending','verified')) DEFAULT 'pending',
  verifier_note text,
  verified_at timestamptz,
  distributed boolean NOT NULL DEFAULT false,
  distributed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tpc_tx_user ON public.tpc_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_tpc_tx_status ON public.tpc_transactions(status, distributed);

-- Create tpc_distribution_logs table
CREATE TABLE IF NOT EXISTS public.tpc_distribution_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES public.tpc_transactions(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('referral','treasury','buyback')),
  amount numeric(18,6) NOT NULL CHECK (amount >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (transaction_id, type)
);

CREATE INDEX IF NOT EXISTS idx_tpc_dist_tx ON public.tpc_distribution_logs(transaction_id);

-- Enable RLS
ALTER TABLE public.tpc_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tpc_distribution_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "tx_select_own" ON public.tpc_transactions;
DROP POLICY IF EXISTS "tx_admin_select_all" ON public.tpc_transactions;
DROP POLICY IF EXISTS "tx_service_only_write" ON public.tpc_transactions;
DROP POLICY IF EXISTS "dist_admin_select" ON public.tpc_distribution_logs;
DROP POLICY IF EXISTS "dist_service_write" ON public.tpc_distribution_logs;

-- Create RLS policies
CREATE POLICY "tx_select_own" ON public.tpc_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "tx_admin_select_all" ON public.tpc_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "tx_service_only_write" ON public.tpc_transactions
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "dist_admin_select" ON public.tpc_distribution_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "dist_service_write" ON public.tpc_distribution_logs
  FOR INSERT WITH CHECK (auth.role() = 'service_role');
