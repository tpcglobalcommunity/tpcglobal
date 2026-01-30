// Email service for sending transactional emails
// This would typically integrate with services like SendGrid, Resend, or AWS SES

import { logger } from './logger';

interface EmailService {
  sendInvoiceEmail: (to: string, invoiceNo: string, lang: 'id' | 'en') => Promise<boolean>;
  sendConfirmationEmail: (to: string, invoiceNo: string, lang: 'id' | 'en') => Promise<boolean>;
  sendApprovalEmail: (to: string, invoiceNo: string, tpcAmount: number, txHash: string, lang: 'id' | 'en') => Promise<boolean>;
  sendRejectionEmail: (to: string, invoiceNo: string, adminNote: string, lang: 'id' | 'en') => Promise<boolean>;
  sendAdminNotification: (invoiceNo: string, buyerEmail: string, tpcAmount: number, paymentMethod: string) => Promise<boolean>;
}

class MockEmailService implements EmailService {
  private async sendEmail(to: string, subject: string, htmlContent: string): Promise<boolean> {
    // Mock implementation - in production, this would integrate with actual email service
    logger.debug('Sending email', { to, subject, contentLength: htmlContent.length });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate success (in production, this would handle actual errors)
    logger.debug('Email sent successfully');
    return true;
  }

  async sendInvoiceEmail(to: string, invoiceNo: string, lang: 'id' | 'en'): Promise<boolean> {
    const { default: InvoiceEmailTemplate } = await import('@/templates/InvoiceEmailTemplate');
    const { getInvoicePublic } = await import('@/lib/rpc/public');
    
    try {
      const invoice = await getInvoicePublic(invoiceNo);
      if (!invoice) {
        logger.info('Invoice not found', { invoiceNo });
        return false;
      }

      const template = InvoiceEmailTemplate({ invoice, lang });
      const subject = lang === 'id' 
        ? `Invoice TPC - ${invoiceNo}` 
        : `TPC Invoice - ${invoiceNo}`;

      return await this.sendEmail(to, subject, template);
    } catch (error) {
      logger.error('Failed to send invoice email', { error });
      return false;
    }
  }

  async sendConfirmationEmail(to: string, invoiceNo: string, lang: 'id' | 'en'): Promise<boolean> {
    const { default: ConfirmationEmailTemplate } = await import('@/templates/ConfirmationEmailTemplate');
    
    try {
      const template = ConfirmationEmailTemplate({ invoiceNo, buyerEmail: to, lang });
      const subject = lang === 'id' 
        ? 'Konfirmasi Pembayaran Diterima' 
        : 'Payment Confirmation Received';

      return await this.sendEmail(to, subject, template);
    } catch (error) {
      logger.error('Failed to send confirmation email', { error });
      return false;
    }
  }

  async sendApprovalEmail(to: string, invoiceNo: string, tpcAmount: number, txHash: string, lang: 'id' | 'en'): Promise<boolean> {
    const { default: ApprovalEmailTemplate } = await import('@/templates/ApprovalEmailTemplate');
    
    try {
      const template = ApprovalEmailTemplate({ 
        invoiceNo, 
        buyerEmail: to, 
        tpcAmount, 
        txHash, 
        lang 
      });
      const subject = lang === 'id' 
        ? 'Pembayaran Disetujui! 🎉' 
        : 'Payment Approved! 🎉';

      return await this.sendEmail(to, subject, template);
    } catch (error) {
      logger.error('Failed to send approval email', { error });
      return false;
    }
  }

  async sendRejectionEmail(to: string, invoiceNo: string, adminNote: string, lang: 'id' | 'en'): Promise<boolean> {
    const { default: RejectionEmailTemplate } = await import('@/templates/RejectionEmailTemplate');
    
    try {
      const template = RejectionEmailTemplate({ 
        invoiceNo, 
        buyerEmail: to, 
        adminNote, 
        lang 
      });
      const subject = lang === 'id' 
        ? 'Pembayaran Ditolak' 
        : 'Payment Rejected';

      return await this.sendEmail(to, subject, template);
    } catch (error) {
      logger.error('Failed to send rejection email', { error });
      return false;
    }
  }

