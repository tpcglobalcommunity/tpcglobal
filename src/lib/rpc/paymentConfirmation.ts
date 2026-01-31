// Payment Confirmation RPC Functions
// These functions provide secure payment confirmation and admin review

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface PaymentConfirmationRequest {
  invoice_no: string;
  payment_method: string;
  payer_name?: string;
  payer_ref?: string;
  tx_signature?: string;
  proof_url?: string;
}

export interface AdminReviewRequest {
  invoice_no: string;
  action: 'PAID' | 'REJECTED';
  note?: string;
}

/**
 * Submit payment confirmation for user's invoice
 * Only accessible by authenticated users
 * Only works for user's own invoices with UNPAID status
 */
export async function submitPaymentConfirmation(request: PaymentConfirmationRequest): Promise<void> {
  try {
    console.log("Submitting payment confirmation:", request);
    
    // @ts-ignore - Supabase RPC type issue
    const { error } = await supabase.rpc('submit_invoice_confirmation', {
      p_invoice_no: request.invoice_no,
      p_payment_method: request.payment_method,
      p_payer_name: request.payer_name || null,
      p_payer_ref: request.payer_ref || null,
      p_tx_signature: request.tx_signature || null,
      p_proof_url: request.proof_url || null
    });

    if (error) {
      console.error("RPC error:", error);
      logger.error('Failed to submit payment confirmation', { error, request });
      
      // More specific error messages
      let errorMessage = 'Failed to submit payment confirmation: ' + error.message;
      if (error.message.includes('function not found')) {
        errorMessage = 'RPC function not found. Please contact support.';
      } else if (error.message.includes('permission denied')) {
        errorMessage = 'Permission denied. You can only confirm your own invoices.';
      } else if (error.message.includes('not found')) {
        errorMessage = 'Invoice not found. Please check your invoice number.';
      } else if (error.message.includes('already confirmed')) {
        errorMessage = 'Invoice already confirmed. Cannot submit again.';
      }
      
      throw new Error(errorMessage);
    }

    console.log("Payment confirmation submitted successfully");
    logger.info('Payment confirmation submitted successfully', { invoice_no: request.invoice_no });
  } catch (error) {
    console.error("Unexpected error submitting payment confirmation:", error);
    logger.error('Unexpected error submitting payment confirmation', error);
    throw error;
  }
}

/**
 * Admin review of payment confirmation
 * Only accessible by admin users
 * Can mark invoice as PAID or REJECTED
 */
export async function adminReviewInvoice(request: AdminReviewRequest): Promise<void> {
  try {
    // @ts-ignore - Supabase RPC type issue
    const { error } = await supabase.rpc('admin_review_invoice', {
      p_invoice_no: request.invoice_no,
      p_action: request.action,
      p_note: request.note || null
    });

    if (error) {
      logger.error('Failed to review invoice', { error, request });
      throw new Error('Failed to review invoice: ' + error.message);
    }

    logger.info('Invoice reviewed successfully', { 
      invoice_no: request.invoice_no, 
      action: request.action,
      note: request.note 
    });
  } catch (error) {
    logger.error('Unexpected error reviewing invoice', error);
    throw error;
  }
}
