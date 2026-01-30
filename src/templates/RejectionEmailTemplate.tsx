interface RejectionEmailTemplateProps {
  invoiceNo: string;
  buyerEmail: string;
  adminNote: string;
  lang: 'id' | 'en';
}

const RejectionEmailTemplate = ({ invoiceNo, buyerEmail, adminNote, lang }: RejectionEmailTemplateProps) => {
  const isIndonesian = lang === 'id';
  
  const translations = {
    id: {
      title: 'Pembayaran Ditolak',
      subtitle: 'Pembayaran Anda tidak dapat disetujui',
      message: 'Mohon maaf, pembayaran untuk invoice Anda tidak dapat disetujui. Silakan periksa alasan di bawah ini.',
      invoiceNo: 'No. Invoice',
      rejectionReason: 'Alasan Penolakan',
      whatToDo: 'Apa yang harus dilakukan?',
      step1: 'Periksa alasan penolakan di atas',
      step2: 'Jika ada kesalahan, buat invoice baru dengan data yang benar',
      step3: 'Hubungi support jika Anda butuh bantuan',
      contactSupport: 'Hubungi Support',
      createNewInvoice: 'Buat Invoice Baru',
      companyName: 'TPC Global',
      website: 'www.tpcglobal.io',
      email: 'support@tpcglobal.io'
    },
    en: {
      title: 'Payment Rejected',
      subtitle: 'Your payment could not be approved',
      message: 'We apologize, but your payment for this invoice could not be approved. Please check the reason below.',
      invoiceNo: 'Invoice No.',
      rejectionReason: 'Rejection Reason',
      whatToDo: 'What to do next?',
      step1: 'Review the rejection reason above',
      step2: 'If there was an error, create a new invoice with correct data',
      step3: 'Contact support if you need assistance',
      contactSupport: 'Contact Support',
      createNewInvoice: 'Create New Invoice',
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
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
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
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            color: #721c24;
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
            color: #dc3545;
            margin-bottom: 15px;
        }
        
        .rejection-reason {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
        }
        
        .rejection-title {
            font-weight: 700;
            color: #856404;
            margin-bottom: 10px;
        }
        
        .rejection-text {
            color: #856404;
            line-height: 1.6;
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
            background: #dc3545;
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
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
            color: #dc3545;
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
            <!-- Message Box -->
            <div class="message-box">
                <p>${t.message}</p>
                <p style="margin-top: 10px; font-size: 14px; font-style: italic;">
                    ${isIndonesian ? 'Status ditentukan berdasarkan pengecekan manual oleh admin.' : 'Status determined based on manual verification by admin.'}
                </p>
            </div>
            
            <!-- Invoice Info -->
            <div class="invoice-info">
                <div class="invoice-number">
                    ${t.invoiceNo}: ${invoiceNo}
                </div>
                <div><strong>${isIndonesian ? 'Email' : 'Email'}:</strong> ${buyerEmail}</div>
            </div>
            
            <!-- Rejection Reason -->
            <div class="rejection-reason">
                <div class="rejection-title">${t.rejectionReason}:</div>
                <div class="rejection-text">${adminNote}</div>
            </div>
            
            <!-- What to do -->
            <div class="steps-section">
                <h3 class="steps-title">${t.whatToDo}:</h3>
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
            
            <!-- Action Buttons -->
            <div class="action-buttons">
                <a href="https://tpcglobal.io/${lang}/buytpc" class="action-button">
                    ${t.createNewInvoice}
                </a>
                <a href="mailto:${translations[lang].email}" class="action-button secondary">
                    ${t.contactSupport}
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

export default RejectionEmailTemplate;
