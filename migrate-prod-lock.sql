-- PROD-LOCK Migration Script
-- Fix missing fields and add proper constraints

-- 1) Add missing stage field
ALTER TABLE invoices ADD COLUMN stage INTEGER DEFAULT 1;

-- 2) Update admin settings to include proper values
INSERT OR REPLACE INTO admin_settings (key, value, updated_at) VALUES
('stage', '1', CURRENT_TIMESTAMP),
('presale_stage', '1', CURRENT_TIMESTAMP),
('ADMIN_USER_IDS', '["admin@example.com"]', CURRENT_TIMESTAMP);

-- 3) Add proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoices_stage ON invoices(stage);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_user_email ON invoices(user_email);

-- 4) Add check constraints for data integrity
-- SQLite doesn't support CHECK constraints in ALTER TABLE, so we'll validate in application layer

-- 5) Update existing invoices to have stage = 1
UPDATE invoices SET stage = 1 WHERE stage IS NULL;
