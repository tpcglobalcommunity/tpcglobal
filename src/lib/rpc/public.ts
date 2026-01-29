// RPC functions for public data access
// These use typed queries that work with the generated types

export interface InvoicePublic {
  invoice_no: string;
  stage: string;
  tpc_amount: number;
  price_usd: number;
  total_usd: number;
  usd_idr_rate: number;
  total_idr: number;
  payment_method: string;
  treasury_address: string;
  status: string;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  admin_note: string | null;
}

export interface PresaleStats {
  stage: string;
  sold_tpc: number;
  sold_usd: number;
  sold_idr: number;
  stage_supply: number;
  remaining_tpc: number;
}

// Get invoice by invoice number (will be implemented after types regenerate)
export const getInvoicePublic = async (_invoiceNo: string): Promise<InvoicePublic | null> => {
  // TODO: Implement after database types are regenerated
  return null;
};

// Get presale statistics - returns mock data until DB is ready
export const getPresaleStatsPublic = async (): Promise<PresaleStats[]> => {
  return [
    { stage: "stage1", sold_tpc: 0, sold_usd: 0, sold_idr: 0, stage_supply: 100000000, remaining_tpc: 100000000 },
    { stage: "stage2", sold_tpc: 0, sold_usd: 0, sold_idr: 0, stage_supply: 100000000, remaining_tpc: 100000000 },
  ];
};
