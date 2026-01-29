// Admin RPC functions
// These will be fully implemented after types regenerate

export interface AdminInvoiceResult {
  invoice_no: string;
  stage: string;
  tpc_amount: number;
  total_usd: number;
  total_idr: number;
  payment_method: string;
  treasury_address: string;
  status: string;
  paid_at: string | null;
  admin_note: string | null;
  updated_at: string;
}

export interface AppSettings {
  id: number;
  tpc_usd_idr_rate: number;
  stage1_price_usd: number;
  stage2_price_usd: number;
  stage1_supply: number;
  stage2_supply: number;
}

// Admin: Update invoice status
export const adminUpdateInvoiceStatus = async (
  _invoiceNo: string,
  _newStatus: "paid" | "rejected",
  _adminNote?: string
): Promise<AdminInvoiceResult | null> => {
  // TODO: Implement after types regenerate
  return null;
};

// Admin: Update USD/IDR rate
export const adminUpdateUsdIdrRate = async (_rate: number): Promise<number> => {
  // TODO: Implement after types regenerate
  return 17000;
};

// Admin: Get current settings
export const getAppSettings = async (): Promise<AppSettings | null> => {
  return {
    id: 1,
    tpc_usd_idr_rate: 17000,
    stage1_price_usd: 0.001,
    stage2_price_usd: 0.002,
    stage1_supply: 100000000,
    stage2_supply: 100000000,
  };
};

// Admin: Get all invoices
export const getAllInvoices = async (): Promise<unknown[]> => {
  return [];
};
