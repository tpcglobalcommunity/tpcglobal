// Admin RPC functions
// These will be fully implemented after types regenerate

export interface AdminInvoiceResult {
  id: string;
  invoice_no: string;
  stage: string;
  tpc_amount: number;
  price_usd: number;
  total_usd: number;
  usd_idr_rate: number;
  total_idr: number;
  payment_method: string;
  treasury_address: string;
  buyer_email: string;
  status: 'PENDING' | 'CONFIRMED' | 'APPROVED' | 'REJECTED';
  admin_note: string | null;
  tx_hash: string | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  confirmed_at: string | null;
  approved_at: string | null;
}

export interface ApproveInvoiceRequest {
  invoice_no: string;
  tx_hash: string;
  admin_note?: string;
}

export interface RejectInvoiceRequest {
  invoice_no: string;
  admin_note: string;
}

export interface AppSettings {
  id: number;
  tpc_usd_idr_rate: number;
  stage1_price_usd: number;
  stage2_price_usd: number;
  stage1_supply: number;
  stage2_supply: number;
}

// Admin: Approve invoice with transaction hash
export const adminApproveInvoice = async (request: ApproveInvoiceRequest): Promise<AdminInvoiceResult | null> => {
  // TODO: Implement after database types are regenerated
  // This should: 1) Update invoice status to APPROVED, 2) Store tx_hash, 3) Send approval email to buyer
  
  try {
    const { emailService } = await import('@/lib/emailService');
    
    // TODO: Get actual invoice data from database
    const mockInvoice: AdminInvoiceResult = {
      id: 'mock-id',
      invoice_no: request.invoice_no,
      stage: 'stage1',
      tpc_amount: 1000,
      price_usd: 0.001,
      total_usd: 1,
      usd_idr_rate: 17000,
      total_idr: 17000,
      payment_method: 'USDC',
      treasury_address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      buyer_email: 'buyer@example.com',
      status: 'APPROVED',
      admin_note: request.admin_note || null,
      tx_hash: request.tx_hash,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      paid_at: new Date().toISOString(),
      confirmed_at: new Date().toISOString(),
      approved_at: new Date().toISOString(),
    };
    
    // Send approval email to buyer
    await emailService.sendApprovalEmail(
      mockInvoice.buyer_email,
      mockInvoice.invoice_no,
      mockInvoice.tpc_amount,
      request.tx_hash,
      'id'
    );
    
    return mockInvoice;
  } catch (error) {
    console.error('Failed to approve invoice:', error);
    return null;
  }
};

// Admin: Reject invoice with reason
export const adminRejectInvoice = async (request: RejectInvoiceRequest): Promise<AdminInvoiceResult | null> => {
  // TODO: Implement after database types are regenerated
  // This should: 1) Update invoice status to REJECTED, 2) Store admin_note, 3) Send rejection email to buyer
  
  try {
    const { emailService } = await import('@/lib/emailService');
    
    // TODO: Get actual invoice data from database
    const mockInvoice: AdminInvoiceResult = {
      id: 'mock-id',
      invoice_no: request.invoice_no,
      stage: 'stage1',
      tpc_amount: 1000,
      price_usd: 0.001,
      total_usd: 1,
      usd_idr_rate: 17000,
      total_idr: 17000,
      payment_method: 'USDC',
      treasury_address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      buyer_email: 'buyer@example.com',
      status: 'REJECTED',
      admin_note: request.admin_note,
      tx_hash: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      paid_at: null,
      confirmed_at: new Date().toISOString(),
      approved_at: null,
    };
    
    // Send rejection email to buyer
    await emailService.sendRejectionEmail(
      mockInvoice.buyer_email,
      mockInvoice.invoice_no,
      request.admin_note,
      'id'
    );
    
    return mockInvoice;
  } catch (error) {
    console.error('Failed to reject invoice:', error);
    return null;
  }
};

// Admin: Get confirmed invoices for approval
export const getConfirmedInvoices = async (): Promise<AdminInvoiceResult[]> => {
  // TODO: Implement after types regenerate
  return [];
};

// Admin: Get all invoices with filtering
export const getAllInvoices = async (_status?: string, _stage?: string): Promise<AdminInvoiceResult[]> => {
  // TODO: Implement after types regenerate
  return [];
};
