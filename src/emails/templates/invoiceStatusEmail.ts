import { renderEmailHtml, EmailParams } from '../renderEmail';
import { getBadgeStyle } from '../emailStyles';

interface InvoiceStatusEmailParams {
  lang: 'id' | 'en';
  invoice: {
    invoice_no: string;
    tpc_amount: number;
    total_usd: number;
    total_idr: number;
  };
  invoiceUrl: string;
  status: 'APPROVED' | 'REJECTED';
  note?: string;
}

export function buildInvoiceStatusEmail({ 
  lang, 
  invoice, 
  invoiceUrl, 
  status,
  note 
}: InvoiceStatusEmailParams): string {
  const isId = lang === 'id';
  const isApproved = status === 'APPROVED';
  
  const bodyHtml = `
    <div style="background-color: #111827; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <div style="text-align: center; margin-bottom: 16px;">
        <span style="${getBadgeStyle(isApproved ? 'success' : 'error')}">
          ${isApproved ? (isId ? '✅ DISETUJUI' : '✅ APPROVED') : (isId ? '❌ DITOLAK' : '❌ REJECTED')}
        </span>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div>
          <p style="margin: 0 0 4px 0; color: #9CA3AF; font-size: 12px;">${isId ? 'No. Invoice' : 'Invoice No'}</p>
          <p style="margin: 0; font-weight: 600;">${invoice.invoice_no}</p>
        </div>
        <div>
          <p style="margin: 0 0 4px 0; color: #9CA3AF; font-size: 12px;">${isId ? 'Jumlah TPC' : 'TPC Amount'}</p>
          <p style="margin: 0; font-weight: 600;">${invoice.tpc_amount.toLocaleString('id-ID')} TPC</p>
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px;">
        <div>
          <p style="margin: 0 0 4px 0; color: #9CA3AF; font-size: 12px;">${isId ? 'Total USD' : 'Total USD'}</p>
          <p style="margin: 0; font-weight: 600;">$${invoice.total_usd.toFixed(2)}</p>
        </div>
        <div>
          <p style="margin: 0 0 4px 0; color: #9CA3AF; font-size: 12px;">${isId ? 'Total IDR' : 'Total IDR'}</p>
          <p style="margin: 0; font-weight: 600;">Rp ${invoice.total_idr.toLocaleString('id-ID')}</p>
        </div>
      </div>
      
      ${note ? `
        <div style="margin-top: 16px;">
          <p style="margin: 0 0 4px 0; color: #9CA3AF; font-size: 12px;">${isId ? 'Catatan Admin' : 'Admin Note'}</p>
          <p style="margin: 0; font-weight: 600; color: #E5E7EB;">${note}</p>
        </div>
      ` : ''}
    </div>
    
    <p style="margin: 24px 0 16px 0; color: #9CA3AF; font-size: 14px;">
      ${isApproved ? 
        'Pembayaran Anda telah disetujui. TPC akan segera dikirim ke wallet Anda.' :
        'Pembayaran Anda ditolak. Silakan periksa catatan admin dan kirim konfirmasi ulang jika diperlukan.'
      }
    </p>
  `;

  const params: EmailParams = {
    title: isApproved ? (isId ? 'Pembayaran Disetujui' : 'Payment Approved') : (isId ? 'Pembayaran Ditolak' : 'Payment Rejected'),
    subtitle: isApproved ? (isId ? 'Invoice Anda telah disetujui.' : 'Your invoice has been approved.') : (isId ? 'Invoice Anda ditolak.' : 'Your invoice has been rejected.'),
    bodyHtml,
    primaryCta: {
      label: isId ? 'Lihat Invoice' : 'View Invoice',
      url: invoiceUrl
    },
    secondaryCta: !isApproved ? {
      label: isId ? 'Kirim Konfirmasi Ulang' : 'Resubmit Confirmation',
      url: `${invoiceUrl}#confirm`
    } : undefined,
    lang,
    previewText: isApproved ? 
      (isId ? `Invoice ${invoice.invoice_no} disetujui` : `Invoice ${invoice.invoice_no} approved`) :
      (isId ? `Invoice ${invoice.invoice_no} ditolak` : `Invoice ${invoice.invoice_no} rejected`)
  };

  return renderEmailHtml(params);
}
