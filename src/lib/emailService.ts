// Email service for sending transactional emails via Supabase Edge Functions
// Frontend should NOT handle direct email sending - all email logic moved to edge functions

import { logger } from './logger';
import { supabase } from '@/integrations/supabase/client';

interface EmailService {
  sendInvoiceEmail: (to: string, invoiceNo: string, lang: 'id' | 'en') => Promise<boolean>;
  sendConfirmationEmail: (to: string, invoiceNo: string, lang: 'id' | 'en') => Promise<boolean>;
  sendApprovalEmail: (to: string, invoiceNo: string, tpcAmount: number, txHash: string, lang: 'id' | 'en') => Promise<boolean>;
  sendRejectionEmail: (to: string, invoiceNo: string, adminNote: string, lang: 'id' | 'en') => Promise<boolean>;
  sendAdminNotification: (invoiceNo: string, buyerEmail: string, tpcAmount: number, paymentMethod: string) => Promise<boolean>;
}

class EdgeFunctionEmailService implements EmailService {
  async sendInvoiceEmail(to: string, invoiceNo: string, lang: 'id' | 'en'): Promise<boolean> {
    try {
      console.log('📧 [EDGE FUNCTION] Calling send-invoice-email for:', invoiceNo);
      
      const { data, error } = await supabase.functions.invoke('send-invoice-email', {
        body: {
          invoice_no: invoiceNo,
          email: to,
          lang: lang
        }
      });

      if (error) {
        console.error('❌ Edge function error:', error);
        logger.error('Failed to send invoice email via edge function', { error, invoiceNo });
        return false;
      }

      console.log('✅ [EDGE FUNCTION] Invoice email sent successfully');
      logger.info('Invoice email sent successfully via edge function', { invoiceNo });
      return true;
    } catch (error) {
      console.error('❌ Unexpected error calling edge function:', error);
      logger.error('Unexpected error calling edge function', { error, invoiceNo });
      return false;
    }
  }

  async sendConfirmationEmail(to: string, invoiceNo: string, lang: 'id' | 'en'): Promise<boolean> {
    try {
      console.log('📧 [EDGE FUNCTION] Calling send-confirmation-email for:', invoiceNo);
      
      const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
        body: {
          invoice_no: invoiceNo,
          email: to,
          lang: lang
        }
      });

      if (error) {
        console.error('❌ Edge function error:', error);
        logger.error('Failed to send confirmation email via edge function', { error, invoiceNo });
        return false;
      }

      console.log('✅ [EDGE FUNCTION] Confirmation email sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Unexpected error calling edge function:', error);
      logger.error('Unexpected error calling edge function', { error, invoiceNo });
      return false;
    }
  }

  async sendApprovalEmail(to: string, invoiceNo: string, tpcAmount: number, txHash: string, lang: 'id' | 'en'): Promise<boolean> {
    try {
      console.log('📧 [EDGE FUNCTION] Calling send-approval-email for:', invoiceNo);
      
      const { data, error } = await supabase.functions.invoke('send-approval-email', {
        body: {
          invoice_no: invoiceNo,
          email: to,
          tpc_amount: tpcAmount,
          tx_hash: txHash,
          lang: lang
        }
      });

      if (error) {
        console.error('❌ Edge function error:', error);
        logger.error('Failed to send approval email via edge function', { error, invoiceNo });
        return false;
      }

      console.log('✅ [EDGE FUNCTION] Approval email sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Unexpected error calling edge function:', error);
      logger.error('Unexpected error calling edge function', { error, invoiceNo });
      return false;
    }
  }

  async sendRejectionEmail(to: string, invoiceNo: string, adminNote: string, lang: 'id' | 'en'): Promise<boolean> {
    try {
      console.log('📧 [EDGE FUNCTION] Calling send-rejection-email for:', invoiceNo);
      
      const { data, error } = await supabase.functions.invoke('send-rejection-email', {
        body: {
          invoice_no: invoiceNo,
          email: to,
          admin_note: adminNote,
          lang: lang
        }
      });

      if (error) {
        console.error('❌ Edge function error:', error);
        logger.error('Failed to send rejection email via edge function', { error, invoiceNo });
        return false;
      }

      console.log('✅ [EDGE FUNCTION] Rejection email sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Unexpected error calling edge function:', error);
      logger.error('Unexpected error calling edge function', { error, invoiceNo });
      return false;
    }
  }

  async sendAdminNotification(invoiceNo: string, buyerEmail: string, tpcAmount: number, paymentMethod: string): Promise<boolean> {
    try {
      console.log('� [EDGE FUNCTION] Calling send-admin-notification for:', invoiceNo);
      
      const { data, error } = await supabase.functions.invoke('send-admin-notification', {
        body: {
          invoice_no: invoiceNo,
          buyer_email: buyerEmail,
          tpc_amount: tpcAmount,
          payment_method: paymentMethod
        }
      });

      if (error) {
        console.error('❌ Edge function error:', error);
        logger.error('Failed to send admin notification via edge function', { error, invoiceNo });
        return false;
      }

      console.log('✅ [EDGE FUNCTION] Admin notification sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Unexpected error calling edge function:', error);
      logger.error('Unexpected error calling edge function', { error, invoiceNo });
      return false;
    }
  }
}

// Factory function - always use edge function service
export const getEmailService = (): EmailService => {
  console.log('📧 Using Edge Function Email Service');
  return new EdgeFunctionEmailService();
};

// Export singleton instance
export const emailService = getEmailService();
