// Member Invoices RPC Functions
// These functions provide secure access to user's own invoices

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface MemberInvoice {
  invoice_no: string;
  buyer_email: string;
  tpc_amount: number;
  price_usd: number;
  total_usd: number;
  total_idr: number;
  usd_idr_rate: number;
  treasury_address: string;
  status: 'UNPAID' | 'PENDING_REVIEW' | 'PAID' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';
  payment_method?: string;
  admin_note?: string;
  tx_hash?: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
  paid_at?: string;
  confirmed_at?: string;
  approved_at?: string;
}

/**
 * Get all invoices for the authenticated user
 * Only accessible by authenticated users
 * Returns only user's own invoices
 */
export const getMyInvoices = async (): Promise<MemberInvoice[]> => {
  try {
    // Check if user is authenticated before calling RPC
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      logger.warn('User not authenticated, returning empty invoices list');
      return [];
    }

    console.log("Fetching user invoices for user:", session.user.id);
    
    // @ts-ignore - Supabase RPC type issue
    const { data, error } = await supabase.rpc('get_my_invoices');

    if (error) {
      console.error("RPC error:", error);
      logger.error('Failed to fetch user invoices', error);
      
      // More specific error messages
      let errorMessage = 'Failed to fetch invoices: ' + error.message;
      if (error.message.includes('function not found')) {
        errorMessage = 'RPC function not found. Please contact support.';
      } else if (error.message.includes('permission denied')) {
        errorMessage = 'Permission denied. You must be logged in to view invoices.';
      }
      
      throw new Error(errorMessage);
    }

    console.log("User invoices fetched successfully:", data?.length || 0);
    logger.info('User invoices fetched successfully', { count: data?.length || 0 });
    
    return (data as MemberInvoice[]) || [];
  } catch (error) {
    console.error("Unexpected error fetching user invoices:", error);
    logger.error('Unexpected error fetching user invoices', error);
    throw error;
  }
};

/**
 * Get single invoice by invoice number for authenticated user
 * Only accessible by authenticated users
 * Only returns user's own invoice
 */
export const getMyInvoice = async (invoiceNo: string): Promise<MemberInvoice | null> => {
  try {
    // Check if user is authenticated before calling RPC
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      logger.warn('User not authenticated, cannot fetch invoice');
      throw new Error('You must be logged in to view invoices.');
    }

    console.log("Fetching invoice:", invoiceNo, "for user:", session.user.id);
    
    // @ts-ignore - Supabase RPC type issue
    const { data, error } = await supabase.rpc('get_my_invoice', {
      p_invoice_no: invoiceNo
    });

    if (error) {
      console.error("RPC error:", error);
      logger.error('Failed to fetch invoice', { error, invoiceNo });
      
      // More specific error messages
      let errorMessage = 'Failed to fetch invoice: ' + error.message;
      if (error.message.includes('function not found')) {
        errorMessage = 'RPC function not found. Please contact support.';
      } else if (error.message.includes('permission denied')) {
        errorMessage = 'Permission denied. You can only access your own invoices.';
      } else if (error.message.includes('not found')) {
        errorMessage = 'Invoice not found. Please check your invoice number.';
      }
      
      throw new Error(errorMessage);
    }

    const invoice = data ? (Array.isArray(data) ? data[0] : data) : null;
    console.log("Invoice fetched successfully:", invoice ? invoice.invoice_no : null);
    logger.info('Invoice fetched successfully', { invoice_no: invoice?.invoice_no });
    
    return invoice as MemberInvoice | null;
  } catch (error) {
    console.error("Unexpected error fetching invoice:", error);
    logger.error('Unexpected error fetching invoice', { error, invoiceNo });
    throw error;
  }
};
