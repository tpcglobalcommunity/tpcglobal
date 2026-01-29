import { supabase } from '../../config/supabase';

export interface PublicInvoice {
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

export interface SalesHistory {
  masked_invoice_no: string;
  stage: string;
  tpc_amount: number;
  total_usd: number;
  total_idr: number;
  paid_at: string | null;
}

export async function getInvoicePublic(invoiceNo: string): Promise<PublicInvoice | null> {
  try {
    const { data, error } = await supabase.rpc('get_invoice_public', {
      p_invoice_no: invoiceNo,
    });

    if (error) {
      console.error('Error fetching public invoice:', error);
      return null;
    }

    return data?.[0] || null;
  } catch (error) {
    console.error('Unexpected error fetching public invoice:', error);
    return null;
  }
}

export async function getPresaleStatsPublic(): Promise<PresaleStats[]> {
  try {
    const { data, error } = await supabase.rpc('get_presale_stats_public');

    if (error) {
      console.error('Error fetching presale stats:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching presale stats:', error);
    return [];
  }
}

export async function getSalesHistoryPublic(limit: number = 50): Promise<SalesHistory[]> {
  try {
    const { data, error } = await supabase.rpc('get_sales_history_public', {
      p_limit: limit,
    });

    if (error) {
      console.error('Error fetching sales history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching sales history:', error);
    return [];
  }
}
