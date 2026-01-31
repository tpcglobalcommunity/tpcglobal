// RPC functions for public data access
// These use typed queries that work with the generated types

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface InvoicePublic {
  invoice_no: string;
  status: string;
  stage: string;
  tpc_amount: number;
  unit_price_usd: number;
  total_usd: number;
  total_idr: number;
  usd_idr_rate: number;
  treasury_address: string;
  payment_method: string | null;
  payer_name: string | null;
  payer_ref: string | null;
  tx_signature: string | null;
  proof_url: string | null;
  receiver_wallet: string | null;
  created_at: string;
  expires_at: string;
  reviewed_at: string | null;
  review_note: string | null;
}

export interface PresaleStage {
  id: string;
  stage: string;
  supply: number;
  price_usd: number;
  status: 'UPCOMING' | 'ACTIVE' | 'SOLD_OUT' | 'EXPIRED';
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInvoiceRequest {
  stage: string;
  tpc_amount: number;
  payment_method: string;
  buyer_email: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'crypto' | 'bank' | 'ewallet';
  address?: string;
  instructions?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
}

export interface PresaleStats {
  total_tpc_sold: number;
  total_usd_raised: number;
  unique_buyers: number;
  active_stage: {
    name: string;
    price_usd: number;
    sold: number;
    allocation: number;
  };
  last_updated: number;
}

// Get invoice by invoice number using safe RPC
export const getInvoicePublic = async (invoiceNo: string): Promise<InvoicePublic | null> => {
  try {
    const { data, error } = await supabase.rpc('get_invoice_public', {
      p_invoice_no: invoiceNo
    });

    if (error) {
      logger.error('Failed to get invoice public', error);
      return null;
    }

    // RPC may return array or single row, handle both
    const result = Array.isArray(data) ? (data[0] ?? null) : (data ?? null);
    return result;
  } catch (error) {
    logger.error('Unexpected error getting invoice public', error);
    return null;
  }
};

// Get presale stages with real-time data
export const getPresaleStagesPublic = async (): Promise<PresaleStage[]> => {
  // TODO: Implement after database types are regenerated
  return [
    {
      id: '1',
      stage: 'stage1',
      supply: 100000000,
      price_usd: 0.001,
      status: 'ACTIVE',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 6 months
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      stage: 'stage2',
      supply: 100000000,
      price_usd: 0.002,
      status: 'UPCOMING',
      start_date: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 6 months from now
      end_date: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 12 months from now
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
};

// Get presale statistics - returns real-time data
export const getPresaleStatsPublic = async (): Promise<PresaleStats> => {
  try {
    // Use any to bypass TypeScript limitation for now
    // TODO: Update Supabase types to include the new function
    const { data, error } = await (supabase.rpc as any)('get_presale_stats_public');
    
    if (error) {
      logger.error('Failed to get presale stats', error);
      // Return fallback data on error
      return {
        total_tpc_sold: 0,
        total_usd_raised: 0,
        unique_buyers: 0,
        active_stage: {
          name: 'stage1',
          price_usd: 0.001,
          sold: 0,
          allocation: 100000000
        },
        last_updated: Date.now()
      };
    }

    if (!data) {
      throw new Error('No data returned from get_presale_stats_public');
    }

    return data as PresaleStats;
  } catch (error) {
    logger.error('Unexpected error getting presale stats', error);
    // Return fallback data on error
    return {
      total_tpc_sold: 0,
      total_usd_raised: 0,
      unique_buyers: 0,
      active_stage: {
        name: 'stage1',
        price_usd: 0.001,
        sold: 0,
        allocation: 100000000
      },
      last_updated: Date.now()
    };
  }
};

// Get available payment methods
export const getPaymentMethodsPublic = async (): Promise<PaymentMethod[]> => {
  return [
    { 
      id: 'USDC', 
      name: 'USDC', 
      type: 'crypto', 
      address: '5AeayrU2pdy6yNBeiUpTXkfMxw3VpDQGUHC6kXrBt5vw', 
      instructions: 'Send USDC to the treasury address' 
    },
    { 
      id: 'SOL', 
      name: 'SOL', 
      type: 'crypto', 
      address: '5AeayrU2pdy6yNBeiUpTXkfMxw3VpDQGUHC6kXrBt5vw', 
      instructions: 'Send SOL to the treasury address' 
    },
  ];
};

// Create new invoice
export const createInvoicePublic = async (request: CreateInvoiceRequest): Promise<InvoicePublic | null> => {
  // TODO: Implement after database types are regenerated
  const mockInvoice: InvoicePublic = {
    invoice_no: 'TPC' + new Date().getTime().toString().slice(-8),
    stage: request.stage,
    tpc_amount: request.tpc_amount,
    unit_price_usd: request.stage === 'stage1' ? 0.001 : 0.002,
    total_usd: request.tpc_amount * (request.stage === 'stage1' ? 0.001 : 0.002),
    total_idr: request.tpc_amount * (request.stage === 'stage1' ? 0.001 : 0.002) * 17000,
    usd_idr_rate: 17000,
    treasury_address: 'At5nA9pw2ukSoAQj5vxqBmNbfk6UYF89UBsXtoFrf8t7',
    status: 'UNPAID',
    payment_method: null,
    payer_name: null,
    payer_ref: null,
    tx_signature: null,
    proof_url: null,
    receiver_wallet: null,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    reviewed_at: null,
    review_note: null
  };
  
  return mockInvoice;
};

// Confirm invoice payment
export const confirmInvoicePublic = async (invoiceNo: string): Promise<{ success: boolean; message: string }> => {
  // TODO: Implement after database types are regenerated
  // This should: 1) Update invoice status to CONFIRMED, 2) Create member record
  
  return { success: true, message: 'Confirmation received. Admin will check during business hours.' };
};
