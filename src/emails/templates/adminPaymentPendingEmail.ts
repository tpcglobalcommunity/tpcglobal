import { renderEmailHtml, EmailParams } from '../renderEmail';

interface AdminPaymentPendingEmailParams {
  lang: 'id' | 'en';
  invoiceNo: string;
  adminUrl: string;
  summaryFields: {
    amount: number;
    method: string;
    txSignature?: string;
    submittedAt: string;
    payerName?: string;
    receiverWallet?: string;
  };
}

export function buildAdminPaymentPendingEmail({ 
  lang, 
  invoiceNo, 
  adminUrl, 
  summaryFields 
}: AdminPaymentPendingEmailParams): string {
  const isId = lang === 'id';
  
  const bodyHtml = `
    <div style="background-color: #111827; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <div style="margin-bottom: 16px;">
        <p style="margin: 0 0 4px 0; color: #9CA3AF; font-size: 12px;">${isId ? 'No. Invoice' : 'Invoice No'}</p>
        <p style="margin: 0; font-weight: 600; font-size: 18px;">${invoiceNo}</p>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div>
          <p style="margin: 0 0 4px 0; color: #9CA3AF; font-size: 12px;">${isId ? 'Jumlah' : 'Amount'}</p>
          <p style="margin: 0; font-weight: 600;">${summaryFields.amount.toLocaleString('id-ID')} TPC</p>
        </div>
        <div>
          <p style="margin: 0 0 4px 0; color: #9CA3AF; font-size: 12px;">${isId ? 'Metode' : 'Method'}</p>
          <p style="margin: 0; font-weight: 600;">${summaryFields.method}</p>
        </div>
      </div>
      
      ${summaryFields.txSignature ? `
        <div style="margin-top: 16px;">
          <p style="margin: 0 0 4px 0; color: #9CA3AF; font-size: 12px;">${isId ? 'Signature Transaksi' : 'Transaction Signature'}</p>
          <p style="margin: 0; font-weight: 600; font-family: monospace; font-size: 12px; word-break: break-all;">${summaryFields.txSignature}</p>
        </div>
      ` : ''}
      
      ${summaryFields.payerName ? `
        <div style="margin-top: 16px;">
          <p style="margin: 0 0 4px 0; color: #9CA3AF; font-size: 12px;">${isId ? 'Nama Pemilik' : 'Payer Name'}</p>
          <p style="margin: 0; font-weight: 600;">${summaryFields.payerName}</p>
        </div>
      ` : ''}
      
      ${summaryFields.receiverWallet ? `
        <div style="margin-top: 16px;">
          <p style="margin: 0 0 4px 0; color: #9CA3AF; font-size: 12px;">${isId ? 'Wallet Penerima' : 'Receiver Wallet'}</p>
          <p style="margin: 0; font-weight: 600; font-family: monospace; font-size: 12px; word-break: break-all;">${summaryFields.receiverWallet}</p>
        </div>
      ` : ''}
      
      <div style="margin-top: 16px;">
        <p style="margin: 0 0 4px 0; color: #9CA3AF; font-size: 12px;">${isId ? 'Waktu Submit' : 'Submitted At'}</p>
        <p style="margin: 0; font-weight: 600;">${new Date(summaryFields.submittedAt).toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')}</p>
      </div>
    </div>
    
    <p style="margin: 24px 0 16px 0; color: #9CA3AF; font-size: 14px;">
      ${isId ? 
        'Konfirmasi pembayaran baru telah diterima. Segera review dan approve/reject sesuai kebijakan.' :
        'New payment confirmation has been received. Please review and approve/reject according to policy.'
      }
    </p>
  `;

  const params: EmailParams = {
    title: isId ? 'Konfirmasi Pembayaran Baru' : 'New Payment Confirmation',
    subtitle: isId ? 'Detail konfirmasi pembayaran:' : 'Payment confirmation details:',
    bodyHtml,
    primaryCta: {
      label: isId ? 'Buka Admin Dashboard' : 'Open Admin Dashboard',
      url: adminUrl
    },
    lang,
    previewText: isId ? `Konfirmasi pembayaran untuk invoice ${invoiceNo}` : `Payment confirmation for invoice ${invoiceNo}`
  };

  return renderEmailHtml(params);
}
