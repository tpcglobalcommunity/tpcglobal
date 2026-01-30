interface ConfirmationEmailTemplateProps {
  invoiceNo: string;
  buyerEmail: string;
  lang: 'id' | 'en';
}

const ConfirmationEmailTemplate = ({ invoiceNo, buyerEmail, lang }: ConfirmationEmailTemplateProps) => {
  const isIndonesian = lang === 'id';
  
  const translations = {
    id: {
      title: 'Konfirmasi Pembayaran Diterima',
      subtitle: 'Terima kasih! Pembayaran Anda sedang diverifikasi',
      message: 'Kami telah menerima konfirmasi pembayaran untuk invoice Anda. Tim admin kami akan memverifikasi pembayaran tersebut selama jam kerja.',
      invoiceNo: 'No. Invoice',
      nextSteps: 'Langkah Selanjutnya',
      step1: 'Admin akan memverifikasi bukti pembayaran Anda',
      step2: 'Jika disetujui, TPC akan ditransfer ke wallet Anda',
      step3: 'Anda akan menerima email konfirmasi dengan detail transaksi',
      viewInvoice: 'Lihat Detail Invoice',
      contactSupport: 'Hubungi Support',
      companyName: 'TPC Global',
      website: 'www.tpcglobal.io',
      email: 'support@tpcglobal.io'
    },
    en: {
      title: 'Payment Confirmation Received',
      subtitle: 'Thank you! Your payment is being verified',
      message: 'We have received your payment confirmation for your invoice. Our admin team will verify the payment during business hours.',
      invoiceNo: 'Invoice No.',
      nextSteps: 'Next Steps',
      step1: 'Admin will verify your payment proof',
      step2: 'If approved, TPC will be transferred to your wallet',
      step3: 'You will receive a confirmation email with transaction details',
      viewInvoice: 'View Invoice Details',
      contactSupport: 'Contact Support',
      companyName: 'TPC Global',
      website: 'www.tpcglobal.io',
      email: 'support@tpcglobal.io'
    }
  };

  const t = translations[lang];

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${t.title}</title>
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
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
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
        
        .message-box {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            color: #155724;
        }
        
        .invoice-info {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
        }
        
        .invoice-number {
            font-size: 20px;
            font-weight: 700;
            color: #28a745;
            margin-bottom: 10px;
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
            background: #28a745;
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
        
        .action-button {
            display: inline-block;
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: 600;
            text-align: center;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        
        .action-button:hover {
            transform: translateY(-2px);
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
            color: #28a745;
            text-decoration: none;
        }
        
        .footer a:hover {
            text-decoration: underline;
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
            <!-- Message Box -->
            <div class="message-box">
                <p>${t.message}</p>
            </div>
            
            <!-- Invoice Info -->
            <div class="invoice-info">
                <div class="invoice-number">
                    ${t.invoiceNo}: ${invoiceNo}
                </div>
                <div><strong>${isIndonesian ? 'Email' : 'Email'}:</strong> ${buyerEmail}</div>
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
            </div>
            
            <!-- Action Button -->
            <div style="text-align: center;">
                <a href="https://tpcglobal.io/${lang}/invoice/${invoiceNo}" class="action-button">
                    ${t.viewInvoice}
                </a>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p><strong>${t.companyName}</strong></p>
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

export default ConfirmationEmailTemplate;
