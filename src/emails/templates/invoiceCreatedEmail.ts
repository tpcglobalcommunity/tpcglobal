import { renderEmailHtml, EmailParams } from '../renderEmail';
import { getBadgeStyle } from '../emailStyles';

interface InvoiceCreatedEmailParams {
  lang: 'id' | 'en';
  invoice: {
    invoice_no: string;
    stage: string;
    tpc_amount: number;
    total_usd: number;
    total_idr: number;
    usd_idr_rate: number;
    treasury_address: string;
    expires_at: string;
    status: string;
  };
  invoiceUrl: string;
  confirmUrl: string;
}

export function buildInvoiceCreatedEmail({ 
  lang, 
  invoice, 
  invoiceUrl, 
  confirmUrl 
}: InvoiceCreatedEmailParams): string {
  const isId = lang === 'id';
  
  const statusColor = invoice.status === 'UNPAID' ? 'warning' : 'success';
  const statusText = {
    UNPAID: { id: 'Belum Dibayar', en: 'Unpaid' },
    PENDING_REVIEW: { id: 'Menunggu Review', en: 'Pending Review' },
    PAID: { id: 'Disetujui', en: 'Approved' },
    REJECTED: { id: 'Ditolak', en: 'Rejected' }
  }[invoice.status] || { id: invoice.status, en: invoice.status };

  const bodyHtml = `
    <div style="background-color: #111827; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div>
          <p style="margin: 0 0 4px 0; color: #9CA3AF; font-size: 12px;">${isId ? 'No. Invoice' : 'Invoice No'}</p>
          <p style="margin: 0; font-weight: 600;">${invoice.invoice_no}</p>
        </div>
        <div>
          <p style="margin: 0 0 4px 0; color: #9CA3AF; font-size: 12px;">${isId ? 'Status' : 'Status'}</p>
          <span style="${getBadgeStyle(statusColor)}">${statusText[lang]}</span>
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px;">
        <div>
          <p style="margin: 0 0 4px 0; color: #9CA3AF; font-size: 12px;">${isId ? 'Stage' : 'Stage'}</p>
          <p style="margin: 0; font-weight: 600;">${invoice.stage.toUpperCase()}</p>
        </div>
        <div>
          <p style="margin: 0 0 4px 0; color: #9CA3AF; font-size: 12px;">${isId ? 'Jumlah TPC' : 'TPC Amount'}</p>
          <p style="margin: 0; font-weight: 600;">${invoice.tpc_amount.toLocaleString('id-ID')} TPC</p>
        </div>
      </div>
      
      <div style="margin-top: 16px;">
        <p style="margin: 0 0 4px 0; color: #9CA3AF; font-size: 12px;">${isId ? 'Total USD' : 'Total USD'}</p>
        <p style="margin: 0; font-weight: 600;">$${invoice.total_usd.toFixed(2)}</p>
      </div>
      
      <div style="margin-top: 16px;">
        <p style="margin: 0 0 4px 0; color: #9CA3AF; font-size: 12px;">${isId ? 'Total IDR' : 'Total IDR'}</p>
        <p style="margin: 0; font-weight: 600;">Rp ${invoice.total_idr.toLocaleString('id-ID')}</p>
      </div>
      
      <div style="margin-top: 16px;">
        <p style="margin: 0 0 4px 0; color: #9CA3AF; font-size: 12px;">${isId ? 'Kurs USD/IDR' : 'USD/IDR Rate'}</p>
        <p style="margin: 0; font-weight: 600;">${invoice.usd_idr_rate.toLocaleString('id-ID')}</p>
      </div>
      
      <div style="margin-top: 16px;">
        <p style="margin: 0 0 4px 0; color: #9CA3AF; font-size: 12px;">${isId ? 'Alamat Treasury' : 'Treasury Address'}</p>
        <p style="margin: 0; font-weight: 600; font-family: monospace; font-size: 12px; word-break: break-all;">${invoice.treasury_address}</p>
      </div>
      
      <div style="margin-top: 16px;">
        <p style="margin: 0 0 4px 0; color: #9CA3AF; font-size: 12px;">${isId ? 'Kadaluarsa' : 'Expires'}</p>
        <p style="margin: 0; font-weight: 600;">${new Date(invoice.expires_at).toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')}</p>
      </div>
    </div>
    
    <p style="margin: 24px 0 16px 0; color: #9CA3AF; font-size: 14px;">
      ${isId ? 
        'Silakan lakukan pembayaran ke alamat treasury di atas dan konfirmasi pembayaran Anda melalui halaman invoice.' :
        'Please make payment to the treasury address above and confirm your payment through the invoice page.'
      }
    </p>
  `;

  const params: EmailParams = {
    title: isId ? 'Invoice TPC Anda' : 'Your TPC Invoice',
    subtitle: isId ? 'Invoice berhasil dibuat. Detail pembayaran:' : 'Invoice created successfully. Payment details:',
    bodyHtml,
    primaryCta: {
      label: isId ? 'Lihat Invoice' : 'View Invoice',
      url: invoiceUrl
    },
    secondaryCta: {
      label: isId ? 'Konfirmasi Pembayaran' : 'Confirm Payment',
      url: confirmUrl
    },
    lang,
    previewText: isId ? `Invoice ${invoice.invoice_no} dari TPC Global` : `Invoice ${invoice.invoice_no} from TPC Global`
  };

  return renderEmailHtml(params);
}