  async sendAdminNotification(invoiceNo: string, buyerEmail: string, tpcAmount: number, paymentMethod: string): Promise<boolean> {
    try {
      const subject = `🔔 New Payment Confirmation - ${invoiceNo}`;
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Payment Confirmation</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Invoice:</strong> ${invoiceNo}</p>
            <p><strong>Buyer Email:</strong> ${buyerEmail}</p>
            <p><strong>TPC Amount:</strong> ${tpcAmount.toLocaleString()}</p>
            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            <p><strong>Status:</strong> <span style="color: #007bff;">CONFIRMED - Awaiting Approval</span></p>
          </div>
          <p style="color: #666; font-size: 14px;">
            Please review and approve/reject this payment in the admin panel.
          </p>
          <div style="margin-top: 20px;">
            <a href="https://tpcglobal.io/admin/invoices" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Review in Admin Panel
            </a>
          </div>
        </div>
      `;

      // In production, this would send to admin email(s)
      const adminEmail = 'admin@tpcglobal.io';
      return await this.sendEmail(adminEmail, subject, htmlContent);
    } catch (error) {
      logger.error('Failed to send admin notification', { error });
      return false;
    }
  }
}

// Production email service (would integrate with real email provider)
class ProductionEmailService implements EmailService {
  private apiKey: string;
  private fromEmail: string;

  constructor(apiKey: string, fromEmail: string) {
    this.apiKey = apiKey;
    this.fromEmail = fromEmail;
  }

  async sendEmail(to: string, subject: string, htmlContent: string): Promise<boolean> {
    try {
      // Example with Resend (https://resend.com)
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: [to],
          subject,
          html: htmlContent,
        }),
      });

      if (!response.ok) {
        throw new Error(`Email service error: ${response.statusText}`);
      }

      const data = await response.json();
      logger.debug('Email sent successfully', { emailId: data.id });
      return true;
    } catch (error) {
      logger.error('Failed to send email', { error });
      return false;
    }
  }

  // Implement other methods using the same sendEmail method
  async sendInvoiceEmail(to: string, invoiceNo: string, lang: 'id' | 'en'): Promise<boolean> {
    const { default: InvoiceEmailTemplate } = await import('@/templates/InvoiceEmailTemplate');
    const { getInvoicePublic } = await import('@/lib/rpc/public');
    
    const invoice = await getInvoicePublic(invoiceNo);
    if (!invoice) return false;

    const template = InvoiceEmailTemplate({ invoice, lang });
    const subject = lang === 'id' ? `Invoice TPC - ${invoiceNo}` : `TPC Invoice - ${invoiceNo}`;
    
    return await this.sendEmail(to, subject, template);
  }

  async sendConfirmationEmail(to: string, invoiceNo: string, lang: 'id' | 'en'): Promise<boolean> {
    const { default: ConfirmationEmailTemplate } = await import('@/templates/ConfirmationEmailTemplate');
    
    const template = ConfirmationEmailTemplate({ invoiceNo, buyerEmail: to, lang });
    const subject = lang === 'id' ? 'Konfirmasi Pembayaran Diterima' : 'Payment Confirmation Received';
    
    return await this.sendEmail(to, subject, template);
  }

  async sendApprovalEmail(to: string, invoiceNo: string, tpcAmount: number, txHash: string, lang: 'id' | 'en'): Promise<boolean> {
    const { default: ApprovalEmailTemplate } = await import('@/templates/ApprovalEmailTemplate');
    
    const template = ApprovalEmailTemplate({ invoiceNo, buyerEmail: to, tpcAmount, txHash, lang });
    const subject = lang === 'id' ? 'Pembayaran Disetujui! 🎉' : 'Payment Approved! 🎉';
    
    return await this.sendEmail(to, subject, template);
  }

  async sendRejectionEmail(to: string, invoiceNo: string, adminNote: string, lang: 'id' | 'en'): Promise<boolean> {
    const { default: RejectionEmailTemplate } = await import('@/templates/RejectionEmailTemplate');
    
    const template = RejectionEmailTemplate({ invoiceNo, buyerEmail: to, adminNote, lang });
    const subject = lang === 'id' ? 'Pembayaran Ditolak' : 'Payment Rejected';
    
    return await this.sendEmail(to, subject, template);
  }

  async sendAdminNotification(invoiceNo: string, buyerEmail: string, tpcAmount: number, paymentMethod: string): Promise<boolean> {
    const subject = `🔔 New Payment Confirmation - ${invoiceNo}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Payment Confirmation</h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Invoice:</strong> ${invoiceNo}</p>
          <p><strong>Buyer Email:</strong> ${buyerEmail}</p>
          <p><strong>TPC Amount:</strong> ${tpcAmount.toLocaleString()}</p>
          <p><strong>Payment Method:</strong> ${paymentMethod}</p>
          <p><strong>Status:</strong> <span style="color: #007bff;">CONFIRMED - Awaiting Approval</span></p>
        </div>
        <p style="color: #666; font-size: 14px;">
          Please review and approve/reject this payment in the admin panel.
        </p>
        <div style="margin-top: 20px;">
          <a href="https://tpcglobal.io/admin/invoices" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Review in Admin Panel
          </a>
        </div>
      </div>
    `;

    const adminEmail = 'admin@tpcglobal.io';
    return await this.sendEmail(adminEmail, subject, htmlContent);
  }
}

// Factory function to get the appropriate email service
export const getEmailService = (): EmailService => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    logger.debug('Using Mock Email Service (Development)');
    return new MockEmailService();
  }
  
  // In production, use real email service
  const apiKey = process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || 'noreply@tpcglobal.io';
  
  if (!apiKey) {
    logger.warn('No email API key found, falling back to mock service');
    return new MockEmailService();
  }
  
  logger.debug('Using Production Email Service');
  return new ProductionEmailService(apiKey, fromEmail);
};

// Export singleton instance
export const emailService = getEmailService();
