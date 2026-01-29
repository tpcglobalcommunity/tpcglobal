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
  // TODO: Implement after types regenerate
  // This should: 1) Update invoice status to APPROVED, 2) Store tx_hash, 3) Send approval email to buyer
  return null;
};

// Admin: Reject invoice with reason
export const adminRejectInvoice = async (request: RejectInvoiceRequest): Promise<AdminInvoiceResult | null> => {
  // TODO: Implement after types regenerate
  // This should: 1) Update invoice status to REJECTED, 2) Store admin_note, 3) Send rejection email to buyer
  return null;
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
