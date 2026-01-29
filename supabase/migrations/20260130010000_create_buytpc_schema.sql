-- Create invoices table for TPC presale
CREATE TABLE invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_no VARCHAR(20) UNIQUE NOT NULL,
  stage VARCHAR(20) NOT NULL CHECK (stage IN ('stage1', 'stage2')),
  tpc_amount DECIMAL(15,6) NOT NULL CHECK (tpc_amount > 0),
  price_usd DECIMAL(10,6) NOT NULL CHECK (price_usd > 0),
  total_usd DECIMAL(15,2) NOT NULL CHECK (total_usd > 0),
  usd_idr_rate DECIMAL(10,2) NOT NULL CHECK (usd_idr_rate > 0),
  total_idr DECIMAL(15,2) GENERATED ALWAYS AS (total_usd * usd_idr_rate) STORED,
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('USDC', 'SOL', 'BCA', 'MANDIRI', 'BNI', 'BRI', 'OVO', 'DANA', 'GOPAY')),
  treasury_address TEXT NOT NULL,
  buyer_email VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'APPROVED', 'REJECTED')),
  admin_note TEXT,
  tx_hash VARCHAR(255), -- Solana transaction hash when approved
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Create members table for buyer registration
CREATE TABLE members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create presale_stages table for stage management
CREATE TABLE presale_stages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stage VARCHAR(20) UNIQUE NOT NULL CHECK (stage IN ('stage1', 'stage2')),
  supply DECIMAL(15,0) NOT NULL CHECK (supply > 0),
  price_usd DECIMAL(10,6) NOT NULL CHECK (price_usd > 0),
  status VARCHAR(20) NOT NULL DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'ACTIVE', 'SOLD_OUT', 'EXPIRED')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial presale stages
INSERT INTO presale_stages (stage, supply, price_usd, status, start_date, end_date) VALUES
('stage1', 100000000, 0.001, 'ACTIVE', NOW(), NOW() + INTERVAL '6 months'),
('stage2', 100000000, 0.002, 'UPCOMING', NOW() + INTERVAL '6 months', NOW() + INTERVAL '12 months');

-- Create indexes for performance
CREATE INDEX idx_invoices_invoice_no ON invoices(invoice_no);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_stage ON invoices(stage);
CREATE INDEX idx_invoices_buyer_email ON invoices(buyer_email);
CREATE INDEX idx_members_email ON members(email);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_presale_stages_updated_at BEFORE UPDATE ON presale_stages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_no()
RETURNS TEXT AS $$
DECLARE
  prefix TEXT := 'TPC';
  date_part TEXT;
  sequence_part INTEGER;
  result TEXT;
BEGIN
  date_part := TO_CHAR(NOW(), 'YYMMDD');
  
  -- Get next sequence for today
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_no, -4) AS INTEGER)), 0) + 1
  INTO sequence_part
  FROM invoices
  WHERE invoice_no LIKE prefix || date_part || '%';
  
  result := prefix || date_part || LPAD(sequence_part::TEXT, 4, '0');
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate sold TPC per stage
CREATE OR REPLACE FUNCTION calculate_sold_tpc(p_stage VARCHAR)
RETURNS DECIMAL(15,6) AS $$
BEGIN
  RETURN COALESCE(
    SELECT SUM(tpc_amount)
    FROM invoices
    WHERE stage = p_stage AND status = 'APPROVED'
  , 0);
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate remaining TPC per stage
CREATE OR REPLACE FUNCTION calculate_remaining_tpc(p_stage VARCHAR)
RETURNS DECIMAL(15,6) AS $$
DECLARE
  stage_supply DECIMAL(15,0);
  sold_amount DECIMAL(15,6);
BEGIN
  SELECT supply INTO stage_supply
  FROM presale_stages
  WHERE stage = p_stage;
  
  sold_amount := calculate_sold_tpc(p_stage);
  
  RETURN stage_supply - sold_amount;
END;
$$ LANGUAGE plpgsql;

-- Create function to auto-update stage status
CREATE OR REPLACE FUNCTION update_stage_status()
RETURNS VOID AS $$
DECLARE
  stage_record RECORD;
  sold_amount DECIMAL(15,6);
  remaining_amount DECIMAL(15,6);
BEGIN
  FOR stage_record IN SELECT * FROM presale_stages LOOP
    sold_amount := calculate_sold_tpc(stage_record.stage);
    remaining_amount := calculate_remaining_tpc(stage_record.stage);
    
    -- Update status based on conditions
    IF stage_record.status = 'ACTIVE' THEN
      IF remaining_amount <= 0 THEN
        UPDATE presale_stages 
        SET status = 'SOLD_OUT' 
        WHERE stage = stage_record.stage;
      ELSIF NOW() > stage_record.end_date THEN
        UPDATE presale_stages 
        SET status = 'EXPIRED' 
        WHERE stage = stage_record.stage;
      END IF;
    ELSIF stage_record.status = 'UPCOMING' THEN
      IF NOW() >= stage_record.start_date THEN
        UPDATE presale_stages 
        SET status = 'ACTIVE' 
        WHERE stage = stage_record.stage;
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
