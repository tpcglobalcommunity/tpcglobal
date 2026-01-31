import { InvoicePublic } from "@/lib/rpc/public";

interface InvoiceEmailTemplateProps {
  invoice: InvoicePublic;
  lang: 'id' | 'en';
  memberDashboardUrl?: string;
  authCallbackUrl?: string;
}

const InvoiceEmailTemplate = ({ invoice, lang, memberDashboardUrl, authCallbackUrl }: InvoiceEmailTemplateProps) => {
  const isIndonesian = lang === 'id';
  
  // Use provided URLs or fallback to old logic
  const dashboardUrl = memberDashboardUrl || (() => {
    const baseUrl = typeof window !== 'undefined' && window.location.host.includes('localhost') 
      ? 'http://localhost:8084'
      : 'https://tpcglobal.io';
    return `${baseUrl}/${lang}/member`;
  })();
  
  const callbackUrl = authCallbackUrl || (() => {
    const baseUrl = typeof window !== 'undefined' && window.location.host.includes('localhost') 
      ? 'http://localhost:8084'
      : 'https://tpcglobal.io';
    return `${baseUrl}/auth/callback?next=${encodeURIComponent(`/${lang}/member`)}`;
  })();
  
  const translations = {
    id: {
      title: 'INVOICE PEMBELIAN TPC',
      subtitle: 'Terima kasih telah bergabung dengan presale TPC Global',
      invoiceDetails: 'Detail Invoice',
      invoiceNo: 'No. Invoice',
      expires: 'Kadaluarsa',
      stage: 'Stage',
      tpcAmount: 'Jumlah TPC',
      priceUsd: 'Harga per TPC',
      totalUsd: 'Total USD',
      totalIdr: 'Total IDR',
      paymentMethod: 'Metode Pembayaran',
      paymentInstructions: 'Instruksi Pembayaran',
      treasuryAddress: 'Alamat Treasury',
      copyAddressInstruction: 'Tekan & tahan alamat untuk menyalin',
      nextSteps: 'Langkah Selanjutnya',
      step1: 'Lakukan pembayaran sesuai jumlah yang tertera',
      step2: 'Klik tombol "Konfirmasi Pembayaran" di halaman invoice',
      step3: 'Tunggu verifikasi dari admin',
      step4: 'Terima email konfirmasi setelah diproses',
      contactSupport: 'Hubungi Support',
      thankYou: 'Terima kasih atas kepercayaan Anda!',
      companyName: 'TPC Global',
      website: 'www.tpcglobal.io',
      email: 'support@tpcglobal.io',
      viewInvoice: 'Lihat Detail Invoice',
      confirmPayment: 'Konfirmasi Pembayaran',
      goToDashboard: 'Masuk Dashboard'
    },
    en: {
      title: 'TPC PURCHASE INVOICE',
      subtitle: 'Thank you for joining the TPC Global presale',
      invoiceDetails: 'Invoice Details',
      invoiceNo: 'Invoice No.',
      expires: 'Expires',
      stage: 'Stage',
      tpcAmount: 'TPC Amount',
      priceUsd: 'Price per TPC',
      totalUsd: 'Total USD',
      totalIdr: 'Total IDR',
      paymentMethod: 'Payment Method',
      paymentInstructions: 'Payment Instructions',
      treasuryAddress: 'Treasury Address',
      copyAddressInstruction: 'Tap and hold the address to copy',
      nextSteps: 'Next Steps',
      step1: 'Make payment according to the specified amount',
      step2: 'Click "Confirm Payment" button on the invoice page',
      step3: 'Wait for admin verification',
      step4: 'Receive confirmation email after processing',
      contactSupport: 'Contact Support',
      thankYou: 'Thank you for your trust!',
      companyName: 'TPC Global',
      website: 'www.tpcglobal.io',
      email: 'support@tpcglobal.io',
      viewInvoice: 'View Invoice Details',
      confirmPayment: 'Confirm Payment',
      goToDashboard: 'Go to Dashboard'
    }
  };

  const t = translations[lang];
  
  // Safe number formatting
  const formatUSD = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const formatIDR = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Status badge mapping
  const getStatusClass = (status: string) => {
    const statusMap: Record<string, string> = {
      'PENDING': 'status-pending',
      'CONFIRMED': 'status-confirmed',
      'APPROVED': 'status-approved',
      'REJECTED': 'status-rejected',
      'UNPAID': 'status-pending',
      'PENDING_REVIEW': 'status-confirmed',
      'CONFIRMATION_SENT': 'status-confirmed'
    };
    return statusMap[status] || 'status-pending';
  };

  // Payment method destinations
  const getPaymentDestination = (method: string) => {
    const destinations: Record<string, { id: string; name: string }> = {
      'USDC': { id: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', name: 'Solana USDC' },
      'SOL': { id: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', name: 'Solana SOL' },
      'BCA': { id: '1234567890', name: 'BCA - PT TPC Global' },
      'MANDIRI': { id: '0987654321', name: 'Mandiri - PT TPC Global' },
      'BNI': { id: '1122334455', name: 'BNI - PT TPC Global' },
      'BRI': { id: '5544332211', name: 'BRI - PT TPC Global' },
      'OVO': { id: '08123456789', name: 'OVO - TPC Global' },
      'DANA': { id: '08198765432', name: 'DANA - TPC Global' },
      'GOPAY': { id: '08157684321', name: 'GoPay - TPC Global' }
    };
    return destinations[method] || { id: invoice.treasury_address, name: method };
  };

  const getPaymentMethodIcon = (method: string) => {
    const icons = {
      'USDC': '💵',
      'SOL': '◎',
      'BCA': '🏦',
      'MANDIRI': '🏦',
      'BNI': '🏦',
      'BRI': '🏦',
      'OVO': '📱',
      'DANA': '📱',
      'GOPAY': '📱'
    };
    return icons[method as keyof typeof icons] || '💳';
  };

  const paymentDestination = getPaymentDestination(invoice.payment_method);
  const statusClass = getStatusClass(invoice.status);

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${t.title} - ${invoice.invoice_no}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .invoice-info {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
        }
        
        .invoice-number {
            font-size: 24px;
            font-weight: 700;
            color: #667eea;
            margin-bottom: 10px;
        }
        
        .invoice-meta {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            font-size: 14px;
            color: #666;
        }
        
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        
        .details-table th {
            background: #667eea;
            color: white;
            text-align: left;
            padding: 15px;
            font-weight: 600;
        }
        
        .details-table td {
            padding: 15px;
            border-bottom: 1px solid #e9ecef;
        }
        
        .details-table tr:last-child td {
            border-bottom: none;
        }
        
        .amount-cell {
            font-weight: 700;
            font-size: 18px;
            color: #667eea;
        }
        
        .payment-section {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
        }
        
        .payment-title {
            font-weight: 700;
            color: #856404;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .address-box {
            background: white;
            border: 2px dashed #ffeaa7;
            border-radius: 6px;
            padding: 15px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            word-break: break-all;
            margin: 15px 0;
        }
        
        .copy-instruction {
            font-size: 12px;
            color: #856404;
            font-style: italic;
            margin-top: 5px;
        }
        
        .steps-section {
            margin-bottom: 30px;
        }
        
        .steps-title {
            font-weight: 700;
            margin-bottom: 20px;
            color: #333;
        }
        
        .step-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 15px;
            gap: 15px;
        }
        
        .step-number {
            background: #667eea;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 12px;
            flex-shrink: 0;
        }
        
        .action-buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin: 30px 0;
            flex-wrap: wrap;
        }
        
        .action-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: 600;
            text-align: center;
            transition: transform 0.2s;
            flex: 1;
            min-width: 200px;
        }
        
        .action-button:hover {
            transform: translateY(-2px);
        }
        
        .action-button.secondary {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        }
        
        .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        
        .footer p {
            color: #666;
            font-size: 14px;
            margin-bottom: 10px;
        }
        
        .footer a {
            color: #667eea;
            text-decoration: none;
        }
        
        .footer a:hover {
            text-decoration: underline;
        }
        
        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            margin-left: 10px;
        }
        
        .status-pending {
            background: #fff3cd;
            color: #856404;
        }
        
        .status-confirmed {
            background: #d1ecf1;
            color: #0c5460;
        }
        
        .status-approved {
            background: #d4edda;
            color: #155724;
        }
        
        .status-rejected {
            background: #f8d7da;
            color: #721c24;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 8px;
            }
            
            .header {
                padding: 30px 20px;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .invoice-meta {
                grid-template-columns: 1fr;
            }
            
            .details-table {
                font-size: 14px;
            }
            
            .details-table th,
            .details-table td {
                padding: 10px;
            }
            
            .action-buttons {
                flex-direction: column;
            }
            
            .action-button {
                min-width: auto;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>${t.title}</h1>
            <p>${t.subtitle}</p>
        </div>
        
        <!-- Content -->
        <div class="content">
            <!-- Invoice Info -->
            <div class="invoice-info">
                <div class="invoice-number">
                    ${t.invoiceNo}: ${invoice.invoice_no}
                    <span class="status-badge ${statusClass}">${invoice.status}</span>
                </div>
                <div class="invoice-meta">
                    <div><strong>${isIndonesian ? 'Tanggal' : 'Date'}:</strong> ${formatDate(invoice.created_at)}</div>
                    <div><strong>${isIndonesian ? 'Kadaluarsa' : 'Expires'}:</strong> ${formatDate(invoice.expires_at)}</div>
                    <div><strong>${t.stage}:</strong> ${invoice.stage.toUpperCase()}</div>
                    ${invoice.payment_method ? `<div><strong>${isIndonesian ? 'Metode' : 'Method'}:</strong> ${getPaymentMethodIcon(invoice.payment_method)} ${invoice.payment_method}</div>` : ''}
                </div>
            </div>
            
            <!-- Details Table -->
            <table class="details-table">
                <thead>
                    <tr>
                        <th>${t.tpcAmount}</th>
                        <th>${t.priceUsd}</th>
                        <th>${t.totalUsd}</th>
                        <th>${t.totalIdr}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${invoice.tpc_amount.toLocaleString()} TPC</td>
                        <td>${formatUSD(invoice.unit_price_usd)}</td>
                        <td class="amount-cell">${formatUSD(invoice.total_usd)}</td>
                        <td class="amount-cell">${formatIDR(invoice.total_idr)}</td>
                    </tr>
                </tbody>
            </table>
            
            <!-- Payment Instructions -->
            <div class="payment-section">
                <div class="payment-title">
                    ${getPaymentMethodIcon(invoice.payment_method)}
                    ${t.paymentInstructions}
                </div>
                <p><strong>${t.paymentMethod}:</strong> ${invoice.payment_method}</p>
                <p><strong>${paymentDestination.name}:</strong></p>
                <div class="address-box">${paymentDestination.id}</div>
                <div class="copy-instruction">${t.copyAddressInstruction}</div>
                ${invoice.payment_method !== 'USDC' && invoice.payment_method !== 'SOL' ? `
                    <p style="margin-top: 15px; color: #856404;">
                        <em>${isIndonesian ? 'Catatan: Untuk pembayaran bank, transfer ke rekening resmi TPC Global.' : 'Note: For bank payments, transfer to the official TPC Global account.'}</em>
                    </p>
                ` : `
                    <p style="margin-top: 15px; color: #856404;">
                        <em>${isIndonesian ? 'Catatan: Pastikan network adalah Solana (SOL) dan gunakan address yang tepat.' : 'Note: Make sure the network is Solana (SOL) and use the correct address.'}</em>
                    </p>
                `}
            </div>
            
            <!-- Next Steps -->
            <div class="steps-section">
                <h3 class="steps-title">${t.nextSteps}:</h3>
                <div class="step-item">
                    <div class="step-number">1</div>
                    <div>${t.step1}</div>
                </div>
                <div class="step-item">
                    <div class="step-number">2</div>
                    <div>${t.step2}</div>
                </div>
                <div class="step-item">
                    <div class="step-number">3</div>
                    <div>${t.step3}</div>
                </div>
                <div class="step-item">
                    <div class="step-number">4</div>
                    <div>${t.step4}</div>
                </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="action-buttons">
                <a href="${callbackUrl}" class="action-button primary">
                    ${t.goToDashboard}
                </a>
                <a href="${dashboardUrl}" class="action-button secondary">
                    ${t.viewInvoice}
                </a>
            </div>
            
            <!-- Plain Text Fallback -->
            <div class="plain-text-fallback">
                <p style="font-size: 12px; color: #666; margin-top: 20px;">
                    ${isIndonesian 
                        ? 'Jika tombol tidak berfungsi, salin link ini:' 
                        : 'If buttons don\'t work, copy this link:'}
                </p>
                <p style="font-size: 11px; word-break: break-all; color: #999;">
                    ${callbackUrl}
                </p>
            </div>
            
            <!-- Security Warning -->
            <div class="security-warning">
                <p style="color: #dc2626; font-weight: bold; margin-bottom: 8px;">
                    ⚠️ ${isIndonesian ? 'PERINGATAN KEAMANAN' : 'SECURITY WARNING'}
                </p>
                <p style="font-size: 14px;">
                    ${isIndonesian 
                        ? 'Gunakan hanya halaman resmi ini. Jangan transfer lewat DM atau pihak lain.' 
                        : 'Use only this official page. Do not transfer via DM or third parties.'}
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p><strong>${t.companyName}</strong></p>
            <p>${t.thankYou}</p>
            <p>
                <a href="https://tpcglobal.io">${t.website}</a> | 
                <a href="mailto:${t.email}">${t.email}</a>
            </p>
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
                ${isIndonesian ? 'Email ini dikirim otomatis. Mohon tidak membalas email ini.' : 'This email was sent automatically. Please do not reply to this email.'}
            </p>
        </div>
    </div>
</body>
</html>`;
};

export default InvoiceEmailTemplate;
