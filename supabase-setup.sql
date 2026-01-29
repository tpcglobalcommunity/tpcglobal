-- TPC Global Database Setup
-- Run this in your Supabase SQL Editor

-- Create tables
CREATE TABLE IF NOT EXISTS invoices (
    invoice_no VARCHAR(50) PRIMARY KEY,
    buyer_name VARCHAR(255) NOT NULL,
    buyer_email VARCHAR(255) NOT NULL,
    buyer_phone VARCHAR(50),
    stage VARCHAR(20) NOT NULL CHECK (stage IN ('stage1', 'stage2')),
    tpc_amount DECIMAL(20,8) NOT NULL,
    price_usd DECIMAL(10,4) NOT NULL,
    total_usd DECIMAL(20,2) NOT NULL,
    usd_idr_rate DECIMAL(10,2) NOT NULL DEFAULT 17000,
    total_idr DECIMAL(20,2) GENERATED ALWAYS AS (total_usd * usd_idr_rate) STORED,
    payment_method VARCHAR(50) NOT NULL,
    treasury_address VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'rejected')),
    admin_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS admin_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial settings
INSERT INTO admin_settings (key, value) VALUES 
    ('usd_idr_rate', '17000'),
    ('admin_uuid_whitelist', '["cd6d5d3d-e59d-4fd0-8543-93da9e3d87c1"]'),
    ('admin_email_required', 'false')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read invoices" ON invoices FOR SELECT USING (true);
CREATE POLICY "Anyone can insert invoices" ON invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "Only authenticated users can update invoices" ON invoices FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Anyone can read admin_settings" ON admin_settings FOR SELECT USING (true);
CREATE POLICY "Only authenticated users can update admin_settings" ON admin_settings FOR UPDATE USING (auth.role() = 'authenticated');

-- Create function to get invoice public data
CREATE OR REPLACE FUNCTION get_invoice_public(p_invoice_no VARCHAR)
RETURNS TABLE (
    invoice_no VARCHAR,
    stage VARCHAR,
    tpc_amount DECIMAL,
    price_usd DECIMAL,
    total_usd DECIMAL,
    usd_idr_rate DECIMAL,
    total_idr DECIMAL,
    payment_method VARCHAR,
    treasury_address VARCHAR,
    status VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    admin_note TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.invoice_no,
        i.stage,
        i.tpc_amount,
        i.price_usd,
        i.total_usd,
        i.usd_idr_rate,
        i.total_idr,
        i.payment_method,
        i.treasury_address,
        i.status,
        i.created_at,
        i.updated_at,
        i.paid_at,
        i.admin_note
    FROM invoices i
    WHERE i.invoice_no = p_invoice_no;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get presale stats
CREATE OR REPLACE FUNCTION get_presale_stats_public()
RETURNS TABLE (
    stage VARCHAR,
    sold_tpc DECIMAL,
    sold_usd DECIMAL,
    sold_idr DECIMAL,
    stage_supply DECIMAL,
    remaining_tpc DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        stage,
        COALESCE(SUM(tpc_amount), 0) as sold_tpc,
        COALESCE(SUM(total_usd), 0) as sold_usd,
        COALESCE(SUM(total_idr), 0) as sold_idr,
        CASE 
            WHEN stage = 'stage1' THEN 500000000
            WHEN stage = 'stage2' THEN 1000000000
            ELSE 0
        END as stage_supply,
        CASE 
            WHEN stage = 'stage1' THEN 500000000 - COALESCE(SUM(tpc_amount), 0)
            WHEN stage = 'stage2' THEN 1000000000 - COALESCE(SUM(tpc_amount), 0)
            ELSE 0
        END as remaining_tpc
    FROM invoices
    WHERE status = 'paid'
    GROUP BY stage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get sales history
CREATE OR REPLACE FUNCTION get_sales_history_public(p_limit INTEGER DEFAULT 50)
RETURNS TABLE (
    masked_invoice_no VARCHAR,
    stage VARCHAR,
    tpc_amount DECIMAL,
    total_usd DECIMAL,
    total_idr DECIMAL,
    paid_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        LEFT(invoice_no, 4) || '***' || RIGHT(invoice_no, 4) as masked_invoice_no,
        stage,
        tpc_amount,
        total_usd,
        total_idr,
        paid_at
    FROM invoices
    WHERE status = 'paid' AND paid_at IS NOT NULL
    ORDER BY paid_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create admin function to update invoice status
CREATE OR REPLACE FUNCTION admin_update_invoice_status(
    p_invoice_no VARCHAR,
    p_new_status VARCHAR,
    p_admin_note TEXT DEFAULT NULL
)
RETURNS TABLE (
    invoice_no VARCHAR,
    stage VARCHAR,
    tpc_amount DECIMAL,
    total_usd DECIMAL,
    total_idr DECIMAL,
    payment_method VARCHAR,
    treasury_address VARCHAR,
    status VARCHAR,
    paid_at TIMESTAMP WITH TIME ZONE,
    admin_note TEXT,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- Check if user is authenticated
    IF auth.role() != 'authenticated' THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;
    
    -- Update invoice
    UPDATE invoices
    SET 
        status = p_new_status,
        admin_note = p_admin_note,
        paid_at = CASE WHEN p_new_status = 'paid' THEN NOW() ELSE paid_at END,
        updated_at = NOW()
    WHERE invoice_no = p_invoice_no;
    
    -- Return updated invoice
    RETURN QUERY
    SELECT 
        i.invoice_no,
        i.stage,
        i.tpc_amount,
        i.total_usd,
        i.total_idr,
        i.payment_method,
        i.treasury_address,
        i.status,
        i.paid_at,
        i.admin_note,
        i.updated_at
    FROM invoices i
    WHERE i.invoice_no = p_invoice_no;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create admin function to update USD/IDR rate
CREATE OR REPLACE FUNCTION admin_update_usd_idr_rate(p_rate DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
    -- Check if user is authenticated
    IF auth.role() != 'authenticated' THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;
    
    -- Update rate
    UPDATE admin_settings
    SET value = p_rate::TEXT, updated_at = NOW()
    WHERE key = 'usd_idr_rate';
    
    RETURN p_rate;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON admin_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT EXECUTE ON ALL FUNCTIONS TO anon;
GRANT EXECUTE ON ALL FUNCTIONS TO authenticated;
