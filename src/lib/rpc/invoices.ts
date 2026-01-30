// Invoice Creation RPC Functions (Server-Side Pricing)
// These functions provide secure invoice creation with server-side validation

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface CreateInvoiceRequest {
  tpc_amount: number;
  referral_code?: string;
}

export interface CreateInvoiceResponse {
  invoice_no: string;
}

/**
 * Create invoice with server-side pricing and validation
 * Only accessible by authenticated users
 * All calculations done server-side to prevent tampering
 */
export async function createInvoice(request: CreateInvoiceRequest): Promise<CreateInvoiceResponse> {
  try {
    const { data, error } = await supabase.rpc('create_invoice', {
      p_tpc_amount: request.tpc_amount,
      p_referral_code: request.referral_code || null
    });

    if (error) {
      logger.error('Failed to create invoice', { error, request });
      throw new Error('Failed to create invoice: ' + error.message);
    }

    // RPC returns array with one row
    const result = data && data.length > 0 ? data[0] : null;
    
    if (!result) {
      throw new Error('Failed to create invoice: No response from server');
    }

    logger.info('Invoice created successfully', { invoice_no: result.invoice_no });
    return result;
  } catch (error) {
    logger.error('Unexpected error creating invoice', error);
    throw error;
  }
}

/**
 * Cancel unpaid invoice
 * Only accessible by authenticated users
 * Can only cancel own unpaid invoices
 */
export async function cancelInvoice(invoiceNo: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('cancel_invoice', {
      p_invoice_no: invoiceNo
    });

    if (error) {
      logger.error('Failed to cancel invoice', { error, invoiceNo });
      throw new Error('Failed to cancel invoice: ' + error.message);
    }

    logger.info('Invoice cancelled successfully', { invoiceNo });
  } catch (error) {
    logger.error('Unexpected error cancelling invoice', error);
    throw error;
  }
}
