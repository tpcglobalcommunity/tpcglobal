import { supabase } from '../../config/supabase';

export interface AdminInvoiceUpdate {
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

export async function adminUpdateInvoiceStatus(
  invoiceNo: string,
  newStatus: 'paid' | 'rejected',
  adminNote?: string
): Promise<AdminInvoiceUpdate | null> {
  try {
    const { data, error } = await supabase.rpc('admin_update_invoice_status', {
      p_invoice_no: invoiceNo,
      p_new_status: newStatus,
      p_admin_note: adminNote || null,
    });

    if (error) {
      console.error('Error updating invoice status:', error);
      return null;
    }

    return data?.[0] || null;
  } catch (error) {
    console.error('Unexpected error updating invoice status:', error);
    return null;
  }
}

export async function adminUpdateUsdIdrRate(rate: number): Promise<number | null> {
  try {
    const { data, error } = await supabase.rpc('admin_update_usd_idr_rate', {
      p_rate: rate,
    });

    if (error) {
      console.error('Error updating USD/IDR rate:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error updating USD/IDR rate:', error);
    return null;
  }
}
